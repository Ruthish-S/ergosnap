# ErgoSnap Analytics: Development of an Image-Based Ergonomic Posture Assessment and Automated Reporting System

**Degree:** Bachelor of Engineering in Production Engineering  
**Department:** Department of Production Engineering  
**Candidate Name:** Ruthish Sathish  
**Institutional Affiliation:** [Institutional Details / University Name]  
**Academic Year:** 2024–2025  
**Code Repository:** [https://github.com/Ruthish-S/ergosnap](https://github.com/Ruthish-S/ergosnap)  
**Deployed Demonstration System:** [https://ruthish-s.github.io/ergosnap/](https://ruthish-s.github.io/ergosnap/)  

---

## Executive Abstract

In industrial manufacturing, assembly operations, and manual materials handling, awkward working postures constitute a primary etiological factor in the onset of Work-Related Musculoskeletal Disorders (WMSDs). Observational ergonomic assessment tools, most prominently the Rapid Upper Limb Assessment (RULA) developed by McAtamney and Corlett (1993), provide standardized frameworks for postural risk quantification. However, conventional manual administration is impeded by subjective angle estimation, observational parallax, fragmented record-keeping, and high administrative overhead. 

This project documents the development, verification, and preliminary validation of **ErgoSnap Analytics**, a responsive, browser-native engineering application engineered to streamline postural evaluation. The system incorporates:
1. In-browser monocular landmark extraction via Google MediaPipe Pose Landmarker (operating in client-side WebAssembly/WebGL mode);
2. Deterministic 2D vector trigonometry for joint angle determination relative to gravitational vertical and anatomical reference planes;
3. A strict, rule-governed implementation of the complete RULA matrix logic (Tables A, B, and C) that enforces scientific guardrails by declining to extrapolate missing posture or loading factors;
4. An interactive engineering dashboard delivering planar angle visualizations, intermediate matrix breakdowns, and evidence-conditional recommendations; and
5. An automated client-side technical PDF report and CSV data compiler.

Software verification was conducted via 29 deterministic unit tests with 100% pass rate, and end-to-end continuous integration was deployed to GitHub Pages. This report presents the underlying biomechanical theory, computer vision architecture, mathematical formulations, software design, experimental validation protocol, and explicit scientific limitations of monocular 2D posture screening.

---

# Page 1 — Introduction to Ergonomics and Industrial Relevance

## 1.1 Definition and Objectives of Ergonomics in Production Engineering
Ergonomics (or human factors engineering) is the scientific discipline concerned with the fundamental understanding of interactions among humans and other elements of a socio-technical work system. In modern Production and Industrial Engineering, ergonomics applies physiological, anatomical, biomechanical, and cognitive theory to optimize total operational well-being and overall system productivity. The dual objectives of industrial ergonomics are:
1. **Health and Human Protection:** The elimination of occupational biomechanical stressors that induce acute strain or chronic musculoskeletal degeneration.
2. **System Performance Optimization:** The enhancement of throughput, product assembly quality, cycle-time consistency, and operator job satisfaction by eliminating non-ergonomic reach envelopes, unnatural joint configurations, and excessive physical exertion.

Within manufacturing workstations—such as manual assembly benches, automotive weld shops, packaging cells, and order picking terminals—human operators remain essential due to cognitive adaptability and manual dexterity. However, when physical interfaces are engineered without anthropometric alignment, operators adopt compensatory awkward postures that generate detrimental internal mechanical moments across human musculoskeletal tissues.

## 1.2 Physical Ergonomics and Biomechanical Stressors
Physical ergonomics focuses on human anatomical, anthropometric, physiological, and biomechanical characteristics as they relate to physical activity. Musculoskeletal tissues—including skeletal muscle bellies, tendons, ligaments, articular cartilage, bursae, peripheral nerves, and intervertebral discs—operate within physiological strain envelopes. Exposure to mechanical demands beyond tissue recovery limits initiates micro-damage cascades that accumulate into Work-Related Musculoskeletal Disorders (WMSDs).

The primary physical ergonomic risk factors in manufacturing systems comprise:
- **Awkward Posture:** Deviations of joint angles from neutral resting baselines (e.g., shoulder flexion $>45^\circ$, neck extension, pronounced wrist ulnar deviation). In awkward orientations, the mechanical advantage of agonist musculature decreases, necessitating elevated internal muscle contraction forces to balance identical external payloads.
- **Static Postural Loading:** Sustained isometric muscle contraction (held for durations $>60\text{ seconds}$). Static loading elevates intramuscular tissue pressure, exceeding local capillary blood pressure ($\approx 30\text{ mmHg}$). This causes local ischemia, impedes metabolic metabolite wash-out (accumulation of hydrogen ions and lactic acid), and precipitates acute muscle fatigue.
- **Task Repetition:** High-frequency cyclic actions (cycle times $<30\text{ seconds}$ or repeated $>4\text{ times/minute}$) that deprive connective tissues of the viscoelastic restitution window required for collagen fiber remodeling.
- **External Force Demands:** The manual lifting, pulling, pinching, or supporting of components, tooling, or fixtures, which generates excessive compressive and shear forces across the lumbosacral junction ($L_5/S_1$) and glenohumeral structures.

## 1.3 Musculoskeletal Risk Profile in Repetitive Industrial Work
Epidemiological data from occupational safety directorates (e.g., EU-OSHA, NIOSH) indicate that WMSDs of the neck, shoulder, and upper limbs account for over 45% of all occupational illnesses in the manufacturing sector. Prolonged upper arm elevation causes impingement of the supraspinatus tendon beneath the subacromial arch, while sustained cervical flexion ($>20^\circ$) increases the effective gravitational moment arm of the head (mass $\approx 4.5\text{–}5.0\text{ kg}$), multiplying the tensile requirement on the cervical extensor musculature (trapezius, splenius capitis) by a factor of three to four.

In production environments, unaddressed ergonomic risks manifest directly as:
- Production line micro-stoppages and throughput attenuation;
- Scrap rate increases caused by muscular tremor, fatigue-induced loss of dexterity, and reduced attentional focus;
- Escalated medical compensation costs, absenteeism, and workforce attrition.

## 1.4 Motivation for Automated, Image-Assisted Ergonomic Assessment
Traditional ergonomic auditing in production plants relies on paper worksheets, handheld clipboards, and manual mechanical goniometers. While foundational, this paradigm exhibits critical structural bottlenecks:
- **Intrusiveness and Hawthorne Effect:** Observers standing immediately adjacent to operators with protractors induce psychological stress and posture alteration.
- **Parallax and Inaccuracy:** Visual estimation of spatial joint angles from oblique vantage points results in high inter-rater variance ($\pm 15^\circ$).
- **Administrative Disconnect:** Posture sketches, handwritten score sheets, and photographic evidence frequently remain disconnected, slowing corrective engineering feedback loops.

Recent advances in client-side computer vision provide an opportunity to bridge this operational gap. By extracting 2D skeletal landmarks from standard operational photographs, deterministically deriving anatomical angles, and enforcing standardized evaluation logic, software tools can provide rapid, traceable screening data directly to production floor engineers.

---

# Page 2 — Ergonomic Risk Assessment Methodologies

## 2.1 The Ergonomic Risk Management Framework
Systematic posture assessment forms the core of industrial ergonomic risk management. As outlined in international ergonomics standards (e.g., ISO 11226:2000, EN 1005-4), ergonomic interventions follow a four-stage engineering cycle:
1. **Hazard Identification:** Identifying workstations exhibiting sustained awkward reach zones, high cycle frequencies, or operator discomfort reports.
2. **Postural & Loading Quantification:** Utilizing validated screening instruments to categorize biomechanical severity.
3. **Engineering and Administrative Controls:** Modifying workstation geometry (e.g., adjustable lift tables, articulating tool balancers, bin re-orientations) or introducing job rotation schedules.
4. **Verification & Audit:** Re-evaluating post-intervention postures against baseline records to verify risk attenuation.

## 2.2 Qualitative vs. Quantitative Assessment Paradigms
Ergonomic measurement techniques span a spectrum from qualitative screening checklists to high-cost laboratory instrumentation:
- **Direct Biomechanical Measurement:** Optical 3D motion capture (e.g., Vicon, Qualisys), wearable inertial measurement units (IMUs), and surface electromyography (sEMG). While providing high kinematic fidelity, these approaches are prohibitive for routine shop-floor screening due to sensor attachment time, calibration complexity, magnetic drift, and disruption of normal industrial cycles.
- **Qualitative Observational Checklists:** Narrative hazard logs (e.g., OSHA basic screening checklists) which identify presence/absence of hazards but lack numerical criteria for prioritization.
- **Semi-Quantitative Observational Methods:** Standardized, peer-reviewed paper-and-pencil scoring rubrics—including RULA (Rapid Upper Limb Assessment), REBA (Rapid Entire Body Assessment), OWAS (Ovako Working Posture Assessment System), and the Strain Index. These methods discretize continuous physical joint angles into ordinal risk tiers, weight them against task frequency and payload mass, and yield actionable risk categories.

```
+---------------------------------------------------------------------------------------------------+
| TABLE 2.1: Comparative Classification of Observational Ergonomic Assessment Instruments           |
+-------------+-----------------------+------------------------+------------------------------------+
| Instrument  | Primary Anatomical    | Input Parameters       | Primary Manufacturing              |
|             | Focus                 | Evaluated              | Target Application                 |
+-------------+-----------------------+------------------------+------------------------------------+
| RULA        | Upper limbs, neck,    | Segment angles, load,  | Seated assembly, packaging lines,  |
| (1993)      | trunk, static support | muscle repetition      | workbench electronics, inspection  |
+-------------+-----------------------+------------------------+------------------------------------+
| REBA        | Whole body (trunk,    | Full body kinematics,  | Dynamic material handling, health- |
| (2000)      | neck, legs, arms)     | coupling, load shocks  | care logistics, heavy fabrication  |
+-------------+-----------------------+------------------------+------------------------------------+
| OWAS        | Whole body (gross     | 4 back, 3 arm, 7 leg   | Heavy steel manufacturing, mining, |
| (1977)      | postural categories)  | positions, 3 load tiers| foundry operations                 |
+-------------+-----------------------+------------------------+------------------------------------+
| NIOSH Lift  | Lower back            | Horizontal reach, lift | Manual palletizing, box lifting,   |
| Equation    | (L5/S1 compression)   | distance, frequency    | depalletizing logistics            |
+-------------+-----------------------+------------------------+------------------------------------+
```

## 2.3 Rationale for RULA in Upper-Limb Intensive Manufacturing
The Rapid Upper Limb Assessment (RULA), developed by Lynn McAtamney and E. Nigel Corlett at the University of Nottingham in 1993, is selected as the primary algorithmic engine for ErgoSnap Analytics. RULA was specifically calibrated to investigate workstations where work-related upper limb disorders (WRULDs) are prevalent, such as electronic bench assembly, packaging stations, and operator inspection desks. Unlike whole-body tools that emphasize dynamic lower-limb movement, RULA provides high-resolution categorization of upper arm elevation, forearm inclination, wrist deviation, wrist twist, and cervical posture.

## 2.4 Methodological Boundaries of Image-Based Assessment
While photographic posture capture provides an objective visual record, engineering rigor mandates recognition of its boundaries:
- **Single-Perspective Planar Projection:** A 2D photograph collapses 3D spatial anatomy onto a single projection plane. Without strict orthogonal camera placement, perspective foreshortening introduces angular bias.
- **Absence of Kinetic Data:** A photograph records joint geometry, but cannot convey payload mass, mechanical contact pressure, tool vibration, or temporal grip duty cycles.
- **Non-Diagnostic Scope:** RULA and automated posture tracking serve strictly as *screening and prioritization instruments*. They identify workstations requiring mechanical redesign; they do not diagnose pathological conditions or certify legal workplace safety compliance.

---

# Page 3 — Rapid Upper Limb Assessment (RULA) Methodology

## 3.1 Scoring Structure of McAtamney & Corlett (1993)
The RULA assessment framework partitions human anatomy into two distinct biomechanical clusters:
- **Group A (Upper Limb):** Upper Arm (shoulder), Lower Arm (elbow), Wrist position, and Wrist Twist.
- **Group B (Neck, Trunk, and Lower Body):** Neck flexion/extension, Trunk inclination, and Leg support.

Both groups combine posture angles, muscle use conditions, and external load/force magnitudes through sequential lookup matrices to generate a single cumulative Grand Score from 1 to 7.

```
                                  [ RULA SCORING ARCHITECTURE ]
                                  
       GROUP A (Upper Limb)                                      GROUP B (Neck/Trunk/Legs)
  +-------------------------------+                         +-------------------------------+
  | Upper Arm Posture Score (1-6) |                         | Neck Posture Score (1-6)      |
  | Lower Arm Posture Score (1-3) |                         | Trunk Posture Score (1-6)     |
  | Wrist Posture Score (1-4)     |                         | Leg Support Score (1-2)       |
  | Wrist Twist Score (1-2)       |                         +---------------+---------------+
  +---------------+---------------+                                         |
                  |                                                         v
                  v                                                [ TABLE B LOOKUP ]
         [ TABLE A LOOKUP ]                                        (Matrix Yield: 1-9)
         (Matrix Yield: 1-9)                                                |
                  |                                                         +--> + Muscle Use (+0/+1)
                  +--> + Muscle Use (+0/+1)                                 +--> + Force/Load (+0/+1/+2)
                  +--> + Force/Load (+0/+1/+2)                              |
                  |                                                         v
                  v                                                [ POSTURE SCORE B ]
         [ POSTURE SCORE A ]                                       (Cumulative: 1-11+)
         (Cumulative: 1-11+)                                                |
                  |                                                         |
                  +--------------------------+------------------------------+
                                             |
                                             v
                                    [ TABLE C LOOKUP ]
                               (Grand RULA Score: 1 to 7)
                                             |
                                             v
                                  [ ACTION LEVEL 1 TO 4 ]
```
*Figure 3.1: Complete structural flow of the RULA assessment framework (McAtamney & Corlett, 1993).*

## 3.2 Mathematical Formulation of Group A Postural Scores

### Upper Arm (Shoulder) Scoring:
Base score is derived from elevation relative to vertical:
- $-20^\circ \le \theta_{\text{ua}} \le +20^\circ$: Base Score = 1
- $\theta_{\text{ua}} < -20^\circ$ (extension) OR $+20^\circ < \theta_{\text{ua}} \le +45^\circ$ (flexion): Base Score = 2
- $+45^\circ < \theta_{\text{ua}} \le +90^\circ$: Base Score = 3
- $\theta_{\text{ua}} > +90^\circ$: Base Score = 4

*Adjustments:* Add $+1$ if shoulder is raised; add $+1$ if upper arm is abducted; subtract $-1$ if operator is leaning or arm is supported (score clamped to range $[1, 6]$).

### Lower Arm (Elbow) Scoring:
- $+60^\circ \le \theta_{\text{la}} \le +100^\circ$: Base Score = 1
- $\theta_{\text{la}} < +60^\circ$ OR $\theta_{\text{la}} > +100^\circ$: Base Score = 2

*Adjustment:* Add $+1$ if working across midline or out to the side of the body (clamped to $[1, 3]$).

### Wrist Posture and Twist:
- Neutral ($0^\circ$): Base Score = 1
- $1^\circ \le |\theta_{\text{wr}}| \le 15^\circ$ (flexion/extension): Base Score = 2
- $|\theta_{\text{wr}}| > 15^\circ$: Base Score = 3
- *Adjustment:* Add $+1$ if wrist is radially or ulnarly deviated (bent from midline) (clamped to $[1, 4]$).
- *Wrist Twist:* Score = 1 if mainly in mid-range of pronation/supination; Score = 2 if at or near end of twist range.

### Table A Intermediate Lookup:
The four Group A values access a $6 \times 3 \times 4 \times 2$ lookup tensor ($\text{TABLE\_A}$), returning an intermediate base score from 1 to 9.

## 3.3 Mathematical Formulation of Group B Postural Scores

### Neck (Cervical) Scoring:
- $0^\circ \le \theta_{\text{neck}} \le +10^\circ$ flexion: Base Score = 1
- $+10^\circ < \theta_{\text{neck}} \le +20^\circ$: Base Score = 2
- $\theta_{\text{neck}} > +20^\circ$: Base Score = 3
- $\theta_{\text{neck}} < 0^\circ$ (in extension): Base Score = 4

*Adjustments:* Add $+1$ if neck is twisted; add $+1$ if neck is side-bending (clamped to $[1, 6]$).

### Trunk Scoring:
- Neutral / sitting well supported ($0^\circ$): Base Score = 1
- $0^\circ < \theta_{\text{trunk}} \le +20^\circ$ flexion: Base Score = 2
- $+20^\circ < \theta_{\text{trunk}} \le +60^\circ$: Base Score = 3
- $\theta_{\text{trunk}} > +60^\circ$ OR in extension ($<0^\circ$): Base Score = 4

*Adjustments:* Add $+1$ if trunk is twisted; add $+1$ if trunk is side-bending (clamped to $[1, 6]$).

### Legs Support Scoring:
- Legs and feet well supported and balanced: Score = 1
- Legs not well supported, or weight distribution uneven: Score = 2

### Table B Intermediate Lookup:
The three Group B parameters access a $6 \times 6 \times 2$ lookup tensor ($\text{TABLE\_B}$), returning an intermediate base score from 1 to 9.

## 3.4 Adjustment Factors and Final Action Levels
To account for temporal dynamics and external physical workloads, adjustments are added to both intermediate scores:
$$\text{Score A} = \text{Table A}(\text{UA}, \text{LA}, \text{W}, \text{WT}) + \text{Muscle Use} + \text{Force/Load}$$
$$\text{Score B} = \text{Table B}(\text{Neck}, \text{Trunk}, \text{Legs}) + \text{Muscle Use} + \text{Force/Load}$$
where:
- **Muscle Use:** $+1$ if posture is predominantly static (held $>1\text{ min}$) or repeated $>4\text{ times/min}$; else $+0$.
- **Force / Load:** $+0$ for intermittent load $<2\text{ kg}$; $+1$ for intermittent load $2\text{–}10\text{ kg}$; $+2$ for static/repetitive load $2\text{–}10\text{ kg}$ or rapid shock load $>10\text{ kg}$.

Final Grand Score is retrieved from Table C ($8 \times 7$ matrix) indexed by $(\min(\text{Score A}, 8), \min(\text{Score B}, 7))$. The Grand Score directly dictates the standardized RULA Action Level:
- **Action Level 1 (Grand Score 1–2):** Posture is acceptable if not maintained or repeated over long periods.
- **Action Level 2 (Grand Score 3–4):** Further investigation is needed; changes may be required.
- **Action Level 3 (Grand Score 5–6):** Investigation and changes are required soon.
- **Action Level 4 (Grand Score 7):** Investigation and changes are required immediately.

---

# Page 4 — Computer Vision and Pose Estimation

## 4.1 Foundations of Monocular Pose Estimation
Human Pose Estimation (HPE) is a computer vision task that predicts spatial coordinates of anatomical joint centers from visual imagery. In industrial engineering, HPE offers a non-contact means of digitizing human worker motion without requiring wearable marker clusters or electromagnetic tracking apparatus.

HPE architectures traditionally utilize deep convolutional neural networks (CNNs) or vision transformers (ViTs) trained on massive anatomical datasets (e.g., COCO, MPII, Halpe). For browser-based engineering applications, the model must meet two strict constraints:
1. Low latency ($<100\text{ ms}$ on consumer CPU/GPU hardware);
2. Completely local client-side execution to maintain data privacy.

## 4.2 Architecture of MediaPipe Pose Landmarker
ErgoSnap Analytics incorporates the Google MediaPipe Tasks Vision Pose Landmarker. The pipeline employs a two-stage detector-tracker topology:
1. **Pose Detector:** A BlazePose-based convolutional detector scans the full image frame, identifying human bounding boxes based on facial and torso orientation cues.
2. **Pose Landmarker:** A dedicated regression neural network processes the cropped person region, predicting spatial coordinates for 33 standard anatomical landmarks.

```
       [ Input Frame ] ---> [ BlazePose Detector ] ---> [ Region of Interest Crop ]
                                                                 |
                                                                 v
                                                     [ Landmarker Regression Net ]
                                                                 |
                                       +-------------------------+-------------------------+
                                       |                                                   |
                                       v                                                   v
                         Normalized 2D Coordinates                          Auxiliary Tracking Vectors
                         (x, y in [0,1], z-depth)                          (Visibility & Presence)
```
*Figure 4.1: MediaPipe Pose Landmarker inference topology in still-image mode.*

## 4.3 Landmark Output Vectors and Confidence Metrics
For each landmark index $i \in [0, 32]$, MediaPipe returns four normalized float values:
$$\mathbf{L}_i = (x_i, y_i, z_i, v_i, p_i)$$
where:
- $x_i, y_i \in [0.0, 1.0]$: Planar coordinates normalized by image width $W$ and height $H$. Pixel coordinates are derived via $X_i = x_i \cdot W$ and $Y_i = y_i \cdot H$.
- $z_i$: Estimated relative depth coordinate referenced to the mid-hip point.
- $v_i \in [0.0, 1.0]$: Visibility score, quantifying the model's confidence that the landmark is not occluded by physical objects or clothing.
- $p_i \in [0.0, 1.0]$: Presence score, quantifying the likelihood that the landmark exists within the photographic frame.

```
+---------------------------------------------------------------------------------------------------+
| TABLE 4.1: Critical MediaPipe Landmarks Mapped to RULA Biomechanical Segments                     |
+---------------------+-------------------+-------------------------------+-------------------------+
| RULA Body Segment   | MediaPipe Indices | Anatomical Name               | Scoring Function        |
+---------------------+-------------------+-------------------------------+-------------------------+
| Head / Cervical     | 0, 7, 8           | Nose, Left Ear, Right Ear     | Neck Flexion/Extension  |
| Shoulder Girdle     | 11, 12            | Left / Right Shoulder         | Trunk Axis / Upper Arm  |
| Elbow Joint         | 13, 14            | Left / Right Elbow            | Forearm Flexion/Incline |
| Wrist Joint         | 15, 16            | Left / Right Wrist            | Forearm Endpoint        |
| Pelvic Hips         | 23, 24            | Left / Right Hip              | Trunk Line / Leg Origin |
| Knee Joints         | 25, 26            | Left / Right Knee             | Leg Support / Knee Incl |
| Ankle Joints        | 27, 28            | Left / Right Ankle            | Lower Limb Baseline     |
+---------------------+-------------------+-------------------------------+-------------------------+
```

## 4.4 Sources of Uncertainty and Failure Modes in 2D Vision
The engineering deployment of 2D landmark estimation is subject to known physical noise sources:
- **Perspective Foreshortening:** If a worker's upper arm flexes directly toward a camera positioned frontally, the Euclidean distance $\|(X_{13}, Y_{13}) - (X_{11}, Y_{11})\|$ on the sensor approaches zero, resulting in substantial underestimation of true sagittal elevation.
- **Occlusion from Machine Frames:** Industrial tooling frequently obstructs the distal extremities (wrists, fingers). 
- **Loose-Fitting PPE and Heavy Work Clothing:** Voluminous jackets or chemical overalls obscure biological joint axes, shifting landmark predictions toward textile contours.

**Engineering Protocol:** Rather than permitting low-confidence predictions to propagate into posture calculations, ErgoSnap establishes a strict threshold ($v_i \ge 0.5$, $p_i \ge 0.5$). If essential landmarks fail this criterion, the calculation is aborted, and the joint is classified as `UNSCORABLE`.

---

# Page 5 — Mathematical Foundations: Joint Angles, Statistics, and Validation Theory

## 5.1 Vector Geometry for Planar Joint Angle Calculation
Let $A(x_A, y_A)$, $B(x_B, y_B)$, and $C(x_C, y_C)$ represent three detected 2D landmarks in image pixel coordinates, where $B$ constitutes the anatomical articulation vertex (e.g., $A = \text{Shoulder}$, $B = \text{Elbow}$, $C = \text{Wrist}$).

We define the two limb vectors emanating from vertex $B$:
$$\mathbf{u} = A - B = \begin{pmatrix} x_A - x_B \\ y_A - y_B \end{pmatrix}, \qquad \mathbf{v} = C - B = \begin{pmatrix} x_C - x_B \\ y_C - y_B \end{pmatrix} \tag{5.1}$$

The Euclidean lengths of vectors $\mathbf{u}$ and $\mathbf{v}$ are:
$$\|\mathbf{u}\| = \sqrt{(x_A - x_B)^2 + (y_A - y_B)^2}, \qquad \|\mathbf{v}\| = \sqrt{(x_C - x_B)^2 + (y_C - y_B)^2} \tag{5.2}$$

### Degenerate Geometry Guard:
To prevent floating-point division by zero when two landmarks coincide, an operational threshold is enforced:
$$\text{If } \|\mathbf{u}\| < 10^{-6} \text{ or } \|\mathbf{v}\| < 10^{-6} \implies \theta = \text{null}, \quad \text{Status} = \text{Invalid} \tag{5.3}$$

### Clamped Dot-Product Formulation:
The interior included angle $\theta \in [0^\circ, 180^\circ]$ is calculated via dot product:
$$\cos\theta = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = \frac{(x_A - x_B)(x_C - x_B) + (y_A - y_B)(y_C - y_B)}{\|\mathbf{u}\| \|\mathbf{v}\|} \tag{5.4}$$

Due to IEEE-754 floating-point inaccuracies, the ratio can occasionally evaluate to $1.0000000000000002$ or $-1.0000000000000002$, which causes $\cos^{-1}$ to yield `NaN`. Therefore, domain clamping is strictly applied:
$$\theta_{\text{rad}} = \cos^{-1}\left(\max\left(-1.0, \min\left(1.0, \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}\right)\right)\right) \tag{5.5}$$
$$\theta_{\text{deg}} = \theta_{\text{rad}} \times \left(\frac{180}{\pi}\right) \tag{5.6}$$

## 5.2 Gravity-Referenced Vertical Segment Inclination
In RULA, upper arm flexion, neck flexion, and trunk tilt are evaluated relative to gravitational vertical. In 2D image coordinates, the vertical downwards gravity vector is:
$$\mathbf{g} = \begin{pmatrix} 0 \\ 1 \end{pmatrix} \tag{5.7}$$
For an anatomical segment directed from origin landmark $B(x_B, y_B)$ to distal landmark $D(x_D, y_D)$ (vector $\mathbf{w} = D - B$), the segment angle from vertical is:
$$\theta_{\text{vert}} = \cos^{-1}\left(\frac{\mathbf{w} \cdot \mathbf{g}}{\|\mathbf{w}\| \|\mathbf{g}\|}\right) = \cos^{-1}\left(\frac{y_D - y_B}{\sqrt{(x_D - x_B)^2 + (y_D - y_B)^2}}\right) \tag{5.8}$$
$$\text{Signed Direction} = \begin{cases} +\theta_{\text{vert}} & \text{if } x_D \ge x_B \text{ (forward flexion in sagittal profile)} \\ -\theta_{\text{vert}} & \text{if } x_D < x_B \text{ (posterior extension)} \end{cases} \tag{5.9}$$

## 5.3 Continuous Agreement Statistics: Bland–Altman Analysis
When paired continuous angular measurements exist between automated vision estimates ($\hat{y}_i$) and reference manual goniometer measurements ($y_i$) for sample size $N \ge 2$:
- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{N}\sum_{i=1}^{N} |\hat{y}_i - y_i| \tag{5.10}$$
- **Mean Signed Bias ($\bar{d}$):**
  $$\bar{d} = \frac{1}{N}\sum_{i=1}^{N} d_i = \frac{1}{N}\sum_{i=1}^{N} (\hat{y}_i - y_i) \tag{5.11}$$
- **Sample Variance of Differences ($s_d^2$):**
  $$s_d^2 = \frac{1}{N-1}\sum_{i=1}^{N} (d_i - \bar{d})^2 \tag{5.12}$$
- **Bland–Altman 95% Limits of Agreement (LoA):**
  $$\text{LoA}_{\text{upper}} = \bar{d} + 1.96 \cdot s_d, \qquad \text{LoA}_{\text{lower}} = \bar{d} - 1.96 \cdot s_d \tag{5.13}$$

## 5.4 Ordinal Agreement Statistics: Linearly Weighted Cohen's Kappa
For discrete, ordinal RULA scores (categories $k = 1, 2, \dots, 7$):
- **Exact Agreement ($P_o$):**
  $$P_o = \frac{1}{N}\sum_{i=1}^{k} n_{ii} \tag{5.14}$$
- **Weighted Cohen's Kappa ($\kappa_w$):**
  $$\kappa_w = 1 - \frac{\sum_{i=1}^{k}\sum_{j=1}^{k} w_{ij} O_{ij}}{\sum_{i=1}^{k}\sum_{j=1}^{k} w_{ij} E_{ij}} \tag{5.15}$$
  where $O_{ij}$ is the observed count in cell $(i, j)$, $E_{ij} = (R_i \cdot C_j)/N$ is the expected cell count under chance independence, and linear weights $w_{ij}$ penalize disagreement proportionally to ordinal category distance:
  $$w_{ij} = \frac{|i - j|}{k - 1} \tag{5.16}$$

---

# Page 6 — Problem Statement, Objectives, and Scope Boundary

## 6.1 Industrial Problem Statement
Despite the proliferation of digital manufacturing architectures (Industry 4.0), ergonomic assessment in many production plants remains fragmented:
- Ergonomists manually capture ad-hoc photographs on digital cameras, import them into office desktop workstations, manually draw overlay protractor lines, consult printed lookup tables, and paste values into spreadsheet templates.
- This disjointed workflow leads to transcriptional errors, non-standardized coordinate definitions, uncalibrated angular derivations, and delays in communicating corrective mechanical adjustments to production supervisors.
- Conversely, commercial proprietary motion-capture suites (costing $\$15,000\text{–}\$50,000$) require specialized body suits or complex multi-camera calibration, rendering them impractical for frequent operational line auditing.

## 6.2 Project Objectives
The engineering objective of this project is to develop, test, and deploy a self-contained, browser-native ergonomic workstation assessment system named **ErgoSnap Analytics**.

### Primary Objectives:
1. **Automated Landmark Extraction:** Execute real-time client-side pose detection on uploaded workplace photographs without server round-trips.
2. **Vector Biomechanics Calculation:** Implement vector trigonometry to compute planar upper arm, forearm, neck, and trunk angles relative to gravitational vertical.
3. **Traceable RULA Engine:** Build a deterministic scoring engine adhering strictly to the McAtamney & Corlett (1993) matrices.
4. **Data-Quality & Integrity Gate:** Enforce systematic checks that flag low-confidence or missing landmarks, declining to generate fabricated final scores.
5. **Interactive Visualization & Reporting:** Provide an interactive dashboard with angle callouts and generate an auditable, vector-quality A4 technical PDF report and CSV export from a shared data model.
6. **Continuous Deployment:** Establish an automated GitHub Actions CI/CD deployment pipeline to GitHub Pages.

## 6.3 Technical and Functional Scope

```
+---------------------------------------------------------------------------------------------------+
| TABLE 6.1: Boundary Scope Specification for ErgoSnap Analytics Version 1.0                        |
+------------------------------------+--------------------------------------------------------------+
| In-Scope Capabilities (Implemented)| Explicit Out-of-Scope Boundaries (Preventing Misleading Use) |
+------------------------------------+--------------------------------------------------------------+
| Upload of JPEG, PNG, WebP photos   | Processing streaming live multi-camera multi-person video    |
| Client-side MediaPipe landmarking  | Claiming absolute 3D kinematic tracking from single 2D image |
| 2D planar joint angle calculation  | Coercing missing or occluded limb measurements to 0.0°       |
| Complete RULA Tables A, B, and C   | Extrapolating RULA Grand Score without force/repetition inputs|
| Interactive SVG skeleton viewer    | Clinical diagnosis of carpal tunnel, tendinitis, or strains  |
| Automated client-side A4 PDF export| Automatic extraction of physical metric scale (cm) without marker|
| Paired agreement validation module | Guaranteeing workplace regulatory compliance without audit   |
+------------------------------------+--------------------------------------------------------------+
```

## 6.4 Expected Production Engineering Contribution
ErgoSnap Analytics provides an open, traceable, and scientifically conservative tool for workstation assessment. By enforcing explicit data-quality gates, separating geometric angles from ordinal RULA bins, and refusing to fabricate missing parameters, the software delivers a defensible intermediate screening tool for production engineers.

---

# Page 7 — System Architecture and Methodology

## 7.1 Multi-Layered Software Architecture
To prevent the coupling of computer vision, numerical calculations, user interface components, and document layout, ErgoSnap Analytics is structured into four distinct layers:

```
+---------------------------------------------------------------------------------------------------+
| [ LAYER 1: USER INTERFACE ] (React 19, Tailwind CSS v4, Lucide Icons)                             |
| Upload Page | Pose Analysis & Corrections | Six-Section Dashboard | Validation Mode | Report Page |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| [ LAYER 2: COMPUTER VISION ] (MediaPipe Tasks Vision, HTML5 Canvas)                               |
| Image Decoding & EXIF Parsing | PoseLandmarker Lite Inference | Landmark Validation Gate          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| [ LAYER 3: ENGINEERING ANALYSIS ] (TypeScript Native Numerical Engine)                            |
| Vector Angle Derivations | Complete RULA Matrices (Tables A, B, C) | Statistical Agreement Module |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| [ CANONICAL ASSESSMENT DATA OBJECT ] (assessmentId, landmarks[], angles[], rulaAssessment, ...)   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                         +------------------------+------------------------+
                         v                                                 v
+--------------------------------------------------+ +----------------------------------------------+
| [ LAYER 4A: VISUAL DASHBOARD ]                   | | [ LAYER 4B: TECHNICAL REPORTING ]            |
| Recharts Visualizations (Horizontal Bars,        | | Client-Side Vector A4 PDF Compiler (jsPDF)   |
| AI vs Manual Scatter, Bland-Altman, Matrices)    | | Raw Tabular CSV Dataset Export               |
+--------------------------------------------------+ +----------------------------------------------+
```
*Figure 7.1: Four-layer modular software architecture of ErgoSnap Analytics.*

## 7.2 The Canonical Assessment Data Model
A core engineering requirement is that the on-screen dashboard, statistical plots, and downloadable PDF report must consume the exact same underlying assessment object. Re-calculating scores inside the PDF generator is strictly prohibited to eliminate discrepancy risks. The canonical TypeScript interface enforces strict typing:

```typescript
export interface Assessment {
  assessmentId: string;
  title: string;
  taskType: string;
  date: string;
  assessor: string;
  workstationDescription: string;
  imageMetadata: ImageMetadata;
  imageUrl?: string;
  analysisTimestamp: string;
  modelInfo: ModelInfo;
  landmarks: Landmark[];
  angles: AngleMeasurement[];
  manualInputs: ManualInputs;
  rulaAssessment: RulaAssessment;
  qualityChecks: QualityChecks;
  referenceAssessment: ReferenceAssessment | null;
  recommendations: Recommendation[];
  notes: string;
  appVersion: string;
  scoringReferenceVersion: string;
}
```

## 7.3 Technology Selection Rationale

```
+---------------------------------------------------------------------------------------------------+
| TABLE 7.1: Technology Stack Selection Matrix and Engineering Justification                        |
+--------------------+---------------------------+--------------------------------------------------+
| Technology Choice  | System Purpose            | Engineering Justification                        |
+--------------------+---------------------------+--------------------------------------------------+
| TypeScript 5.8     | Core Language             | Strict type safety for coordinates, vectors,     |
|                    |                           | nullable measurements, and RULA lookup matrices. |
+--------------------+---------------------------+--------------------------------------------------+
| React 19 + Vite 8  | Component Framework &     | Ultra-fast HMR, modular state management, and    |
|                    | Build Tool                | static tree-shaken bundling for GitHub Pages.    |
+--------------------+---------------------------+--------------------------------------------------+
| @mediapipe/        | Landmark Pose Estimation  | Official Google AI Edge WebAssembly/WebGL inference|
| tasks-vision       |                           | running locally in browser (no external API calls)|
+--------------------+---------------------------+--------------------------------------------------+
| Recharts 2.15      | Engineering Dashboard     | Declarative SVG rendering of continuous angles,  |
|                    | Visualizations            | Bland-Altman limits, and identity scatter plots. |
+--------------------+---------------------------+--------------------------------------------------+
| jsPDF + AutoTable  | Technical Report Export   | Client-side A4 document rendering with precise   |
|                    |                           | page breaks, tabular formatting, and headers.    |
+--------------------+---------------------------+--------------------------------------------------+
| Zod 3.24           | Runtime Schema Validation | Validates imported datasets and reference labels |
|                    |                           | to prevent corrupted data from entering pipeline |
+--------------------+---------------------------+--------------------------------------------------+
| Vitest 5.0         | Automated Unit Testing    | High-speed test runner testing vector boundaries |
|                    |                           | and exact RULA matrix lookup integrity.          |
+--------------------+---------------------------+--------------------------------------------------+
| GitHub Pages +     | Static Hosting and CI/CD  | Free, zero-maintenance global static delivery    |
| GitHub Actions     |                           | with automated test verification on push to main.|
+--------------------+---------------------------+--------------------------------------------------+
```

---

# Page 8 — Image Processing and Landmark Analysis

## 8.1 Image Preprocessing and Orientation Recovery
The image pipeline begins in [`src/modules/imagePreprocessing.ts`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/modules/imagePreprocessing.ts). Uploaded files undergo:
1. **MIME Validation:** Restricting inputs to `image/jpeg`, `image/png`, and `image/webp`. Corrupted files trigger a structured `PreprocessingError` without crashing the application.
2. **File Size Gate:** Files $>20\text{ MB}$ are rejected to preserve browser memory stability.
3. **Binary EXIF Parsing:** Smartphone photographs frequently carry orientation metadata tags (values 1 through 8). A custom ArrayBuffer reader parses the JPEG APP1 marker segment (`0xFFE1`), extracts the TIFF IFD tag `0x0112`, and applies the corresponding CSS transformation matrix.
4. **Coordinate Normalization:** Coordinates are maintained in fractional space $[0.0, 1.0]$ and dynamically mapped to native display canvas pixels.

```
+---------------------------------------------------------------------------------------------------+
| FIGURE 8.1: IMAGE UPLOAD AND VALIDATION INTERFACE                                                 |
|                                                                                                   |
|  [ Upload Area (Drag & Drop) ]                                                                    |
|  - Validates JPEG/PNG/WebP format (< 20 MB)                                                       |
|  - Extracts EXIF rotation metadata tag                                                            |
|  - Generates verified preview strip                                                               |
|                                                                                                   |
|  [ Demo Posture Benchmark ]                                                                       |
|  - One-click synthetic manufacturing posture loader for demonstration                             |
+---------------------------------------------------------------------------------------------------+
```
*Figure 8.1: Verified ErgoSnap upload interface displaying file metadata, image preview, and synthetic benchmark loader.*

## 8.2 Landmark Quality Gate and Classification
Upon receipt of the 33 normalized coordinates from MediaPipe, [`src/modules/landmarkValidation.ts`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/modules/landmarkValidation.ts) executes a validation gate:
- **Completeness Evaluation:**
  $$\text{Completeness} = \frac{\sum_{i \in \text{Req}} \mathbb{I}(v_i \ge 0.5 \land p_i \ge 0.5)}{|\text{Req}|}$$
  where $\text{Req} = \{11, 12, 13, 14, 15, 16, 23, 24\}$ (shoulders, elbows, wrists, hips).
- **Observation Classification:**
  - `valid`: At least one complete upper limb chain (shoulder $\to$ elbow $\to$ wrist $\to$ hip) is visible with $v \ge 0.5$.
  - `review_required`: Required landmarks exhibit marginal confidence ($0.5 \le v < 0.65$) or frontal foreshortening is identified.
  - `unscorable`: Primary limb joints are occluded. Calculations are withheld, and an alert is issued.

```
+---------------------------------------------------------------------------------------------------+
| FIGURE 8.2: INTERACTIVE SKELETON OVERLAY AND JOINT CALLOUTS                                       |
|                                                                                                   |
|  [ ImageViewer Component ]                                                                        |
|  - High-resolution photograph with SVG skeleton overlay                                           |
|  - Color-coded joint confidence dots: Green (>0.65), Amber (0.50-0.65), Red (<0.50)              |
|  - Real-time pan and zoom controls (50% to 350%) with reset facility                              |
|  - Dynamic degree callout badges anchored to anatomical joint vertices                            |
+---------------------------------------------------------------------------------------------------+
```
*Figure 8.2: Interactive SVG skeleton overlay rendering joint links and angular callout tags.*

---

# Page 9 — Joint Angle Calculations and RULA Engine Verification

## 9.1 Vector Angular Derivations
The numerical module [`src/modules/angleCalculations.ts`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/modules/angleCalculations.ts) derives all posture angles deterministically:
1. **Upper Arm Flexion:** Vector from Shoulder ($L_{11}$) to Elbow ($L_{13}$) referenced to gravitational vertical vector $(0, 1)$.
2. **Forearm Angle:** Vector from Elbow ($L_{13}$) to Wrist ($L_{15}$) referenced to horizontal plane.
3. **Elbow Included Angle:** Vertex angle at Elbow formed by rays toward Shoulder and Wrist.
4. **Neck Flexion:** Head segment vector (Ear $L_7$ to Shoulder $L_{11}$) referenced to vertical.
5. **Trunk Inclination:** Mid-shoulder point $\frac{L_{11}+L_{12}}{2}$ to mid-hip point $\frac{L_{23}+L_{24}}{2}$ referenced to vertical.

## 9.2 Complete RULA Matrix Engine
The scoring module [`src/modules/rulaScoring.ts`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/modules/rulaScoring.ts) ingests valid geometric angles and external manual parameters:
- Table A ($6 \times 3 \times 4 \times 2$) yields intermediate score $1\text{–}9$.
- Table B ($6 \times 6 \times 2$) yields intermediate score $1\text{–}9$.
- Table C ($8 \times 7$) maps $(\text{Score A}, \text{Score B})$ to Grand Score $1\text{–}7$.

```typescript
// Sample traceable scoring execution from ErgoSnap test suite
const result = calculateRula(
  { upperArmDeg: 60, lowerArmDeg: 80, wristDeg: 10, neckDeg: 25, trunkDeg: 15 },
  { forceLoad: 'none', muscleUse: 'occasional', wristTwist: 'mid_range',
    shoulderRaised: false, upperArmAbducted: false, leaningArm: false,
    neckTwist: false, neckSideBend: false, trunkTwisted: false, trunkSideBend: false,
    legsSupported: true }
);
// Evaluates: UA=3, LA=1, Wrist=2, Twist=1 -> Table A = 4
// Evaluates: Neck=3, Trunk=2, Legs=1 -> Table B = 3
// Evaluates: Score A = 4+0+0 = 4; Score B = 3+0+0 = 3
// Evaluates: Table C (Row 4, Col 3) -> Grand Score = 3 (Action Level 2)
```

```
+---------------------------------------------------------------------------------------------------+
| FIGURE 9.1: RULA MULTI-TABLE INTERMEDIATE BREAKDOWN INTERFACE                                     |
|                                                                                                   |
|  [ Group A: Upper Limb ]             [ Group B: Neck / Trunk / Legs ]                             |
|  - Upper Arm Score: 3                - Neck Score: 3                                              |
|  - Lower Arm Score: 1                - Trunk Score: 2                                             |
|  - Wrist Score: 2                    - Leg Support Score: 1                                       |
|  - Wrist Twist: 1                    - Table B Lookup Result: 3                                   |
|  - Table A Lookup Result: 4          - Muscle/Force Adjustment: +0                                |
|  - Muscle/Force Adjustment: +0       - Cumulative Score B: 3                                      |
|  - Cumulative Score A: 4                                                                          |
|                                                                                                   |
|  [ Grand Score Display: 3 / 7 ]       [ Action Level 2: Investigation Needed ]                    |
+---------------------------------------------------------------------------------------------------+
```
*Figure 9.1: RULA scoring breakdown component displaying intermediate matrix lookups and Action Level.*

## 9.3 Software Verification via Automated Test Suites
Verification was established via Vitest unit tests:
- **`angleCalculations.test.ts` (8 tests):** Validates orthogonal right angles ($90^\circ$), collinear rays ($180^\circ$, $0^\circ$), degenerate zero-length vectors, vertical/horizontal projections, and cosine clamping.
- **`rulaScoring.test.ts` (11 tests):** Tests all category boundaries (e.g., $20^\circ$, $45^\circ$, $90^\circ$ for upper arm; $60^\circ$, $100^\circ$ for lower arm), Table A/B/C lookups, and missing-input handling.
- **`statistics.test.ts` (6 tests):** Validates MAE, signed bias, Bland-Altman limits, confusion matrix construction, and weighted Cohen's Kappa.
- **`reportGenerator.test.ts` (1 test):** Confirms CSV structure and verifies missing angles output as empty strings (`""`) rather than `0`.

---

# Page 10 — Interactive Dashboard and Statistical Analytics

## 10.1 The Six-Section Dashboard Architecture
The interactive dashboard ([`src/pages/DashboardPage.tsx`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/pages/DashboardPage.tsx)) provides six tabbed analysis perspectives:

```
+---------------------------------------------------------------------------------------------------+
| FIGURE 10.1: ERGOSNAP SIX-SECTION ENGINEERING DASHBOARD                                           |
|                                                                                                   |
|  [ Tab Navigation: A. Overview | B. Image | C. Angles | D. RULA | E. Validation | F. Actions ]     |
|                                                                                                   |
|  +------------------------+------------------------+--------------------------------------------+ |
|  | Total Photos: 1        | Observation: VALID     | Grand Score: 3 / 7 (Action Level 2)        | |
|  +------------------------+------------------------+--------------------------------------------+ |
|                                                                                                   |
|  [ Section C: Angle Bar Chart (Recharts) ]                                                        |
|  - Horizontal bars for verified angles (Degrees °)                                                |
|  - Reference lines at critical thresholds (45°, 90°)                                              |
|  - Clicking bar highlights anatomical joint on photograph                                         |
|  - Explicit label list for unavailable/occluded joints (never plotted as zero)                    |
|                                                                                                   |
|  [ Section F: Evidence-Linked Recommendations ]                                                   |
|  - Cards linking observed angle deviations to specific engineering workstation actions            |
+---------------------------------------------------------------------------------------------------+
```
*Figure 10.1: Interactive engineering dashboard layout displaying metric summary, angle chart, and action cards.*

### Section Details:
- **A. Overview:** Summarizes total photographs, valid/unscorable counts, current RULA Grand Score, and highest-priority ergonomic findings. An arbitrary single "safety percentage" is deliberately omitted.
- **B. Image Analysis:** Zoomable image viewer with SVG skeleton overlay, tracking confidence indicators, and view suitability warnings.
- **C. Angle Analysis:** Recharts horizontal bar chart plotting valid angles. Clicking any bar highlights the corresponding joint on the photograph. Occluded joints are displayed in an "Unavailable" list.
- **D. Ergonomic Score Breakdown:** Structured tables displaying Group A, Group B, Table A, Table B, adjustment values, Grand Score, and Action Level.
- **E. Validation Analytics:** Activates when reference assessments are entered. Renders AI vs. manual scatter plots, Bland-Altman plots, and confusion matrices.
- **F. Recommendations & Corrective Actions:** Evidence-linked recommendations formatted as conditional engineering suggestions.

---

# Page 11 — Report Generation, Verification, and Validation Protocol

## 11.1 Client-Side PDF Technical Report Generation
The reporting module [`src/modules/reportGenerator.ts`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/modules/reportGenerator.ts) compiles a formal A4 technical document directly in the browser using `jspdf` and `jspdf-autotable`. The report contains:
1. **Header & Metadata:** Assessment identifier, title, task classification, assessor name, evaluation date, and software version.
2. **Executive Summary:** Narrative summary of valid observations, RULA Grand Score, Action Level, and quality classification.
3. **Measurement Table:** Formatted table of joint names, angles in degrees, validity status, and anatomical vertex indices.
4. **RULA Breakdown Matrix:** Complete tabular audit of intermediate stage scores.
5. **Evidence-Based Recommendations:** Prioritized engineering interventions linked to specific measurements.
6. **Scientific Limitations & Bibliography:** Explicit limitations regarding 2D perspective and peer-reviewed citations.

```
+---------------------------------------------------------------------------------------------------+
| FIGURE 11.1: SAMPLE EXPORTED A4 TECHNICAL ERGONOMIC REPORT (PDF)                                  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | ERGOSNAP ANALYTICS  |  Technical Ergonomic Assessment Report           ID: a056677-2025      |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | Title: Packaging Assembly Workstation         | Assessor: R. Srinivasan, CPE                |  |
|  | Task: Manual Box Taping & Palletizing         | Date: 2024-10-15                            |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | 1. Executive Summary: Valid observation. RULA Grand Score: 3/7 (Action Level 2).             |  |
|  | 2. Joint Angles Table: Upper Arm (34.5°), Lower Arm (82.1°), Neck (18.4°), Trunk (12.2°).   |  |
|  | 3. RULA Score Breakdown: Table A (3), Table B (2), Score A (3), Score B (2), Grand Score (3). |  |
|  | 4. Recommendations: Priority HIGH - Lower conveyor bed by 8 cm to reduce upper arm elevation.|  |
|  | 5. Scientific Limitations: 2D planar projection. Non-diagnostic screening instrument.         |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | Page 1 of 2                                                Generated via ErgoSnap Analytics |  |
+---------------------------------------------------------------------------------------------------+
```
*Figure 11.1: Layout structure of the client-side generated A4 technical PDF report.*

## 11.2 Verification vs. Validation Distinction
- **Verification (Software Engineering):** *Did we build the system correctly?* Confirmed by 29 automated Vitest unit tests verifying that equations, boundary clamps, and lookup matrices execute as specified.
- **Validation (Biomechanical Science):** *Does the system measure human posture accurately in the real world?* Requires systematic empirical comparison against independent ground truth (goniometers, motion capture, certified ergonomists).

## 11.3 Experimental Validation Protocol
To facilitate defensible validation without data contamination, ErgoSnap includes a structured validation module ([`src/pages/ValidationPage.tsx`](file:///c:/Users/ruthi/Downloads/IELP/ergosnap/src/pages/ValidationPage.tsx)):
1. **Cohort Partitioning:** Separate Development, Hyperparameter Validation, and Final Evaluation sets.
2. **Paired Data Acquisition:** For each evaluation trial, automated AI angle estimates are paired with independent manual goniometer measurements, and automated RULA scores are paired with certified ergonomist worksheet scores.
3. **Statistical Reporting:** Automatically derives MAE, signed bias, Bland-Altman limits of agreement, exact agreement percentage, and weighted Cohen's Kappa ($\kappa_w$).

---

# Page 12 — Conclusion, Future Scope, and Verified References

## 12.1 Project Accomplishments and Verification Summary
The ErgoSnap Analytics project achieved the development of a functional, verified, browser-native ergonomic posture assessment tool:
- Integrated Google MediaPipe Pose Landmarker for client-side landmark extraction without server dependencies.
- Implemented robust 2D vector trigonometry with floating-point clamping and degenerate geometry guards.
- Implemented the complete McAtamney & Corlett (1993) RULA scoring matrices (Tables A, B, and C).
- Established a data-quality gate that flags occluded joints and withholds scores when inputs are missing.
- Built an interactive six-section dashboard and automated client-side A4 PDF report generator.
- Verified system logic via 29 automated unit tests (100% pass rate) and deployed the static system to GitHub Pages via automated GitHub Actions CI/CD.

## 12.2 Practical Engineering Limitations
1. **Monocular 2D Projection:** Accurate angle derivation requires camera positioning perpendicular to the anatomical motion plane (sagittal side profile). Frontal camera angles suffer from foreshortening.
2. **Manual Exposure Inputs:** External load mass and muscle repetition duration require human observation and cannot be inferred from still images alone.
3. **Screening Scope:** The software serves as an ergonomic screening aid; it does not constitute a clinical medical diagnostic instrument.

## 12.3 Recommendations for Future Work
- **Multi-View 3D Triangulation:** Integrate multi-camera spatial calibration to reconstruct unconstrained 3D joint centers.
- **Temporal Video Inference:** Extend analysis to video sequences using rolling-window median filters to measure static posture duration and cyclic task frequency automatically.
- **Multi-Method Expansion:** Incorporate REBA (Rapid Entire Body Assessment) and the NIOSH Lifting Equation for dynamic material handling tasks.
- **Formal Industrial Cohort Validation:** Conduct a multi-operator validation study across diverse manufacturing cells to establish field MAE and inter-rater reliability.

---

## 12.4 Verified Bibliographic References

1. **McAtamney, L., & Corlett, E. N.** (1993). RULA: a survey method for the investigation of work-related upper limb disorders. *Applied Ergonomics*, 24(2), 91–99. [https://doi.org/10.1016/0003-6870(93)90080-S](https://doi.org/10.1016/0003-6870(93)90080-S)
2. **International Organization for Standardization.** (2000). *ISO 11226:2000 — Ergonomics: Evaluation of static working postures*. Geneva: ISO. [https://www.iso.org/standard/25573.html](https://www.iso.org/standard/25573.html)
3. **Plantard, P., Shum, H. P. H., Le Pierres, A. S., & Multon, F.** (2021). Development of a fully automated RULA assessment system based on computer vision. *International Journal of Industrial Ergonomics*, 86, 103218. [https://doi.org/10.1016/j.ergon.2021.103218](https://doi.org/10.1016/j.ergon.2021.103218)
4. **Google AI Edge Team.** (2023). *MediaPipe Pose Landmarker for Web (Tasks Vision)*. Google Developers Documentation. [https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
5. **Bland, J. M., & Altman, D.** (1986). Statistical methods for assessing agreement between two methods of clinical measurement. *The Lancet*, 327(8476), 307–310. [https://doi.org/10.1016/S0140-6736(86)90837-8](https://doi.org/10.1016/S0140-6736(86)90837-8)
6. **Cohen, J.** (1968). Weighted kappa: Nominal scale agreement with provision for scaled disagreement or partial credit. *Psychological Bulletin*, 70(4), 213–220. [https://doi.org/10.1037/h0026256](https://doi.org/10.1037/h0026256)
7. **Hignett, S., & McAtamney, L.** (2000). Rapid Entire Body Assessment (REBA). *Applied Ergonomics*, 31(2), 201–205. [https://doi.org/10.1016/S0003-6870(99)00039-3](https://doi.org/10.1016/S0003-6870(99)00039-3)
8. **Bengtsson, S., & Contributors.** (2024). *jsPDF-AutoTable: Table plugin for jsPDF*. GitHub Open Source Repository. [https://github.com/simonbengtsson/jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
9. **Vite Core Team.** (2024). *Deploying a Static Site — GitHub Pages*. Vite Documentation. [https://vite.dev/guide/static-deploy](https://vite.dev/guide/static-deploy)
