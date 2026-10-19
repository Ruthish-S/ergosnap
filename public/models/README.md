# MediaPipe Vision Model Assets

This directory hosts pretrained vision models for ErgoSnap Analytics:

- **Model:** Pose Landmarker (Lite - float16)
- **Target File:** `pose_landmarker_lite.task`
- **License:** Apache License 2.0 (Google LLC)
- **Official Source:**
  `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`

### Fallback Behavior
The application runtime (`src/modules/poseDetector.ts`) automatically checks if `/ergosnap/models/pose_landmarker_lite.task` exists locally. If absent (e.g. during minimal static deploys), it falls back seamlessly to the version-pinned Google Cloud CDN URL.
