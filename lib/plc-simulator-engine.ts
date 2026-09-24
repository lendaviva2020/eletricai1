import {
  PlcProgramConfiguration,
  PlcPou,
  PlcLadderRung,
  PlcLadderElement,
  PlcVariable,
  PlcTraceSample,
} from '@/types/plc';

export interface SimulatorExecutionResult {
  nextProgram: PlcProgramConfiguration;
  scanDurationMs: number;
  tracePoint: PlcTraceSample;
  cycleErrors: string[];
}

export class PlcLadderEngine {
  private lastCycleTimestamp: number = Date.now();
  private prevEdgeStates: Map<string, boolean> = new Map();

  /**
   * IEC 61131-3:2025 Scan Cycle:
   * 1. Read Inputs (from physical/simulated rack channels to variable image)
   * 2. Execute Program (evaluate POUs rung-by-rung, solve power flow, update coils/timers/math)
   * 3. Update Outputs (write output image table to rack modules)
   * 4. Perform Self-Diagnostics & Alarm Evaluation
   */
  public executeScanCycle(
    program: PlcProgramConfiguration,
    deltaMs: number = 12
  ): SimulatorExecutionResult {
    const startTime = performance.now();
    const cycleErrors: string[] = [];

    // Clone working variables dictionary
    const varMap = new Map<string, PlcVariable>();
    for (const v of program.globalVariables) {
      varMap.set(v.name, { ...v });
    }

    const activePou = program.pous.find(p => p.id === program.activePouId) || program.pous[0];
    if (activePou) {
      for (const lv of activePou.localVariables) {
        varMap.set(lv.name, { ...lv });
      }
    }

    // Step 1: Read Inputs (Map hardware rack channels into variables)
    for (const mod of program.rack.modules) {
      for (const ch of mod.channels) {
        if (ch.tag && varMap.has(ch.tag)) {
          const variable = varMap.get(ch.tag)!;
          if (!variable.isForced) {
            variable.currentValue = ch.state;
          }
        }
      }
    }

    // Trace snapshot for trends
    const traceValues: Record<string, number | boolean> = {};

    // Step 2: Execute Program POUs
    const updatedPous: PlcPou[] = program.pous.map(pou => {
      if (pou.language !== 'LD') return pou;

      const updatedRungs: PlcLadderRung[] = pou.rungs.map(rung => {
        if (!rung.isEnabled) {
          return {
            ...rung,
            isPowerFlowActive: false,
            diagnosticStatus: 'NORMAL',
          };
        }

        let rungPowerFlow: boolean = true; // Left Power Rail is energized
        const sortedElements = [...rung.elements].sort((a, b) => {
          if (a.col !== b.col) return a.col - b.col;
          return a.row - b.row;
        });

        // Group elements by column (series nodes) and rows (parallel branches)
        const colsMap = new Map<number, PlcLadderElement[]>();
        for (const el of sortedElements) {
          if (!colsMap.has(el.col)) colsMap.set(el.col, []);
          colsMap.get(el.col)!.push(el);
        }

        const sortedColIndices = Array.from(colsMap.keys()).sort((a, b) => a - b);
        const updatedElements: PlcLadderElement[] = [];

        // Evaluate sequential column flow (Left-to-Right IEC power conduction)
        for (const colIdx of sortedColIndices) {
          const colElements = colsMap.get(colIdx)!;
          const inputPowerToCol: boolean = rungPowerFlow;
          let anyBranchConducted: boolean = false;

          for (const el of colElements) {
            const updatedEl = { ...el };
            const varObj = varMap.get(el.variableName);
            const rawVal = varObj ? (varObj.isForced && varObj.forcedValue !== undefined ? varObj.forcedValue : varObj.currentValue) : false;
            const boolVal = Boolean(rawVal);

            // Edge detection memory
            const edgeKey = `${pou.id}_${rung.id}_${el.id}`;
            const prevVal = this.prevEdgeStates.get(edgeKey) ?? false;
            this.prevEdgeStates.set(edgeKey, boolVal);

            switch (el.elementType) {
              case 'CONTACT': {
                let conducts = false;
                if (el.contactType === 'CONTACT_NO') {
                  conducts = inputPowerToCol && boolVal;
                } else if (el.contactType === 'CONTACT_NC') {
                  conducts = inputPowerToCol && !boolVal;
                } else if (el.contactType === 'CONTACT_POS_EDGE') {
                  conducts = inputPowerToCol && boolVal && !prevVal;
                } else if (el.contactType === 'CONTACT_NEG_EDGE') {
                  conducts = inputPowerToCol && !boolVal && prevVal;
                } else {
                  conducts = inputPowerToCol && boolVal;
                }
                updatedEl.isEnergized = conducts;
                if (conducts) anyBranchConducted = true;
                break;
              }

              case 'TIMER': {
                const ptMs = el.presetTimeMs ?? 5000;
                let etMs = el.elapsedTimeMs ?? 0;
                let qOut = false;

                if (el.timerType === 'TON') {
                  // On-Delay Timer
                  if (inputPowerToCol) {
                    etMs = Math.min(ptMs, etMs + deltaMs);
                    qOut = etMs >= ptMs;
                  } else {
                    etMs = 0;
                    qOut = false;
                  }
                } else if (el.timerType === 'TOF') {
                  // Off-Delay Timer
                  if (inputPowerToCol) {
                    etMs = 0;
                    qOut = true;
                  } else {
                    if (qOut || etMs < ptMs) {
                      etMs = Math.min(ptMs, etMs + deltaMs);
                      qOut = etMs < ptMs;
                    }
                  }
                } else if (el.timerType === 'TP') {
                  // Pulse Timer
                  if (inputPowerToCol && etMs === 0) {
                    etMs = deltaMs;
                    qOut = true;
                  } else if (etMs > 0 && etMs < ptMs) {
                    etMs = Math.min(ptMs, etMs + deltaMs);
                    qOut = true;
                  } else if (etMs >= ptMs) {
                    qOut = false;
                    if (!inputPowerToCol) etMs = 0;
                  }
                }

                updatedEl.elapsedTimeMs = etMs;
                updatedEl.timerQ = qOut;
                updatedEl.isEnergized = qOut;
                if (qOut) anyBranchConducted = true;

                // Sync to variable if present
                if (varObj) {
                  varObj.currentValue = qOut;
                }
                break;
              }

              case 'COUNTER': {
                const pv = el.counterPresetPv ?? 10;
                let cv = el.counterCurrentCv ?? 0;
                let qu = el.counterQu ?? false;
                let qd = el.counterQd ?? false;

                if (el.counterType === 'CTU') {
                  // Positive edge on input increments counter
                  if (inputPowerToCol && !prevVal) {
                    cv = Math.min(9999, cv + 1);
                  }
                  qu = cv >= pv;
                  updatedEl.isEnergized = qu;
                  if (qu) anyBranchConducted = true;
                } else if (el.counterType === 'CTD') {
                  if (inputPowerToCol && !prevVal) {
                    cv = Math.max(0, cv - 1);
                  }
                  qd = cv <= 0;
                  updatedEl.isEnergized = qd;
                  if (qd) anyBranchConducted = true;
                } else if (el.counterType === 'CTUD') {
                  if (inputPowerToCol && !prevVal) {
                    cv += 1;
                  }
                  qu = cv >= pv;
                  qd = cv <= 0;
                  updatedEl.isEnergized = qu;
                  if (qu) anyBranchConducted = true;
                }

                updatedEl.counterCurrentCv = cv;
                updatedEl.counterQu = qu;
                updatedEl.counterQd = qd;

                if (varObj) {
                  varObj.currentValue = cv;
                }
                break;
              }

              case 'COMPARE': {
                const v1 = Number(el.in1Value ?? (varObj ? varObj.currentValue : 0));
                const v2 = Number(el.in2Value ?? 0);
                let compRes = false;

                switch (el.compareOp) {
                  case 'EQ': compRes = v1 === v2; break;
                  case 'NE': compRes = v1 !== v2; break;
                  case 'GT': compRes = v1 > v2; break;
                  case 'LT': compRes = v1 < v2; break;
                  case 'GE': compRes = v1 >= v2; break;
                  case 'LE': compRes = v1 <= v2; break;
                  default: compRes = v1 === v2;
                }

                const conducts = inputPowerToCol && compRes;
                updatedEl.isEnergized = conducts;
                if (conducts) anyBranchConducted = true;
                break;
              }

              case 'MATH': {
                const a = Number(el.in1Value ?? 0);
                const b = Number(el.in2Value ?? 0);
                let result = 0;

                if (inputPowerToCol) {
                  switch (el.mathOp) {
                    case 'ADD': result = a + b; break;
                    case 'SUB': result = a - b; break;
                    case 'MUL': result = a * b; break;
                    case 'DIV':
                      if (b === 0) {
                        cycleErrors.push(`Erro de Divisão por Zero no Rung ${rung.rungNumber}: Bloco DIV`);
                        result = 0;
                      } else {
                        result = a / b;
                      }
                      break;
                    case 'MOD': result = b !== 0 ? a % b : 0; break;
                    case 'ABS': result = Math.abs(a); break;
                    case 'SQRT': result = a >= 0 ? Math.sqrt(a) : 0; break;
                    case 'MIN': result = Math.min(a, b); break;
                    case 'MAX': result = Math.max(a, b); break;
                    case 'LIMIT': {
                      const minLim = Number(el.in1Value ?? 0);
                      const inVal = Number(el.in2Value ?? 0);
                      const maxLim = Number(el.in3Value ?? 100);
                      result = Math.max(minLim, Math.min(inVal, maxLim));
                      break;
                    }
                    default: result = a + b;
                  }

                  if (el.destVariable && varMap.has(el.destVariable)) {
                    varMap.get(el.destVariable)!.currentValue = Math.round(result * 100) / 100;
                  }
                }

                updatedEl.outValue = result;
                updatedEl.isEnergized = inputPowerToCol;
                if (inputPowerToCol) anyBranchConducted = true;
                break;
              }

              case 'COIL': {
                // Coils are actuators positioned at the right power rail
                updatedEl.isEnergized = inputPowerToCol;
                if (varObj) {
                  if (el.coilType === 'COIL_NORMAL') {
                    if (!varObj.isForced) varObj.currentValue = inputPowerToCol;
                  } else if (el.coilType === 'COIL_NEGATED') {
                    if (!varObj.isForced) varObj.currentValue = !inputPowerToCol;
                  } else if (el.coilType === 'COIL_SET') {
                    if (inputPowerToCol && !varObj.isForced) varObj.currentValue = true;
                  } else if (el.coilType === 'COIL_RESET') {
                    if (inputPowerToCol && !varObj.isForced) varObj.currentValue = false;
                  } else if (el.coilType === 'COIL_POS_EDGE') {
                    if (inputPowerToCol && !prevVal && !varObj.isForced) varObj.currentValue = true;
                    else if (!varObj.isForced) varObj.currentValue = false;
                  } else if (el.coilType === 'COIL_NEG_EDGE') {
                    if (!inputPowerToCol && prevVal && !varObj.isForced) varObj.currentValue = true;
                    else if (!varObj.isForced) varObj.currentValue = false;
                  }
                }
                anyBranchConducted = inputPowerToCol;
                break;
              }

              default:
                updatedEl.isEnergized = inputPowerToCol;
                if (inputPowerToCol) anyBranchConducted = true;
            }

            updatedElements.push(updatedEl);
          }

          // If this column had branches, rung conduction continues if any parallel branch conducted
          rungPowerFlow = anyBranchConducted;
        }

        return {
          ...rung,
          isPowerFlowActive: rungPowerFlow,
          diagnosticStatus: cycleErrors.length > 0 ? 'ERROR' : 'NORMAL',
          elements: updatedElements,
        };
      });

      return {
        ...pou,
        rungs: updatedRungs,
      };
    });

    // Step 3: Write Outputs (Map variable state back to Rack DO/AO channels)
    const updatedRack = {
      ...program.rack,
      modules: program.rack.modules.map(mod => ({
        ...mod,
        channels: mod.channels.map(ch => {
          if (ch.tag && varMap.has(ch.tag)) {
            const v = varMap.get(ch.tag)!;
            const current = v.isForced && v.forcedValue !== undefined ? v.forcedValue : v.currentValue;
            return {
              ...ch,
              state: typeof current === 'boolean' ? current : Number(current) || 0,
            };
          }
          return ch;
        }),
      })),
    };

    // Step 4: Populate Trends Snapshot
    for (const [vName, vObj] of varMap.entries()) {
      traceValues[vName] = typeof vObj.currentValue === 'boolean' ? (vObj.currentValue ? 1 : 0) : Number(vObj.currentValue) || 0;
    }

    const scanDurationMs = Math.round((performance.now() - startTime) * 100) / 100;

    const nextProgram: PlcProgramConfiguration = {
      ...program,
      rack: updatedRack,
      globalVariables: Array.from(varMap.values()).filter(v => v.scope === 'VAR_GLOBAL'),
      pous: updatedPous,
      cycleCount: program.cycleCount + 1,
      actualScanTimeMs: scanDurationMs || deltaMs,
    };

    const tracePoint: PlcTraceSample = {
      timestamp: Date.now(),
      cycle: nextProgram.cycleCount,
      values: traceValues,
    };

    return {
      nextProgram,
      scanDurationMs,
      tracePoint,
      cycleErrors,
    };
  }
}
