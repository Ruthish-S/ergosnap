import { describe, it, expect } from 'vitest';
import { generateCsvExport } from '../modules/reportGenerator';
import type { Assessment } from '../types/assessment';

describe('reportGenerator module', () => {
  const dummyAssessment: Assessment = {
    assessmentId: 'test-uuid-1234',
    title: 'Bench Assembly Assessment',
    taskType: 'Precision Electronics Assembly',
    date: '2024-10-15',
    assessor: 'R. Srinivasan',
    workstationDescription: 'Standard bench test',
    imageMetadata: {
      filename: 'operator_bench.png',
      width: 1920,
      height: 1080,
      fileType: 'image/png',
      fileSizeBytes: 1024000,
      sourceType: 'user_upload',
      transformations: [],
    },
    imageUrl: '',
    analysisTimestamp: '2024-10-15T10:00:00.000Z',
    modelInfo: {
      modelName: 'MediaPipe Pose (Lite)',
      modelVersion: 'v0.10.0',
      assetUrl: '/ergosnap/models/pose_landmarker_lite.task',
      detectionConfidence: 0.5,
      presenceConfidence: 0.5,
    },
    landmarks: [],
    angles: [
      {
        name: 'Left Upper Arm Angle',
        description: 'Angle from vertical',
        landmarkIndices: [11, 11, 13],
        valueDegrees: 34.5,
        isValid: true,
        isManuallyCorrected: false,
        automatedValueDegrees: 34.5,
        unit: 'degrees',
      },
      {
        name: 'Right Wrist Angle',
        description: 'Angle deviation',
        landmarkIndices: [14, 16, 20],
        valueDegrees: null, // Missing!
        isValid: false,
        invalidReason: 'Hand occluded by fixture',
        isManuallyCorrected: false,
        automatedValueDegrees: null,
        unit: 'degrees',
      },
    ],
    manualInputs: {
      forceLoad: 'light',
      muscleUse: 'occasional',
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    },
    rulaAssessment: {
      segmentScores: {
        upperArm: 2,
        lowerArm: 1,
        wrist: 1,
        wristTwist: 1,
        tableAScore: 2,
        muscleUseAdjustment: 0,
        forceLoadAdjustment: 1,
        scoreA: 3,
        neck: 2,
        trunk: 2,
        legs: 1,
        tableBScore: 2,
        muscleUseAdjustmentB: 0,
        forceLoadAdjustmentB: 1,
        scoreB: 3,
        finalScore: 3,
        actionLevel: 2,
      },
      missingInputFlags: [],
      scoringReferenceVersion: '1993-McAtamney-Corlett',
      isComplete: true,
      manualCorrections: {},
      assessorConfirmed: true,
    },
    qualityChecks: {
      overallStatus: 'valid',
      landmarkCompleteness: 0.9,
      requiredLandmarksPresent: true,
      viewSuitability: 'suitable',
      viewSuitabilityNotes: 'Clear side view',
      processingStatus: 'success',
    },
    referenceAssessment: null,
    recommendations: [],
    notes: 'None',
    appVersion: '1.0.0',
    scoringReferenceVersion: '1993-McAtamney-Corlett',
  };

  it('generates a well-formatted CSV with correct headers and scientific null handling', () => {
    const csv = generateCsvExport(dummyAssessment);
    const lines = csv.split('\n');

    expect(lines.length).toBe(3); // Header + 2 angle measurement rows

    // Header inspection
    expect(lines[0]).toContain('AssessmentID');
    expect(lines[0]).toContain('ValueDegrees');
    expect(lines[0]).toContain('RulaFinalGrandScore');

    // First row (valid angle 34.5)
    expect(lines[1]).toContain('Left Upper Arm Angle');
    expect(lines[1]).toContain('34.5');
    expect(lines[1]).toContain('TRUE');

    // Second row (invalid angle): value MUST be empty string, NOT '0'
    expect(lines[2]).toContain('Right Wrist Angle');
    expect(lines[2]).toContain('FALSE');
    expect(lines[2]).toContain('Hand occluded by fixture');

    // Check that missing angle did not emit a fake 0
    const columnsRow2 = lines[2].split(',');
    // ValueDegrees is at index 7
    expect(columnsRow2[7]).toBe('');
  });
});
