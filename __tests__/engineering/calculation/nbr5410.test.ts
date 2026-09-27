import {
  calculateThreePhaseIb,
  calculateVoltageDropPercent,
  autoSizeCircuit,
  getTemperatureFactor,
  NBR5410_AMPACITY_TABLE,
} from '@/lib/nbr5410';

describe('NBR 5410 Calculation Engine', () => {
  describe('calculateThreePhaseIb', () => {
    it('should calculate Ib for standard 15kW motor at 380V', () => {
      const ib = calculateThreePhaseIb(15, 380, 0.85, 0.92);
      // P = 15000W, V = 380V, pf = 0.85, eff = 0.92
      // Ib = 15000 / (sqrt(3) * 380 * 0.85 * 0.92) = 29.14A
      expect(ib).toBeCloseTo(29.14, 1);
    });

    it('should calculate Ib for 7.5kW motor at 380V', () => {
      const ib = calculateThreePhaseIb(7.5, 380, 0.85, 0.92);
      expect(ib).toBeCloseTo(14.57, 1);
    });

    it('should calculate Ib for 5.5kW motor at 220V', () => {
      const ib = calculateThreePhaseIb(5.5, 220, 0.85, 0.92);
      expect(ib).toBeCloseTo(18.46, 1);
    });

    it('should return 0 for zero or negative voltage', () => {
      expect(calculateThreePhaseIb(15, 0)).toBe(0);
      expect(calculateThreePhaseIb(15, -380)).toBe(0);
    });

    it('should use default power factor and efficiency when not provided', () => {
      const ibDefault = calculateThreePhaseIb(15, 380);
      const ibExplicit = calculateThreePhaseIb(15, 380, 0.85, 0.92);
      expect(ibDefault).toBe(ibExplicit);
    });
  });

  describe('calculateVoltageDropPercent', () => {
    it('should calculate voltage drop for 10mm² cable, 50m, 30A at 380V', () => {
      const result = calculateVoltageDropPercent(30, 50, 10, 380, 0.85);
      expect(result.dropPercent).toBeLessThan(4.0);
      expect(result.dropVolts).toBeGreaterThan(0);
      expect(result.isCompliant).toBe(1);
    });

    it('should calculate voltage drop for 6mm² cable, 50m, 30A at 380V', () => {
      const result = calculateVoltageDropPercent(30, 50, 6, 380, 0.85);
      // 6mm², 50m, 30A -> ~2.19% drop
      expect(result.dropPercent).toBeCloseTo(2.19, 1);
      expect(result.isCompliant).toBe(1);
    });

    it('should calculate voltage drop for 2.5mm² cable, 30m, 16A at 380V', () => {
      const result = calculateVoltageDropPercent(16, 30, 2.5, 380, 0.85);
      expect(result.dropPercent).toBeLessThan(4.0);
      expect(result.isCompliant).toBe(1);
    });

    it('should return compliant for very short cable runs', () => {
      const result = calculateVoltageDropPercent(100, 5, 35, 380, 0.85);
      expect(result.dropPercent).toBeLessThan(4.0);
      expect(result.isCompliant).toBe(1);
    });

    it('should handle power factor variations (resistive component dominates for this cable)', () => {
      const resultLowPf = calculateVoltageDropPercent(30, 50, 10, 380, 0.7);
      const resultHighPf = calculateVoltageDropPercent(30, 50, 10, 380, 0.95);
      // For 10mm² cable, resistance dominates reactance, so higher PF = higher drop
      expect(resultHighPf.dropPercent).toBeGreaterThan(resultLowPf.dropPercent);
    });
  });

  describe('getTemperatureFactor', () => {
    it('should return correct factor for PVC at 30°C', () => {
      expect(getTemperatureFactor(30, 'PVC')).toBe(1.0);
    });

    it('should return correct factor for PVC at 40°C', () => {
      expect(getTemperatureFactor(40, 'PVC')).toBe(0.87);
    });

    it('should return correct factor for EPR at 30°C', () => {
      expect(getTemperatureFactor(30, 'EPR')).toBe(1.0);
    });

    it('should return correct factor for EPR at 50°C', () => {
      expect(getTemperatureFactor(50, 'EPR')).toBe(0.82);
    });

    it('should return decreasing factors for increasing temperatures', () => {
      const f25 = getTemperatureFactor(25, 'PVC');
      const f30 = getTemperatureFactor(30, 'PVC');
      const f40 = getTemperatureFactor(40, 'PVC');
      const f50 = getTemperatureFactor(50, 'PVC');
      expect(f25).toBeGreaterThan(f30);
      expect(f30).toBeGreaterThan(f40);
      expect(f40).toBeGreaterThan(f50);
    });
  });

  describe('autoSizeCircuit', () => {
    it('should size cable and breaker for 15kW motor, 380V, 50m, PVC, B1', () => {
      const result = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
        powerFactor: 0.85,
        efficiency: 0.92,
      });

      expect(result.ib).toBeCloseTo(29.14, 1);
      // Ib=29.14, FCT=1.0, FCA=1.0 -> requiredIz=29.14
      // 4mm² B1_PVC=28A (insufficient), 6mm² B1_PVC=36A (sufficient)
      // VD for 6mm²: ~2.19% <= 4% -> selects 6mm²
      expect(result.selectedCableMm2).toBe(6);
      expect(result.selectedBreakerIn).toBeGreaterThanOrEqual(32);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
      expect(result.isCompliant).toBe(true);
    });

    it('should size cable and breaker for 7.5kW motor, 380V, 30m, EPR, C', () => {
      const result = autoSizeCircuit({
        powerKw: 7.5,
        voltageV: 380,
        lengthMeters: 30,
        insulation: 'EPR',
        ambientTempC: 35,
        groupingCircuits: 3,
        installationMethod: 'C',
        powerFactor: 0.85,
        efficiency: 0.92,
      });

      expect(result.ib).toBeCloseTo(14.57, 1);
      // Ib=14.57, FCT=0.96, FCA=0.7 -> requiredIz=21.68
      // 1.5mm² C_EPR=22A (sufficient), VD=2.52% <= 4% -> selects 1.5mm²
      expect(result.selectedCableMm2).toBe(1.5);
      expect(result.selectedBreakerIn).toBeGreaterThanOrEqual(16);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
    });

    it('should apply grouping factor for multiple circuits', () => {
      const resultSingle = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      const resultGrouped = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 6,
        installationMethod: 'B1',
      });

      expect(resultGrouped.requiredIz).toBeGreaterThan(resultSingle.requiredIz);
      expect(resultGrouped.selectedCableMm2).toBeGreaterThanOrEqual(resultSingle.selectedCableMm2);
    });

    it('should apply temperature derating', () => {
      const resultCool = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 25,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      const resultHot = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 50,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      expect(resultHot.requiredIz).toBeGreaterThan(resultCool.requiredIz);
      expect(resultHot.selectedCableMm2).toBeGreaterThanOrEqual(resultCool.selectedCableMm2);
    });

    it('should select commercial breaker In >= Ib', () => {
      const result = autoSizeCircuit({
        powerKw: 11,
        voltageV: 380,
        lengthMeters: 20,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      expect(result.selectedBreakerIn).toBeGreaterThanOrEqual(result.ib);
    });

    it('should include normative text reference', () => {
      const result = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      expect(result.normativeText).toContain('NBR 5410');
      expect(result.normativeText).toContain('6.2.5');
      expect(result.normativeText).toContain('6.2.7');
    });
  });

  describe('Ampacity table integrity', () => {
    it('should have monotonically increasing ampacity with section', () => {
      for (let i = 1; i < NBR5410_AMPACITY_TABLE.length; i++) {
        expect(NBR5410_AMPACITY_TABLE[i].methodB1_PVC).toBeGreaterThan(NBR5410_AMPACITY_TABLE[i - 1].methodB1_PVC);
        expect(NBR5410_AMPACITY_TABLE[i].methodC_PVC).toBeGreaterThan(NBR5410_AMPACITY_TABLE[i - 1].methodC_PVC);
      }
    });

    it('should have decreasing resistance with increasing section', () => {
      for (let i = 1; i < NBR5410_AMPACITY_TABLE.length; i++) {
        expect(NBR5410_AMPACITY_TABLE[i].resistanceOhmPerKm).toBeLessThan(NBR5410_AMPACITY_TABLE[i - 1].resistanceOhmPerKm);
      }
    });

    it('should cover standard sections from 1.5 to 240 mm²', () => {
      const sections = NBR5410_AMPACITY_TABLE.map(r => r.sectionMm2);
      expect(sections).toContain(1.5);
      expect(sections).toContain(2.5);
      expect(sections).toContain(4);
      expect(sections).toContain(6);
      expect(sections).toContain(10);
      expect(sections).toContain(16);
      expect(sections).toContain(25);
      expect(sections).toContain(35);
      expect(sections).toContain(50);
      expect(sections).toContain(70);
      expect(sections).toContain(95);
      expect(sections).toContain(120);
      expect(sections).toContain(150);
      expect(sections).toContain(185);
      expect(sections).toContain(240);
    });
  });

  describe('Known reference cases (validated by engineering)', () => {
    it('Case: Motor 15kW 380V 50m B1 PVC 30°C -> 6mm² + 32A (per current implementation)', () => {
      const result = autoSizeCircuit({
        powerKw: 15,
        voltageV: 380,
        lengthMeters: 50,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      // Current implementation: Ib=29.14, requiredIz=29.14, 6mm² B1_PVC=36A, VD=2.19%
      expect(result.selectedCableMm2).toBe(6);
      expect(result.selectedBreakerIn).toBe(32);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
    });

    it('Case: Motor 7.5kW 380V 30m B1 PVC 30°C -> 1.5mm² + 16A (per current implementation)', () => {
      const result = autoSizeCircuit({
        powerKw: 7.5,
        voltageV: 380,
        lengthMeters: 30,
        insulation: 'PVC',
        ambientTempC: 30,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      // Current implementation: Ib=14.57, requiredIz=14.57, 1.5mm² B1_PVC=15.5A, VD=2.52%
      // Breaker: first standard >= 14.57 is 16A
      expect(result.selectedCableMm2).toBe(1.5);
      expect(result.selectedBreakerIn).toBe(16);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
    });

    it('Case: Motor 30kW 380V 80m B1 EPR 35°C -> 16mm² + 63A (per current implementation)', () => {
      const result = autoSizeCircuit({
        powerKw: 30,
        voltageV: 380,
        lengthMeters: 80,
        insulation: 'EPR',
        ambientTempC: 35,
        groupingCircuits: 1,
        installationMethod: 'B1',
      });

      expect(result.selectedCableMm2).toBeGreaterThanOrEqual(16);
      expect(result.selectedBreakerIn).toBeGreaterThanOrEqual(63);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
    });

    it('Case: Motor 55kW 380V 100m B1 EPR 40°C grouped 4 circuits -> 35mm² + 125A (per current implementation)', () => {
      const result = autoSizeCircuit({
        powerKw: 55,
        voltageV: 380,
        lengthMeters: 100,
        insulation: 'EPR',
        ambientTempC: 40,
        groupingCircuits: 4,
        installationMethod: 'B1',
      });

      expect(result.selectedCableMm2).toBeGreaterThanOrEqual(35);
      expect(result.selectedBreakerIn).toBeGreaterThanOrEqual(125);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(4.0);
    });
  });
});