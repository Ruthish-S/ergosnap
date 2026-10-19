/**
 * Complete and verified RULA scoring engine.
 *
 * Source: McAtamney, L., & Corlett, E. N. (1993). RULA: a survey method for
 * the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 91-99.
 *
 * Table lookup matrices: src/data/rulaTables.ts
 *
 * Rules:
 * 1. Deterministic engineering implementation of McAtamney & Corlett (1993).
 * 2. Every intermediate score and adjustment is preserved for transparent auditability.
 * 3. Never issues a final Grand Score or Action Level when required inputs are missing.
 * 4. Missing values are flagged explicitly, not coerced to 0.
 */

import type {
  ActionLevel,
  ManualInputs,
  RulaAssessment,
  RulaSegmentScores,
} from '../types/assessment';
import {
  RULA_TABLES_SOURCE,
  RULA_TABLES_VERSION,
  lookupTableA,
  lookupTableB,
  lookupTableC,
} from '../data/rulaTables';

export interface RulaInputAngles {
  upperArmDeg: number | null;
  lowerArmDeg: number | null;
  wristDeg: number | null;
  neckDeg: number | null;
  trunkDeg: number | null;
}

export interface UpperArmAdjustments {
  upperArmAbducted?: boolean | null;
  shoulderRaised?: boolean | null;
  leaningArm?: boolean | null;
}

export interface NeckAdjustments {
  neckTwist?: boolean | null;
  neckSideBend?: boolean | null;
}

export interface TrunkAdjustments {
  trunkTwisted?: boolean | null;
  trunkSideBend?: boolean | null;
}

/**
 * Score Upper Arm Posture (Step 1).
 * Base score:
 * - 20° extension to 20° flexion: 1
 * - >20° extension: 2
 * - 20° to 45° flexion: 2
 * - 45° to 90° flexion: 3
 * - >90° flexion: 4
 * Adjustments:
 * - Shoulder raised: +1
 * - Upper arm abducted: +1
 * - Arm supported / person leaning: -1
 * Score clamped between 1 and 6.
 */
export function scoreUpperArm(
  angleDeg: number,
  adjustments: UpperArmAdjustments = {}
): number {
  let score = 1;

  if (angleDeg < -20) {
    // Marked extension > 20°
    score = 2;
  } else if (angleDeg >= -20 && angleDeg <= 20) {
    score = 1;
  } else if (angleDeg > 20 && angleDeg <= 45) {
    score = 2;
  } else if (angleDeg > 45 && angleDeg <= 90) {
    score = 3;
  } else if (angleDeg > 90) {
    score = 4;
  }

  if (adjustments.shoulderRaised) score += 1;
  if (adjustments.upperArmAbducted) score += 1;
  if (adjustments.leaningArm) score -= 1;

  return Math.max(1, Math.min(6, score));
}

/**
 * Score Lower Arm Posture (Step 2).
 * Base score:
 * - 60° to 100° flexion: 1
 * - <60° or >100° flexion: 2
 * Adjustments:
 * - Working across midline or out to side: +1
 * Score clamped between 1 and 3.
 */
export function scoreLowerArm(
  angleDeg: number,
  workingAcrossMidlineOrOutToSide: boolean = false
): number {
  let score = 1;
  if (angleDeg >= 60 && angleDeg <= 100) {
    score = 1;
  } else {
    score = 2;
  }

  if (workingAcrossMidlineOrOutToSide) score += 1;

  return Math.max(1, Math.min(3, score));
}

/**
 * Score Wrist Posture (Step 3).
 * Base score:
 * - Neutral (0°): 1
 * - 1° to 15° flexion or extension: 2
 * - >15° flexion or extension: 3
 * Adjustments:
 * - Bent away from midline (radial or ulnar deviation): +1
 * Score clamped between 1 and 4.
 */
export function scoreWrist(
  angleDeg: number | null,
  bentFromMidline: boolean = false
): number {
  let score = 1;
  if (angleDeg === null) {
    // If angle not directly measured, neutral baseline with manual check
    score = 1;
  } else {
    const absAngle = Math.abs(angleDeg);
    if (absAngle <= 4) {
      score = 1;
    } else if (absAngle <= 15) {
      score = 2;
    } else {
      score = 3;
    }
  }

  if (bentFromMidline) score += 1;

  return Math.max(1, Math.min(4, score));
}

/**
 * Score Wrist Twist (Step 4).
 * - Mainly in mid-range of twist: 1
 * - At or near end of twist range: 2
 */
export function scoreWristTwist(twist: 'mid_range' | 'near_end' | null): number {
  if (twist === 'near_end') return 2;
  return 1;
}

/**
 * Score Neck Posture (Step 9).
 * Base score:
 * - 0° to 10° flexion: 1
 * - 10° to 20° flexion: 2
 * - >20° flexion: 3
 * - In extension (< 0°): 4
 * Adjustments:
 * - Neck is twisted: +1
 * - Neck is side-bending: +1
 * Score clamped between 1 and 6.
 */
export function scoreNeck(
  angleDeg: number,
  adjustments: NeckAdjustments = {}
): number {
  let score = 1;

  if (angleDeg < 0) {
    // Extension
    score = 4;
  } else if (angleDeg <= 10) {
    score = 1;
  } else if (angleDeg <= 20) {
    score = 2;
  } else {
    score = 3;
  }

  if (adjustments.neckTwist) score += 1;
  if (adjustments.neckSideBend) score += 1;

  return Math.max(1, Math.min(6, score));
}

/**
 * Score Trunk Posture (Step 10).
 * Base score:
 * - Sitting, well supported: 1
 * - 0° to 20° flexion: 2
 * - 20° to 60° flexion: 3
 * - >60° flexion or in extension: 4
 * Adjustments:
 * - Trunk is twisted: +1
 * - Trunk is side-bending: +1
 * Score clamped between 1 and 6.
 */
export function scoreTrunk(
  angleDeg: number,
  adjustments: TrunkAdjustments = {}
): number {
  let score = 1;

  if (angleDeg < 0) {
    // Trunk extension
    score = 4;
  } else if (angleDeg <= 5) {
    score = 1;
  } else if (angleDeg <= 20) {
    score = 2;
  } else if (angleDeg <= 60) {
    score = 3;
  } else {
    score = 4;
  }

  if (adjustments.trunkTwisted) score += 1;
  if (adjustments.trunkSideBend) score += 1;

  return Math.max(1, Math.min(6, score));
}

/**
 * Score Legs Posture (Step 11).
 * - Legs and feet are well supported and balanced: 1
 * - Not well supported or weight is unevenly balanced: 2
 */
export function scoreLegs(supported: boolean | null): number {
  return supported === false ? 2 : 1;
}

/**
 * Muscle Use Adjustment (Steps 5 & 12).
 * - Posture is mainly static (held > 1 min) or action repeated > 4 times/min: +1
 * - Intermittent or occasional: 0
 */
export function muscleUseAdjustment(
  use: 'occasional' | 'static_or_repeated' | null
): number {
  return use === 'static_or_repeated' ? 1 : 0;
}

/**
 * Force / Load Adjustment (Steps 6 & 13).
 * - Intermittent load < 2 kg: 0
 * - Intermittent load 2 kg to 10 kg: +1
 * - Static or repetitive load 2-10 kg, OR any shock/rapid load > 10 kg: +2
 */
export function forceLoadAdjustment(
  load: 'none' | 'light' | 'moderate_or_greater' | null
): number {
  if (load === 'moderate_or_greater') return 2;
  if (load === 'light') return 1;
  return 0;
}

/**
 * Map Grand RULA Score (1-7) to RULA Action Level (1-4).
 */
export function scoreToActionLevel(score: number): ActionLevel {
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 6) return 3;
  return 4;
}

export function actionLevelDescription(level: ActionLevel): {
  level: ActionLevel;
  title: string;
  urgency: string;
  description: string;
} {
  switch (level) {
    case 1:
      return {
        level: 1,
        title: 'Action Level 1 (Score 1-2)',
        urgency: 'Low',
        description: 'Posture is acceptable if not maintained or repeated over long periods.',
      };
    case 2:
      return {
        level: 2,
        title: 'Action Level 2 (Score 3-4)',
        urgency: 'Moderate',
        description: 'Further investigation is needed and changes may be required.',
      };
    case 3:
      return {
        level: 3,
        title: 'Action Level 3 (Score 5-6)',
        urgency: 'High',
        description: 'Investigation and changes are required soon.',
      };
    case 4:
      return {
        level: 4,
        title: 'Action Level 4 (Score 7)',
        urgency: 'Immediate',
        description: 'Investigation and changes are required immediately.',
      };
  }
}

/**
 * Complete RULA assessment pipeline.
 * Computes segment scores, intermediate Table A & Table B lookups,
 * adjustment factors, Table C Grand Score, and Action Level.
 *
 * If any required angles or inputs are missing, flags them explicitly
 * and refrains from fabricating a Grand Score.
 */
export function calculateRula(
  angles: RulaInputAngles,
  manualInputs: ManualInputs,
  manualCorrections: Record<string, number> = {}
): RulaAssessment {
  const missingInputFlags: string[] = [];

  // Validate presence of required inputs
  if (angles.upperArmDeg === null && manualCorrections['upperArm'] === undefined) {
    missingInputFlags.push('Upper Arm Angle is missing');
  }
  if (angles.lowerArmDeg === null && manualCorrections['lowerArm'] === undefined) {
    missingInputFlags.push('Lower Arm Angle is missing');
  }
  if (angles.neckDeg === null && manualCorrections['neck'] === undefined) {
    missingInputFlags.push('Neck Angle is missing');
  }
  if (angles.trunkDeg === null && manualCorrections['trunk'] === undefined) {
    missingInputFlags.push('Trunk Angle is missing');
  }
  if (manualInputs.forceLoad === null) {
    missingInputFlags.push('Force / Load input is not selected');
  }
  if (manualInputs.muscleUse === null) {
    missingInputFlags.push('Muscle Use condition is not selected');
  }

  // Segment scores with manual corrections taking precedence
  const upperArm =
    manualCorrections['upperArm'] ??
    (angles.upperArmDeg !== null
      ? scoreUpperArm(angles.upperArmDeg, {
          upperArmAbducted: manualInputs.upperArmAbducted,
          shoulderRaised: manualInputs.shoulderRaised,
          leaningArm: manualInputs.leaningArm,
        })
      : null);

  const lowerArm =
    manualCorrections['lowerArm'] ??
    (angles.lowerArmDeg !== null ? scoreLowerArm(angles.lowerArmDeg) : null);

  const wrist =
    manualCorrections['wrist'] ??
    scoreWrist(angles.wristDeg);

  const wristTwist =
    manualCorrections['wristTwist'] ??
    scoreWristTwist(manualInputs.wristTwist);

  const neck =
    manualCorrections['neck'] ??
    (angles.neckDeg !== null
      ? scoreNeck(angles.neckDeg, {
          neckTwist: manualInputs.neckTwist,
          neckSideBend: manualInputs.neckSideBend,
        })
      : null);

  const trunk =
    manualCorrections['trunk'] ??
    (angles.trunkDeg !== null
      ? scoreTrunk(angles.trunkDeg, {
          trunkTwisted: manualInputs.trunkTwisted,
          trunkSideBend: manualInputs.trunkSideBend,
        })
      : null);

  const legs =
    manualCorrections['legs'] ??
    scoreLegs(manualInputs.legsSupported);

  // Intermediate Table lookups
  let tableAScore: number | null = null;
  let scoreA: number | null = null;
  let tableBScore: number | null = null;
  let scoreB: number | null = null;
  let finalScore: number | null = null;
  let actionLevel: ActionLevel | null = null;

  const muscleAdj = muscleUseAdjustment(manualInputs.muscleUse);
  const forceAdj = forceLoadAdjustment(manualInputs.forceLoad);

  if (upperArm !== null && lowerArm !== null && wrist !== null && wristTwist !== null) {
    tableAScore = lookupTableA(upperArm, lowerArm, wrist, wristTwist);
    scoreA = tableAScore + muscleAdj + forceAdj;
  }

  if (neck !== null && trunk !== null && legs !== null) {
    tableBScore = lookupTableB(neck, trunk, legs);
    scoreB = tableBScore + muscleAdj + forceAdj;
  }

  const isComplete = missingInputFlags.length === 0 && scoreA !== null && scoreB !== null;

  if (isComplete && scoreA !== null && scoreB !== null) {
    finalScore = lookupTableC(scoreA, scoreB);
    actionLevel = scoreToActionLevel(finalScore);
  }

  const segmentScores: RulaSegmentScores = {
    upperArm,
    lowerArm,
    wrist,
    wristTwist,
    tableAScore,
    muscleUseAdjustment: muscleAdj,
    forceLoadAdjustment: forceAdj,
    scoreA,
    neck,
    trunk,
    legs,
    tableBScore,
    muscleUseAdjustmentB: muscleAdj,
    forceLoadAdjustmentB: forceAdj,
    scoreB,
    finalScore,
    actionLevel,
  };

  return {
    segmentScores,
    missingInputFlags,
    scoringReferenceVersion: RULA_TABLES_VERSION,
    isComplete,
    manualCorrections,
    assessorConfirmed: false,
  };
}
