import {
  computeThermalRelayTripTime,
  evaluateDirectOnlineStarter,
  runPlantSimulation,
} from '@/lib/engineering/simulation/plant-simulator';
import type { PlantSimulationConfig } from '@/lib/engineering/simulation/plant-simulator';

const baseConfig = (overrides: Partial<PlantSimulationConfig> = {}): PlantSimulationConfig => ({
  motorRatedCurrentA: 29,
  thermalRelay: { ratedCurrentA: 29, curveConstantS: 10 },
  fault: { kind: 'OVERLOAD', currentA: 58, description: 'sobrecarga mecânica da bomba' },
  durationS: 10,
  timestepS: 0.1,
  ...overrides,
});

describe('Simulation Engine — Simulador de Planta (plant-simulator)', () => {
  describe('computeThermalRelayTripTime (curva de inverso-de-tempo)', () => {
    it('calcula t = T / ((I/Ie)² - 1)', () => {
      // I = 2 · Ie, T = 10 s -> 10 / (4 - 1) = 3,333 s
      expect(computeThermalRelayTripTime(58, 29, 10)).toBeCloseTo(3.333, 3);
    });

    it('não dispara quando a corrente é menor ou igual ao ajuste', () => {
      expect(computeThermalRelayTripTime(29, 29, 10)).toBeNull();
      expect(computeThermalRelayTripTime(20, 29, 10)).toBeNull();
    });

    it('retorna null quando a constante da curva não é informada (DADO_NAO_INFORMADO)', () => {
      expect(computeThermalRelayTripTime(58, 29)).toBeNull();
      expect(computeThermalRelayTripTime(58, 29, 0)).toBeNull();
    });

    it('retorna null com dados inválidos', () => {
      expect(computeThermalRelayTripTime(58, 0, 10)).toBeNull();
      expect(computeThermalRelayTripTime(0, 29, 10)).toBeNull();
    });
  });

  describe('evaluateDirectOnlineStarter (rung Ladder DOL)', () => {
    const closedInterlocks = {
      stopButtonClosed: true,
      thermalRelayContactClosed: true,
    };

    it('energiza a bobina ao pressionar LIGAR com intertravamentos fechados', () => {
      const result = evaluateDirectOnlineStarter({
        startButtonPressed: true,
        previousCoilEnergized: false,
        ...closedInterlocks,
      });

      expect(result.coilEnergized).toBe(true);
      expect(result.sealInClosed).toBe(false);
      expect(result.interlockOk).toBe(true);
    });

    it('mantém a bobina energizada pelo selo após soltar o botão', () => {
      const result = evaluateDirectOnlineStarter({
        startButtonPressed: false,
        previousCoilEnergized: true,
        ...closedInterlocks,
      });

      expect(result.sealInClosed).toBe(true);
      expect(result.coilEnergized).toBe(true);
    });

    it('desenergiza a bobina quando o contato do relé térmico abre', () => {
      const result = evaluateDirectOnlineStarter({
        startButtonPressed: true,
        previousCoilEnergized: true,
        stopButtonClosed: true,
        thermalRelayContactClosed: false,
      });

      expect(result.interlockOk).toBe(false);
      expect(result.coilEnergized).toBe(false);
    });

    it('desenergiza a bobina quando o botão PARAR abre', () => {
      const result = evaluateDirectOnlineStarter({
        startButtonPressed: true,
        previousCoilEnergized: true,
        stopButtonClosed: false,
        thermalRelayContactClosed: true,
      });

      expect(result.coilEnergized).toBe(false);
    });
  });

  describe('runPlantSimulation (janela de tempo)', () => {
    it('marca todo o resultado como SIMULAÇÃO', () => {
      const result = runPlantSimulation(baseConfig());

      expect(result.tag).toBe('SIMULAÇÃO');
      expect(result.notes[0]).toContain('SIMULAÇÃO');
      result.events.forEach(event => {
        expect(event.message).toMatch(/^SIMULAÇÃO/);
      });
    });

    it('abre o relé térmico pela curva e interrompe a bobina no Ladder', () => {
      const result = runPlantSimulation(baseConfig());

      expect(result.tripped).toBe(true);
      expect(result.tripTimeS).toBeCloseTo(3.333, 2);

      const codes = result.events.map(e => e.code);
      expect(codes).toContain('OVERLOAD_DETECTED');
      expect(codes).toContain('THERMAL_RELAY_TRIP');
      expect(codes).toContain('COIL_DEENERGIZED');
      expect(codes).toContain('MOTOR_STOPPED');

      const lastStep = result.steps[result.steps.length - 1];
      expect(lastStep.relayContactClosed).toBe(false);
      expect(lastStep.coilEnergized).toBe(false);
      expect(lastStep.motorRunning).toBe(false);
      expect(lastStep.motorCurrentA).toBe(0);
    });

    it('permanece com bobina energizada enquanto não há disparo', () => {
      const result = runPlantSimulation(baseConfig());

      const beforeTrip = result.steps.filter(s => s.relayContactClosed);
      expect(beforeTrip.length).toBeGreaterThan(0);
      beforeTrip.forEach(step => {
        expect(step.coilEnergized).toBe(true);
        expect(step.motorRunning).toBe(true);
      });
    });

    it('não dispara dentro da janela quando a sobrecarga é leve', () => {
      const result = runPlantSimulation(
        baseConfig({ fault: { kind: 'OVERLOAD', currentA: 30.45 } })
      );

      expect(result.tripped).toBe(false);
      expect(result.tripTimeS).toBeNull();
      expect(result.events.map(e => e.code)).toContain('NO_TRIP_WITHIN_WINDOW');
      expect(result.steps[result.steps.length - 1].motorRunning).toBe(true);
    });

    it('dispara instantaneamente quando informado limite instantâneo', () => {
      const result = runPlantSimulation(
        baseConfig({
          thermalRelay: { ratedCurrentA: 29, curveConstantS: 10, instantaneousTripA: 100 },
          fault: { kind: 'SHORT_CIRCUIT', currentA: 800 },
        })
      );

      expect(result.tripped).toBe(true);
      expect(result.tripTimeS).toBe(0);
      expect(result.events.map(e => e.code)).toContain('INSTANTANEOUS_TRIP');
      expect(result.steps[0].motorRunning).toBe(false);
    });

    it('não produz conclusão quando a corrente da falha não é informada', () => {
      const result = runPlantSimulation(
        baseConfig({ fault: { kind: 'PHASE_LOSS' } })
      );

      expect(result.tripped).toBe(false);
      expect(result.steps).toHaveLength(0);
      expect(result.events.map(e => e.code)).toContain('DADO_NAO_INFORMADO');
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });

    it('sinaliza DADO_NAO_INFORMADO quando a constante da curva falta', () => {
      const result = runPlantSimulation(
        baseConfig({ thermalRelay: { ratedCurrentA: 29 } })
      );

      expect(result.tripped).toBe(false);
      expect(result.events.map(e => e.code)).toContain('DADO_NAO_INFORMADO');
      expect(result.notes.join(' ')).toContain('curveConstantS');
    });

    it('não dispara quando a corrente está abaixo do ajuste do relé', () => {
      const result = runPlantSimulation(
        baseConfig({ fault: { kind: 'NONE' }, loadCurrentA: 20 })
      );

      expect(result.tripped).toBe(false);
      expect(result.notes.join(' ')).toContain('não dispara');
    });

    it('é determinística: mesma entrada produz exatamente a mesma saída', () => {
      const config = baseConfig();
      const first = runPlantSimulation(config);
      const second = runPlantSimulation(config);

      expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    });

    it('não executa mais passos que a janela de tempo permite', () => {
      const result = runPlantSimulation(
        baseConfig({ fault: { kind: 'OVERLOAD', currentA: 29.01 } })
      );

      const maxSteps = Math.floor(10 / 0.1) + 2;
      expect(result.steps.length).toBeLessThanOrEqual(maxSteps);
    });
  });
});
