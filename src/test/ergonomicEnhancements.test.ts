import { describe, it, expect } from 'vitest';
import { computeSensitivityAnalysis } from '../modules/sensitivityAnalysis';
import { estimateShoulderMomentArm, evaluateExposureRisk } from '../modules/biomechanicalAnalysis';
import { analyzeWorkstationFit } from '../modules/workstationRecommender';
import type { AngleMeasurement, Landmark, ManualInputs, RulaAssessment } from '../types/assessment';

describe('sensitivityAnalysis module', () => {
  it('returns empty entries if baseline is incomplete', () => {
    const incompleteRula: RulaAssessment = {
      segmentScores: {
        upperArm: 3,
        lowerArm: 2,
        wrist: 2,
        wristTwist: 1,
        tableAScore: 3,
        muscleUseAdjustment: 0,
        forceLoadAdjustment: 0,
        scoreA: 3,
        neck: 2,
        trunk: 2,
        legs: 1,
        tableBScore: 2,
        muscleUseAdjustmentB: 0,
        forceLoadAdjustmentB: 0,
        scoreB: 2,
        finalScore: null,
        actionLevel: null,
      },
      missingInputFlags: ['Force load missing'],
      scoringReferenceVersion: '1993',
      isComplete: false,
      manualCorrections: {},
      assessorConfirmed: false,
    };

    const result = computeSensitivityAnalysis(
      incompleteRula,
      { upperArmDeg: 45, lowerArmDeg: 90, wristDeg: 0, neckDeg: 15, trunkDeg: 10 },
      {
        forceLoad: null,
        muscleUse: null,
        wristTwist: null,
        neckTwist: false,
        neckSideBend: false,
        trunkTwisted: false,
        trunkSideBend: false,
        upperArmAbducted: false,
        shoulderRaised: false,
        leaningArm: false,
        legsSupported: true,
      }
    );

    expect(result.entries.length).toBe(0);
    expect(result.topImpactSegment).toBeNull();
  });

  it('computes segment sensitivity for a complete RULA assessment', () => {
    const completeRula: RulaAssessment = {
      segmentScores: {
        upperArm: 4,
        lowerArm: 2,
        wrist: 2,
        wristTwist: 1,
        tableAScore: 4,
        muscleUseAdjustment: 1,
        forceLoadAdjustment: 1,
        scoreA: 6,
        neck: 4,
        trunk: 3,
        legs: 1,
        tableBScore: 4,
        muscleUseAdjustmentB: 1,
        forceLoadAdjustmentB: 1,
        scoreB: 6,
        finalScore: 7,
        actionLevel: 4,
      },
      missingInputFlags: [],
      scoringReferenceVersion: '1993',
      isComplete: true,
      manualCorrections: {},
      assessorConfirmed: true,
    };

    const manualInputs: ManualInputs = {
      forceLoad: 'light',
      muscleUse: 'static_or_repeated',
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    };

    const result = computeSensitivityAnalysis(
      completeRula,
      { upperArmDeg: 95, lowerArmDeg: 110, wristDeg: 10, neckDeg: 25, trunkDeg: 35 },
      manualInputs
    );

    expect(result.entries.length).toBe(6);
    expect(result.entries[0].currentGrandScore).toBe(7);
  });
});

describe('biomechanicalAnalysis module', () => {
  it('estimates shoulder moment arm correctly based on upper arm angle', () => {
    const angles: AngleMeasurement[] = [
      {
        name: 'Upper Arm Flexion',
        description: 'Angle of upper arm',
        landmarkIndices: [11, 13, 15],
        valueDegrees: 90,
        isValid: true,
        isManuallyCorrected: false,
        automatedValueDegrees: 90,
        unit: 'degrees',
      },
    ];

    const result = estimateShoulderMomentArm(angles);
    expect(result.upperArmFlexionDeg).toBe(90);
    // sin(90 deg) = 1.0
    expect(result.dimensionlessMomentIndex).toBe(1.0);
    expect(result.riskLevel).toBe('high');
  });

  it('handles missing upper arm angle gracefully', () => {
    const result = estimateShoulderMomentArm([]);
    expect(result.riskLevel).toBe('unscorable');
    expect(result.dimensionlessMomentIndex).toBeNull();
  });

  it('evaluates cumulative exposure risk index (CERI)', () => {
    const completeRula: RulaAssessment = {
      segmentScores: {
        upperArm: 3,
        lowerArm: 1,
        wrist: 1,
        wristTwist: 1,
        tableAScore: 3,
        muscleUseAdjustment: 1,
        forceLoadAdjustment: 1,
        scoreA: 5,
        neck: 2,
        trunk: 2,
        legs: 1,
        tableBScore: 2,
        muscleUseAdjustmentB: 1,
        forceLoadAdjustmentB: 1,
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

    const manualInputs: ManualInputs = {
      forceLoad: 'light',
      muscleUse: 'static_or_repeated',
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    };

    const result = evaluateExposureRisk(completeRula, manualInputs);
    expect(result.rulaGrandScore).toBe(5);
    expect(result.ceriScore).toBeGreaterThan(5.0);
    expect(result.estimatedShiftExposureRisk).toBe('high');
  });
});

describe('workstationRecommender module', () => {
  it('returns canEstimate false when shoulders are missing', () => {
    const result = analyzeWorkstationFit([]);
    expect(result.canEstimate).toBe(false);
    expect(result.suggestions.length).toBe(0);
  });

  it('generates suggestions when landmarks are present', () => {
    const landmarks: Landmark[] = [
      { index: 0, name: 'nose', x: 0.5, y: 0.2, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 11, name: 'left_shoulder', x: 0.45, y: 0.35, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 12, name: 'right_shoulder', x: 0.55, y: 0.35, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 13, name: 'left_elbow', x: 0.42, y: 0.55, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 14, name: 'right_elbow', x: 0.58, y: 0.55, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 15, name: 'left_wrist', x: 0.40, y: 0.58, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 16, name: 'right_wrist', x: 0.60, y: 0.58, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 23, name: 'left_hip', x: 0.46, y: 0.65, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
      { index: 24, name: 'right_hip', x: 0.54, y: 0.65, z: 0, visibility: 0.9, presence: 0.9, isVisible: true },
    ];

    const result = analyzeWorkstationFit(landmarks);
    expect(result.canEstimate).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.calibrationNote).toContain('NOT calibrated physical measurements');
  });
});
