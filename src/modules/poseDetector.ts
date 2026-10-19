/**
 * Pose landmark detection wrapper for ErgoSnap Analytics.
 * Uses MediaPipe Tasks Vision PoseLandmarker in IMAGE mode.
 *
 * Reference: Google AI Edge. Pose Landmarker for Web.
 * https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
 */

import {
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import type { Landmark, ModelInfo } from '../types/assessment';

export const MODEL_CONFIG = {
  localAssetPath: '/ergosnap/models/pose_landmarker_lite.task',
  fallbackCdnUrl:
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
  wasmCdnUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  modelVersion: 'pose_landmarker_lite_float16_v0.10.0',
} as const;

export type DetectorStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ready'; modelInfo: ModelInfo }
  | { state: 'error'; message: string };

export interface DetectionResult {
  landmarks: Landmark[];
  detectedAt: string;
  modelInfo: ModelInfo;
  personDetected: boolean;
}

export interface DetectionError {
  code: 'NO_PERSON' | 'MODEL_NOT_READY' | 'INFERENCE_FAILED' | 'IMAGE_ERROR';
  message: string;
}

export const LANDMARK_NAMES: Record<number, string> = {
  0: 'nose',
  1: 'left_eye_inner',
  2: 'left_eye',
  3: 'left_eye_outer',
  4: 'right_eye_inner',
  5: 'right_eye',
  6: 'right_eye_outer',
  7: 'left_ear',
  8: 'right_ear',
  9: 'mouth_left',
  10: 'mouth_right',
  11: 'left_shoulder',
  12: 'right_shoulder',
  13: 'left_elbow',
  14: 'right_elbow',
  15: 'left_wrist',
  16: 'right_wrist',
  17: 'left_pinky',
  18: 'right_pinky',
  19: 'left_index',
  20: 'right_index',
  21: 'left_thumb',
  22: 'right_thumb',
  23: 'left_hip',
  24: 'right_hip',
  25: 'left_knee',
  26: 'right_knee',
  27: 'left_ankle',
  28: 'right_ankle',
  29: 'left_heel',
  30: 'right_heel',
  31: 'left_foot_index',
  32: 'right_foot_index',
};

let poseLandmarkerInstance: PoseLandmarker | null = null;
let currentStatus: DetectorStatus = { state: 'idle' };
let loadedModelInfo: ModelInfo | null = null;
let initPromise: Promise<ModelInfo> | null = null;

export function getDetectorStatus(): DetectorStatus {
  return currentStatus;
}

/**
 * Initialize MediaPipe PoseLandmarker.
 * Tries local asset first; falls back to versioned CDN if local is unreachable.
 */
export async function initializePoseDetector(): Promise<ModelInfo> {
  if (poseLandmarkerInstance && loadedModelInfo) {
    return loadedModelInfo;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    currentStatus = { state: 'loading' };

    try {
      const vision = await FilesetResolver.forVisionTasks(MODEL_CONFIG.wasmCdnUrl);

      // Check whether self-hosted asset is available
      let modelAssetPath: string = MODEL_CONFIG.fallbackCdnUrl;
      try {
        const headResp = await fetch(MODEL_CONFIG.localAssetPath, { method: 'HEAD' });
        if (headResp.ok) {
          modelAssetPath = MODEL_CONFIG.localAssetPath;
        }
      } catch {
        // Fall back to CDN
        modelAssetPath = MODEL_CONFIG.fallbackCdnUrl;
      }

      poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: MODEL_CONFIG.numPoses,
        minPoseDetectionConfidence: MODEL_CONFIG.minPoseDetectionConfidence,
        minPosePresenceConfidence: MODEL_CONFIG.minPosePresenceConfidence,
        minTrackingConfidence: MODEL_CONFIG.minTrackingConfidence,
        outputSegmentationMasks: false,
      });

      loadedModelInfo = {
        modelName: 'MediaPipe PoseLandmarker (Lite)',
        modelVersion: MODEL_CONFIG.modelVersion,
        assetUrl: modelAssetPath,
        detectionConfidence: MODEL_CONFIG.minPoseDetectionConfidence,
        presenceConfidence: MODEL_CONFIG.minPosePresenceConfidence,
      };

      currentStatus = { state: 'ready', modelInfo: loadedModelInfo };
      return loadedModelInfo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      currentStatus = { state: 'error', message: msg };
      initPromise = null;
      throw new Error(`MediaPipe Pose Landmarker initialization failed: ${msg}`);
    }
  })();

  return initPromise;
}

/**
 * Run pose landmark inference on an HTML image element.
 */
export async function detectPose(
  imageElement: HTMLImageElement
): Promise<DetectionResult | DetectionError> {
  if (!poseLandmarkerInstance || !loadedModelInfo) {
    try {
      await initializePoseDetector();
    } catch (err) {
      return {
        code: 'MODEL_NOT_READY',
        message: err instanceof Error ? err.message : 'Model failed to initialize',
      };
    }
  }

  if (!poseLandmarkerInstance || !loadedModelInfo) {
    return {
      code: 'MODEL_NOT_READY',
      message: 'Pose Landmarker is not initialized.',
    };
  }

  try {
    const result = poseLandmarkerInstance.detect(imageElement);

    if (!result.landmarks || result.landmarks.length === 0 || result.landmarks[0].length === 0) {
      return {
        code: 'NO_PERSON',
        message:
          'No human figure detected in the image. Please verify lighting, camera angle, and visibility of the subject.',
      };
    }

    const rawLandmarks: NormalizedLandmark[] = result.landmarks[0];
    const typedLandmarks: Landmark[] = rawLandmarks.map((lm, idx) => {
      const vis = lm.visibility ?? 1.0;
      const pres = lm.presence ?? 1.0;
      const isVisible =
        vis >= MODEL_CONFIG.minPoseDetectionConfidence &&
        pres >= MODEL_CONFIG.minPosePresenceConfidence;

      return {
        index: idx,
        name: LANDMARK_NAMES[idx] ?? `landmark_${idx}`,
        x: lm.x,
        y: lm.y,
        z: lm.z ?? 0,
        visibility: Math.round(vis * 100) / 100,
        presence: Math.round(pres * 100) / 100,
        isVisible,
      };
    });

    return {
      landmarks: typedLandmarks,
      detectedAt: new Date().toISOString(),
      modelInfo: loadedModelInfo,
      personDetected: true,
    };
  } catch (err) {
    return {
      code: 'INFERENCE_FAILED',
      message: `Inference failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Cleanup resources
 */
export async function disposePoseDetector(): Promise<void> {
  if (poseLandmarkerInstance) {
    poseLandmarkerInstance.close();
    poseLandmarkerInstance = null;
    currentStatus = { state: 'idle' };
    loadedModelInfo = null;
    initPromise = null;
  }
}
