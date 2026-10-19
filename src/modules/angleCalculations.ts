/**
 * Joint angle calculations for ErgoSnap Analytics.
 * Source: Vector mathematics, RULA scoring definitions from
 * McAtamney & Corlett (1993) Applied Ergonomics 24(2), 91-99.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface AngleResult {
  valueDegrees: number | null;
  isValid: boolean;
  invalidReason?: string;
  signedValueDegrees: number | null;
}

// Minimum vector length in normalized coordinates to avoid near-zero division
const MIN_VECTOR_LENGTH = 1e-6;

/**
 * Calculate the angle at vertex B formed by points A-B-C.
 * Vector u = A - B, Vector v = C - B.
 * Returns angle in degrees [0, 180]. Returns null if geometry is degenerate.
 */
export function angleBetween(A: Point2D, B: Point2D, C: Point2D): AngleResult {
  const uX = A.x - B.x;
  const uY = A.y - B.y;
  const vX = C.x - B.x;
  const vY = C.y - B.y;

  const lenU = Math.sqrt(uX * uX + uY * uY);
  const lenV = Math.sqrt(vX * vX + vY * vY);

  if (lenU < MIN_VECTOR_LENGTH || lenV < MIN_VECTOR_LENGTH) {
    return {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Collinear or zero-length limb vector (degenerate geometry)',
      signedValueDegrees: null,
    };
  }

  const dot = uX * vX + uY * vY;
  // Clamp cosine argument to [-1, 1] to prevent floating point domain errors
  const cosTheta = Math.max(-1, Math.min(1, dot / (lenU * lenV)));
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Signed 2D angle using cross product (z-component)
  const cross = uX * vY - uY * vX;
  const signedDeg = cross >= 0 ? angleDeg : -angleDeg;

  return {
    valueDegrees: Math.round(angleDeg * 10) / 10,
    isValid: true,
    signedValueDegrees: Math.round(signedDeg * 10) / 10,
  };
}

/**
 * Signed angle from vector BA to BC, positive = counter-clockwise.
 */
export function signedAngle(A: Point2D, B: Point2D, C: Point2D): AngleResult {
  return angleBetween(A, B, C);
}

/**
 * Angle of a vector relative to the vertical axis (gravity axis, positive Y is downwards in image coordinates).
 * Angle 0° means pointing directly downwards (e.g. arm hanging straight down).
 */
export function angleFromVertical(from: Point2D, to: Point2D): AngleResult {
  const dx = to.x - from.x;
  const dy = to.y - from.y; // Positive downwards
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < MIN_VECTOR_LENGTH) {
    return {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Zero-length vector relative to vertical',
      signedValueDegrees: null,
    };
  }

  // Vector downwards is (0, 1)
  const dot = 0 * dx + 1 * dy;
  const cosTheta = Math.max(-1, Math.min(1, dot / len));
  const angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;

  return {
    valueDegrees: Math.round(angleDeg * 10) / 10,
    isValid: true,
    signedValueDegrees: dx >= 0 ? Math.round(angleDeg * 10) / 10 : -Math.round(angleDeg * 10) / 10,
  };
}

/**
 * Angle of a vector relative to horizontal (pointing rightwards: dx > 0, dy = 0).
 */
export function angleFromHorizontal(from: Point2D, to: Point2D): AngleResult {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < MIN_VECTOR_LENGTH) {
    return {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Zero-length vector relative to horizontal',
      signedValueDegrees: null,
    };
  }

  const dot = 1 * dx + 0 * dy;
  const cosTheta = Math.max(-1, Math.min(1, dot / len));
  const angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;

  return {
    valueDegrees: Math.round(angleDeg * 10) / 10,
    isValid: true,
    signedValueDegrees: dy <= 0 ? Math.round(angleDeg * 10) / 10 : -Math.round(angleDeg * 10) / 10,
  };
}

// MediaPipe 33 landmark standard indices
export const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export interface ComputedAngle extends AngleResult {
  name: string;
  description: string;
  landmarkIndices: [number, number, number];
}

/**
 * Calculate all RULA-relevant angles from a landmark array.
 * Chooses the side with higher average visibility (left or right).
 */
export function calculateRulaAngles(
  landmarks: Array<{ x: number; y: number; visibility: number; presence?: number }>,
  imageWidth: number,
  imageHeight: number,
  visibilityThreshold: number = 0.5
): Record<string, ComputedAngle> {
  const toPixels = (lm: { x: number; y: number }): Point2D => ({
    x: lm.x * imageWidth,
    y: lm.y * imageHeight,
  });

  const isUsable = (idx: number) => {
    const lm = landmarks[idx];
    return lm && lm.visibility >= visibilityThreshold;
  };

  // Determine side: compare visibility of left vs right upper limb
  const leftScore =
    (landmarks[11]?.visibility ?? 0) +
    (landmarks[13]?.visibility ?? 0) +
    (landmarks[15]?.visibility ?? 0);
  const rightScore =
    (landmarks[12]?.visibility ?? 0) +
    (landmarks[14]?.visibility ?? 0) +
    (landmarks[16]?.visibility ?? 0);

  const useLeft = leftScore >= rightScore;
  const side = useLeft ? 'Left' : 'Right';
  const shIdx = useLeft ? 11 : 12;
  const elIdx = useLeft ? 13 : 14;
  const wrIdx = useLeft ? 15 : 16;
  const hipIdx = useLeft ? 23 : 24;
  const earIdx = useLeft ? 7 : 8;
  const knIdx = useLeft ? 25 : 26;
  const anIdx = useLeft ? 27 : 28;

  const results: Record<string, ComputedAngle> = {};

  // 1. Upper Arm Flexion / Extension (Angle of Shoulder->Elbow relative to vertical)
  if (isUsable(shIdx) && isUsable(elIdx)) {
    const sh = toPixels(landmarks[shIdx]);
    const el = toPixels(landmarks[elIdx]);
    const res = angleFromVertical(sh, el);
    results['upperArmAngle'] = {
      ...res,
      name: `${side} Upper Arm Angle`,
      description: 'Angle of upper arm relative to vertical trunk/gravity axis',
      landmarkIndices: [shIdx, shIdx, elIdx],
    };
  } else {
    results['upperArmAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: `${side} shoulder or elbow landmark visibility below threshold`,
      signedValueDegrees: null,
      name: `${side} Upper Arm Angle`,
      description: 'Angle of upper arm relative to vertical trunk axis',
      landmarkIndices: [shIdx, shIdx, elIdx],
    };
  }

  // 2. Elbow Included Angle (Shoulder - Elbow - Wrist)
  if (isUsable(shIdx) && isUsable(elIdx) && isUsable(wrIdx)) {
    const sh = toPixels(landmarks[shIdx]);
    const el = toPixels(landmarks[elIdx]);
    const wr = toPixels(landmarks[wrIdx]);
    const res = angleBetween(sh, el, wr);
    results['elbowIncludedAngle'] = {
      ...res,
      name: `${side} Elbow Included Angle`,
      description: 'Included interior angle at elbow joint (Shoulder - Elbow - Wrist)',
      landmarkIndices: [shIdx, elIdx, wrIdx],
    };
  } else {
    results['elbowIncludedAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: `${side} arm landmarks (shoulder, elbow, or wrist) not sufficiently visible`,
      signedValueDegrees: null,
      name: `${side} Elbow Included Angle`,
      description: 'Included interior angle at elbow joint',
      landmarkIndices: [shIdx, elIdx, wrIdx],
    };
  }

  // 3. Lower Arm Angle (Angle of Elbow->Wrist from horizontal/vertical)
  if (isUsable(elIdx) && isUsable(wrIdx)) {
    const el = toPixels(landmarks[elIdx]);
    const wr = toPixels(landmarks[wrIdx]);
    const res = angleFromHorizontal(el, wr);
    results['lowerArmAngle'] = {
      ...res,
      name: `${side} Lower Arm Inclination`,
      description: 'Angle of forearm relative to horizontal working plane',
      landmarkIndices: [elIdx, elIdx, wrIdx],
    };
  } else {
    results['lowerArmAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: `${side} elbow or wrist landmark not sufficiently visible`,
      signedValueDegrees: null,
      name: `${side} Lower Arm Inclination`,
      description: 'Angle of forearm relative to horizontal working plane',
      landmarkIndices: [elIdx, elIdx, wrIdx],
    };
  }

  // 4. Neck Angle (Ear -> Shoulder relative to vertical)
  const headIdx = isUsable(earIdx) ? earIdx : 0; // Fallback to nose if ear not visible
  if (isUsable(headIdx) && isUsable(shIdx)) {
    const head = toPixels(landmarks[headIdx]);
    const sh = toPixels(landmarks[shIdx]);
    // Vector head to shoulder points downwards
    const res = angleFromVertical(head, sh);
    results['neckAngle'] = {
      ...res,
      name: 'Neck Inclination',
      description: 'Inclination of head-neck segment relative to vertical axis',
      landmarkIndices: [headIdx, headIdx, shIdx],
    };
  } else {
    results['neckAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Head/ear or shoulder landmarks not sufficiently visible',
      signedValueDegrees: null,
      name: 'Neck Inclination',
      description: 'Inclination of head-neck segment relative to vertical axis',
      landmarkIndices: [headIdx, headIdx, shIdx],
    };
  }

  // 5. Trunk Angle (Shoulder midpoint -> Hip midpoint relative to vertical)
  if (isUsable(11) && isUsable(12) && isUsable(23) && isUsable(24)) {
    const shMid: Point2D = {
      x: ((landmarks[11].x + landmarks[12].x) / 2) * imageWidth,
      y: ((landmarks[11].y + landmarks[12].y) / 2) * imageHeight,
    };
    const hipMid: Point2D = {
      x: ((landmarks[23].x + landmarks[24].x) / 2) * imageWidth,
      y: ((landmarks[23].y + landmarks[24].y) / 2) * imageHeight,
    };
    const res = angleFromVertical(shMid, hipMid);
    results['trunkAngle'] = {
      ...res,
      name: 'Trunk Inclination',
      description: 'Inclination of thoracic/lumbar spine relative to vertical axis',
      landmarkIndices: [11, 23, 24],
    };
  } else if (isUsable(shIdx) && isUsable(hipIdx)) {
    // Monocular single-side estimate
    const sh = toPixels(landmarks[shIdx]);
    const hip = toPixels(landmarks[hipIdx]);
    const res = angleFromVertical(sh, hip);
    results['trunkAngle'] = {
      ...res,
      name: `${side} Trunk Inclination (Single-Side)`,
      description: 'Inclination of trunk relative to vertical axis (single-side estimate)',
      landmarkIndices: [shIdx, shIdx, hipIdx],
    };
  } else {
    results['trunkAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Torso landmarks (shoulders/hips) not sufficiently visible',
      signedValueDegrees: null,
      name: 'Trunk Inclination',
      description: 'Inclination of trunk relative to vertical axis',
      landmarkIndices: [shIdx, shIdx, hipIdx],
    };
  }

  // 6. Knee Angle (Hip - Knee - Ankle)
  if (isUsable(hipIdx) && isUsable(knIdx) && isUsable(anIdx)) {
    const hp = toPixels(landmarks[hipIdx]);
    const kn = toPixels(landmarks[knIdx]);
    const an = toPixels(landmarks[anIdx]);
    const res = angleBetween(hp, kn, an);
    results['kneeAngle'] = {
      ...res,
      name: `${side} Knee Angle`,
      description: 'Included angle at knee joint (Hip - Knee - Ankle)',
      landmarkIndices: [hipIdx, knIdx, anIdx],
    };
  } else {
    results['kneeAngle'] = {
      valueDegrees: null,
      isValid: false,
      invalidReason: 'Lower body landmarks not visible or occluded',
      signedValueDegrees: null,
      name: `${side} Knee Angle`,
      description: 'Included angle at knee joint',
      landmarkIndices: [hipIdx, knIdx, anIdx],
    };
  }

  return results;
}
