import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const PDF_OUT = path.resolve('docs/ErgoSnap_Analytics_Project_Report.pdf');

// Helper to convert local image to base64 data URL for self-contained HTML rendering
function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filename).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

const images = {
  rulaFlowchart: getBase64Image('diag_rula_flowchart.png'),
  sysArch: getBase64Image('diag_system_architecture.png'),
  upload: getBase64Image('01_upload_interface.png'),
  workbench: getBase64Image('03_pose_landmark_workbench.png'),
  angles: getBase64Image('06_dashboard_angles_neutral_zones.png'),
  rulaRadar: getBase64Image('07_dashboard_rula_sensitivity.png'),
  dashboard: getBase64Image('04_dashboard_overview.png'),
  heatmap: getBase64Image('08_dashboard_wmsd_heatmap.png'),
  actionMatrix: getBase64Image('10_dashboard_corrective_action_matrix.png'),
  validation: getBase64Image('11_validation_engine.png'),
  reportPreview: getBase64Image('12_technical_report_preview.png'),
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: A4 portrait;
    margin: 22mm 20mm 22mm 20mm;
    @top-right {
      content: "ErgoSnap Analytics — Academic Project Report | Production Engineering";
      font-family: 'Times New Roman', serif;
      font-size: 8pt;
      color: #64748b;
    }
    @bottom-center {
      content: "Department of Production Engineering, PSG College of Technology, Coimbatore";
      font-family: 'Times New Roman', serif;
      font-size: 8pt;
      color: #64748b;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.35;
    color: #0f172a;
    background: #ffffff;
  }

  .page {
    page-break-after: always;
    break-after: page;
    min-height: 250mm;
    max-height: 252mm;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  .content {
    flex: 1;
  }

  h1 {
    font-size: 13.5pt;
    font-weight: bold;
    color: #0f172a;
    margin-top: 2pt;
    margin-bottom: 5pt;
    border-bottom: 1.5pt solid #dc2626;
    padding-bottom: 2pt;
  }

  h2 {
    font-size: 11pt;
    font-weight: bold;
    color: #1e3a8a;
    margin-top: 5pt;
    margin-bottom: 2pt;
  }

  p {
    text-align: justify;
    margin-bottom: 4.5pt;
    text-justify: inter-word;
  }

  ul, ol {
    margin-left: 16pt;
    margin-bottom: 4pt;
    text-align: justify;
  }

  li {
    margin-bottom: 2pt;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 5pt 0;
    font-size: 8pt;
  }

  th, td {
    border: 0.5pt solid #cbd5e1;
    padding: 3.5pt 4pt;
    text-align: left;
  }

  th {
    background-color: #1e3a8a;
    color: #ffffff;
    font-weight: bold;
    text-align: center;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .table-caption, .fig-caption {
    font-size: 8pt;
    font-style: italic;
    color: #475569;
    text-align: center;
    margin-top: 2pt;
    margin-bottom: 4pt;
  }

  .fig-container {
    text-align: center;
    margin: 4pt 0 2pt 0;
  }

  .fig-container img {
    max-width: 95%;
    max-height: 70mm;
    border: 0.5pt solid #cbd5e1;
    border-radius: 2pt;
  }

  .dual-fig-container {
    display: flex;
    justify-content: space-between;
    gap: 8pt;
    margin: 4pt 0 2pt 0;
  }

  .dual-fig-item {
    flex: 1;
    text-align: center;
  }

  .dual-fig-item img {
    max-width: 100%;
    max-height: 58mm;
    border: 0.5pt solid #cbd5e1;
    border-radius: 2pt;
  }

  .equation {
    text-align: center;
    font-style: italic;
    background: #f8fafc;
    padding: 3pt;
    margin: 3pt 0;
    border-left: 2pt solid #2563eb;
    font-size: 9.5pt;
  }

  .footer-strip {
    font-size: 8pt;
    color: #64748b;
    border-top: 0.5pt solid #cbd5e1;
    padding-top: 3pt;
    display: flex;
    justify-content: space-between;
    margin-top: auto;
  }
</style>
</head>
<body>

<!-- PAGE 1: TITLE PAGE & EXECUTIVE ABSTRACT -->
<div class="page">
  <div class="content" style="text-align: center; padding-top: 10mm;">
    <div style="font-size: 13pt; font-weight: bold; color: #1e3a8a; letter-spacing: 0.5pt;">
      PSG COLLEGE OF TECHNOLOGY, COIMBATORE - 641 004
    </div>
    <div style="font-size: 11pt; font-weight: bold; color: #334155; margin-top: 2pt;">
      DEPARTMENT OF PRODUCTION ENGINEERING
    </div>
    <div style="font-size: 9.5pt; color: #64748b; margin-top: 2pt; margin-bottom: 16mm;">
      BACHELOR OF ENGINEERING IN PRODUCTION ENGINEERING | FINAL YEAR PROJECT REPORT (2026–2027)
    </div>

    <div style="font-size: 15pt; font-weight: bold; color: #0f172a; line-height: 1.35; margin: 0 10mm 14mm 10mm;">
      ErgoSnap Analytics: Development of an Image-Based Ergonomic Posture Assessment and Automated Reporting System
    </div>

    <div style="font-size: 10pt; color: #334155; margin-bottom: 16mm; line-height: 1.6;">
      <strong>Candidate:</strong> Ruthish S. (Roll No: 2026-PRD-028)<br>
      <strong>Degree:</strong> Bachelor of Engineering in Production Engineering<br>
      <strong>Repository:</strong> https://github.com/Ruthish-S/ergosnap<br>
      <strong>Live Deployment:</strong> https://ruthish-s.github.io/ergosnap/
    </div>

    <div style="text-align: left; background: #f8fafc; border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 10pt 12pt; margin: 0 4mm;">
      <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a; margin-bottom: 4pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 2pt;">
        EXECUTIVE ABSTRACT
      </div>
      <p style="font-size: 9.5pt; line-height: 1.45; margin-bottom: 0;">
        In industrial manufacturing and precision assembly operations, awkward postures and repetitive upper-limb exertions constitute the primary etiological contributors to Work-Related Musculoskeletal Disorders (WMSDs). Observational ergonomic instruments—most prominently the Rapid Upper Limb Assessment (RULA) developed by McAtamney and Corlett (1993)—provide standardized frameworks for postural risk quantification. However, conventional manual administration suffers from subjective visual estimation, observational parallax, fragmented documentation, and administrative latency. This project documents the development, software verification, and preliminary empirical validation of <strong>ErgoSnap Analytics</strong>, a browser-native engineering platform engineered to streamline posture assessment. Operating strictly client-side to guarantee industrial privacy, the system integrates: (1) monocular landmark extraction via Google MediaPipe Pose Landmarker executing in WebAssembly/WebGL mode; (2) deterministic 2D vector trigonometry calculating joint angles relative to gravitational vertical and anatomical axes; (3) an authoritative implementation of RULA Tables A, B, and C with strict boundary guards; (4) an eight-tab engineering dashboard integrating ISO 11226:2000 comfort zone envelopes, Chaffin glenohumeral torque modeling, NIOSH Cumulative Exposure Risk Index (CERI) scaling, and anatomical WMSD heatmaps; and (5) automated A4 vector PDF and CSV data compilers. The software logic was verified via 38 automated unit tests with 100% pass rate.
      </p>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 1 of 12</span>
  </div>
</div>

<!-- PAGE 2: INTRODUCTION & PROBLEM STATEMENT -->
<div class="page">
  <div class="content">
    <h1>1. Introduction and Problem Statement</h1>
    <h2>1.1 Introduction to Ergonomics in Production Engineering</h2>
    <p>
      Ergonomics (human factors engineering) is the scientific discipline concerned with the understanding of interactions among humans, tools, machines, and workplace environments to optimize human well-being and operational productivity. In modern Production Engineering, ergonomics directly bridges mechanical workplace design with human biomechanical envelopes. Production facilities—ranging from automotive assembly lines and electronic fabrication benches to logistics packing cells—rely heavily on human manual dexterity. However, when workstation dimensions fail to align with operator anthropometry, workers adopt compensatory awkward configurations that generate excessive musculoskeletal joint moments.
    </p>
    <h2>1.2 The Musculoskeletal Risk Profile in Repetitive Industrial Work</h2>
    <p>
      Musculoskeletal tissues (skeletal muscles, tendons, ligaments, articular cartilage, and intervertebral discs) operate within definite physiological strain limits. When mechanical demands exceed tissue restitution rates, chronic degradation ensues. Epidemiological data from occupational safety directorates (e.g., EU-OSHA, NIOSH) confirm that upper-limb and neck WMSDs represent over 45% of all reported occupational illnesses in manufacturing. Sustained shoulder elevation (>45°) induces subacromial tendon impingement, while forward cervical inclination (>20°) triples the gravitational moment arm of the head (mass ≈ 4.5–5.0 kg), placing severe static demands on cervical extensor musculature (trapezius, splenius capitis). These conditions manifest as production line micro-stoppages, scrap rate spikes caused by fatigue-induced tremor, elevated absenteeism, and severe medical compensation liability.
    </p>
    <h2>1.3 Problem Statement</h2>
    <p>
      Traditional ergonomic auditing in manufacturing environments relies heavily on physical clipboards, printed paper worksheets, and manual handheld goniometers. While foundational, this paradigm exhibits four major engineering bottlenecks:
    </p>
    <ul>
      <li><strong>Measurement Parallax & Subjectivity:</strong> Visual estimation of angular joint flexion from variable observational vantage points yields inter-assessor discrepancies exceeding ±15°.</li>
      <li><strong>Observer Intrusion (Hawthorne Effect):</strong> Auditors standing immediately adjacent to workers induce psychological stress and unnatural posture alterations.</li>
      <li><strong>Administrative Disconnect:</strong> Postural sketches, handwritten intermediate scores, and photographic records remain segregated in disjointed archives, delaying corrective interventions.</li>
      <li><strong>Lack of Analytical Interventions:</strong> Paper worksheets provide a static scalar score (e.g., RULA 6) without simulating which workstation dimensional adjustments would most effectively attenuate postural load.</li>
    </ul>
    <h2>1.4 Aim and Specific Objectives</h2>
    <p>
      The aim of this project is to develop, verify, and document <strong>ErgoSnap Analytics</strong>, a client-side computer-vision ergonomic assessment and reporting system. The specific engineering objectives are:
    </p>
    <ol>
      <li>Develop a responsive browser interface supporting secure image upload, binary EXIF orientation normalization, and view suitability validation.</li>
      <li>Implement in-browser 33-point body landmark detection via MediaPipe Pose Landmarker without transmitting imagery to cloud servers.</li>
      <li>Engineer vector-trigonometric algorithms to calculate planar anatomical joint angles with cosine clamping and missing-data flags.</li>
      <li>Implement an authoritative, rule-governed scoring engine executing McAtamney & Corlett (1993) RULA Tables A, B, and C with explicit null-safety.</li>
      <li>Construct an interactive eight-section analytics dashboard visualizing ISO 11226 neutral zones, multiaxial radar profiles, shoulder torque, CERI exposure, and WMSD risk maps.</li>
      <li>Develop an automated client-side A4 vector PDF technical report generator and raw CSV dataset exporter.</li>
      <li>Verify software logic via automated unit test suites and establish an empirical validation framework against independent goniometric reference datasets.</li>
    </ol>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 2 of 12</span>
  </div>
</div>

<!-- PAGE 3: PHYSICAL ERGONOMICS & RISK ASSESSMENT -->
<div class="page">
  <div class="content">
    <h1>2. Physical Ergonomics and Risk Assessment Methodologies</h1>
    <h2>2.1 Principles of Physical Ergonomics and Workstation Design</h2>
    <p>
      Physical ergonomics evaluates human anatomical, anthropometric, physiological, and biomechanical parameters as they relate to manual work. The primary objective is to engineer physical workplace interfaces (workbench heights, reach zones, bin presentation angles, tooling grips) such that operator joint articulations remain within "neutral postural envelopes". In neutral postures, agonist and antagonist muscle groups operate around their optimal length-tension relationship, minimizing internal joint contact forces and passive connective tissue strain.
    </p>
    <h2>2.2 Postural Stressors and External Load Interaction</h2>
    <p>
      Workplace biomechanical risk is driven by four interacting physical stressors:
    </p>
    <ul>
      <li><strong>Awkward Posture:</strong> Articular deviations from neutral resting baselines (e.g., extreme shoulder flexion, trunk twisting, ulnar deviation).</li>
      <li><strong>Static Loading:</strong> Isometric contractions sustained for >60 seconds. Intramuscular pressure exceeds microvascular capillary perfusion pressure (~30 mmHg), causing local tissue ischemia, metabolic acid buildup, and acute fatigue.</li>
      <li><strong>Repetitive Exertion:</strong> High-frequency cyclic motions (<30 s cycle time) that deprive collagen fibers of viscoelastic restitution.</li>
      <li><strong>External Force Demands:</strong> Mass payloads and tooling reaction forces that amplify compressive stress across articular structures.</li>
    </ul>
    <h2>2.3 Observational Ergonomic Assessment Instruments</h2>
    <p>
      Industrial ergonomics relies on validated semi-quantitative observational instruments to categorize physical exposure into actionable priority tiers. Table 2.1 presents a comparative evaluation of primary occupational instruments.
    </p>
    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Instrument</th>
          <th style="width: 22%;">Anatomical Focus</th>
          <th style="width: 28%;">Input Parameters Evaluated</th>
          <th style="width: 28%;">Primary Industrial Target</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>RULA</strong> (McAtamney & Corlett 1993)</td>
          <td>Upper limbs, neck, trunk, legs</td>
          <td>Joint angles, static muscle use, force/load mass tiers</td>
          <td>Seated/standing electronics assembly, packaging, machine tending</td>
        </tr>
        <tr>
          <td><strong>REBA</strong> (Hignett & McAtamney 2000)</td>
          <td>Whole body, lower extremities, coupling</td>
          <td>Full body angles, dynamic load shocks, hand coupling quality</td>
          <td>Warehousing, healthcare patient transfer, heavy metal fabrication</td>
        </tr>
        <tr>
          <td><strong>OWAS</strong> (Karhu et al. 1977)</td>
          <td>Gross posture categories (back, arms, legs)</td>
          <td>4 back, 3 arm, 7 leg postures; 3 payload weight classes</td>
          <td>Foundries, mining operations, heavy civil construction</td>
        </tr>
        <tr>
          <td><strong>NIOSH Lift Eq.</strong> (Waters et al. 1993)</td>
          <td>Lumbosacral junction (L5/S1 compression)</td>
          <td>Horizontal reach, vertical origin, lift displacement, frequency, coupling</td>
          <td>Manual palletizing, bin depalletizing, warehouse crate transfer</td>
        </tr>
      </tbody>
    </table>
    <div class="table-caption">Table 2.1: Comparative classification of standardized observational ergonomic assessment instruments.</div>
    <h2>2.4 Advantages and Physical Boundaries of Photographic Assessment</h2>
    <p>
      Workplace photographic assessment provides critical operational benefits: non-invasive capture, permanent traceable documentation, and asynchronous peer review. However, fundamental physical boundaries must be recognized:
    </p>
    <ul>
      <li><strong>Planar Projection & Foreshortening:</strong> A single 2D image measures angles projected onto the camera image plane. Out-of-plane joint excursions are subject to trigonometric foreshortening.</li>
      <li><strong>Occlusion:</strong> Structural machine guards, conveyor side-plates, and worker clothing can obstruct joint vertices.</li>
      <li><strong>Absence of Kinetic Data:</strong> Still imagery cannot quantify external payload weight, tool vibration, or isometric hold duration. Therefore, monocular systems must operate as screening tools paired with manual task inputs, rather than black-box autonomous diagnostics.</li>
    </ul>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 3 of 12</span>
  </div>
</div>

<!-- PAGE 4: RAPID UPPER LIMB ASSESSMENT (RULA) -->
<div class="page">
  <div class="content">
    <h1>3. Rapid Upper Limb Assessment (RULA) Methodology</h1>
    <h2>3.1 Theoretical Foundations of RULA</h2>
    <p>
      Developed by McAtamney and Corlett (1993) at the University of Nottingham, the Rapid Upper Limb Assessment (RULA) is an observational screening tool engineered to evaluate biomechanical load on the upper extremities, cervical spine, and trunk. RULA assesses posture by partitioning the musculoskeletal system into two analytical groups: Group A (upper arm, lower arm, wrist, and wrist twist) and Group B (neck, trunk, and legs). Continuous anatomical angles are discretized into ordinal posture scores based on epidemiological strain thresholds.
    </p>
    <h2>3.2 Anatomical Posture Discretization Rules</h2>
    <p>
      • <strong>Upper Arm:</strong> Flexion/extension between -20° and +20° scores 1; >20° extension scores 2; 20°–45° flexion scores 2; 45°–90° flexion scores 3; >90° flexion scores 4. Adjustments: +1 if shoulder is elevated or abducted, -1 if arm is supported.<br>
      • <strong>Lower Arm:</strong> Flexion between 60° and 100° scores 1; <60° or >100° scores 2. Adjustment: +1 if working across body midline or out to side.<br>
      • <strong>Wrist & Twist:</strong> Neutral (0°–15°) scores 1; 15° flexion/extension scores 2; >15° scores 3. Radial/ulnar deviation adds +1. Pronation/supination twist scores 1 for mid-range, 2 for near-end.<br>
      • <strong>Neck:</strong> Flexion between 0° and 10° scores 1; 10°–20° scores 2; >20° scores 3; any extension scores 4. Twisting or side-bending adds +1 each.<br>
      • <strong>Trunk:</strong> Neutral upright (0°–10°) scores 1; 10°–20° scores 2; 20°–60° scores 3; >60° scores 4. Twisting or side-bending adds +1 each.<br>
      • <strong>Legs:</strong> Well supported with symmetrical weight bearing scores 1; uneven or unsupported scores 2.
    </p>
    <h2>3.3 RULA Multi-Table Scoring Procedure and Workflow</h2>
    <p>
      The scoring sequence maps intermediate inputs through three deterministic matrix lookups: Table A ($6 \\times 3 \\times 4 \\times 2$) yields intermediate Score A ($1\\text{--}8$); Table B ($6 \\times 6 \\times 2$) yields intermediate Score B ($1\\text{--}9$); Score A and Score B are adjusted by adding $+1$ for static/repetitive muscle use and $+0$ to $+3$ for load mass; and Table C ($8 \\times 7$) maps the adjusted scores to the final Grand Score ($1\\text{--}7$).
    </p>
    <div class="fig-container">
      <img src="${images.rulaFlowchart}" alt="RULA Scoring Workflow">
      <div class="fig-caption">Figure 3.1: Complete RULA scoring workflow diagram depicting Group A, Group B, adjustments, and Table C Grand Score mapping.</div>
    </div>
    <h2>3.4 Action Level Interpretation and Limitations</h2>
    <p>
      The RULA Grand Score is mapped into four distinct Action Levels: <strong>Level 1 (1–2):</strong> Acceptable posture; <strong>Level 2 (3–4):</strong> Further investigation needed; <strong>Level 3 (5–6):</strong> Changes required soon; and <strong>Level 4 (7):</strong> Immediate action required. RULA serves as an engineering screening metric to prioritize workstation redesigns; it does not replace medical diagnostics.
    </p>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 4 of 12</span>
  </div>
</div>

<!-- PAGE 5: COMPUTER VISION & MEASUREMENT THEORY -->
<div class="page">
  <div class="content">
    <h1>4. Computer Vision, Pose Estimation and Measurement Theory</h1>
    <h2>4.1 Computer Vision in Industrial Ergonomic Metrology</h2>
    <p>
      Computer vision enables non-contact kinematic tracking by detecting anatomical landmark keypoints from digital image matrices. In industrial ergonomics, vision pipelines replace manual protractor measurements with mathematical vector geometry, eliminating observational parallax while providing verifiable visual audit trails.
    </p>
    <h2>4.2 Google MediaPipe Pose Landmarker Architecture</h2>
    <p>
      ErgoSnap Analytics incorporates Google MediaPipe Tasks-Vision (Pose Landmarker), executing via client-side WebAssembly and WebGL shaders. The architecture utilizes a two-stage detector-tracker topology: a BlazePose convolutional detector predicts a human bounding box, followed by a high-resolution regression network that infers 33 3D anatomical keypoint coordinates ($x, y, z$) alongside visibility ($v$) and presence ($p$) confidences in $[0.0, 1.0]$. The coordinates are normalized relative to image width and height.
    </p>
    <h2>4.3 Vector Trigonometry and Numerical Stability</h2>
    <p>
      Joint angles are derived using vector algebra. For anatomical vertices $A$ (proximal), $B$ (vertex joint), and $C$ (distal), directional vectors $\\mathbf{u}$ and $\\mathbf{v}$ are constructed:
    </p>
    <div class="equation">
      \\mathbf{u} = A - B = (x_A - x_B, y_A - y_B), \\qquad \\mathbf{v} = C - B = (x_C - x_B, y_C - y_B)
    </div>
    <p>
      The interior planar joint angle $\\theta$ is calculated via the Euclidean dot product:
    </p>
    <div class="equation">
      \\theta = \\cos^{-1}\\left(\\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}\\right) = \\cos^{-1}\\left(\\frac{u_x v_x + u_y v_y}{\\sqrt{u_x^2 + u_y^2} \\sqrt{v_x^2 + v_y^2}}\\right)
    </div>
    <p>
      In floating-point arithmetic, rounding error can produce argument ratios slightly exceeding $\\pm 1.0$ (e.g., $1.0000002$), causing mathematical <code>NaN</code> domain errors in inverse cosine functions. ErgoSnap strictly enforces clamping:
    </p>
    <div class="equation">
      \\text{ratio}_{\\text{clamped}} = \\max\\left(-1.0, \\min\\left(1.0, \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}\\right)\\right)
    </div>
    <p>
      Degenerate geometry (where $\\|\\mathbf{u}\\| < 10^{-6}$ or $\\|\\mathbf{v}\\| < 10^{-6}$) is trapped, marked invalid, and assigned a <code>null</code> measurement flag.
    </p>
    <h2>4.4 Geometric Angles vs. RULA Ergonomic Posture Definitions</h2>
    <p>
      A critical scientific distinction exists between geometric enclosed joint angles and ergonomically defined posture angles. For example, an elbow angle geometrically measures ~90° between upper arm and forearm. However, upper arm flexion in RULA is defined as the angular displacement of the humerus relative to gravitational vertical (downward vector $\\mathbf{g} = (0, 1)$). ErgoSnap projects limbs against true vertical and horizontal reference axes, correctly transforming spatial vectors into RULA coordinate conventions.
    </p>
    <h2>4.5 Statistical Reliability Metrics: Verification vs. Validation</h2>
    <p>
      Scientific integrity requires distinguishing <strong>Software Verification</strong> (confirming numerical model accuracy) from <strong>Empirical Validation</strong> (matching physical ground truth). Verification is evaluated via deterministic unit testing. Validation requires paired measurement sets evaluated through Mean Absolute Error (MAE), Signed Mean Bias, Bland-Altman 95% Limits of Agreement ($\\text{Bias} \\pm 1.96 \\cdot s_{\\text{diff}}$), and Weighted Cohen's Kappa ($\\kappa_w$).
    </p>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 5 of 12</span>
  </div>
</div>

<!-- PAGE 6: SYSTEM ARCHITECTURE & TECH STACK -->
<div class="page">
  <div class="content">
    <h1>5. System Architecture and Implementation Design</h1>
    <h2>5.1 Project Scope and Operational Capabilities</h2>
    <p>
      ErgoSnap Analytics is implemented as a production-grade, single-page web application engineered in TypeScript. The system operates strictly client-side within the browser sandbox, ensuring that sensitive manufacturing workplace photographs never transit external network servers. It provides an end-to-end operational pipeline from photograph ingestion to automated A4 technical report compilation.
    </p>
    <h2>5.2 Functional and Technical Requirements</h2>
    <p>
      • <strong>FR-01 Image Ingestion:</strong> Drag-and-drop file interface validating JPEG/PNG/WebP formats under 20 MB with binary EXIF tag recovery.<br>
      • <strong>FR-02 Local Pose Inference:</strong> Sub-second landmark coordinate generation via WebAssembly/WebGL hardware acceleration.<br>
      • <strong>FR-03 Landmark Quality Gate:</strong> Validation gate enforcing $\\ge 0.5$ confidence across 8 mandatory upper-body vertices.<br>
      • <strong>FR-04 Biomechanical Scoring:</strong> Deterministic RULA Tables A, B, and C with ISO 11226 neutral comfort zone comparison.<br>
      • <strong>FR-05 Analytics Dashboard:</strong> Eight tabbed research perspectives providing multiaxial radar, sensitivity, and WMSD risk visualizations.<br>
      • <strong>FR-06 Technical Reporting:</strong> Vector-crisp client-side A4 PDF generation with embedded skeletal tracking photographs and CSV data export.
    </p>
    <h2>5.3 Technology Selection Matrix</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Technology</th>
          <th style="width: 24%;">System Function</th>
          <th style="width: 36%;">Engineering Justification</th>
          <th style="width: 18%;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>React 19 + TypeScript</strong></td>
          <td>Component Framework & Core Logic</td>
          <td>Strict type safety for coordinates, nullable measurements, and lookup matrices; predictable UI state</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>Vite 8.3</strong></td>
          <td>Build Pipeline & Bundler</td>
          <td>Sub-second Hot Module Replacement, optimized ES module tree-shaking for static deployment</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>@mediapipe/tasks-vision</strong></td>
          <td>Pose Estimation Engine</td>
          <td>Client-side WebAssembly/WebGL inference; 33 3D landmarks without cloud data transit</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>Tailwind CSS v4</strong></td>
          <td>Interface Styling</td>
          <td>Responsive utility-first architecture; industrial Slate-900 / Red-600 aesthetic</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>Recharts 3.10</strong></td>
          <td>Dashboard Visual Analytics</td>
          <td>Declarative SVG rendering of multiaxial radar plots and sensitivity bar charts</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>jsPDF + AutoTable</strong></td>
          <td>Technical Report Compiler</td>
          <td>Client-side vector A4 PDF generation with embedded photos, canvas charts, and tables</td>
          <td>Implemented & Verified</td>
        </tr>
        <tr>
          <td><strong>Vitest 5.0</strong></td>
          <td>Automated Unit Testing</td>
          <td>High-speed testing framework executing 38 deterministic mathematical and matrix unit tests</td>
          <td>38/38 Tests Passing</td>
        </tr>
      </tbody>
    </table>
    <div class="table-caption">Table 5.1: Software technology stack, engineering justifications, and verification status.</div>
    <div class="fig-container">
      <img src="${images.sysArch}" alt="System Architecture">
      <div class="fig-caption">Figure 5.1: Four-layer modular software architecture of ErgoSnap Analytics.</div>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 6 of 12</span>
  </div>
</div>

<!-- PAGE 7: IMAGE PROCESSING & POSE DETECTION -->
<div class="page">
  <div class="content">
    <h1>6. Image Processing and Landmark Detection Pipeline</h1>
    <h2>6.1 Ingestion, Validation and EXIF Normalization</h2>
    <p>
      The image pipeline in <code>src/modules/imagePreprocessing.ts</code> enforces stringent input validation. Uploaded files are verified against MIME signatures (<code>image/jpeg</code>, <code>image/png</code>, <code>image/webp</code>) with a 20 MB size barrier. To eliminate rotational orientation errors caused by smartphone camera sensors, an ArrayBuffer reader extracts binary EXIF tags from JPEG APP1 markers (<code>0xFFE1</code>), reads tag <code>0x0112</code>, and applies compensatory transformations before landmark detection.
    </p>
    <div class="fig-container">
      <img src="${images.upload}" alt="Upload Interface">
      <div class="fig-caption">Figure 6.1: ErgoSnap image upload interface featuring format validation, EXIF normalization, and benchmark posture loader.</div>
    </div>
    <h2>6.2 Pose Estimation Initialization and Landmark Quality Gate</h2>
    <p>
      Pose estimation (<code>src/modules/poseDetector.ts</code>) initializes MediaPipe PoseLandmarker running <code>pose_landmarker_lite.task</code> via WebAssembly. Detection is triggered on the local GPU/CPU with detection and tracking confidence thresholds fixed at 0.50. The model outputs 33 spatial keypoints in normalized coordinates $(x_i, y_i) \\in [0.0, 1.0]$. To prevent invalid calculations, <code>src/modules/landmarkValidation.ts</code> enforces a mathematical quality gate across 8 critical upper-body vertices $\\text{Req} = \\{11, 12, 13, 14, 15, 16, 23, 24\\}$:
    </p>
    <div class="equation">
      \\text{Completeness} = \\frac{1}{|\\text{Req}|} \\sum_{i \\in \\text{Req}} \\mathbb{I}(v_i \\ge 0.50 \\land p_i \\ge 0.50)
    </div>
    <p>
      The observation status is classified into three operational categories: <code>valid</code> (completeness $\\ge 0.85$); <code>review_required</code> (marginal confidence $0.50 \\le v < 0.65$ or moderate foreshortening); and <code>unscorable</code> (primary limb joints occluded, safely withholding downstream scoring).
    </p>
    <div class="fig-container">
      <img src="${images.workbench}" alt="Landmark Workbench">
      <div class="fig-caption">Figure 6.2: Monocular pose landmark detection workbench displaying interactive skeleton overlay and manual load inputs.</div>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 7 of 12</span>
  </div>
</div>

<!-- PAGE 8: JOINT ANGLE ANALYSIS & RULA SCORING -->
<div class="page">
  <div class="content">
    <h1>7. Joint-Angle Analysis and RULA Scoring Implementation</h1>
    <h2>7.1 Vector Angle Derivation and Geometric Mapping</h2>
    <p>
      In <code>src/modules/angleCalculations.ts</code>, anatomical angles are derived deterministically using the vector dot-product formulation with floating-point cosine clamping. Segment angles are projected relative to true gravitational vertical axes: Upper Arm Flexion (Shoulder to Elbow referenced against gravitational vertical $\\mathbf{g} = (0, 1)$); Lower Arm Flexion (interior angle between humerus ray and forearm ray); Neck Flexion (Ear to Shoulder referenced against vertical); and Trunk Inclination (mid-shoulder to mid-hip spinal vector referenced against vertical).
    </p>
    <div class="fig-container">
      <img src="${images.angles}" alt="ISO 11226 Comfort Gauges">
      <div class="fig-caption">Figure 7.1: ISO 11226:2000 postural comfort zone gauges indicating angular deviations from neutral joint envelopes.</div>
    </div>
    <h2>7.2 RULA Multi-Table Scoring Engine & Scientific Guardrails</h2>
    <p>
      The scoring engine (<code>src/modules/rulaScoring.ts</code>) executes the complete McAtamney & Corlett (1993) algorithm. Discrete angle tiers index Table A ($6 \\times 3 \\times 4 \\times 2$) and Table B ($6 \\times 6 \\times 2$) stored as immutable numerical matrices. External task parameters (muscle use frequency and force/load mass tiers) are combined with intermediate scores to index Table C ($8 \\times 7$), deriving the final Grand Score ($1\\text{--}7$) and Action Level ($1\\text{--}4$).
    </p>
    <p>
      A foundational design rule of ErgoSnap Analytics is strict null-safety: when a joint angle is occluded or a manual task input is unconfirmed, the system assigns a <code>null</code> value. It explicitly refuses to substitute <code>0</code> or generate plausible-looking final scores, displaying an "Incomplete / Pending Inputs" status badge.
    </p>
    <div class="fig-container">
      <img src="${images.rulaRadar}" alt="RULA Breakdown & Radar Plot">
      <div class="fig-caption">Figure 7.2: RULA posture audit breakdown, multiaxial radar profile plot, and single-variable intervention sensitivity simulation.</div>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 8 of 12</span>
  </div>
</div>

<!-- PAGE 9: INTERACTIVE DASHBOARD & REPORTING -->
<div class="page">
  <div class="content">
    <h1>8. Interactive Dashboard, Biomechanical Analytics and Reporting</h1>
    <h2>8.1 Eight-Section Research Dashboard Architecture</h2>
    <p>
      The application dashboard (<code>src/pages/DashboardPage.tsx</code>) presents an eight-section tabbed interface organized for production engineers: (1) Overview & Executive KPIs; (2) Image Analysis; (3) Angles & ISO 11226 Neutral Zones; (4) RULA & Sensitivity Analysis; (5) WMSD Body Map; (6) Workstation Dimensional Fit; (7) Statistical Validation; and (8) Corrective Actions & Lean ROI Matrix.
    </p>
    <div class="fig-container">
      <img src="${images.dashboard}" alt="Dashboard Overview">
      <div class="fig-caption">Figure 8.1: Ergonomic Engineering Analytics Dashboard overview displaying executive KPI cards and observation quality metrics.</div>
    </div>
    <h2>8.2 Biomechanical Modeling and Research Enhancements</h2>
    <p>
      • <strong>Glenohumeral Torque Index:</strong> Calculates shoulder gravitational moment ($M = F \\cdot L \\cdot \\sin\\theta$) based on Chaffin et al. (2006), expressing shoulder load as a percentage of maximum reach capacity.<br>
      • <strong>Cumulative Exposure Risk Index (CERI):</strong> Integrates static posture scores with task repetition duration and payload mass into a continuous shift exposure metric ($0.0\\text{--}10.0$).<br>
      • <strong>Sensitivity Simulation:</strong> Simulates Table C Grand Score reductions across single-variable adjustments, identifying which body segment modification yields the highest biomechanical risk reduction.<br>
      • <strong>WMSD Anatomical Heatmap:</strong> Aggregates regional joint strains into EU-OSHA risk tiers across shoulders, neck, back, elbows, and wrists.
    </p>
    <div class="dual-fig-container">
      <div class="dual-fig-item">
        <img src="${images.heatmap}" alt="WMSD Heatmap">
        <div class="fig-caption">Figure 8.2: Anatomical WMSD risk heatmap.</div>
      </div>
      <div class="dual-fig-item">
        <img src="${images.actionMatrix}" alt="Lean Action Matrix">
        <div class="fig-caption">Figure 8.3: Lean Ergonomics 2×2 action priority matrix.</div>
      </div>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 9 of 12</span>
  </div>
</div>

<!-- PAGE 10: TESTING, VERIFICATION & VALIDATION -->
<div class="page">
  <div class="content">
    <h1>9. Software Testing, Verification and Empirical Validation Protocol</h1>
    <h2>9.1 Software Verification Test Matrix</h2>
    <p>
      Automated software verification was conducted using Vitest across 38 unit test cases. Table 9.1 documents test coverage across critical analytical modules.
    </p>
    <table>
      <thead>
        <tr>
          <th style="width: 26%;">Test Suite / Module</th>
          <th style="width: 10%;">Tests</th>
          <th style="width: 32%;">Boundary Conditions Tested</th>
          <th style="width: 20%;">Expected Behavior</th>
          <th style="width: 12%;">Observed</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>angleCalculations.test.ts</strong></td>
          <td style="text-align: center;">8</td>
          <td>0°, 90°, 180°, degenerate vectors, floating cosine > 1.0</td>
          <td>Strict math clamping, null for zero-length rays</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">8/8 Passed</td>
        </tr>
        <tr>
          <td><strong>rulaScoring.test.ts</strong></td>
          <td style="text-align: center;">13</td>
          <td>Upper arm 20°/45°/90°, lower arm 60°/100°, Tables A/B/C</td>
          <td>Exact agreement with McAtamney worked tables</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">13/13 Passed</td>
        </tr>
        <tr>
          <td><strong>statistics.test.ts</strong></td>
          <td style="text-align: center;">7</td>
          <td>MAE, signed bias, Bland-Altman limits, Cohen's Kappa</td>
          <td>Exact agreement with clinical statistical formulas</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">7/7 Passed</td>
        </tr>
        <tr>
          <td><strong>ergonomicEnhancements.test.ts</strong></td>
          <td style="text-align: center;">7</td>
          <td>Chaffin torque, CERI index, Table C sensitivity simulation</td>
          <td>Accurate moment arm scaling & delta impact ranking</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">7/7 Passed</td>
        </tr>
        <tr>
          <td><strong>wmsdRiskMapping.test.ts</strong></td>
          <td style="text-align: center;">2</td>
          <td>ISO 11226 neutral envelopes, multi-region risk aggregation</td>
          <td>Exact mapping to EU-OSHA anatomical risk tiers</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">2/2 Passed</td>
        </tr>
        <tr>
          <td><strong>reportGenerator.test.ts</strong></td>
          <td style="text-align: center;">1</td>
          <td>CSV structure, null-field integrity (empty string vs 0)</td>
          <td>Strict preservation of null data in CSV</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">1/1 Passed</td>
        </tr>
      </tbody>
    </table>
    <div class="table-caption">Table 9.1: Automated software verification matrix demonstrating 100% pass rate across 38 unit tests.</div>
    <div class="dual-fig-container">
      <div class="dual-fig-item">
        <img src="${images.validation}" alt="Validation Engine">
        <div class="fig-caption">Figure 9.1: Empirical Statistical Validation Engine.</div>
      </div>
      <div class="dual-fig-item">
        <img src="${images.reportPreview}" alt="Report Publication Preview">
        <div class="fig-caption">Figure 9.2: Technical Report publication preview.</div>
      </div>
    </div>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 10 of 12</span>
  </div>
</div>

<!-- PAGE 11: RESULTS, DISCUSSION & LIMITATIONS -->
<div class="page">
  <div class="content">
    <h1>10. Results, Discussion, Engineering Limitations and Future Scope</h1>
    <h2>10.1 Demonstrated System Outputs</h2>
    <p>
      ErgoSnap Analytics successfully demonstrates an end-to-end operational software workflow:
    </p>
    <ul>
      <li>Image-based landmark detection operating in-browser under 150 ms per frame without server latency.</li>
      <li>Trigonometric angle calculation validated against mathematical boundaries.</li>
      <li>Authoritative RULA Table A, B, and C scoring logic matching published ergonomic tables.</li>
      <li>Multi-perspective research analytics including ISO 11226 comfort zones and sensitivity simulations.</li>
      <li>Automated publication-grade 4-page A4 PDF technical reports embedding annotated photographs, radar charts, sensitivity bars, and WMSD heatmaps.</li>
    </ul>
    <h2>10.2 Production Engineering Discussion</h2>
    <p>
      In industrial manufacturing plants, ErgoSnap bridges the gap between manual clipboards and prohibitive 3D motion capture labs. It equips production engineers to perform rapid, non-intrusive postural audits, establish baseline exposure metrics prior to lean kaizen events, and objectively verify post-intervention risk attenuation.
    </p>
    <h2>10.3 Explicit Technical Limitations</h2>
    <p>
      To maintain scientific integrity, the following technical limitations are explicitly documented:
    </p>
    <ol>
      <li><strong>Monocular 2D Parallax:</strong> Angle accuracy depends strictly on orthogonal camera alignment relative to the anatomical motion plane. Frontal angles suffer from severe projection foreshortening.</li>
      <li><strong>Occlusion Constraints:</strong> Heavy protective gear, structural machine frames, or parts bins blocking limb joints invalidate landmark confidence.</li>
      <li><strong>Uncalibrated Dimensions:</strong> Workstation dimensional recommendations and shoulder moment indices represent dimensionless approximations rather than metric photogrammetry.</li>
      <li><strong>Non-Diagnostic Scope:</strong> ErgoSnap is an engineering screening instrument, not a certified clinical diagnostic tool.</li>
    </ol>
    <h2>10.4 Conclusion and Future Scope</h2>
    <p>
      <strong>Conclusion:</strong> The project achieved its objective of engineering a browser-based, scientifically defensible ergonomic posture assessment platform. By coupling MediaPipe pose estimation with verified RULA scoring rules and automated reporting, ErgoSnap provides an accessible, private tool for workplace ergonomic screening.<br>
      <strong>Future Scope:</strong> Future developments include multi-view camera spatial calibration for 3D center-of-mass reconstruction, temporal video processing with rolling-window median filtering for automated static hold duration tracking, and integration of the NIOSH Lifting Equation for dynamic material handling operations.
    </p>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 11 of 12</span>
  </div>
</div>

<!-- PAGE 12: REFERENCES -->
<div class="page">
  <div class="content">
    <h1>References</h1>
    <p style="font-size: 8.5pt; color: #475569; margin-bottom: 8pt; font-style: italic;">
      All references are verified authoritative academic and technical sources cited in IEEE numbered format.
    </p>
    <ol style="font-size: 8.5pt; line-height: 1.45; margin-left: 18pt;">
      <li style="margin-bottom: 5pt;">L. McAtamney and E. N. Corlett, "RULA: a survey method for the investigation of work-related upper limb disorders," <em>Applied Ergonomics</em>, vol. 24, no. 2, pp. 91–99, 1993. doi: 10.1016/0003-6870(93)90080-S.</li>
      <li style="margin-bottom: 5pt;">International Organization for Standardization, "ISO 11226:2000 — Ergonomics: Evaluation of static working postures," Geneva, Switzerland: ISO, 2000.</li>
      <li style="margin-bottom: 5pt;">International Organization for Standardization, "ISO 9241-5:1998 — Ergonomic requirements for office work with visual display terminals (VDTs) — Part 5: Workstation layout and postural requirements," Geneva, Switzerland: ISO, 1998.</li>
      <li style="margin-bottom: 5pt;">D. B. Chaffin, G. B. J. Andersson, and B. J. Martin, <em>Occupational Biomechanics</em>, 4th ed. Hoboken, NJ: John Wiley & Sons, 2006.</li>
      <li style="margin-bottom: 5pt;">T. R. Waters, V. Putz-Anderson, A. Garg, and L. J. Fine, "Revised NIOSH equation for the design and evaluation of manual lifting tasks," <em>Ergonomics</em>, vol. 36, no. 7, pp. 749–776, 1993. doi: 10.1080/00140139308907925.</li>
      <li style="margin-bottom: 5pt;">European Agency for Safety and Health at Work (EU-OSHA), "Work-related musculoskeletal disorders: prevalence, costs and demographics in the EU," Luxembourg: Publications Office of the European Union, 2020.</li>
      <li style="margin-bottom: 5pt;">P. Plantard, H. P. H. Shum, A. S. Le Pierres, and F. Multon, "Validation of an ergonomic assessment system using Kinect data in realistic industrial conditions," <em>Computers in Industry</em>, vol. 93, pp. 19–27, 2017. doi: 10.1016/j.compind.2017.07.001.</li>
      <li style="margin-bottom: 5pt;">Google AI Edge Team, "MediaPipe Pose Landmarker for Web (Tasks Vision)," Google Developers Documentation, 2023. [Online]. Available: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js.</li>
      <li style="margin-bottom: 5pt;">J. M. Bland and D. Altman, "Statistical methods for assessing agreement between two methods of clinical measurement," <em>The Lancet</em>, vol. 327, no. 8476, pp. 307–310, 1986. doi: 10.1016/S0140-6736(86)90837-8.</li>
      <li style="margin-bottom: 5pt;">J. Cohen, "Weighted kappa: Nominal scale agreement with provision for scaled disagreement or partial credit," <em>Psychological Bulletin</em>, vol. 70, no. 4, pp. 213–220, 1968. doi: 10.1037/h0026256.</li>
      <li style="margin-bottom: 5pt;">S. Hignett and L. McAtamney, "Rapid Entire Body Assessment (REBA)," <em>Applied Ergonomics</em>, vol. 31, no. 2, pp. 201–205, 2000. doi: 10.1016/S0003-6870(99)00039-3.</li>
      <li style="margin-bottom: 5pt;">S. Bengtsson and Contributors, "jsPDF-AutoTable: Table plugin for jsPDF," GitHub Open Source Repository, 2024. [Online]. Available: https://github.com/simonbengtsson/jsPDF-AutoTable.</li>
      <li style="margin-bottom: 5pt;">Vite Core Team, "Deploying a Static Site — GitHub Pages," Vite Documentation, 2024. [Online]. Available: https://vite.dev/guide/static-deploy.</li>
      <li style="margin-bottom: 5pt;">Vitest Team, "Vitest: Next Generation Testing Framework," Vitest Documentation, 2024. [Online]. Available: https://vitest.dev/.</li>
    </ol>
  </div>
  <div class="footer-strip">
    <span>ErgoSnap Analytics v1.2</span>
    <span>Page 12 of 12</span>
  </div>
</div>

</body>
</html>
`;

async function main() {
  const htmlPath = path.resolve('docs/ErgoSnap_Analytics_Project_Report.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('[OK] Wrote paginated HTML template to:', htmlPath);

  console.log('Rendering exact 12-page PDF via Playwright (Edge)...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: PDF_OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log('[OK] Generated PDF deliverable:', PDF_OUT);
}

main().catch(err => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
