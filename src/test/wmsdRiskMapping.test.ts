import { describe, it, expect } from 'vitest';
import { buildWmsdRiskMap } from '../modules/wmsdRiskMapping';
import type { AngleMeasurement, RulaAssessment } from '../types/assessment';

describe('wmsdRiskMapping module', () => {
  it('correctly derives risk levels from RULA segment scores', () => {
    const mockRula: RulaAssessment = {
      segmentScores: {
        upperArm: 4,
        lowerArm: 2,
        wrist: 2,
        wristTwist: 1,
        tableAScore: 4,
        muscleUseAdjustment: 1,
        forceLoadAdjustment: 0,
        scoreA: 5,
        neck: 3,
        trunk: 2,
        legs: 1,
        tableBScore: 3,
        muscleUseAdjustmentB: 1,
        forceLoadAdjustmentB: 0,
        scoreB: 4,
        finalScore: 5,
        actionLevel: 3,
      },
      missingInputFlags: [],
      scoringReferenceVersion: '1993',
      isComplete: true,
      manualCorrections: {},
      assessorConfirmed: true,
    };

    const mockAngles: AngleMeasurement[] = [
      {
        name: 'Upper Arm Flexion',
        description: 'Angle of upper arm',
        landmarkIndices: [11, 13, 15],
        valueDegrees: 55,
        isValid: true,
        isManuallyCorrected: false,
        automatedValueDegrees: 55,
        unit: 'degrees',
      },
      {
        name: 'Neck Flexion',
        description: 'Angle of neck',
        landmarkIndices: [0, 11, 23],
        valueDegrees: 28,
        isValid: true,
        isManuallyCorrected: false,
        automatedValueDegrees: 28,
        unit: 'degrees',
      },
    ];

    const result = buildWmsdRiskMap(mockRula, mockAngles);

    expect(result.regions.length).toBe(6);
    expect(result.overallBodyRisk).toBe('high'); // score 4 = high

    const upperArm = result.regions.find((r) => r.region.includes('Shoulder'));
    expect(upperArm?.riskLevel).toBe('high');
    expect(upperArm?.angleDeg).toBe(55);
    expect(upperArm?.deviationDeg).toBe(35); // 55 - 20 = 35
  });

  it('marks regions unknown when angles and scores are null', () => {
    const incompleteRula: RulaAssessment = {
      segmentScores: {
        upperArm: null,
        lowerArm: null,
        wrist: null,
        wristTwist: null,
        tableAScore: null,
        muscleUseAdjustment: null,
        forceLoadAdjustment: null,
        scoreA: null,
        neck: null,
        trunk: null,
        legs: null,
        tableBScore: null,
        muscleUseAdjustmentB: null,
        forceLoadAdjustmentB: null,
        scoreB: null,
        finalScore: null,
        actionLevel: null,
      },
      missingInputFlags: ['Upper Arm Angle is missing'],
      scoringReferenceVersion: '1993',
      isComplete: false,
      manualCorrections: {},
      assessorConfirmed: false,
    };

    const result = buildWmsdRiskMap(incompleteRula, []);
    expect(result.overallBodyRisk).toBe('unknown');
    expect(result.regions.every((r) => r.riskLevel === 'unknown')).toBe(true);
  });
});
