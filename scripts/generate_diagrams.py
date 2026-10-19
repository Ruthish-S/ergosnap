import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

OUT_DIR = os.path.abspath('docs/screenshots')
os.makedirs(OUT_DIR, exist_ok=True)

# Set global styles
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

def create_rula_flowchart():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color palette
    c_blue = '#1E3A8A'
    c_teal = '#0D9488'
    c_slate = '#334155'
    c_red = '#DC2626'
    c_amber = '#D97706'
    c_light_blue = '#EFF6FF'
    c_light_teal = '#F0FDFA'
    c_light_amber = '#FFFBEB'
    c_border = '#64748B'

    # Title
    ax.text(50, 96, "RULA POSTURAL SCORING WORKFLOW (McAtamney & Corlett, 1993)", 
            ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')

    # Group A Box (Left)
    rect_a = patches.FancyBboxPatch((4, 48), 42, 43, boxstyle="round,pad=1.5", 
                                    fc=c_light_blue, ec=c_blue, lw=1.8)
    ax.add_patch(rect_a)
    ax.text(25, 88, "GROUP A: UPPER LIMB KINEMATICS", ha='center', va='center', 
            fontsize=10, fontweight='bold', color=c_blue)
    ax.text(25, 82, "• Upper Arm Flexion / Ext (-20° to >90°): Score 1–6\n"
                    "• Lower Arm Flexion (60°–100°): Score 1–3\n"
                    "• Wrist Flexion / Deviation (-15° to >15°): Score 1–4\n"
                    "• Wrist Twist (Pronation/Supination): Score 1–2", 
            ha='center', va='center', fontsize=8, color=c_slate)

    # Table A Box
    rect_ta = patches.FancyBboxPatch((10, 52), 30, 8, boxstyle="round,pad=1", 
                                     fc='#FFFFFF', ec=c_blue, lw=1.5)
    ax.add_patch(rect_ta)
    ax.text(25, 56, "TABLE A MATRIX LOOKUP\nIntermediate Score (1–8)", ha='center', va='center', 
            fontsize=8.5, fontweight='bold', color=c_blue)

    # Group B Box (Right)
    rect_b = patches.FancyBboxPatch((54, 48), 42, 43, boxstyle="round,pad=1.5", 
                                    fc=c_light_teal, ec=c_teal, lw=1.8)
    ax.add_patch(rect_b)
    ax.text(75, 88, "GROUP B: NECK, TRUNK & LEGS", ha='center', va='center', 
            fontsize=10, fontweight='bold', color=c_teal)
    ax.text(75, 82, "• Neck Flexion / Extension (0° to >20°): Score 1–6\n"
                    "• Trunk Inclination (0° to >60°): Score 1–6\n"
                    "• Leg Support & Weight Distribution: Score 1–2", 
            ha='center', va='center', fontsize=8, color=c_slate)

    # Table B Box
    rect_tb = patches.FancyBboxPatch((60, 52), 30, 8, boxstyle="round,pad=1", 
                                     fc='#FFFFFF', ec=c_teal, lw=1.5)
    ax.add_patch(rect_tb)
    ax.text(75, 56, "TABLE B MATRIX LOOKUP\nIntermediate Score (1–9)", ha='center', va='center', 
            fontsize=8.5, fontweight='bold', color=c_teal)

    # Adjustments Row
    rect_adj_a = patches.FancyBboxPatch((10, 36), 30, 8, boxstyle="round,pad=1", 
                                        fc=c_light_amber, ec=c_amber, lw=1.2)
    ax.add_patch(rect_adj_a)
    ax.text(25, 40, "+ Muscle Use (0/1) + Load/Force (0–3)\nScore A = Table A + Adjustments", 
            ha='center', va='center', fontsize=7.5, fontweight='bold', color='#92400E')

    rect_adj_b = patches.FancyBboxPatch((60, 36), 30, 8, boxstyle="round,pad=1", 
                                        fc=c_light_amber, ec=c_amber, lw=1.2)
    ax.add_patch(rect_adj_b)
    ax.text(75, 40, "+ Muscle Use (0/1) + Load/Force (0–3)\nScore B = Table B + Adjustments", 
            ha='center', va='center', fontsize=7.5, fontweight='bold', color='#92400E')

    # Arrows downward
    ax.annotate('', xy=(25, 45), xytext=(25, 51), arrowprops=dict(arrowstyle="->", lw=1.5, color=c_blue))
    ax.annotate('', xy=(75, 45), xytext=(75, 51), arrowprops=dict(arrowstyle="->", lw=1.5, color=c_teal))

    # Converge to Table C
    ax.annotate('', xy=(42, 27), xytext=(25, 35), arrowprops=dict(arrowstyle="->", lw=1.5, color=c_blue))
    ax.annotate('', xy=(58, 27), xytext=(75, 35), arrowprops=dict(arrowstyle="->", lw=1.5, color=c_teal))

    # Table C Grand Score Box
    rect_tc = patches.FancyBboxPatch((32, 19), 36, 10, boxstyle="round,pad=1.5", 
                                     fc='#FFFFFF', ec=c_red, lw=2)
    ax.add_patch(rect_tc)
    ax.text(50, 24, "TABLE C LOOKUP MATRIX\nInput: (Score A, Score B) → Grand Score (1–7)", 
            ha='center', va='center', fontsize=9, fontweight='bold', color=c_red)

    # Action Levels Output
    ax.annotate('', xy=(50, 11), xytext=(50, 18), arrowprops=dict(arrowstyle="->", lw=2, color=c_red))

    rect_act = patches.FancyBboxPatch((15, 2), 70, 8, boxstyle="round,pad=1.5", 
                                      fc='#0F172A', ec='#000000', lw=1.5)
    ax.add_patch(rect_act)
    ax.text(50, 6, "ACTION LEVEL 1 (1–2): Acceptable  |  ACTION LEVEL 2 (3–4): Investigate Further\n"
                   "ACTION LEVEL 3 (5–6): Change Soon  |  ACTION LEVEL 4 (7): Immediate Action Required", 
            ha='center', va='center', fontsize=7.5, fontweight='bold', color='#FFFFFF')

    plt.tight_layout()
    out_path = os.path.join(OUT_DIR, 'diag_rula_flowchart.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Created RULA Flowchart: {out_path}")

def create_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 7), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "ERGOSNAP ANALYTICS — FOUR-LAYER SYSTEM ARCHITECTURE", 
            ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')

    layers = [
        ("LAYER 1: PRESENTATION & CLIENT UI", 
         "React 19 + TypeScript + Tailwind CSS v4\n"
         "• Drag-and-drop Image Uploader with binary EXIF parsing\n"
         "• Interactive SVG Pose Visualizer with dynamic joint angle badges & zoom controls\n"
         "• Eight-Tab Engineering Research Dashboard & A4 Publication Document Viewer",
         76, '#EFF6FF', '#1E40AF'),
        ("LAYER 2: COMPUTER VISION & LANDMARK VALIDATION", 
         "@mediapipe/tasks-vision (Pose Landmarker WebAssembly/WebGL)\n"
         "• 33-point body landmark inference on local device GPU/CPU (Zero cloud upload)\n"
         "• Landmark completeness gate (Req >= 0.5 confidence across 8 key limb vertices)\n"
         "• Foreshortening detector, camera view classification & quality classification",
         54, '#F0FDF4', '#15803D'),
        ("LAYER 3: BIOMECHANICAL MODELING & RULA SCORING ENGINE", 
         "Vector Geometry (Trigonometry with Cosine Clamping) + RULA Rules\n"
         "• Planar joint angles: Upper Arm, Forearm, Wrist, Neck & Trunk inclination\n"
         "• McAtamney & Corlett Tables A, B & C with verified boundary guards\n"
         "• Chaffin Glenohumeral Moment Arm (M = F · L · sin θ), NIOSH CERI & ISO 11226 Zones",
         32, '#FFFBEB', '#B45309'),
        ("LAYER 4: EXPORT, VERIFICATION & VALIDATION ENGINE", 
         "jsPDF + jsPDF-AutoTable + Recharts + Vitest Suite (38 unit tests)\n"
         "• Client-side vector A4 technical report compiler with embedded photographic analysis\n"
         "• Raw CSV assessment dataset exporter (strict null-integrity preserve)\n"
         "• Empirical validation engine (MAE, signed bias, Bland-Altman limits & Cohen's Kappa)",
         10, '#FDF2F8', '#BE185D'),
    ]

    for title, desc, y_bottom, fc, ec in layers:
        rect = patches.FancyBboxPatch((8, y_bottom), 84, 18, boxstyle="round,pad=1.2", 
                                      fc=fc, ec=ec, lw=1.6)
        ax.add_patch(rect)
        ax.text(12, y_bottom + 14.5, title, ha='left', va='center', 
                fontsize=9.5, fontweight='bold', color=ec)
        ax.text(12, y_bottom + 7, desc, ha='left', va='center', 
                fontsize=7.8, color='#334155', linespacing=1.3)

    # Connecting arrows
    for y in [75, 53, 31]:
        ax.annotate('', xy=(50, y), xytext=(50, y + 2), 
                    arrowprops=dict(arrowstyle="->", lw=1.8, color='#0F172A'))

    plt.tight_layout()
    out_path = os.path.join(OUT_DIR, 'diag_system_architecture.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Created System Architecture: {out_path}")

def create_application_workflow():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97, "ERGOSNAP ANALYTICS — END-TO-END APPLICATION WORKFLOW PIPELINE", 
            ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')

    # Step 1: Upload
    p1 = patches.FancyBboxPatch((35, 87), 30, 6, boxstyle="round,pad=1", fc='#F1F5F9', ec='#475569', lw=1.2)
    ax.add_patch(p1)
    ax.text(50, 90, "1. Workplace Photograph Upload (JPEG/PNG/WebP)", ha='center', va='center', fontsize=8, fontweight='bold')

    # Gate 1: MIME & EXIF
    p2 = patches.FancyBboxPatch((35, 75), 30, 6, boxstyle="round,pad=1", fc='#EFF6FF', ec='#2563EB', lw=1.2)
    ax.add_patch(p2)
    ax.text(50, 78, "2. EXIF Orientation Parsing & Normalization", ha='center', va='center', fontsize=8, fontweight='bold', color='#1D4ED8')

    # Step 3: MediaPipe
    p3 = patches.FancyBboxPatch((35, 63), 30, 6, boxstyle="round,pad=1", fc='#F0FDF4', ec='#16A34A', lw=1.2)
    ax.add_patch(p3)
    ax.text(50, 66, "3. MediaPipe Pose 33 Landmark Inference", ha='center', va='center', fontsize=8, fontweight='bold', color='#15803D')

    # Gate 2: Quality Gate Diamond
    d_points = [(50, 56), (65, 51), (50, 46), (35, 51)]
    diamond = patches.Polygon(d_points, fc='#FEF3C7', ec='#D97706', lw=1.5)
    ax.add_patch(diamond)
    ax.text(50, 51, "Quality Gate:\nReq Landmarks >= 0.5?", ha='center', va='center', fontsize=7.2, fontweight='bold', color='#B45309')

    # Failure Branch
    p_fail = patches.FancyBboxPatch((74, 48), 22, 6, boxstyle="round,pad=1", fc='#FEE2E2', ec='#DC2626', lw=1.2)
    ax.add_patch(p_fail)
    ax.text(85, 51, "Flag 'Unscorable' / Re-shoot\nWithhold Incomplete RULA", ha='center', va='center', fontsize=6.8, fontweight='bold', color='#991B1B')
    ax.annotate('NO', xy=(74, 51), xytext=(66, 51), arrowprops=dict(arrowstyle="->", lw=1.2, color='#DC2626'), fontsize=7.5, fontweight='bold', color='#DC2626')

    # Success Branch
    p4 = patches.FancyBboxPatch((35, 35), 30, 6, boxstyle="round,pad=1", fc='#F0FDFA', ec='#0D9488', lw=1.2)
    ax.add_patch(p4)
    ax.text(50, 38, "4. 2D Vector Angles & Clamping", ha='center', va='center', fontsize=8, fontweight='bold', color='#0F766E')
    ax.annotate('YES', xy=(50, 42), xytext=(50, 45), arrowprops=dict(arrowstyle="->", lw=1.2, color='#16A34A'), fontsize=7.5, fontweight='bold', color='#16A34A')

    # Step 5: Manual Inputs & RULA
    p5 = patches.FancyBboxPatch((35, 23), 30, 6, boxstyle="round,pad=1", fc='#FFF7ED', ec='#EA580C', lw=1.2)
    ax.add_patch(p5)
    ax.text(50, 26, "5. Manual Task Inputs + RULA Tables A, B, C", ha='center', va='center', fontsize=8, fontweight='bold', color='#C2410C')

    # Step 6: Visualizations & PDF
    p6_a = patches.FancyBboxPatch((10, 8), 36, 9, boxstyle="round,pad=1", fc='#F3E8FF', ec='#9333EA', lw=1.2)
    ax.add_patch(p6_a)
    ax.text(28, 12.5, "6A. Interactive Research Dashboard\n(8 Tabs: Radar, Heatmap, ISO Zones)", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#7E22CE')

    p6_b = patches.FancyBboxPatch((54, 8), 36, 9, boxstyle="round,pad=1", fc='#FCE7F3', ec='#DB2777', lw=1.2)
    ax.add_patch(p6_b)
    ax.text(72, 12.5, "6B. Automated A4 Technical PDF Report\n(Embedded Photo, Radar & Heatmap)", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#BE185D')

    # Connecting arrows
    ax.annotate('', xy=(50, 82), xytext=(50, 86), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))
    ax.annotate('', xy=(50, 70), xytext=(50, 74), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))
    ax.annotate('', xy=(50, 57), xytext=(50, 62), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))
    ax.annotate('', xy=(50, 30), xytext=(50, 34), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))
    ax.annotate('', xy=(28, 18), xytext=(45, 22), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))
    ax.annotate('', xy=(72, 18), xytext=(55, 22), arrowprops=dict(arrowstyle="->", lw=1.2, color='#334155'))

    plt.tight_layout()
    out_path = os.path.join(OUT_DIR, 'diag_application_workflow.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Created Application Workflow: {out_path}")

create_rula_flowchart()
create_system_architecture()
create_application_workflow()
