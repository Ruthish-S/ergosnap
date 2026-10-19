# Scientific Validation & Experimental Protocol

## 1. Experimental Cohort Structure
To prevent data contamination and ensure defensible evaluation:

| Cohort | Purpose | Inclusion Criteria |
| :--- | :--- | :--- |
| **Development Cohort** | User interface testing, debugging, and input validation | Synthetic canvas images, pilot test images |
| **Validation Cohort** | Hyperparameter threshold verification (e.g. confidence $\ge 0.5$) | Paired trials with known camera angles |
| **Final Evaluation Cohort** | Frozen pipeline statistical benchmarking | Independent human-subject workplace tasks |

> **Unit of Generalization:** An independent participant or unique workstation task constitutes an observation. Multiple photographs of the exact same posture must not be counted as separate independent trials.

---

## 2. Reference Standard Instrumentation
For scientific agreement evaluation, automated outputs are compared against:
1. **Continuous Angles:** Manual physical goniometer or multi-camera optical motion-capture reference.
2. **RULA Grand Score:** Certified professional ergonomist scoring using an authorized standard RULA worksheet.

---

## 3. Data Recording Protocol
For each paired observation, the following parameters are logged:
- Assessment Identifier and timestamp
- View angle category (Sagittal profile, Frontal, Oblique)
- Automated landmark coordinates and visibility values
- Automated joint angle calculations ($^\circ$)
- Independent manual reference angles ($^\circ$)
- Complete intermediate segment scores (Upper arm, lower arm, wrist, neck, trunk, legs)
- Independent manual RULA Grand Score ($1\text{–}7$)
- Disagreement notes and reasons for exclusion (if unscorable)
