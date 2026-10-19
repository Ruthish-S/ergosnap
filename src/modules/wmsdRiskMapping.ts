/**
 * WMSD Risk Mapping Module for ErgoSnap Analytics
 *
 * Computes body-region risk levels by aggregating RULA segment scores
 * and joint angle deviations from neutral zone baselines.
 *
 * Scientific basis:
 * - EU-OSHA (2020). Work-related musculoskeletal disorders: prevalence, costs
 *   and demographics in the EU. European Agency for Safety and Health at Work.
 * - ISO 11226:2000. Ergonomics — Evaluation of static working postures.
 * - McAtamney & Corlett (1993). RULA. Applied Ergonomics, 24(2), 91–99.
 *
 * Rules:
 * 1. Risk level is derived from measured angles and RULA scores — never invented.
 * 2. null inputs produce 'unknown' risk, never a fabricated value.
 * 3. Labels are "risk indicator" not "diagnosis".
 */

import type { AngleMeasurement, RulaAssessment } from '../types/assessment';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'unknown';

export interface BodyRegionRisk {
  region: string;          // Anatomical region label
  riskLevel: RiskLevel;
  score: number | null;    // Underlying RULA segment score (1–6), null if unavailable
  angleDeg: number | null; // Measured angle (degrees), null if unavailable
  neutralRangeDeg: [number, number]; // ISO 11226 neutral/comfort range [min, max]
  deviationDeg: number | null; // Degrees outside neutral range (0 = within range)
  basis: string;           // Explanation of how risk was determined
}

export interface WmsdRiskMap {
  regions: BodyRegionRisk[];
  overallBodyRisk: RiskLevel;
  primaryRiskRegion: string | null;
  assessmentNote: string;
}

/** Map a RULA segment score (1–6) to a risk level. */
function scoreToRisk(score: number | null): RiskLevel {
  if (score === null) return 'unknown';
  if (score <= 1) return 'low';
  if (score <= 2) return 'moderate';
  if (score <= 4) return 'high';
  return 'critical';
}

/** Compute degrees outside a neutral range. Returns 0 if within range. */
function deviationFromNeutral(angleDeg: number | null, range: [number, number]): number | null {
  if (angleDeg === null) return null;
  if (angleDeg < range[0]) return range[0] - angleDeg;
  if (angleDeg > range[1]) return angleDeg - range[1];
  return 0;
}

/**
 * ISO 11226:2000 acceptable static posture ranges (degrees).
 * These are comfort/acceptable ranges, not absolute injury thresholds.
 * Key reference: ISO 11226:2000 Table 1 "Working posture evaluation criteria".
 */
const NEUTRAL_RANGES: Record<string, [number, number]> = {
  neck:     [0, 25],    // Neck flexion 0°–25° acceptable
  trunk:    [0, 20],    // Trunk flexion 0°–20° acceptable (upright ± 20°)
  upperArm: [0, 20],    // Upper arm elevation 0°–20° from vertical acceptable
  lowerArm: [60, 100],  // Elbow flexion 60°–100° acceptable (RULA criterion)
  wrist:    [-15, 15],  // Wrist deviation ±15° from neutral acceptable
};

/**
 * Build a full WMSD risk map from RULA scores and measured angles.
 */
export function buildWmsdRiskMap(
  rula: RulaAssessment,
  angles: AngleMeasurement[]
): WmsdRiskMap {
  const getAngle = (substr: string): number | null => {
    const match = angles.find((a) =>
      a.name.toLowerCase().includes(substr.toLowerCase()) && a.isValid
    );
    return match?.valueDegrees ?? null;
  };

  const neckAngle   = getAngle('neck');
  const trunkAngle  = getAngle('trunk');
  const upperArmAngle = getAngle('upper arm');
  const lowerArmAngle = getAngle('lower arm');
  const wristAngle  = getAngle('wrist');

  const ss = rula.segmentScores;

  const regions: BodyRegionRisk[] = [
    {
      region: 'Neck / Cervical Spine',
      riskLevel: scoreToRisk(ss.neck),
      score: ss.neck,
      angleDeg: neckAngle,
      neutralRangeDeg: NEUTRAL_RANGES.neck,
      deviationDeg: deviationFromNeutral(neckAngle, NEUTRAL_RANGES.neck),
      basis: ss.neck !== null
        ? `RULA neck score ${ss.neck}/6; ISO 11226 acceptable range 0°–25° flexion`
        : 'Neck angle unavailable — cannot determine risk level',
    },
    {
      region: 'Trunk / Lumbar Spine',
      riskLevel: scoreToRisk(ss.trunk),
      score: ss.trunk,
      angleDeg: trunkAngle,
      neutralRangeDeg: NEUTRAL_RANGES.trunk,
      deviationDeg: deviationFromNeutral(trunkAngle, NEUTRAL_RANGES.trunk),
      basis: ss.trunk !== null
        ? `RULA trunk score ${ss.trunk}/6; ISO 11226 acceptable range 0°–20° flexion`
        : 'Trunk angle unavailable — cannot determine risk level',
    },
    {
      region: 'Shoulder / Upper Arm',
      riskLevel: scoreToRisk(ss.upperArm),
      score: ss.upperArm,
      angleDeg: upperArmAngle,
      neutralRangeDeg: NEUTRAL_RANGES.upperArm,
      deviationDeg: deviationFromNeutral(upperArmAngle, NEUTRAL_RANGES.upperArm),
      basis: ss.upperArm !== null
        ? `RULA upper arm score ${ss.upperArm}/6; arm elevation > 20° increases supraspinatus load`
        : 'Upper arm angle unavailable — cannot determine risk level',
    },
    {
      region: 'Elbow / Forearm',
      riskLevel: scoreToRisk(ss.lowerArm),
      score: ss.lowerArm,
      angleDeg: lowerArmAngle,
      neutralRangeDeg: NEUTRAL_RANGES.lowerArm,
      deviationDeg: deviationFromNeutral(lowerArmAngle, NEUTRAL_RANGES.lowerArm),
      basis: ss.lowerArm !== null
        ? `RULA lower arm score ${ss.lowerArm}/3; optimal elbow flexion 60°–100°`
        : 'Lower arm angle unavailable — cannot determine risk level',
    },
    {
      region: 'Wrist / Hand',
      riskLevel: scoreToRisk(ss.wrist),
      score: ss.wrist,
      angleDeg: wristAngle,
      neutralRangeDeg: NEUTRAL_RANGES.wrist,
      deviationDeg: deviationFromNeutral(wristAngle, NEUTRAL_RANGES.wrist),
      basis: ss.wrist !== null
        ? `RULA wrist score ${ss.wrist}/4; neutral wrist ±15° from mid-range`
        : 'Wrist angle not directly measured — RULA score estimated from manual input',
    },
    {
      region: 'Legs / Lower Limbs',
      riskLevel: scoreToRisk(ss.legs),
      score: ss.legs,
      angleDeg: null,
      neutralRangeDeg: [0, 0],
      deviationDeg: null,
      basis: ss.legs !== null
        ? `RULA leg score ${ss.legs}/2; ${ss.legs === 1 ? 'adequate support' : 'inadequate support detected'}`
        : 'Leg support status not assessed',
    },
  ];

  // Overall body risk = worst region that is not 'unknown'
  const knownRisks = regions.filter((r) => r.riskLevel !== 'unknown');
  const riskOrder: RiskLevel[] = ['low', 'moderate', 'high', 'critical'];
  let overallBodyRisk: RiskLevel = 'unknown';
  if (knownRisks.length > 0) {
    overallBodyRisk = knownRisks.reduce((worst, r) => {
      return riskOrder.indexOf(r.riskLevel) > riskOrder.indexOf(worst)
        ? r.riskLevel
        : worst;
    }, 'low' as RiskLevel);
  }

  const primaryRiskRegion =
    regions
      .filter((r) => r.riskLevel !== 'unknown')
      .sort((a, b) => {
        const aIdx = riskOrder.indexOf(a.riskLevel);
        const bIdx = riskOrder.indexOf(b.riskLevel);
        return bIdx - aIdx;
      })[0]?.region ?? null;

  return {
    regions,
    overallBodyRisk,
    primaryRiskRegion,
    assessmentNote:
      'Risk levels are derived from RULA segment scores (McAtamney & Corlett, 1993) ' +
      'and neutral zone baselines (ISO 11226:2000). They indicate ergonomic screening ' +
      'risk, not clinical diagnosis.',
  };
}
