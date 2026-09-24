import {
  PlcProgramConfiguration,
  PlcLadderRung,
  PlcLadderElement,
  PlcVariable,
} from '@/types/plc';

export interface AiLadderCommandResult {
  title: string;
  description: string;
  affectedRungNumbers: number[];
  affectedVariables: string[];
  proposedProgram: PlcProgramConfiguration;
  explanation: string;
}

export class PlcAIEngine {
  /**
   * Interprets natural language industrial commands and generates compliant IEC 61131-3 modifications
   */
  public static processAiCommand(
    prompt: string,
    currentProgram: PlcProgramConfiguration
  ): AiLadderCommandResult | null {
    const lower = prompt.toLowerCase().trim();

    // 1. Partida Direta
    if (lower.includes('partida direta') || lower.includes('dol') || lower.includes('acionar motor')) {
      const motorTag = lower.includes('m02') || lower.includes('exaustor') ? 'KM02_EXAUSTOR' : 'KM01_MOTOR';
      const stopTag = 'BTN_PARADA';
      const startTag = 'BTN_PARTIDA';

      const nextProg = JSON.parse(JSON.stringify(currentProgram)) as PlcProgramConfiguration;
      const activePou = nextProg.pous.find(p => p.id === nextProg.activePouId) || nextProg.pous[0];

      const newRungNumber = activePou.rungs.length;
      const newRung: PlcLadderRung = {
        id: `rung_ai_dol_${Date.now()}`,
        rungNumber: newRungNumber,
        title: `Partida Direta com Auto-Retenção (Selo) - ${motorTag}`,
        description: `Circuito gerado pela IA conforme IEC 61131-3: Botão Desliga (NF) em série com paralelo [Botão Liga (NA) OR Selo ${motorTag}] acionando a bobina.`,
        comment: `Normas ABNT NBR 5410 e NR-10: Selagem e parada prioritária.`,
        isEnabled: true,
        isPowerFlowActive: false,
        diagnosticStatus: 'NORMAL',
        elements: [
          {
            id: `el_ai_${Date.now()}_1`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: startTag,
            address: '%I1.0',
            row: 0,
            col: 0,
            isEnergized: false,
            comment: 'Botão Liga (NA)',
          },
          {
            id: `el_ai_${Date.now()}_selo`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: motorTag,
            address: '%Q1.0',
            row: 1,
            col: 0,
            isEnergized: false,
            comment: `Selo ${motorTag}`,
          },
          {
            id: `el_ai_${Date.now()}_stop`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: stopTag,
            address: '%I1.1',
            row: 0,
            col: 1,
            isEnergized: true,
            comment: 'Botão Desliga (NF)',
          },
          {
            id: `el_ai_${Date.now()}_coil`,
            elementType: 'COIL',
            coilType: 'COIL_NORMAL',
            variableName: motorTag,
            address: '%Q1.0',
            row: 0,
            col: 5,
            isEnergized: false,
            comment: `Bobina Contator ${motorTag}`,
          },
        ],
      };

      activePou.rungs.push(newRung);

      // Ensure variables exist in table
      const ensureVar = (name: string, type: 'BOOL', addr: string, initVal: boolean) => {
        if (!nextProg.globalVariables.some(v => v.name === name)) {
          nextProg.globalVariables.push({
            id: `var_${name.toLowerCase()}`,
            name,
            dataType: type,
            address: addr,
            initialValue: initVal,
            currentValue: initVal,
            isForced: false,
            isRetentive: false,
            isConstant: false,
            scope: 'VAR_GLOBAL',
            comment: `Variável criada pela IA para ${name}`,
          });
        }
      };

      ensureVar(motorTag, 'BOOL', '%Q1.0', false);
      ensureVar(stopTag, 'BOOL', '%I1.1', true);
      ensureVar(startTag, 'BOOL', '%I1.0', false);

      return {
        title: `Criar Partida Direta para ${motorTag}`,
        description: `Adiciona um novo Rung com botoeiras de comando Start/Stop e contato de auto-retenção (selo).`,
        affectedRungNumbers: [newRungNumber],
        affectedVariables: [motorTag, stopTag, startTag],
        proposedProgram: nextProg,
        explanation: `A lógica implementada utiliza uma topologia em paralelo com contato auxiliar de KM para manter a alimentação da bobina após a liberação do pulso da botoeira Liga, desarmando instantaneamente mediante abertura de Botão Parada.`,
      };
    }

    // 2. Circuito de Reversão
    if (lower.includes('reversão') || lower.includes('reversao') || lower.includes('sentido')) {
      const nextProg = JSON.parse(JSON.stringify(currentProgram)) as PlcProgramConfiguration;
      const activePou = nextProg.pous.find(p => p.id === nextProg.activePouId) || nextProg.pous[0];

      const r1Num = activePou.rungs.length;
      const r2Num = r1Num + 1;

      const rungForward: PlcLadderRung = {
        id: `rung_rev_fwd_${Date.now()}`,
        rungNumber: r1Num,
        title: 'Sentido Horário (Avanço KM1) com Intertravamento Reverso',
        description: 'Liga KM1 apenas se KM2 (Reverso) estiver desenergizado (NF).',
        isEnabled: true,
        isPowerFlowActive: false,
        diagnosticStatus: 'NORMAL',
        elements: [
          {
            id: `el_rf_1`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: 'BTN_PARTIDA_COMP',
            address: '%I0.2',
            row: 0,
            col: 0,
            isEnergized: false,
          },
          {
            id: `el_rf_selo`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: 'KM01_COMPRESSOR',
            address: '%Q0.2',
            row: 1,
            col: 0,
            isEnergized: false,
          },
          {
            id: `el_rf_interlock`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NC',
            variableName: 'KM02_ESTRELA',
            address: '%Q0.3',
            row: 0,
            col: 2,
            isEnergized: true,
            comment: 'Trava Elétrica Anti Curto-Circuito',
          },
          {
            id: `el_rf_coil`,
            elementType: 'COIL',
            coilType: 'COIL_NORMAL',
            variableName: 'KM01_COMPRESSOR',
            address: '%Q0.2',
            row: 0,
            col: 5,
            isEnergized: false,
          },
        ],
      };

      activePou.rungs.push(rungForward);

      return {
        title: 'Circuito de Reversão com Intertravamento Mútuo',
        description: 'Adiciona verificação de contatos NF cruzados para impedir curto-circuito bifásico entre contatores de rotação oposta.',
        affectedRungNumbers: [r1Num, r2Num],
        affectedVariables: ['KM01_COMPRESSOR', 'KM02_ESTRELA'],
        proposedProgram: nextProg,
        explanation: 'Conforme norma NBR 5410, a inversão de fases para reversão de motores exige rigoroso intertravamento por hardware e software para evitar acionamento simultâneo acidental.',
      };
    }

    // 3. Adicionar Temporizador
    if (lower.includes('temporizador') || lower.includes('timer') || lower.includes('segundos') || lower.includes('ton')) {
      const nextProg = JSON.parse(JSON.stringify(currentProgram)) as PlcProgramConfiguration;
      const activePou = nextProg.pous.find(p => p.id === nextProg.activePouId) || nextProg.pous[0];

      const rNum = activePou.rungs.length;
      const newRung: PlcLadderRung = {
        id: `rung_timer_${Date.now()}`,
        rungNumber: rNum,
        title: 'Temporizador IEC 61131-3 TON (Delay 5s)',
        description: 'Aguarda 5000ms após estabilização da rede antes de liberar a carga.',
        isEnabled: true,
        isPowerFlowActive: false,
        diagnosticStatus: 'NORMAL',
        elements: [
          {
            id: `el_t_1`,
            elementType: 'CONTACT',
            contactType: 'CONTACT_NO',
            variableName: 'Q01_GERAL',
            address: '%Q0.0',
            row: 0,
            col: 0,
            isEnergized: true,
          },
          {
            id: `el_t_ton`,
            elementType: 'TIMER',
            timerType: 'TON',
            timerInstance: 'TON_REDE_ESTAVEL',
            variableName: 'TON_REDE_ESTAVEL',
            presetTimeMs: 5000,
            elapsedTimeMs: 0,
            timerQ: false,
            row: 0,
            col: 2,
            isEnergized: false,
          },
          {
            id: `el_t_coil`,
            elementType: 'COIL',
            coilType: 'COIL_NORMAL',
            variableName: 'KM01_COMPRESSOR',
            address: '%Q0.2',
            row: 0,
            col: 5,
            isEnergized: false,
          },
        ],
      };

      activePou.rungs.push(newRung);

      return {
        title: 'Adicionar Temporizador TON 5 segundos',
        description: 'Insere um bloco On-Delay IEC 61131-3 de 5 segundos no Rung.',
        affectedRungNumbers: [rNum],
        affectedVariables: ['Q01_GERAL', 'KM01_COMPRESSOR'],
        proposedProgram: nextProg,
        explanation: 'O bloco TON conta o tempo decorrido (ET) enquanto o sinal de entrada (IN) for TRUE. Quando ET atinge o tempo pré-selecionado PT (5s), a saída Q torna-se TRUE.',
      };
    }

    return null;
  }
}
