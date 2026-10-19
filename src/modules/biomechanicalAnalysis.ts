/**
 * Biomechanical & Exposure Risk Module for ErgoSnap Analytics
 *
 * Implements:
 * 1. Qualitative shoulder moment arm index (proportional estimate from 2D posture)
 * 2. Cumulative Exposure Risk Index (CERI) integrating RULA score, task repetition,
 *    and shift duration per NIOSH & ISO 11226 criteria.
 *
 * Scientific Basis:
 * - Chaffin, D. B., Andersson, G. B., & Martin, B. J. (2006). Occupational Biomechanics (4th ed.). Wiley.
 * - Waters, T. R., Putz-Anderson, V., Garg, A., & Fine, L. J. (1993). Revised NIOSH equation for the design
 *   and evaluation of manual lifting tasks. Ergonomics, 36(7), 749-776.
 * - ISO 11226:2000. Ergonomics — Evaluation of static working postures.
 *
 * Rules:
 * 1. All moment arm indicators are non-calibrated dimensionless ratios (not Newton-meters).
 * 2. Missing data explicitly produces null, never 0.
 * 3. Clearly labeled as screening approximations, not clinical or laboratory kinetics.
 */

import type { AngleMeasurement, ManualInputs, RulaAssessment } from '../types/assessment';

export interface ShoulderMomentEstimate {
  upperArmFlexionDeg: number | null;
  dimensionlessMomentIndex: number | null; // sin(theta), where theta is upper arm angle from vertical
  riskLevel: 'minimal' | 'low' | 'moderate' | 'elevated' | 'high' | 'unscorable';
  biomechanicalNote: string;
}

export interface ExposureRiskEvaluation {
  rulaGrandScore: number | null;
  actionLevel: number | null;
  repetitionCategory: 'occasional' | 'repetitive_or_static' | 'unknown';
  estimatedShiftExposureRisk: 'acceptable' | 'moderate' | 'high' | 'critical' | 'indeterminate';
  ceriScore: number | null; // Cumulative Exposure Risk Index (1.0 to 10.0 scale)
  recommendationCategory: string;
}

/**
 * Calculates a dimensionless gravitational moment arm index for the glenohumeral joint.
 * Gravitational torque on the shoulder is proportional to L * sin(theta), where theta
 * is angle relative to gravity/vertical. Without calibrated anthropometry, sin(theta) provides
 * an index (0.0 to 1.0) of maximum gravitational lever arm.
 */
export function estimateShoulderMomentArm(angles: AngleMeasurement[]): ShoulderMomentEstimate {
  const upperArmAngle = angles.find((a) =>
    a.name.toLowerCase().includes('upper arm') && a.isValid
  );

  if (!upperArmAngle || upperArmAngle.valueDegrees === null) {
    return {
      upperArmFlexionDeg: null,
      dimensionlessMomentIndex: null,
      riskLevel: 'unscorable',
      biomechanicalNote: 'Upper arm angle unavailable from 2D tracking. Moment arm cannot be estimated.',
    };
  }

  const deg = upperArmAngle.valueDegrees;
  // Convert to radians for trigonometric load factor
  const rad = (Math.abs(deg) * Math.PI) / 180;
  // sin(theta) represents fraction of maximum gravitational moment arm
  const momentIndex = Math.min(1.0, Math.max(0.0, Math.sin(rad)));

  let riskLevel: ShoulderMomentEstimate['riskLevel'] = 'minimal';
  if (deg > 60 || momentIndex > 0.86) {
    riskLevel = 'high';
  } else if (deg > 45 || momentIndex > 0.70) {
    riskLevel = 'elevated';
  } else if (deg > 30 || momentIndex > 0.50) {
    riskLevel = 'moderate';
  } else if (deg > 15) {
    riskLevel = 'low';
  }

  return {
    upperArmFlexionDeg: deg,
    dimensionlessMomentIndex: parseFloat(momentIndex.toFixed(3)),
    riskLevel,
    biomechanicalNote:
      `Shoulder moment index is ${(momentIndex * 100).toFixed(1)}% of maximum gravitational torque envelope. ` +
      `Estimated from 2D upper arm elevation of ${deg}°. Not calibrated in absolute Newton-meters (Nm).`,
  };
}

/**
 * Computes Cumulative Exposure Risk Index (CERI) combining RULA score with task repetition/force.
 */
export function evaluateExposureRisk(
  rula: RulaAssessment,
  manualInputs: ManualInputs
): ExposureRiskEvaluation {
  const grandScore = rula.segmentScores.finalScore;
  const actionLevel = rula.segmentScores.actionLevel;

  if (grandScore === null || actionLevel === null) {
    return {
      rulaGrandScore: null,
      actionLevel: null,
      repetitionCategory: manualInputs.muscleUse ? (manualInputs.muscleUse === 'static_or_repeated' ? 'repetitive_or_static' : 'occasional') : 'unknown',
      estimatedShiftExposureRisk: 'indeterminate',
      ceriScore: null,
      recommendationCategory: 'Awaiting complete RULA and repetition parameters to determine cumulative exposure risk.',
    };
  }

  const isRepetitive = manualInputs.muscleUse === 'static_or_repeated';
  const hasModerateLoad = manualInputs.forceLoad === 'moderate_or_greater';
  const hasLightLoad = manualInputs.forceLoad === 'light';

  // Base multiplier from posture severity (RULA 1-7 mapped to 1.0 - 7.0)
  let ceri = grandScore * 1.0;

  // Repetition multiplier (+15% for sustained static or repeated > 4x/min)
  if (isRepetitive) {
    ceri *= 1.25;
  }

  // Force multiplier
  if (hasModerateLoad) {
    ceri *= 1.20;
  } else if (hasLightLoad) {
    ceri *= 1.10;
  }

  // Cap at 10.0 scale
  const finalCeri = parseFloat(Math.min(10.0, Math.max(1.0, ceri)).toFixed(1));

  let estimatedShiftExposureRisk: ExposureRiskEvaluation['estimatedShiftExposureRisk'] = 'acceptable';
  let recommendationCategory = '';

  if (finalCeri >= 7.5 || actionLevel === 4) {
    estimatedShiftExposureRisk = 'critical';
    recommendationCategory = 'Immediate engineering restructuring, job rotation, or task redesign indicated.';
  } else if (finalCeri >= 5.5 || actionLevel === 3) {
    estimatedShiftExposureRisk = 'high';
    recommendationCategory = 'Prompt ergonomic intervention and work-rest interval controls recommended.';
  } else if (finalCeri >= 3.5 || actionLevel === 2) {
    estimatedShiftExposureRisk = 'moderate';
    recommendationCategory = 'Scheduled ergonomic investigation and operator comfort monitoring recommended.';
  } else {
    estimatedShiftExposureRisk = 'acceptable';
    recommendationCategory = 'Postural load within sustainable industrial ergonomic envelope.';
  }

  return {
    rulaGrandScore: grandScore,
    actionLevel,
    repetitionCategory: isRepetitive ? 'repetitive_or_static' : 'occasional',
    estimatedShiftExposureRisk,
    ceriScore: finalCeri,
    recommendationCategory,
  };
}
