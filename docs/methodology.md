# ErgoSnap Analytics — Methodology & Engineering Architecture

## 1. Scientific Overview & Objective
ErgoSnap Analytics is a client-side computer-vision ergonomic evaluation tool designed for transparent assessment of upper-limb and musculoskeletal posture loads during workplace tasks.

The system combines:
1. **Pretrained Computer Vision:** Monocular 2D body landmark detection using Google MediaPipe Pose Landmarker (Tasks Vision).
2. **Deterministic Vector Geometry:** 2D joint angle calculations relative to gravity (vertical) and horizontal planes.
3. **Verified RULA Matrix Implementation:** Full, multi-table scoring of the Rapid Upper Limb Assessment as established by McAtamney and Corlett (1993).
4. **Data-Quality Gate:** Explicit tracking of landmark visibility and missing inputs. Incomplete data is never silently replaced with fabricated numbers.

---

## 2. Computer Vision Pipeline

### 2.1 Image Preprocessing
- Files are decoded client-side using standard HTML5 Canvas/Image APIs (JPEG, PNG, WebP).
- Orientation tags from JPEG EXIF metadata are parsed directly to maintain correct vertical alignment without modifying raw pixel buffers.
- Maximum upload size is enforced at 20 MB.

### 2.2 Landmark Estimation
- **Engine:** `@mediapipe/tasks-vision` PoseLandmarker.
- **Mode:** `IMAGE` mode (single frame inference).
- **Thresholds:**
  - Minimum detection confidence: `0.5`
  - Minimum presence confidence: `0.5`
- A total of 33 normalized landmarks $(x, y, z)$ are returned. The primary landmarks utilized are:
  - Upper limb: Shoulders (11, 12), Elbows (13, 14), Wrists (15, 16)
  - Trunk: Shoulders (11, 12), Hips (23, 24)
  - Head/Neck: Nose (0), Ears (7, 8)
  - Lower body: Hips (23, 24), Knees (25, 26), Ankles (27, 28)

---

## 3. Joint Angle Calculations

### 3.1 3-Point Vertex Angle
For three 2D coordinates $A$, $B$, and $C$, the interior included angle at joint vertex $B$ is determined via vector dot product:
$$\mathbf{u} = A - B, \quad \mathbf{v} = C - B$$
$$\theta = \cos^{-1}\left(\frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}\right)$$
To avoid numerical overflow, the cosine argument is clamped to $[-1, 1]$. If either vector length $\|\mathbf{u}\|$ or $\|\mathbf{v}\|$ is less than $1 \times 10^{-6}$ (degenerate geometry), the calculation returns `null` with `isValid: false`.

### 3.2 Vertical Angle (Gravity Axis)
Upper arm flexion, neck inclination, and trunk angle are referenced to the vertical gravity vector:
$$\mathbf{g} = (0, 1)$$
where positive $Y$ points downwards in standard 2D image coordinate systems.

---

## 4. Rapid Upper Limb Assessment (RULA) Scoring

### 4.1 Scoring Reference
All scoring matrices are implemented from the foundational peer-reviewed publication:
> McAtamney, L., & Corlett, E. N. (1993). *RULA: a survey method for the investigation of work-related upper limb disorders.* Applied Ergonomics, 24(2), 91–99.

### 4.2 Group A (Upper Limb)
1. **Upper Arm (1–6):**
   - $-20^\circ$ to $+20^\circ$: Score 1
   - $>20^\circ$ extension or $20^\circ$–$45^\circ$ flexion: Score 2
   - $45^\circ$–$90^\circ$ flexion: Score 3
   - $>90^\circ$ flexion: Score 4
   - Adjustments: $+1$ if shoulder raised, $+1$ if upper arm abducted, $-1$ if arm supported / leaning.
2. **Lower Arm (1–3):**
   - $60^\circ$–$100^\circ$ flexion: Score 1
   - $<60^\circ$ or $>100^\circ$ flexion: Score 2
   - Adjustment: $+1$ if working across midline or out to side.
3. **Wrist (1–4):**
   - Neutral ($0^\circ$): Score 1
   - $1^\circ$–$15^\circ$ flexion/extension: Score 2
   - $>15^\circ$ flexion/extension: Score 3
   - Adjustment: $+1$ if deviated from midline.
4. **Wrist Twist (1–2):** Mid-range (1), near end of range (2).
5. **Table A Lookup:** Intermediate score from 4D matrix.
6. **Adjustments:** $+1$ for repetitive/static muscle use ($>1\text{ min}$ or $>4\times/\text{min}$); $+0$, $+1$, or $+2$ for external force/load.
   $$\text{Score A} = \text{Table A} + \text{Muscle Use} + \text{Force/Load}$$

### 4.3 Group B (Neck, Trunk, Legs)
1. **Neck (1–6):**
   - $0^\circ$–$10^\circ$ flexion: Score 1
   - $10^\circ$–$20^\circ$ flexion: Score 2
   - $>20^\circ$ flexion: Score 3
   - In extension ($<0^\circ$): Score 4
   - Adjustments: $+1$ if neck twisted, $+1$ if side-bending.
2. **Trunk (1–6):**
   - Upright ($0^\circ$): Score 1
   - $0^\circ$–$20^\circ$ flexion: Score 2
   - $20^\circ$–$60^\circ$ flexion: Score 3
   - $>60^\circ$ flexion or extension: Score 4
   - Adjustments: $+1$ if trunk twisted, $+1$ if side-bending.
3. **Legs (1–2):** Well supported and balanced (1); not supported or uneven (2).
4. **Table B Lookup:** Intermediate score from 3D matrix.
5. **Adjustments:** Same muscle use and force/load additions applied to Group B.
   $$\text{Score B} = \text{Table B} + \text{Muscle Use} + \text{Force/Load}$$

### 4.4 Final Table C Grand Score & Action Level
- Table C cross-references Score A and Score B to produce Grand Score (1–7).
- Action Levels:
  - **Level 1 (Score 1–2):** Acceptable posture.
  - **Level 2 (Score 3–4):** Further investigation needed; changes may be required.
  - **Level 3 (Score 5–6):** Investigation and changes required soon.
  - **Level 4 (Score 7):** Investigation and changes required immediately.
