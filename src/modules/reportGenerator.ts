/**
 * PDF and CSV report generator for ErgoSnap Analytics.
 *
 * Requirements & Aesthetics:
 * - Uses jsPDF and jspdf-autotable for client-side A4 technical reporting.
 * - Sourced strictly from the canonical Assessment data object (no recomputing scores).
 * - Implements executive engineering aesthetics: Deep Midnight Slate (#0F172A), Red accent (#DC2626),
 *   high-contrast typography, KPI callout summary cards, running headers & footers,
 *   embedded skeletal posture photos (Figure 1), multiaxial radar spider plots (Figure 2),
 *   intervention sensitivity bar charts (Figure 3), anatomical WMSD heatmaps (Figure 4),
 *   ISO 11226 neutral comfort envelopes, and authoritative academic citations.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Assessment, Recommendation } from '../types/assessment';
import { REFERENCES } from '../data/references';
import { RULA_TABLES_VERSION } from '../data/rulaTables';
import { buildWmsdRiskMap } from './wmsdRiskMapping';
import { estimateShoulderMomentArm, evaluateExposureRisk } from './biomechanicalAnalysis';
import { analyzeWorkstationFit } from './workstationRecommender';
import { computeSensitivityAnalysis } from './sensitivityAnalysis';

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const MARGIN = 15; // mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Executive Design Tokens
const COLOR_PRIMARY: [number, number, number] = [15, 23, 42]; // Slate-900
const COLOR_ACCENT: [number, number, number] = [220, 38, 38]; // Crimson Red
const COLOR_SLATE_800: [number, number, number] = [30, 41, 59];
const COLOR_MUTED: [number, number, number] = [100, 116, 139]; // Slate-500
const COLOR_LIGHT_BG: [number, number, number] = [248, 250, 252]; // Slate-50
const COLOR_BORDER: [number, number, number] = [226, 232, 240]; // Slate-200
const COLOR_EMERALD: [number, number, number] = [16, 185, 129];
const COLOR_AMBER: [number, number, number] = [245, 158, 11];

export interface ReportVisualAssets {
  annotatedPhotoUrl?: string | null;
  radarChartUrl?: string | null;
  sensitivityChartUrl?: string | null;
  wmsdHeatmapUrl?: string | null;
}

export function generateReport(
  assessment: Assessment,
  visualInput?: ReportVisualAssets | string | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Normalize visual assets input
  const visuals: ReportVisualAssets =
    typeof visualInput === 'string'
      ? { annotatedPhotoUrl: visualInput }
      : visualInput || {};

  const wmsdMap = buildWmsdRiskMap(assessment.rulaAssessment, assessment.angles);
  const shoulderMoment = estimateShoulderMomentArm(assessment.angles);
  const exposureRisk = evaluateExposureRisk(assessment.rulaAssessment, assessment.manualInputs);
  const workstationFit = analyzeWorkstationFit(assessment.landmarks);

  const getAngleVal = (name: string): number | null => {
    const match = assessment.angles.find((a) =>
      a.name.toLowerCase().includes(name.toLowerCase()) && a.isValid
    );
    return match?.valueDegrees ?? null;
  };

  const sensitivityReport = computeSensitivityAnalysis(
    assessment.rulaAssessment,
    {
      upperArmDeg: getAngleVal('upper arm'),
      lowerArmDeg: getAngleVal('lower arm'),
      wristDeg: getAngleVal('wrist'),
      neckDeg: getAngleVal('neck'),
      trunkDeg: getAngleVal('trunk'),
    },
    assessment.manualInputs
  );

  let currentY = MARGIN;

  // ==========================================
  // PAGE 1: TITLE, EXECUTIVE SUMMARY & FIGURE 1
  // ==========================================

  // Executive Top Banner
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, PAGE_WIDTH, 26, 'F');
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 26, PAGE_WIDTH, 2, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ERGOSNAP ANALYTICS', MARGIN, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Industrial Ergonomic Posture Assessment & Engineering Report', MARGIN + 62, 14);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`DOC-ID: ${assessment.assessmentId.slice(0, 8).toUpperCase()}`, PAGE_WIDTH - MARGIN - 30, 14);

  currentY = 35;

  // Assessment Title Block
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(assessment.title || 'Workplace Posture Assessment', MARGIN, currentY);
  currentY += 6;

  // Metadata Strip
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Task: ${assessment.taskType}  |  Assessor: ${assessment.assessor}  |  Date: ${assessment.date}  |  Standard: ISO 11226 & RULA`,
    MARGIN,
    currentY
  );
  currentY += 7;

  // 3-Box Executive KPI Summary Grid
  const cardWidth = (CONTENT_WIDTH - 8) / 3;
  const cardHeight = 22;
  const rula = assessment.rulaAssessment;
  const finalScore = rula.segmentScores.finalScore;
  const actionLevel = rula.segmentScores.actionLevel;

  // Card 1: RULA Grand Score
  doc.setFillColor(...COLOR_LIGHT_BG);
  doc.setDrawColor(...COLOR_BORDER);
  doc.roundedRect(MARGIN, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('RULA GRAND SCORE', MARGIN + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(
    finalScore !== null && finalScore >= 7 ? COLOR_ACCENT[0] : finalScore !== null && finalScore >= 5 ? COLOR_AMBER[0] : COLOR_PRIMARY[0],
    finalScore !== null && finalScore >= 7 ? COLOR_ACCENT[1] : finalScore !== null && finalScore >= 5 ? COLOR_AMBER[1] : COLOR_PRIMARY[1],
    finalScore !== null && finalScore >= 7 ? COLOR_ACCENT[2] : finalScore !== null && finalScore >= 5 ? COLOR_AMBER[2] : COLOR_PRIMARY[2]
  );
  doc.text(finalScore !== null ? `${finalScore} / 7` : 'Incomplete', MARGIN + 4, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(actionLevel !== null ? `Action Level ${actionLevel} of 4` : 'Pending manual inputs', MARGIN + 4, currentY + 19);

  // Card 2: Cumulative Exposure Index (CERI)
  const card2X = MARGIN + cardWidth + 4;
  doc.setFillColor(...COLOR_LIGHT_BG);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('CUMULATIVE EXPOSURE (CERI)', card2X + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(
    exposureRisk.ceriScore !== null ? `${exposureRisk.ceriScore} / 10.0` : 'Pending',
    card2X + 4,
    currentY + 14
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Shift Exposure: ${exposureRisk.estimatedShiftExposureRisk.toUpperCase()}`,
    card2X + 4,
    currentY + 19
  );

  // Card 3: Glenohumeral Torque Index
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(...COLOR_LIGHT_BG);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('GLENOHUMERAL TORQUE', card3X + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(
    shoulderMoment.dimensionlessMomentIndex !== null
      ? `${(shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0)}% Env`
      : 'N/A',
    card3X + 4,
    currentY + 14
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`Load State: ${shoulderMoment.riskLevel.toUpperCase()}`, card3X + 4, currentY + 19);

  currentY += cardHeight + 7;

  // Section 1: Executive Engineering Summary Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('1. Executive Engineering Summary', MARGIN, currentY);
  currentY += 4;

  const validAnglesCount = assessment.angles.filter((a) => a.isValid).length;
  const totalAnglesCount = assessment.angles.length;

  const summaryText = [
    `Evaluation conducted via deterministic 2D landmark coordinate estimation (MediaPipe Pose Tasks-Vision).`,
    `A total of ${validAnglesCount} of ${totalAnglesCount} planar joint angles were successfully evaluated against biomechanical bounds.`,
    rula.isComplete && finalScore !== null
      ? `The resulting RULA Grand Score is ${finalScore}/7 (Action Level ${actionLevel}/4).`
      : `The assessment remains preliminary pending verification of manual task inputs.`,
    exposureRisk.ceriScore !== null
      ? `Estimated cumulative task exposure index is rated ${exposureRisk.ceriScore}/10.0.`
      : '',
    `Quality status: ${assessment.qualityChecks.overallStatus.toUpperCase()} (Camera viewpoint: ${assessment.qualityChecks.viewSuitability.toUpperCase()}).`,
  ].filter(Boolean).join(' ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_SLATE_800);
  const splitSummary = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
  doc.text(splitSummary, MARGIN, currentY);
  currentY += splitSummary.length * 3.8 + 5;

  // Section 2: Photographic Posture & Skeletal Joint Tracking (Figure 1)
  if (visuals.annotatedPhotoUrl) {
    try {
      const imgWidthMm = 90;
      const imgHeightMm = (assessment.imageMetadata.height && assessment.imageMetadata.width)
        ? Math.min(76, (assessment.imageMetadata.height / assessment.imageMetadata.width) * imgWidthMm)
        : 68;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('2. Photographic Posture & Skeletal Tracking Analysis (Figure 1)', MARGIN, currentY);
      currentY += 3.5;

      // Draw Photo Card Frame
      doc.setDrawColor(...COLOR_BORDER);
      doc.setFillColor(255, 255, 255);
      doc.rect(MARGIN, currentY, imgWidthMm + 2, imgHeightMm + 2, 'FD');
      doc.addImage(visuals.annotatedPhotoUrl, 'JPEG', MARGIN + 1, currentY + 1, imgWidthMm, imgHeightMm);

      // Specs Panel on the Right
      const textX = MARGIN + imgWidthMm + 8;
      let textY = currentY + 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('Computer Vision Pose Specs', textX, textY);
      textY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`Image: ${assessment.imageMetadata.filename}`, textX, textY); textY += 3.8;
      doc.text(`Resolution: ${assessment.imageMetadata.width} × ${assessment.imageMetadata.height} px`, textX, textY); textY += 3.8;
      doc.text(`Model: ${assessment.modelInfo.modelName}`, textX, textY); textY += 3.8;
      doc.text(`Landmark Completeness: ${(assessment.qualityChecks.landmarkCompleteness * 100).toFixed(0)}%`, textX, textY); textY += 3.8;
      doc.text(`View Angle Suitability: ${assessment.qualityChecks.viewSuitability.toUpperCase()}`, textX, textY); textY += 3.8;
      doc.text(`Verified Joint Angles: ${validAnglesCount} / ${totalAnglesCount}`, textX, textY); textY += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      const disclaimer = 'Figure 1: Planar 2D kinematic landmark projection with angle callouts estimated directly on client device.';
      const splitDisc = doc.splitTextToSize(disclaimer, CONTENT_WIDTH - (imgWidthMm + 10));
      doc.text(splitDisc, textX, textY);

      currentY += imgHeightMm + 7;
    } catch (e) {
      console.warn('Failed to embed annotated image in PDF:', e);
    }
  }

  // Section 3: Joint Angle Measurements & ISO 11226 Comparison
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('3. Joint Angle Measurements & ISO 11226 Postural Envelopes', MARGIN, currentY);
  currentY += 2.5;

  const angleTableRows = assessment.angles.map((a) => {
    const wmsdReg = wmsdMap.regions.find((r) =>
      a.name.toLowerCase().includes(r.region.split('/')[0].toLowerCase().trim())
    );

    const neutralDesc = wmsdReg
      ? `${wmsdReg.neutralRangeDeg[0]}°–${wmsdReg.neutralRangeDeg[1]}°`
      : 'N/A';

    const dev = wmsdReg && wmsdReg.deviationDeg && wmsdReg.deviationDeg > 0
      ? `+${wmsdReg.deviationDeg.toFixed(0)}° Deviation`
      : (wmsdReg && a.valueDegrees !== null ? 'Within Neutral Zone' : 'N/A');

    return [
      a.name,
      a.valueDegrees !== null ? `${a.valueDegrees}°` : 'Unavailable',
      neutralDesc,
      dev,
      a.isValid ? 'Valid' : 'Occluded',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Measurement', 'Measured (°)', 'ISO 11226 Comfort Zone', 'Deviation Status', 'Validation']],
    body: angleTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_PRIMARY,
      cellPadding: 1.8,
    },
    alternateRowStyles: {
      fillColor: COLOR_LIGHT_BG,
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // ==========================================
  // PAGE 2: RULA AUDIT, RADAR & SENSITIVITY
  // ==========================================
  doc.addPage();
  currentY = MARGIN + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('4. RULA Posture Audit & Multiaxial Risk Profile (Figure 2)', MARGIN, currentY);
  currentY += 3;

  // Radar chart on top-right of Page 2
  if (visuals.radarChartUrl) {
    try {
      const radarWidthMm = 62;
      const radarHeightMm = 62;

      doc.setDrawColor(...COLOR_BORDER);
      doc.rect(PAGE_WIDTH - MARGIN - radarWidthMm - 2, currentY, radarWidthMm + 2, radarHeightMm + 2);
      doc.addImage(visuals.radarChartUrl, 'PNG', PAGE_WIDTH - MARGIN - radarWidthMm - 1, currentY + 1, radarWidthMm, radarHeightMm);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text('Figure 2: Multiaxial RULA Risk Radar', PAGE_WIDTH - MARGIN - radarWidthMm, currentY + radarHeightMm + 6);
    } catch (e) {
      console.warn('Failed to embed radar chart in PDF:', e);
    }
  }

  const ss = rula.segmentScores;
  const rulaTableRows = [
    ['Upper Arm Posture Score', ss.upperArm !== null ? String(ss.upperArm) : 'N/A', '1–6'],
    ['Lower Arm Posture Score', ss.lowerArm !== null ? String(ss.lowerArm) : 'N/A', '1–3'],
    ['Wrist & Twist Score', `${ss.wrist ?? 'N/A'} (Twist: ${ss.wristTwist ?? 'N/A'})`, 'Wrist: 1–4, Twist: 1–2'],
    ['Table A Intermediate Score', ss.tableAScore !== null ? String(ss.tableAScore) : 'N/A', 'Matrix lookup'],
    ['Upper Limb Score A (+Load/Muscle)', ss.scoreA !== null ? String(ss.scoreA) : 'N/A', 'Table A + adjustments'],
    ['Neck Posture Score', ss.neck !== null ? String(ss.neck) : 'N/A', '1–6'],
    ['Trunk Posture Score', ss.trunk !== null ? String(ss.trunk) : 'N/A', '1–6'],
    ['Leg Support Score', ss.legs !== null ? String(ss.legs) : 'N/A', '1–2'],
    ['Table B Intermediate Score', ss.tableBScore !== null ? String(ss.tableBScore) : 'N/A', 'Matrix lookup'],
    ['Neck/Trunk Score B (+Load/Muscle)', ss.scoreB !== null ? String(ss.scoreB) : 'N/A', 'Table B + adjustments'],
    ['Table C Final Grand Score', ss.finalScore !== null ? `${ss.finalScore} / 7` : 'Incomplete', '1–7'],
    ['Action Level Category', ss.actionLevel !== null ? `Level ${ss.actionLevel}` : 'Pending Inputs', 'Level 1–4'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Stage / Segment', 'Score', 'Standard Range']],
    body: rulaTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_PRIMARY,
      cellPadding: 1.5,
    },
    tableWidth: visuals.radarChartUrl ? CONTENT_WIDTH - 68 : CONTENT_WIDTH,
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = Math.max(doc.lastAutoTable.finalY + 8, visuals.radarChartUrl ? currentY + 70 : doc.lastAutoTable.finalY + 8);

  // Section 5: Intervention Sensitivity Analysis Plot & Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('5. Ergonomic Intervention Sensitivity Analysis (Figure 3)', MARGIN, currentY);
  currentY += 3;

  if (visuals.sensitivityChartUrl) {
    try {
      const sensWidthMm = 105;
      const sensHeightMm = 46;

      doc.setDrawColor(...COLOR_BORDER);
      doc.rect(MARGIN, currentY, sensWidthMm + 2, sensHeightMm + 2);
      doc.addImage(visuals.sensitivityChartUrl, 'PNG', MARGIN + 1, currentY + 1, sensWidthMm, sensHeightMm);

      const sensTextX = MARGIN + sensWidthMm + 8;
      let sensTextY = currentY + 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('Intervention Priority', sensTextX, sensTextY);
      sensTextY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`Primary Driver: ${sensitivityReport.topImpactSegment ?? 'None'}`, sensTextX, sensTextY);
      sensTextY += 4;

      const sensDesc = 'Simulates reduction in RULA Grand Score if a segment is repositioned by 1 score tier per McAtamney & Corlett Table C.';
      const splitSens = doc.splitTextToSize(sensDesc, CONTENT_WIDTH - (sensWidthMm + 10));
      doc.text(splitSens, sensTextX, sensTextY);
      sensTextY += splitSens.length * 3.5 + 2;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.text('Figure 3: Single-parameter score delta sensitivity plot', MARGIN, currentY + sensHeightMm + 6);

      currentY += sensHeightMm + 10;
    } catch (e) {
      console.warn('Failed to embed sensitivity chart in PDF:', e);
    }
  }

  // ==========================================
  // PAGE 3: WMSD RISK, HEATMAP & WORKSTATION
  // ==========================================
  doc.addPage();
  currentY = MARGIN + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('6. WMSD Risk Mapping & Anatomical Heatmap (Figure 4)', MARGIN, currentY);
  currentY += 3;

  if (visuals.wmsdHeatmapUrl) {
    try {
      const wmsdWidthMm = 52;
      const wmsdHeightMm = 56;

      doc.setDrawColor(...COLOR_BORDER);
      doc.rect(PAGE_WIDTH - MARGIN - wmsdWidthMm - 2, currentY, wmsdWidthMm + 2, wmsdHeightMm + 2);
      doc.addImage(visuals.wmsdHeatmapUrl, 'PNG', PAGE_WIDTH - MARGIN - wmsdWidthMm - 1, currentY + 1, wmsdWidthMm, wmsdHeightMm);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text('Figure 4: EU-OSHA WMSD Heatmap', PAGE_WIDTH - MARGIN - wmsdWidthMm, currentY + wmsdHeightMm + 6);
    } catch (e) {
      console.warn('Failed to embed WMSD heatmap in PDF:', e);
    }
  }

  const wmsdRows = wmsdMap.regions.map((r) => [
    r.region,
    r.riskLevel.toUpperCase(),
    r.score !== null ? String(r.score) : 'N/A',
    r.basis,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Anatomical Region', 'Risk Tier', 'Score', 'Biomechanical Basis']],
    body: wmsdRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_PRIMARY,
      cellPadding: 1.8,
    },
    tableWidth: visuals.wmsdHeatmapUrl ? CONTENT_WIDTH - 58 : CONTENT_WIDTH,
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 18, fontStyle: 'bold' },
      2: { cellWidth: 14 },
      3: { cellWidth: visuals.wmsdHeatmapUrl ? 42 : 100 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = Math.max(doc.lastAutoTable.finalY + 8, visuals.wmsdHeatmapUrl ? currentY + 65 : doc.lastAutoTable.finalY + 8);

  // Section 7: Biomechanical Moment & Workstation Fit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('7. Biomechanical Torque & ISO 9241-5 Workstation Dimensional Fit', MARGIN, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_SLATE_800);
  const biomechNote = `Glenohumeral shoulder torque: ${(shoulderMoment.dimensionlessMomentIndex ? (shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0) : '0')}% of maximum gravity moment envelope (M = F · L · sin θ). Task muscle demand requires active upper limb elevation.`;
  const splitBio = doc.splitTextToSize(biomechNote, CONTENT_WIDTH);
  doc.text(splitBio, MARGIN, currentY);
  currentY += splitBio.length * 3.5 + 4;

  if (workstationFit.canEstimate && workstationFit.suggestions.length > 0) {
    const wsRows = workstationFit.suggestions.map((sug) => [
      sug.element,
      sug.suggestion,
      sug.reference,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Workstation Element', 'Target Dimensional Adjustment', 'Standard']],
      body: wsRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLOR_SLATE_800,
        textColor: [255, 255, 255],
        fontSize: 7.8,
        fontStyle: 'bold',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: COLOR_PRIMARY,
        cellPadding: 1.6,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 105 },
        2: { cellWidth: 35 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    // @ts-expect-error autoTable extends doc
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // ==========================================
  // PAGE 4: CORRECTIVE ACTION MATRIX & REFS
  // ==========================================
  doc.addPage();
  currentY = MARGIN + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('8. Lean Ergonomics 2×2 Corrective Action Priority Matrix', MARGIN, currentY);
  currentY += 3;

  // Classify recommendations
  const quickWins: string[] = [];
  const majorProjects: string[] = [];
  const housekeeping: string[] = [];

  assessment.recommendations.forEach((rec) => {
    const isHigh = rec.priority === 'urgent' || rec.priority === 'high';
    const text = rec.suggestedAction.toLowerCase();
    const isEasy = text.includes('raise') || text.includes('lower') || text.includes('adjust') || text.includes('reposition') || text.includes('footrest');

    if (isHigh && isEasy) quickWins.push(rec.observation);
    else if (isHigh && !isEasy) majorProjects.push(rec.observation);
    else housekeeping.push(rec.observation);
  });

  const matrixRows = [
    [
      'Quadrant I: Quick Wins (High Impact / Rapid Fix)',
      quickWins.length > 0 ? quickWins.join('; ') : 'No urgent rapid fixes',
      'Immediate action — high biomechanical benefit with minimal capital expense.',
    ],
    [
      'Quadrant II: Strategic Redesigns (High Impact / Major Scope)',
      majorProjects.length > 0 ? majorProjects.join('; ') : 'No major re-engineering items',
      'Requires workstation restructuring, tooling change, or budget allocation.',
    ],
    [
      'Quadrant III: Housekeeping Adjustments (Moderate / Low Cost)',
      housekeeping.length > 0 ? housekeeping.join('; ') : 'Postures within acceptable bounds',
      'Comfort zone fine-tuning during regular scheduled workstation maintenance.',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Matrix Quadrant', 'Identified Postural Risks', 'Engineering Guidance']],
    body: matrixRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_PRIMARY,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 60 },
      2: { cellWidth: 70 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 7;

  // Section 9: Scientific Protocol Boundaries & Limitations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('9. Scientific Limitations & Engineering Assumptions', MARGIN, currentY);
  currentY += 3.5;

  const limitations = [
    '1. 2D Planar Limitations: Single-camera 2D joint angles are susceptible to perspective foreshortening.',
    '2. Non-Diagnostic Boundary: ErgoSnap Analytics is an engineering screening instrument, not a medical diagnostic tool.',
    '3. Manual Verification: External force and muscle use must be confirmed via workstation observation.',
    '4. Calibration Constraint: Workstation and torque estimates are non-calibrated dimensionless approximations.',
    `5. Methodological Reference: Standard RULA tables per McAtamney & Corlett (1993) [${RULA_TABLES_VERSION}].`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLOR_SLATE_800);
  for (const lim of limitations) {
    doc.text(lim, MARGIN, currentY);
    currentY += 3.4;
  }
  currentY += 4;

  // Section 10: Authoritative References
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('10. Authoritative Academic & Standard References', MARGIN, currentY);
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR_MUTED);
  for (const ref of REFERENCES.slice(0, 6)) {
    const refLine = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.source}.`;
    const splitRef = doc.splitTextToSize(refLine, CONTENT_WIDTH);
    doc.text(splitRef, MARGIN, currentY);
    currentY += splitRef.length * 3 + 0.8;
  }

  // ==========================================
  // RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Pages 2+)
    if (i > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_MUTED);
      doc.text('ERGOSNAP ANALYTICS — TECHNICAL POSTURE AUDIT REPORT', MARGIN, 9);
      doc.setFont('helvetica', 'normal');
      doc.text('ISO 11226 & RULA TABLE C', PAGE_WIDTH - MARGIN - 35, 9);

      doc.setDrawColor(...COLOR_BORDER);
      doc.line(MARGIN, 11, PAGE_WIDTH - MARGIN, 11);
    }

    // Running Footer (All pages)
    doc.setDrawColor(...COLOR_BORDER);
    doc.line(MARGIN, PAGE_HEIGHT - 11, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(
      `ErgoSnap Analytics v${assessment.appVersion}  |  Doc ID: ${assessment.assessmentId.slice(0, 8).toUpperCase()}`,
      MARGIN,
      PAGE_HEIGHT - 6.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL — ERGONOMIC AUDIT ONLY', PAGE_WIDTH / 2 - 25, PAGE_HEIGHT - 6.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN - 16, PAGE_HEIGHT - 6.5);
  }

  return doc;
}

/**
 * Generate CSV export of assessment angles and scores.
 * Preserves strict scientific integrity: null values output as empty string, NEVER as 0.
 */
export function generateCsvExport(assessment: Assessment): string {
  const headers = [
    'AssessmentID',
    'Title',
    'TaskType',
    'Assessor',
    'Date',
    'ImageFilename',
    'MeasurementName',
    'ValueDegrees',
    'IsValid',
    'InvalidReason',
    'RulaUpperArm',
    'RulaLowerArm',
    'RulaWrist',
    'RulaTableAScore',
    'RulaNeck',
    'RulaTrunk',
    'RulaLegs',
    'RulaTableBScore',
    'RulaFinalGrandScore',
    'RulaActionLevel',
    'Timestamp',
  ];

  const rows: string[] = [headers.join(',')];

  const r = assessment.rulaAssessment.segmentScores;
  const commonFields = [
    `"${assessment.assessmentId}"`,
    `"${assessment.title.replace(/"/g, '""')}"`,
    `"${assessment.taskType.replace(/"/g, '""')}"`,
    `"${assessment.assessor.replace(/"/g, '""')}"`,
    `"${assessment.date}"`,
    `"${assessment.imageMetadata.filename.replace(/"/g, '""')}"`,
  ];

  for (const angle of assessment.angles) {
    const row = [
      ...commonFields,
      `"${angle.name}"`,
      angle.valueDegrees !== null ? String(angle.valueDegrees) : '',
      angle.isValid ? 'TRUE' : 'FALSE',
      `"${(angle.invalidReason || '').replace(/"/g, '""')}"`,
      r.upperArm !== null ? String(r.upperArm) : '',
      r.lowerArm !== null ? String(r.lowerArm) : '',
      r.wrist !== null ? String(r.wrist) : '',
      r.tableAScore !== null ? String(r.tableAScore) : '',
      r.neck !== null ? String(r.neck) : '',
      r.trunk !== null ? String(r.trunk) : '',
      r.legs !== null ? String(r.legs) : '',
      r.tableBScore !== null ? String(r.tableBScore) : '',
      r.finalScore !== null ? String(r.finalScore) : '',
      r.actionLevel !== null ? String(r.actionLevel) : '',
      `"${assessment.analysisTimestamp}"`,
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}
