import os
import re
from build_academic_report import build_docx

MD_IN = os.path.abspath("docs/ErgoSnap_Project_Report.md")
DOCX_OUT = os.path.abspath("docs/ErgoSnap_Project_Report.docx")
ARTIFACT_MD = r"C:\Users\ruthi\.gemini\antigravity\brain\e70f7897-e8d8-4cc0-bfe2-25a9d6950c67\report.md"
ARTIFACT_IMG_DIR = r"/C:/Users/ruthi/.gemini/antigravity/brain/e70f7897-e8d8-4cc0-bfe2-25a9d6950c67/screenshots"

with open(MD_IN, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update test counts & software verification
text = re.sub(r'29 deterministic unit tests', '38 deterministic unit tests', text)
text = re.sub(r'29 automated unit tests', '38 automated unit tests', text)
text = re.sub(r'29 automated Vitest unit tests', '38 automated Vitest unit tests', text)
text = re.sub(r'six-section dashboard', 'eight-section research dashboard', text, flags=re.IGNORECASE)
text = re.sub(r'Six-Section Dashboard', 'Eight-Section Research Dashboard', text)

# 2. Replace ASCII boxes with actual image embeddings
# Figure 8.1
fig8_1_ascii = r'\+---------------------------------------------------------------------------------------------------\+\s*\| FIGURE 8\.1: IMAGE UPLOAD AND VALIDATION INTERFACE[\s\S]*?\+---------------------------------------------------------------------------------------------------\+\s*```'
fig8_1_replacement = '![Figure 8.1: ErgoSnap Image Upload & File Integrity Validation Interface](screenshots/01_upload_interface.png)\n```'
text = re.sub(fig8_1_ascii, fig8_1_replacement, text)

# Figure 8.2
fig8_2_ascii = r'\+---------------------------------------------------------------------------------------------------\+\s*\| FIGURE 8\.2: INTERACTIVE SKELETON OVERLAY AND JOINT CALLOUTS[\s\S]*?\+---------------------------------------------------------------------------------------------------\+\s*```'
fig8_2_replacement = '![Figure 8.2: Monocular Pose Landmark Detection & Manual Inputs Workbench](screenshots/03_pose_landmark_workbench.png)\n```'
text = re.sub(fig8_2_ascii, fig8_2_replacement, text)

# Figure 9.1
fig9_1_ascii = r'\+---------------------------------------------------------------------------------------------------\+\s*\| FIGURE 9\.1: RULA MULTI-TABLE INTERMEDIATE BREAKDOWN INTERFACE[\s\S]*?\+---------------------------------------------------------------------------------------------------\+\s*```'
fig9_1_replacement = '![Figure 9.1: Multiaxial RULA Risk Radar Plot & Intervention Sensitivity Simulation](screenshots/07_dashboard_rula_sensitivity.png)\n```'
text = re.sub(fig9_1_ascii, fig9_1_replacement, text)

# Figure 10.1 (Dashboard)
fig10_1_ascii = r'\+---------------------------------------------------------------------------------------------------\+\s*\| FIGURE 10\.1: ERGOSNAP SIX-SECTION ENGINEERING DASHBOARD[\s\S]*?\+---------------------------------------------------------------------------------------------------\+\s*```'
fig10_1_replacement = '''![Figure 10.1: Ergonomic Engineering Analytics Dashboard — Executive Overview & KPIs](screenshots/04_dashboard_overview.png)

![Figure 10.2: ISO 11226 Postural Comfort Zone & Angle Deviation Gauges](screenshots/06_dashboard_angles_neutral_zones.png)

![Figure 10.3: Anatomical Musculoskeletal Disorder (WMSD) Risk Heatmap](screenshots/08_dashboard_wmsd_heatmap.png)

![Figure 10.4: ISO 9241-5 Workstation Dimensional Layout & Biomechanical Torque Analysis](screenshots/09_dashboard_workstation_fit.png)

![Figure 10.5: Lean Ergonomics 2×2 Corrective Action Priority Matrix](screenshots/10_dashboard_corrective_action_matrix.png)
```'''
text = re.sub(fig10_1_ascii, fig10_1_replacement, text)

# Figure 11.1 (PDF Report & Validation)
fig11_1_ascii = r'\+---------------------------------------------------------------------------------------------------\+\s*\| FIGURE 11\.1: SAMPLE EXPORTED A4 TECHNICAL ERGONOMIC REPORT \(PDF\)[\s\S]*?\+---------------------------------------------------------------------------------------------------\+\s*```'
fig11_1_replacement = '''![Figure 11.1: Empirical Statistical Validation Engine & Bland-Altman Agreement Charts](screenshots/11_validation_engine.png)

![Figure 11.2: Official Technical Ergonomic Assessment Publication Document & Vector PDF Export](screenshots/12_technical_report_preview.png)
```'''
text = re.sub(fig11_1_ascii, fig11_1_replacement, text)

# Write back to docs/ErgoSnap_Project_Report.md
with open(MD_IN, "w", encoding="utf-8") as f:
    f.write(text)
print("[OK] Updated docs/ErgoSnap_Project_Report.md with image links and test metrics.")

# Build the docx with embedded images
build_docx(text, DOCX_OUT)

# Create artifact report with absolute image paths for rich rendering in Chat UI
artifact_text = text
artifact_text = artifact_text.replace("screenshots/", f"{ARTIFACT_IMG_DIR}/")

with open(ARTIFACT_MD, "w", encoding="utf-8") as f:
    f.write(artifact_text)
print(f"[OK] Created Artifact Report at: {ARTIFACT_MD}")
