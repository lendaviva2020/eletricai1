// ============================================================================
// ELÉTRICAI — SIMULATION ENGINE / SIMULADOR DE PLANTA (FASE 12)
//
// NATUREZA: SIMULAÇÃO DETERMINÍSTICA DE SOFTWARE.
// Esta rotina NÃO controla, NÃO comanda e NÃO altera equipamento físico.
// Ela apenas reproduz, em memória, o comportamento esperado de um relé térmico
// e da bobina de um arranque direto para fins de estudo e revisão.
//
// SEGURANÇA: a lógica de simulação aqui é INDEPENDENTE de qualquer função de
// segurança real. Nenhum Emergency Stop, Safety Relay ou intertravamento é
// substituído, contornado ou desativado por este módulo.
//
// PREMISSAS (obrigatoriamente explícitas):
// - Curva térmica: t_trip = T / ((I/Ie)² - 1) para I > Ie, onde T é informada
//   pelo usuário (`curveConstantS`). T não possui valor padrão neste código:
//   ausência dela significa DADO_NAO_INFORMADO e nenhum tempo de disparo é
//   calculado.
// - Todas as saídas são rotuladas SIMULAÇÃO e não devem ser tratadas como
//   medição real de campo.
// ============================================================================

export type FaultKind = 'NONE' | 'OVERLOAD' | 'SHORT_CIRCUIT' | 'PHASE_LOSS';

export type SimulationTag = 'SIMULAÇÃO';

export interface ThermalRelayModel {
  /** Corrente de ajuste/elemento térmico (A). */
  ratedCurrentA: number;
  /**
   * Constante da curva de inverso-de-tempo (s). DEVE vir do datasheet do
   * relé. Sem este dado não existe tempo de disparo calculável.
   */
  curveConstantS?: number;
  /**
   * Corrente instantânea (A). Se informada e `currentA >= instantaneousTripA`,
   * o disparo é imediato no primeiro passo. Se ausente, apenas a curva térmica
   * é aplicada.
   */
  instantaneousTripA?: number;
}

export interface SimulationFault {
  kind: FaultKind;
  /** Corrente no motor durante a falha (A). Obrigatória para falhas != NONE. */
  currentA?: number;
  description?: string;
}

export interface DirectOnlineStarterState {
  startButtonPressed: boolean;
  stopButtonClosed: boolean;
  thermalRelayContactClosed: boolean;
  /** Estado anterior da bobina (realimentação de selo). */
  previousCoilEnergized: boolean;
}

export interface PlantSimulationConfig {
  motorRatedCurrentA: number;
  thermalRelay: ThermalRelayModel;
  /** Corrente em regime nominal da carga (A). */
  loadCurrentA?: number;
  fault: SimulationFault;
  /** Duração total da janela de simulação (s). */
  durationS: number;
  /** Passo de integração (s). Padrão 0,1 s. */
  timestepS?: number;
}

export interface SimulationEvent {
  timeS: number;
  code:
    | 'SIM_START'
    | 'OVERLOAD_DETECTED'
    | 'THERMAL_RELAY_TRIP'
    | 'INSTANTANEOUS_TRIP'
    | 'COIL_DEENERGIZED'
    | 'MOTOR_STOPPED'
    | 'NO_TRIP_WITHIN_WINDOW'
    | 'DADO_NAO_INFORMADO';
  message: string;
}

export interface SimulationStep {
  timeS: number;
  motorCurrentA: number;
  relayContactClosed: boolean;
  coilEnergized: boolean;
  motorRunning: boolean;
}

export interface PlantSimulationResult {
  tag: SimulationTag;
  steps: SimulationStep[];
  events: SimulationEvent[];
  tripped: boolean;
  tripTimeS: number | null;
  notes: string[];
}

const DEFAULT_TIMESTEP_S = 0.1;
const MIN_TIMESTEP_S = 1e-6;

/**
 * Tempo de disparo do relé térmico pela curva de inverso-de-tempo.
 * Retorna `null` quando não há base de cálculo (DADO_NAO_INFORMADO) ou quando
 * a corrente é menor ou igual ao ajuste (não dispara).
 */
export function computeThermalRelayTripTime(
  currentA: number,
  ratedCurrentA: number,
  curveConstantS?: number
): number | null {
  if (!(ratedCurrentA > 0) || !(currentA > 0)) return null;
  if (curveConstantS === undefined || !(curveConstantS > 0)) return null;

  const ratio = currentA / ratedCurrentA;
  if (ratio <= 1) return null;

  return curveConstantS / (ratio ** 2 - 1);
}

/**
 * Avalia uma etapa de rung Ladder de arranque direto (partida DOL):
 *   Bobina KM = (Botão LIGAR OR Selo) AND Botão PARAR AND Contato FT
 *   Selo       = Bobina (realimentação)
 */
export function evaluateDirectOnlineStarter(
  state: DirectOnlineStarterState
): { coilEnergized: boolean; sealInClosed: boolean; interlockOk: boolean } {
  const interlockOk = state.stopButtonClosed && state.thermalRelayContactClosed;
  const sealInClosed = state.previousCoilEnergized && interlockOk;
  const coilEnergized = (state.startButtonPressed || sealInClosed) && interlockOk;

  return { coilEnergized, sealInClosed, interlockOk };
}

function resolveFaultCurrent(config: PlantSimulationConfig, notes: string[]): number | null {
  const { fault, loadCurrentA, motorRatedCurrentA } = config;

  switch (fault.kind) {
    case 'NONE':
      if (typeof loadCurrentA === 'number' && loadCurrentA > 0) return loadCurrentA;
      if (motorRatedCurrentA > 0) {
        notes.push('SIMULAÇÃO: sem falha — adotada a corrente nominal do motor como regime.');
        return motorRatedCurrentA;
      }
      notes.push('DADO_NAO_INFORMADO: corrente de regime do motor ausente.');
      return null;
    case 'OVERLOAD':
    case 'SHORT_CIRCUIT':
    case 'PHASE_LOSS':
      if (typeof fault.currentA === 'number' && fault.currentA > 0) {
        notes.push(
          `SIMULAÇÃO: corrente de falha ${fault.currentA} A informada pelo usuário (${fault.kind}). Não é leitura de campo.`
        );
        return fault.currentA;
      }
      notes.push(
        `DADO_NAO_INFORMADO: a falha ${fault.kind} exige fault.currentA informado — nenhum tempo de disparo foi calculado.`
      );
      return null;
  }
}

/**
 * Executa a simulação da janela de tempo informada.
 * Função pura e determinística: mesma entrada, mesma saída, sem aleatoriedade.
 */
export function runPlantSimulation(config: PlantSimulationConfig): PlantSimulationResult {
  const notes: string[] = ['SIMULAÇÃO: resultado gerado por motor de simulação — não é dado real de campo.'];
  const events: SimulationEvent[] = [];
  const steps: SimulationStep[] = [];

  const timestepS = Math.max(
    config.timestepS && config.timestepS > 0 ? config.timestepS : DEFAULT_TIMESTEP_S,
    MIN_TIMESTEP_S
  );
  const durationS = config.durationS > 0 ? config.durationS : 0;

  const faultCurrentA = resolveFaultCurrent(config, notes);

  events.push({
    timeS: 0,
    code: 'SIM_START',
    message: `SIMULAÇÃO iniciada com falha ${config.fault.kind}${config.fault.description ? ` — ${config.fault.description}` : ''}.`,
  });

  if (faultCurrentA === null) {
    events.push({
      timeS: 0,
      code: 'DADO_NAO_INFORMADO',
      message: 'Corrente de simulação indisponível: nenhuma conclusão de disparo foi produzida.',
    });
    return { tag: 'SIMULAÇÃO', steps, events, tripped: false, tripTimeS: null, notes };
  }

  const relay = config.thermalRelay;
  const instantaneousTrip =
    typeof relay.instantaneousTripA === 'number' && relay.instantaneousTripA > 0
      ? faultCurrentA >= relay.instantaneousTripA
      : false;

  const inverseTripTimeS = instantaneousTrip
    ? 0
    : computeThermalRelayTripTime(faultCurrentA, relay.ratedCurrentA, relay.curveConstantS);

  if (inverseTripTimeS === null && !instantaneousTrip) {
    if (faultCurrentA <= relay.ratedCurrentA) {
      notes.push(
        `SIMULAÇÃO: corrente ${faultCurrentA} A ≤ ajuste ${relay.ratedCurrentA} A — a curva térmica não dispara.`
      );
    } else {
      notes.push(
        'DADO_NAO_INFORMADO: thermalRelay.curveConstantS ausente — tempo de disparo pela curva não calculado.'
      );
      events.push({
        timeS: 0,
        code: 'DADO_NAO_INFORMADO',
        message: 'curveConstantS do relé térmico não informada; simulação mantida sem disparo.',
      });
    }
  }

  let relayClosed = true;
  let coilEnergized = true;
  let motorRunning = true;
  let tripTimeS: number | null = null;
  let overloadReported = false;

  for (let timeS = 0; timeS <= durationS + timestepS / 2; timeS += timestepS) {
    const roundedTimeS = Math.round(timeS * 1e6) / 1e6;

    if (!overloadReported && faultCurrentA > relay.ratedCurrentA) {
      overloadReported = true;
      events.push({
        timeS: roundedTimeS,
        code: 'OVERLOAD_DETECTED',
        message: `SIMULAÇÃO: corrente de ${faultCurrentA} A supera o ajuste de ${relay.ratedCurrentA} A do relé térmico.`,
      });
    }

    if (relayClosed) {
      const shouldTrip =
        instantaneousTrip || (inverseTripTimeS !== null && roundedTimeS >= inverseTripTimeS - 1e-9);

      if (shouldTrip) {
        relayClosed = false;
        tripTimeS = instantaneousTrip ? 0 : inverseTripTimeS;

        events.push({
          timeS: roundedTimeS,
          code: instantaneousTrip ? 'INSTANTANEOUS_TRIP' : 'THERMAL_RELAY_TRIP',
          message: instantaneousTrip
            ? `SIMULAÇÃO: disparo instantâneo do relé térmico em ${faultCurrentA} A (limite ${relay.instantaneousTripA} A).`
            : `SIMULAÇÃO: disparo do relé térmico em ${tripTimeS?.toFixed(2)} s pela curva (I/Ie = ${(faultCurrentA / relay.ratedCurrentA).toFixed(2)}).`,
        });
      }
    }

    const ladder = evaluateDirectOnlineStarter({
      startButtonPressed: false,
      stopButtonClosed: true,
      thermalRelayContactClosed: relayClosed,
      previousCoilEnergized: coilEnergized,
    });

    const coilWasEnergized = coilEnergized;
    coilEnergized = ladder.coilEnergized;

    if (coilWasEnergized && !coilEnergized) {
      events.push({
        timeS: roundedTimeS,
        code: 'COIL_DEENERGIZED',
        message: 'SIMULAÇÃO: contato auxiliar do relé térmico abriu e a bobina do contator foi desenergizada no rung Ladder.',
      });
      motorRunning = false;
      events.push({
        timeS: roundedTimeS,
        code: 'MOTOR_STOPPED',
        message: 'SIMULAÇÃO: motor parado após abertura da bobina.',
      });
    }

    steps.push({
      timeS: roundedTimeS,
      motorCurrentA: motorRunning ? faultCurrentA : 0,
      relayContactClosed: relayClosed,
      coilEnergized,
      motorRunning,
    });

    if (!motorRunning) break;
  }

  if (tripTimeS === null) {
    events.push({
      timeS: durationS,
      code: 'NO_TRIP_WITHIN_WINDOW',
      message: `SIMULAÇÃO: nenhum disparo ocorrido na janela de ${durationS} s com os dados informados.`,
    });
  }

  return {
    tag: 'SIMULAÇÃO',
    steps,
    events,
    tripped: tripTimeS !== null,
    tripTimeS,
    notes,
  };
}
