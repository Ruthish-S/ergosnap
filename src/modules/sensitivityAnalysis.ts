/**
 * Sensitivity Analysis Module for ErgoSnap Analytics
 *
 * Computes how the RULA Grand Score would change if individual segment
 * scores were reduced by 1 (simulating a single-step intervention).
 * This helps engineers prioritize which corrective action yields the
 * greatest risk reduction per unit effort.
 *
 * Scientific basis:
 * - McAtamney & Corlett (1993). RULA. Applied Ergonomics, 24(2), 91–99.
 * - Bao, S., Spielholz, P., Howard, N., & Silverstein, B. (2009).
 *   Quantifying repetitive hand activity for epidemiological research
 *   on musculoskeletal disorders. Ergonomics, 52(9), 1150–1162.
 *
 * Rules:
 * 1. Sensitivity is only computed when baseline RULA is complete.
 * 2. Scores are floored at their valid minimum (not below 1).
 * 3. Improvements are labelled "estimated" — not validated interventions.
 * 4. Table C lookup is re-run — not guessed.
 */

import type { ManualInputs, RulaAssessment } from '../types/assessment';
import { calculateRula } from './rulaScoring';
import type { RulaInputAngles } from './rulaScoring';

export interface SensitivityEntry {
  segment: string;
  currentSegmentScore: number;
  simulatedSegmentScore: number; // currentSegmentScore - 1, floored at minimum
  currentGrandScore: number;
  simulatedGrandScore: number | null; // null if simulation still incomplete
  grandScoreReduction: number | null; // current - simulated (positive = improvement)
  interventionLabel: string; // Plain-language description of the simulated change
  isSignificant: boolean; // True if grand score actually changes
}

export interface SensitivityReport {
  baseline: RulaAssessment;
  entries: SensitivityEntry[];
  topImpactSegment: string | null; // Segment with greatest grand score reduction
  assessmentNote: string;
}

const SEGMENT_MINIMUMS: Record<string, number> = {
  upperArm: 1,
  lowerArm: 1,
  wrist: 1,
  neck: 1,
  trunk: 1,
  legs: 1,
};

const SEGMENT_LABELS: Record<string, string> = {
  upperArm: 'Shoulder / Upper Arm Elevation',
  lowerArm: 'Elbow / Forearm Flexion',
  wrist: 'Wrist Flexion / Deviation',
  neck: 'Neck / Cervical Flexion',
  trunk: 'Trunk / Lumbar Flexion',
  legs: 'Leg / Lower Limb Support',
};

const INTERVENTION_DESCRIPTIONS: Record<string, string> = {
  upperArm: 'Lower work surface or bring controls closer to reduce shoulder elevation by one score step',
  lowerArm: 'Adjust armrest or workstation height to bring elbow to 60°–100° range',
  wrist: 'Reposition keyboard, tool grip or workpiece to reduce wrist deviation',
  neck: 'Raise monitor or target display to reduce cervical flexion',
  trunk: 'Improve lumbar support or raise workpiece to reduce forward trunk lean',
  legs: 'Provide foot support or improve seat-to-floor height for bilateral leg support',
};

/**
 * Run the sensitivity analysis for a completed RULA assessment.
 * Each segment score is independently reduced by 1 and the grand score recomputed.
 */
export function computeSensitivityAnalysis(
  baseline: RulaAssessment,
  angles: RulaInputAngles,
  manualInputs: ManualInputs
): SensitivityReport {
  if (!baseline.isComplete || baseline.segmentScores.finalScore === null) {
    return {
      baseline,
      entries: [],
      topImpactSegment: null,
      assessmentNote:
        'Sensitivity analysis requires a complete RULA Grand Score. ' +
        'Complete all required inputs to enable this analysis.',
    };
  }

  const currentGrandScore = baseline.segmentScores.finalScore;
  const ss = baseline.segmentScores;

  const segments: Array<{ key: string; currentScore: number | null }> = [
    { key: 'upperArm', currentScore: ss.upperArm },
    { key: 'lowerArm', currentScore: ss.lowerArm },
    { key: 'wrist', currentScore: ss.wrist },
    { key: 'neck', currentScore: ss.neck },
    { key: 'trunk', currentScore: ss.trunk },
    { key: 'legs', currentScore: ss.legs },
  ];

  const entries: SensitivityEntry[] = [];

  for (const seg of segments) {
    if (seg.currentScore === null) continue;

    const minimum = SEGMENT_MINIMUMS[seg.key] ?? 1;
    const simulatedScore = Math.max(minimum, seg.currentScore - 1);

    // Build modified manual corrections to override this segment score
    const simulatedCorrections: Record<string, number> = {
      ...baseline.manualCorrections,
      [seg.key]: simulatedScore,
    };

    // Run full RULA with the simulated segment score
    const simulatedRula = calculateRula(angles, manualInputs, simulatedCorrections);
    const simulatedGrandScore = simulatedRula.segmentScores.finalScore;

    const grandScoreReduction =
      simulatedGrandScore !== null ? currentGrandScore - simulatedGrandScore : null;

    entries.push({
      segment: SEGMENT_LABELS[seg.key] ?? seg.key,
      currentSegmentScore: seg.currentScore,
      simulatedSegmentScore: simulatedScore,
      currentGrandScore,
      simulatedGrandScore,
      grandScoreReduction,
      interventionLabel: INTERVENTION_DESCRIPTIONS[seg.key] ?? 'Reduce postural load for this segment',
      isSignificant: grandScoreReduction !== null && grandScoreReduction > 0,
    });
  }

  // Sort by greatest grand score reduction (descending)
  entries.sort((a, b) => {
    const aRed = a.grandScoreReduction ?? 0;
    const bRed = b.grandScoreReduction ?? 0;
    return bRed - aRed;
  });

  const topImpactSegment = entries.find((e) => e.isSignificant)?.segment ?? null;

  return {
    baseline,
    entries,
    topImpactSegment,
    assessmentNote:
      'Each row shows the estimated RULA Grand Score change if that segment score ' +
      'were reduced by one step (simulating a single ergonomic intervention). ' +
      'Scores are re-derived from McAtamney & Corlett (1993) Table C — not extrapolated. ' +
      'Actual intervention outcomes must be verified by re-assessment.',
  };
}
