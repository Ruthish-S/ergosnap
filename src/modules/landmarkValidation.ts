import type { Landmark, QualityChecks, ObservationStatus } from '../types/assessment';

export const VISIBILITY_THRESHOLD = 0.5;
export const PRESENCE_THRESHOLD = 0.5;

// Essential landmarks for upper-body posture analysis
export const REQUIRED_LANDMARK_INDICES = [
  11, 12, // shoulders
  13, 14, // elbows
  15, 16, // wrists
  23, 24, // hips
];

// Recommended landmarks for neck and postural alignment
export const RECOMMENDED_LANDMARK_INDICES = [
  0,    // nose
  7, 8, // ears
];

export interface LandmarkValidationResult {
  requiredPresent: boolean;
  missingRequiredIndices: number[];
  lowVisibilityIndices: number[];
  completeness: number; // 0 to 1
  qualityChecks: QualityChecks;
  warnings: string[];
}

/**
 * Determine if a single landmark meets confidence thresholds.
 */
export function isLandmarkUsable(
  landmark: Landmark | undefined,
  visThreshold: number = VISIBILITY_THRESHOLD,
  presThreshold: number = PRESENCE_THRESHOLD
): boolean {
  if (!landmark) return false;
  return landmark.visibility >= visThreshold && landmark.presence >= presThreshold;
}

/**
 * Validate landmark completeness and assign scientific observation quality status.
 * Never fabricates or interpolates missing landmarks.
 */
export function validateLandmarks(
  landmarks: Landmark[],
  viewDescription: string = 'general'
): LandmarkValidationResult {
  const missingRequiredIndices: number[] = [];
  const lowVisibilityIndices: number[] = [];
  const warnings: string[] = [];

  let visibleCount = 0;
  for (const lm of landmarks) {
    if (lm.isVisible) {
      visibleCount++;
    } else {
      lowVisibilityIndices.push(lm.index);
    }
  }

  // Check required landmarks
  let requiredVisibleCount = 0;
  for (const reqIdx of REQUIRED_LANDMARK_INDICES) {
    const lm = landmarks.find((l) => l.index === reqIdx);
    if (!lm || !isLandmarkUsable(lm)) {
      missingRequiredIndices.push(reqIdx);
    } else {
      requiredVisibleCount++;
    }
  }

  const landmarkCompleteness =
    REQUIRED_LANDMARK_INDICES.length > 0
      ? requiredVisibleCount / REQUIRED_LANDMARK_INDICES.length
      : 0;

  // At least one full side (shoulder, elbow, wrist, hip) must be visible
  const leftSideUsable =
    isLandmarkUsable(landmarks.find((l) => l.index === 11)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 13)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 15)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 23));

  const rightSideUsable =
    isLandmarkUsable(landmarks.find((l) => l.index === 12)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 14)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 16)) &&
    isLandmarkUsable(landmarks.find((l) => l.index === 24));

  const atLeastOneSideComplete = leftSideUsable || rightSideUsable;

  let overallStatus: ObservationStatus = 'valid';
  let viewSuitability: 'suitable' | 'marginal' | 'unsuitable' = 'suitable';
  let viewSuitabilityNotes = 'Camera viewpoint appears adequate for 2D angle estimation.';

  if (!atLeastOneSideComplete && missingRequiredIndices.length > 4) {
    overallStatus = 'unscorable';
    viewSuitability = 'unsuitable';
    viewSuitabilityNotes = 'Key upper body landmarks are occluded or outside the frame.';
    warnings.push('Key joint landmarks are obscured. Reliable RULA calculation is not possible.');
  } else if (!atLeastOneSideComplete || missingRequiredIndices.length > 0) {
    overallStatus = 'review_required';
    viewSuitability = 'marginal';
    viewSuitabilityNotes = 'Partial landmark occlusion detected. Manual review and verification advised.';
    warnings.push('Some required landmarks have low visibility (< 0.5). Proceed with caution.');
  }

  if (viewDescription.toLowerCase().includes('frontal') || viewDescription.toLowerCase().includes('front')) {
    viewSuitability = 'marginal';
    viewSuitabilityNotes =
      'Frontal view foreshortens sagittal arm and trunk flexion angles. Side/sagittal profile recommended for standard RULA.';
    warnings.push('Frontal view may underestimate flexion/extension angles.');
  }

  return {
    requiredPresent: atLeastOneSideComplete,
    missingRequiredIndices,
    lowVisibilityIndices,
    completeness: Math.round(landmarkCompleteness * 100) / 100,
    qualityChecks: {
      overallStatus,
      landmarkCompleteness: Math.round(landmarkCompleteness * 100) / 100,
      requiredLandmarksPresent: atLeastOneSideComplete,
      viewSuitability,
      viewSuitabilityNotes,
      processingStatus: overallStatus === 'unscorable' ? 'failed' : 'success',
      processingError: overallStatus === 'unscorable' ? 'Insufficient visible landmarks for scoring' : undefined,
    },
    warnings,
  };
}
