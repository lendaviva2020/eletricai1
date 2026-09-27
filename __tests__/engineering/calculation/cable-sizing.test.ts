import {
  sizeCableAndProtection,
  checkProtectionCoordination,
  calculateThermalMinimumSection,
} from '@/lib/engineering/calculation-engine/cable-sizing';

describe('Calculation Engine — Dimensionamento de Condutores (cable-sizing)', () => {
  const baseInputs = {
    powerKw: 15,
    voltageV: 380,
    lengthMeters: 50,
    insulation: 'PVC' as const,
    ambientTempC: 30,
    groupingCircuits: 1,
    installationMethod: 'B1' as const,
    powerFactor: 0.85,
    efficiency: 0.92,
  };

  describe('sizeCableAndProtection', () => {
    it('dimensiona motor 15 kW / 380 V / 50 m com memória de cálculo completa', () => {
      const result = sizeCableAndProtection(baseInputs);

      expect(result.ib).toBeCloseTo(29.14, 1);
      expect(result.fT).toBe(1.0);
      expect(result.fA).toBe(1.0);
      expect(result.requiredIz).toBeCloseTo(29.1, 1);
      expect(result.selectedCableMm2).toBe(6);
      expect(result.selectedCableAmpacityA).toBe(36);
      expect(result.selectedBreakerIn).toBe(32);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
      expect(result.isCompliant).toBe(true);
    });

    it('aplica fator de agrupamento e exige bitola maior', () => {
      const single = sizeCableAndProtection(baseInputs);
      const grouped = sizeCableAndProtection({ ...baseInputs, groupingCircuits: 6 });

      expect(grouped.fA).toBe(0.57);
      expect(grouped.requiredIz).toBeGreaterThan(single.requiredIz);
      expect(grouped.selectedCableMm2).toBeGreaterThanOrEqual(single.selectedCableMm2);
    });

    it('aplica fator de correção de temperatura ambiente', () => {
      const cool = sizeCableAndProtection({ ...baseInputs, ambientTempC: 30 });
      const hot = sizeCableAndProtection({ ...baseInputs, ambientTempC: 50 });

      expect(hot.fT).toBeLessThan(cool.fT);
      expect(hot.requiredIz).toBeGreaterThan(cool.requiredIz);
    });

    it('quando a queda de tensão excede o limite, marca isCompliant = false', () => {
      const result = sizeCableAndProtection({
        ...baseInputs,
        lengthMeters: 1200,
        powerKw: 45,
      });

      expect(result.voltageDropPercent).toBeGreaterThan(4.0);
      expect(result.criteria.voltageDropOk).toBe(false);
      expect(result.isCompliant).toBe(false);
    });

    it('produz memória de cálculo com 7 etapas rastreáveis e referências normativas', () => {
      const result = sizeCableAndProtection(baseInputs);

      expect(result.memory).toHaveLength(7);
      expect(result.memory[0]).toContain('Ib');
      expect(result.memory.join(' ')).toContain('Queda de tensão');
      expect(result.standardReferences.join(' ')).toContain('NBR 5410');
    });

    it('aceita limite de queda de tensão informado pelo engenheiro', () => {
      const strict = sizeCableAndProtection({ ...baseInputs, maxVoltageDropPercent: 1.0 });

      expect(strict.criteria.voltageDropOk).toBe(strict.voltageDropPercent <= 1.0);
      expect(strict.isCompliant).toBe(strict.criteria.voltageDropOk && strict.criteria.ampacityOk);
    });
  });

  describe('checkProtectionCoordination', () => {
    it('aprova quando Ib ≤ In ≤ Iz', () => {
      const result = checkProtectionCoordination(29.14, 32, 36);
      expect(result.isCompliant).toBe(true);
      expect(result.statusText).toContain('Ib ≤ In ≤ Iz');
    });

    it('reprova disjuntor subdimensionado (In < Ib)', () => {
      const result = checkProtectionCoordination(40, 32, 36);
      expect(result.isCompliant).toBe(false);
      expect(result.statusText).toContain('subdimensionado');
    });

    it('reprova cabo desprotegido (In > Iz)', () => {
      const result = checkProtectionCoordination(29, 40, 36);
      expect(result.isCompliant).toBe(false);
      expect(result.statusText).toContain('desprotegido');
    });
  });

  describe('calculateThermalMinimumSection', () => {
    it('calcula S_min = (Icc · √t) / k para cobre/PVC', () => {
      const result = calculateThermalMinimumSection({
        iccA: 5000,
        clearingTimeS: 0.1,
        conductorMaterial: 'COPPER_PVC',
      });

      // 5000 · √0,1 / 115 = 13,75 mm² -> seção comercial 16 mm²
      expect(result.requiredSectionMm2).toBeCloseTo(13.75, 1);
      expect(result.selectedStandardSectionMm2).toBe(16);
      expect(result.formula).toBe('S_min = (Icc · √t) / k');
    });

    it('usa k = 143 para cobre/EPR-XLPE', () => {
      const result = calculateThermalMinimumSection({
        iccA: 10000,
        clearingTimeS: 0.2,
        conductorMaterial: 'COPPER_EPR_XLPE',
      });

      // 10000 · √0,2 / 143 = 31,27 mm² -> seção comercial 35 mm²
      expect(result.inputs.k).toBe(143);
      expect(result.requiredSectionMm2).toBeCloseTo(31.27, 1);
      expect(result.selectedStandardSectionMm2).toBe(35);
    });

    it('não calcula com dados ausentes e sinaliza DADO_NAO_INFORMADO', () => {
      const result = calculateThermalMinimumSection({
        iccA: 0,
        clearingTimeS: 0.1,
        conductorMaterial: 'COPPER_PVC',
      });

      expect(result.requiredSectionMm2).toBe(0);
      expect(result.notes.join(' ')).toContain('DADO_NAO_INFORMADO');
    });

    it('avisa quando o tempo de atuação extrapola a faixa t ≤ 5 s', () => {
      const result = calculateThermalMinimumSection({
        iccA: 5000,
        clearingTimeS: 8,
        conductorMaterial: 'COPPER_PVC',
      });

      expect(result.notes.join(' ')).toContain('t > 5 s');
    });
  });
});
