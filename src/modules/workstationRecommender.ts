/**
 * Workstation Anthropometric Recommender for ErgoSnap Analytics
 *
 * Derives workstation adjustment suggestions (desk, chair, monitor height)
 * from detected landmark y-coordinates (image-proportional estimates).
 *
 * Scientific basis:
 * - NIOSH (1997). Musculoskeletal Disorders and Workplace Factors.
 *   DHHS (NIOSH) Publication No. 97–141.
 * - Pheasant, S. (2003). Bodyspace: Anthropometry, Ergonomics and the Design
 *   of Work. Taylor & Francis.
 * - ISO 9241-5:1998. Ergonomic requirements for office work with visual display
 *   terminals — Part 5: Workstation layout and postural requirements.
 *
 * IMPORTANT LIMITATIONS:
 * 1. Landmark y-coordinates are image-proportional — not physical measurements.
 * 2. Pixel distances cannot be converted to centimetres without a known
 *    reference scale (camera-to-subject distance, focal length, subject height).
 * 3. All outputs are labelled as "directional engineering suggestions",
 *    not calibrated workstation measurements.
 * 4. null inputs produce null outputs — no values are fabricated.
 */

import type { Landmark } from '../types/assessment';

export interface WorkstationSuggestion {
  element: string;          // Workstation element (e.g., "Desk height")
  observedIndicator: string; // What was detected (proportional, not physical)
  suggestion: string;       // Engineering action
  reference: string;        // Source for the guidance
  confidence: 'high' | 'medium' | 'low'; // Based on landmark visibility
}

export interface WorkstationRecommendation {
  suggestions: WorkstationSuggestion[];
  calibrationNote: string;
  canEstimate: boolean; // False if required landmarks are missing
}

// MediaPipe Pose landmark indices used here
const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

function avg(a: number, b: number): number {
  return (a + b) / 2;
}

function getLm(landmarks: Landmark[], index: number): Landmark | undefined {
  return landmarks.find((lm) => lm.index === index && lm.isVisible);
}

/**
 * Derive workstation suggestions from landmark geometry.
 * All measurements are image-proportional (y-coordinate 0=top, 1=bottom).
 */
export function analyzeWorkstationFit(landmarks: Landmark[]): WorkstationRecommendation {
  const lShould = getLm(landmarks, LM.LEFT_SHOULDER);
  const rShould = getLm(landmarks, LM.RIGHT_SHOULDER);
  const lElbow  = getLm(landmarks, LM.LEFT_ELBOW);
  const rElbow  = getLm(landmarks, LM.RIGHT_ELBOW);
  const lWrist  = getLm(landmarks, LM.LEFT_WRIST);
  const rWrist  = getLm(landmarks, LM.RIGHT_WRIST);
  const lHip    = getLm(landmarks, LM.LEFT_HIP);
  const rHip    = getLm(landmarks, LM.RIGHT_HIP);
  const nose    = getLm(landmarks, LM.NOSE);

  // Require at least shoulders and elbows
  if (!lShould && !rShould) {
    return {
      suggestions: [],
      calibrationNote:
        'Insufficient landmark data (shoulders not detected). ' +
        'Workstation fit analysis requires visible shoulder landmarks.',
      canEstimate: false,
    };
  }

  const suggestions: WorkstationSuggestion[] = [];

  // --- 1. Shoulder-to-elbow vertical drop as proxy for armrest/desk height ---
  const shoulderY = lShould && rShould
    ? avg(lShould.y, rShould.y)
    : (lShould?.y ?? rShould?.y ?? null);

  const elbowY = lElbow && rElbow
    ? avg(lElbow.y, rElbow.y)
    : (lElbow?.y ?? rElbow?.y ?? null);

  if (shoulderY !== null && elbowY !== null) {
    const elbowDropRatio = elbowY - shoulderY; // Positive = elbow below shoulder
    const elbowVisible = !!(lElbow || rElbow);

    if (elbowDropRatio < 0.05) {
      // Elbows approximately at or above shoulder level — desk likely too high
      suggestions.push({
        element: 'Work surface / desk height',
        observedIndicator: `Elbow position estimated at or above shoulder level (proportional drop: ${(elbowDropRatio * 100).toFixed(1)}% image height)`,
        suggestion:
          'Consider lowering the primary work surface. Per NIOSH (1997), the work surface should allow the elbows to rest at approximately 90° with shoulders relaxed (near-zero elevation).',
        reference: 'NIOSH DHHS Publication No. 97-141 (1997); ISO 9241-5:1998 §5.3',
        confidence: elbowVisible ? 'medium' : 'low',
      });
    } else if (elbowDropRatio > 0.20) {
      // Elbow significantly below shoulder — desk likely too low
      suggestions.push({
        element: 'Work surface / desk height',
        observedIndicator: `Elbow position appears significantly below shoulder level (proportional drop: ${(elbowDropRatio * 100).toFixed(1)}% image height)`,
        suggestion:
          'Consider raising the work surface or using a height-adjustable desk. The desk height should permit the elbow to rest at 90° without shoulder elevation or depression.',
        reference: 'NIOSH DHHS Publication No. 97-141 (1997); ISO 9241-5:1998 §5.3',
        confidence: elbowVisible ? 'medium' : 'low',
      });
    }
  }

  // --- 2. Wrist-to-elbow vertical alignment (keyboard/tool height) ---
  const wristY = lWrist && rWrist
    ? avg(lWrist.y, rWrist.y)
    : (lWrist?.y ?? rWrist?.y ?? null);

  if (elbowY !== null && wristY !== null) {
    const wristElbowDiff = wristY - elbowY; // Positive = wrist below elbow
    if (wristElbowDiff < -0.02) {
      suggestions.push({
        element: 'Keyboard / tool positioning',
        observedIndicator: `Wrist appears elevated above elbow (proportional offset: ${(wristElbowDiff * 100).toFixed(1)}% image height)`,
        suggestion:
          'Consider lowering the keyboard or repositioning the task tool so the wrist is at or slightly below elbow level. Sustained wrist extension is a risk factor for carpal tunnel syndrome.',
        reference: 'NIOSH DHHS Publication No. 97-141 (1997) Chapter 5',
        confidence: 'medium',
      });
    }
  }

  // --- 3. Hip-to-shoulder vertical as trunk length proxy → seat height ---
  const hipY = lHip && rHip
    ? avg(lHip.y, rHip.y)
    : (lHip?.y ?? rHip?.y ?? null);

  if (hipY !== null && shoulderY !== null) {
    const trunkRatio = hipY - shoulderY; // Proportion of image height = trunk span
    // No calibrated height — only directional comment
    if (trunkRatio < 0.12) {
      suggestions.push({
        element: 'Seat height',
        observedIndicator: `Estimated trunk span is relatively compact (${(trunkRatio * 100).toFixed(1)}% image height), suggesting operator may be shorter-statured`,
        suggestion:
          'Verify seat height allows feet to be flat on the floor with thighs approximately horizontal (ISO 9241-5). A footrest may be appropriate if the desk cannot be lowered.',
        reference: 'ISO 9241-5:1998 §5.1; Pheasant (2003) Chapter 7',
        confidence: 'low',
      });
    }
  }

  // --- 4. Monitor height proxy from nose-to-shoulder ratio ---
  if (nose && shoulderY !== null) {
    const eyeToShoulderRatio = shoulderY - nose.y; // Positive = shoulder below eye
    if (eyeToShoulderRatio > 0) {
      // Nose is above shoulders — normal. Check if nose is excessively above (head tilted back)
      // or if there is minimal eye–shoulder gap (head bowed)
      if (eyeToShoulderRatio < 0.04) {
        suggestions.push({
          element: 'Monitor / display height',
          observedIndicator: 'Head appears significantly lowered relative to shoulder level',
          suggestion:
            'Consider raising the monitor so the top of the screen is at or slightly below eye level. ISO 9241-5 recommends a downward gaze angle of 15°–20° below horizontal.',
          reference: 'ISO 9241-5:1998 §6.2',
          confidence: 'medium',
        });
      }
    }
  }

  // Always add a general guidance note
  suggestions.push({
    element: 'General workstation adjustment',
    observedIndicator: 'Standard ergonomic fit principles',
    suggestion:
      'Verify the chair provides lumbar support with the backrest contacting the lumbar curve. ' +
      'Ensure primary work objects are within the forearm-reach zone (approximately 35–45 cm from the seated position).',
    reference: 'NIOSH DHHS Publication No. 97-141 (1997); ISO 9241-5:1998',
    confidence: 'high',
  });

  return {
    suggestions,
    calibrationNote:
      'IMPORTANT: All positional indicators above are derived from image-proportional landmark ' +
      'coordinates (y-axis, 0=top to 1=bottom of image frame). They are NOT calibrated physical ' +
      'measurements. Pixel distances cannot be converted to centimetres without a known reference ' +
      'scale. These suggestions are directional engineering guidance only and must be verified ' +
      'with actual workstation measurements.',
    canEstimate: true,
  };
}
