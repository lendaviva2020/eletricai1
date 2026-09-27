import {
  calculateNetworkImpedance,
  calculateTransformerImpedance,
  calculateCableImpedance,
  sumImpedances,
  calculateSymmetricalShortCircuitCurrent,
  calculateTransformerShortCircuitCurrent,
} from '@/lib/engineering/calculation-engine/short-circuit';

describe('Calculation Engine — Curto-Circuito IEC 60909 (short-circuit)', () => {
  describe('calculateNetworkImpedance', () => {
    it('calcula Z_rede = 1,1 · V² / S_cc', () => {
      const result = calculateNetworkImpedance({ voltageV: 380, shortCircuitPowerMva: 25 });

      // Z = 1,1 · 380² / 25e6 = 0,0063536 Ω
      expect(result.resistanceOhm).toBeCloseTo(0.00635, 5);
      expect(result.reactanceOhm).toBe(0);
      expect(result.notes.join(' ')).not.toContain('DADO_NAO_INFORMADO');
    });

    it('sinaliza DADO_NAO_INFORMADO quando S_cc não é informada', () => {
      const result = calculateNetworkImpedance({ voltageV: 380 });

      expect(result.resistanceOhm).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });
  });

  describe('calculateTransformerImpedance', () => {
    it('calcula Z, R e X do transformador a partir da impedância e das perdas', () => {
      const result = calculateTransformerImpedance({
        transformerKva: 1000,
        secondaryVoltageV: 380,
        impedancePercent: 5,
        loadLossW: 10000,
      });

      // Z = 0,05 · 380² / 1e6 = 0,00722 Ω
      // R = 10000 · 380² / (1e6)² = 0,001444 Ω
      // X = √(Z² - R²) = 0,0070741 Ω
      expect(result.impedanceOhm).toBeCloseTo(0.00722, 5);
      expect(result.resistanceOhm).toBeCloseTo(0.001444, 6);
      expect(result.reactanceOhm).toBeCloseTo(0.0070741, 6);
    });

    it('marca DADO_NAO_INFORMADO para perdas em carga ausentes', () => {
      const result = calculateTransformerImpedance({
        transformerKva: 1000,
        secondaryVoltageV: 380,
        impedancePercent: 5,
      });

      expect(result.resistanceOhm).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });

    it('não calcula com dados obrigatórios ausentes', () => {
      const result = calculateTransformerImpedance({
        transformerKva: 0,
        secondaryVoltageV: 380,
        impedancePercent: 5,
      });

      expect(result.impedanceOhm).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });
  });

  describe('calculateCableImpedance', () => {
    it('usa R e X tabelados por km para o trecho', () => {
      const result = calculateCableImpedance({ lengthMeters: 50, sectionMm2: 6 });

      // 3,71 Ω/km · 0,05 km = 0,1855 Ω ; 0,096 Ω/km · 0,05 km = 0,0048 Ω
      expect(result.resistanceOhm).toBeCloseTo(0.1855, 4);
      expect(result.reactanceOhm).toBeCloseTo(0.0048, 4);
    });

    it('sinaliza seção fora da tabela', () => {
      const result = calculateCableImpedance({ lengthMeters: 50, sectionMm2: 7 });

      expect(result.resistanceOhm).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });
  });

  describe('sumImpedances', () => {
    it('soma R e X em série', () => {
      const total = sumImpedances([
        { resistanceOhm: 0.1, reactanceOhm: 0.01, impedanceOhm: 0 },
        { resistanceOhm: 0.05, reactanceOhm: 0.02, impedanceOhm: 0 },
      ]);

      expect(total.resistanceOhm).toBeCloseTo(0.15, 6);
      expect(total.reactanceOhm).toBeCloseTo(0.03, 6);
      expect(total.impedanceOhm).toBeCloseTo(Math.sqrt(0.15 ** 2 + 0.03 ** 2), 6);
    });
  });

  describe('calculateSymmetricalShortCircuitCurrent', () => {
    it('calcula I_k3 = c · V / (√3 · Z) para carga puramente resistiva', () => {
      const result = calculateSymmetricalShortCircuitCurrent({
        voltageV: 400,
        impedances: [{ resistanceOhm: 0.1, reactanceOhm: 0, impedanceOhm: 0 }],
        voltageFactorC: 1,
      });

      // 400 / (√3 · 0,1) = 2309,4 A
      expect(result.ik3A).toBeCloseTo(2309.4, 1);
      expect(result.ik3Ka).toBeCloseTo(2.31, 2);
      expect(result.formula).toContain('I_k3');
      expect(result.standardReference).toContain('IEC 60909');
    });

    it('escala linearmente com o fator de tensão c', () => {
      const impedances = [{ resistanceOhm: 0.1, reactanceOhm: 0, impedanceOhm: 0 }];
      const c1 = calculateSymmetricalShortCircuitCurrent({ voltageV: 400, impedances, voltageFactorC: 1 });
      const c11 = calculateSymmetricalShortCircuitCurrent({ voltageV: 400, impedances, voltageFactorC: 1.1 });

      expect(c11.ik3A).toBeCloseTo(c1.ik3A * 1.1, 1);
      expect(c11.notes.join(' ')).toContain('VALOR_ASSUMIDO');
    });

    it('calcula o cenário rede + transformador + cabo', () => {
      const trafo = calculateTransformerImpedance({
        transformerKva: 1000,
        secondaryVoltageV: 380,
        impedancePercent: 5,
        loadLossW: 10000,
      });
      const cabo = calculateCableImpedance({ lengthMeters: 50, sectionMm2: 25 });

      const result = calculateSymmetricalShortCircuitCurrent({
        voltageV: 380,
        impedances: [trafo, cabo],
      });

      expect(result.ik3A).toBeGreaterThan(0);
      expect(result.sumResistanceOhm).toBeCloseTo(
        trafo.resistanceOhm + cabo.resistanceOhm,
        4
      );
      expect(result.sumReactanceOhm).toBeCloseTo(
        trafo.reactanceOhm + cabo.reactanceOhm,
        4
      );
    });

    it('não calcula sem tensão e sinaliza DADO_NAO_INFORMADO', () => {
      const result = calculateSymmetricalShortCircuitCurrent({
        voltageV: 0,
        impedances: [{ resistanceOhm: 0.1, reactanceOhm: 0, impedanceOhm: 0 }],
      });

      expect(result.ik3A).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });
  });

  describe('calculateTransformerShortCircuitCurrent', () => {
    it('calcula I_cc no secundário do transformador', () => {
      const result = calculateTransformerShortCircuitCurrent({
        transformerKva: 1000,
        secondaryVoltageV: 380,
        impedancePercent: 5,
      });

      // In = 1e6 / (√3 · 380) = 1519,3 A ; Icc = 1519,3 / 0,05 = 30,39 kA
      expect(result.ikKa).toBeCloseTo(30.4, 1);
      expect(result.ikA).toBe(30400);
      expect(result.standardReference).toContain('IEC 60909');
    });

    it('avisa quando z% não é informada (VALOR_ASSUMIDO)', () => {
      const result = calculateTransformerShortCircuitCurrent({
        transformerKva: 1000,
        secondaryVoltageV: 380,
      });

      expect(result.notes.join(' ')).toContain('VALOR_ASSUMIDO');
      expect(result.ikKa).toBeGreaterThan(0);
    });

    it('não calcula com dados ausentes', () => {
      const result = calculateTransformerShortCircuitCurrent({
        transformerKva: 1000,
        secondaryVoltageV: 0,
      });

      expect(result.ikKa).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });
  });
});
