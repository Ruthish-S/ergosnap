# ErgoSnap Analytics 🔍📐

**Image-Based Ergonomic Posture Assessment and Technical Reporting**

[![Deploy ErgoSnap Analytics to GitHub Pages](https://github.com/Ruthish-S/ergosnap/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ruthish-S/ergosnap/actions/workflows/deploy.yml)
[![Live Application](https://img.shields.io/badge/Live_Site-GitHub_Pages-red.svg)](https://ruthish-s.github.io/ergosnap/)

ErgoSnap Analytics is a browser-only, client-side engineering application for evaluating workplace posture photographs. It detects body landmarks using Google MediaPipe Pose, calculates 2D planar joint angles, executes the verified RULA (Rapid Upper Limb Assessment) scoring matrices (McAtamney & Corlett, 1993), renders an interactive dashboard, and generates publication-grade technical A4 PDF reports.

---

## 🛠️ Software Architecture & Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript (Strict) | Type safety for coordinates, measurements, and assessment models |
| **Framework** | React 19 + Vite | Component-driven reactivity with high-performance bundling |
| **Styling** | Tailwind CSS v4 | Engineering aesthetic: Slate neutrals with `#DC2626` red accent |
| **Icons** | Lucide React | Uniform dashboard & ergonomic indicators |
| **Vision** | `@mediapipe/tasks-vision` | Pretrained Pose Landmarker running locally via WebAssembly/WebGL |
| **Plotting** | Recharts | Responsive charts for joint angles, Bland–Altman, and scatter plots |
| **Reporting** | jsPDF + AutoTable | Client-side vector A4 technical report compiler |
| **Validation** | Zod | Runtime schema validation for imported records and metadata |
| **Testing** | Vitest + Testing Library | Deterministic testing of angle geometry and RULA matrices |
| **Deployment**| GitHub Pages | Static client-side hosting with zero cloud telemetry or storage |

---

## 🚀 Quickstart & Local Development

```bash
# 1. Clone repository
git clone https://github.com/Ruthish-S/ergosnap.git
cd ergosnap

# 2. Install dependencies
npm install

# 3. Run unit test suite
npx vitest run

# 4. Start local development server
npm run dev
```

---

## 📋 Scientific Integrity & Guardrails

ErgoSnap enforces strict scientific boundaries to prevent misleading automated results:
- **No Zero for Missing Data:** A missing angle or occluded joint is recorded as `null` or `UNSCORABLE`, never coerced into `0°`.
- **Complete Scoring Only:** A final RULA Grand Score is only calculated when all required inputs (including external load and repetition factors) are resolved.
- **No Fabricated Confidence Percentages:** The dashboard avoids arbitrary single-number "ergonomic safety percentages".
- **Local Browser Processing:** Photographs are processed entirely in the browser using WebAssembly. No images are transmitted to external servers.

---

## 📊 RULA Matrix Source Citation
- **Reference:** McAtamney, L., & Corlett, E. N. (1993). *RULA: a survey method for the investigation of work-related upper limb disorders.* Applied Ergonomics, 24(2), 91–99. [DOI: 10.1016/0003-6870(93)90080-S](https://doi.org/10.1016/0003-6870(93)90080-S).
- **Static Posture Standards:** ISO 11226:2000 — *Ergonomics: Evaluation of static working postures*.

---

## 📄 License
This project is released under the MIT License. MediaPipe model assets are distributed under the Apache License 2.0.
