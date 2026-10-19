# Scientific Boundaries & Operational Limitations

## 1. 2D Monocular Foreshortening
- MediaPipe Pose operates on single monocular photographs.
- When limbs move out of the camera's image plane (e.g. forward reaching viewed from the front), 2D projection foreshortening inevitably compresses the apparent segment length and distorts planar angle calculations.
- **Guidance:** Ergonomic posture photographs should ideally be captured perpendicular to the primary movement plane (sagittal side profile).

## 2. Occlusion and Cluttered Environments
- Industrial environments often feature machine frames, safety guards, packaging materials, or loose clothing that obstruct skeletal joints.
- **Scientific Gate:** ErgoSnap does not fabricate or guess occluded coordinates. If landmark visibility falls below `0.5`, the relevant angle is marked as `UNSCORABLE` and excluded from numerical summaries.

## 3. Scope of RULA
- Rapid Upper Limb Assessment is an observational screening tool developed to identify postures associated with upper extremity musculoskeletal disorders.
- It is **not** a diagnostic instrument and cannot certify individual physiological safety, predict tissue injury, or certify legal workplace compliance.

## 4. Requirement for Human Assessment
- External load magnitude (kg) and sustained muscle repetition intervals cannot be directly quantified from static 2D photographs.
- ErgoSnap explicitly requires human assessor input for load/force and repetition factors before calculating a verified RULA Grand Score.
