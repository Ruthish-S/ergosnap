/**
 * Evidence-based ergonomic recommendation engine for ErgoSnap Analytics.
 *
 * Rules:
 * 1. Recommendations are strictly conditional on objective evidence (joint angles, RULA scores).
 * 2. Formulated as engineering guidance ("consider adjusting", "evaluate reach zone")
 *    rather than diagnostic or regulatory conclusions.
 * 3. Never claims that an adjustment will unilaterally prevent injury.
 */

import type {
  AngleMeasurement,
  Recommendation,
  RulaAssessment,
} from '../types/assessment';

export function generateRecommendations(
  angles: AngleMeasurement[],
  rula: RulaAssessment,
  assessorNotes: string = ''
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const getAngle = (nameSubstring: string): AngleMeasurement | undefined => {
    return angles.find((a) =>
      a.name.toLowerCase().includes(nameSubstring.toLowerCase())
    );
  };

  // 1. Upper Arm Flexion / Elevation
  const upperArm = getAngle('Upper Arm');
  if (upperArm && upperArm.valueDegrees !== null) {
    if (upperArm.valueDegrees > 45) {
      recommendations.push({
        id: 'rec-upper-arm-elevation',
        observation: `Significant upper arm elevation observed (${upperArm.valueDegrees}° relative to vertical).`,
        evidence: `Measured ${upperArm.name}: ${upperArm.valueDegrees}° (exceeds neutral 20° comfort envelope).`,
        rationale:
          'Sustained shoulder elevation (>45°) increases static loading on the trapezius and supraspinatus tendons, accelerating musculoskeletal fatigue.',
        suggestedAction:
          'Consider lowering the primary work surface or repositioning frequently handled controls closer to the operator to reduce forward reach.',
        priority: upperArm.valueDegrees > 90 ? 'urgent' : 'high',
        isVerifiedImprovement: false,
        assessorNotes: assessorNotes || 'Identified via automated 2D posture analysis.',
      });
    }
  }

  // 2. Forearm / Elbow Angle
  const lowerArm = getAngle('Lower Arm');
  const elbowAngle = getAngle('Elbow Included');
  if (lowerArm && lowerArm.valueDegrees !== null && (lowerArm.valueDegrees < 60 || lowerArm.valueDegrees > 100)) {
    recommendations.push({
      id: 'rec-lower-arm-posture',
      observation: `Forearm operating outside standard 60°–100° range (measured ${lowerArm.valueDegrees}°).`,
      evidence: `Forearm inclination: ${lowerArm.valueDegrees}°; Included elbow angle: ${elbowAngle?.valueDegrees ?? 'N/A'}°.`,
      rationale:
        'Forearm flexion outside 60°–100° alters mechanical advantage of elbow flexors and may introduce compensatory shoulder movement.',
      suggestedAction:
        'Evaluate chair armrest height and desk clearance to permit a natural 90° resting elbow angle.',
      priority: 'medium',
      isVerifiedImprovement: false,
      assessorNotes,
    });
  }

  // 3. Neck / Cervical Spine Posture
  const neck = getAngle('Neck');
  if (neck && neck.valueDegrees !== null) {
    if (neck.valueDegrees > 20) {
      recommendations.push({
        id: 'rec-neck-flexion',
        observation: `Marked forward neck flexion (${neck.valueDegrees}° inclination).`,
        evidence: `Cervical segment angle: ${neck.valueDegrees}° (optimal target: 0°–10°).`,
        rationale:
          'Forward neck inclination significantly magnifies effective gravitational moment arm on cervical spine musculature.',
        suggestedAction:
          'Consider raising monitor or target visual display to bring gaze angle to 15°–20° below eye level without forward neck tilt.',
        priority: neck.valueDegrees > 30 ? 'high' : 'medium',
        isVerifiedImprovement: false,
        assessorNotes,
      });
    }
  }

  // 4. Trunk Flexion / Sagittal Tilt
  const trunk = getAngle('Trunk');
  if (trunk && trunk.valueDegrees !== null) {
    if (trunk.valueDegrees > 20) {
      recommendations.push({
        id: 'rec-trunk-flexion',
        observation: `Forward trunk flexion detected (${trunk.valueDegrees}° from vertical).`,
        evidence: `Thoracolumbar vector: ${trunk.valueDegrees}° from vertical axis.`,
        rationale:
          'Unsupported trunk flexion substantially increases lumbar disc pressure and erector spinae muscle demand.',
        suggestedAction:
          'Verify lumbar support engagement on the task chair and ensure items are within the primary reach zone (35–45 cm).',
        priority: trunk.valueDegrees > 40 ? 'urgent' : 'high',
        isVerifiedImprovement: false,
        assessorNotes,
      });
    }
  }

  // 5. Overall RULA Grand Score Action Level
  if (rula.segmentScores.actionLevel !== null) {
    if (rula.segmentScores.actionLevel >= 3) {
      recommendations.push({
        id: 'rec-rula-high-action-level',
        observation: `Comprehensive RULA Grand Score indicates Action Level ${rula.segmentScores.actionLevel} (Score ${rula.segmentScores.finalScore}/7).`,
        evidence: `RULA Grand Score = ${rula.segmentScores.finalScore}, Score A = ${rula.segmentScores.scoreA}, Score B = ${rula.segmentScores.scoreB}.`,
        rationale:
          'According to McAtamney & Corlett (1993), an Action Level 3 or 4 warrants formal workstation investigation and task redesign in the near term.',
        suggestedAction:
          'Schedule an in-person ergonomic review, inspect load handling requirements, and rotate repetitive tasks across shifts.',
        priority: rula.segmentScores.actionLevel === 4 ? 'urgent' : 'high',
        isVerifiedImprovement: false,
        assessorNotes,
      });
    }
  }

  // 6. Missing or occluded inputs
  if (!rula.isComplete && rula.missingInputFlags.length > 0) {
    recommendations.push({
      id: 'rec-missing-inputs',
      observation: `Assessment is incomplete: ${rula.missingInputFlags.length} parameter(s) require manual input.`,
      evidence: rula.missingInputFlags.join(', '),
      rationale:
        'RULA scoring requires external load/force and muscle use duration parameters that cannot be measured from 2D still images alone.',
      suggestedAction:
        'Complete the manual input form (force/load, repetition status) to obtain a verified RULA Grand Score.',
      priority: 'low',
      isVerifiedImprovement: false,
      assessorNotes: 'Assessment pending complete input verification.',
    });
  }

  return recommendations;
}
