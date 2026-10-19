/**
 * PDF and CSV report generator for ErgoSnap Analytics.
 *
 * Requirements:
 * - Uses jsPDF and jspdf-autotable for client-side A4 technical reporting.
 * - Sourced strictly from the canonical Assessment data object (no recomputing scores).
 * - Implements clean engineering aesthetics: Charcoal (#1A1A2E), Red accent (#DC2626),
 *   page numbers, headers, footers, ISO 11226 neutral zones, CERI indices, and references appendix.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  Assessment,
} from '../types/assessment';
import { REFERENCES } from '../data/references';
import { RULA_TABLES_VERSION } from '../data/rulaTables';
import { buildWmsdRiskMap } from './wmsdRiskMapping';
import { estimateShoulderMomentArm, evaluateExposureRisk } from './biomechanicalAnalysis';
import { analyzeWorkstationFit } from './workstationRecommender';

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const MARGIN = 18; // mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Styling constants
const COLOR_PRIMARY: [number, number, number] = [26, 26, 46]; // Charcoal
const COLOR_ACCENT: [number, number, number] = [220, 38, 38]; // Red
const COLOR_MUTED: [number, number, number] = [100, 100, 115]; // Slate grey
const COLOR_LIGHT_BG: [number, number, number] = [245, 246, 248];

export function generateReport(assessment: Assessment, annotatedImageDataUrl?: string | null): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const wmsdMap = buildWmsdRiskMap(assessment.rulaAssessment, assessment.angles);
  const shoulderMoment = estimateShoulderMomentArm(assessment.angles);
  const exposureRisk = evaluateExposureRisk(assessment.rulaAssessment, assessment.manualInputs);
  const workstationFit = analyzeWorkstationFit(assessment.landmarks);

  let currentY = MARGIN;

  // Header band
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, PAGE_WIDTH, 24, 'F');
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(0, 24, PAGE_WIDTH, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ERGOSNAP ANALYTICS', MARGIN, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Ergonomic Engineering & Posture Assessment Report', MARGIN + 62, 15);

  doc.setFontSize(8);
  doc.text(`ID: ${assessment.assessmentId.slice(0, 8)}`, PAGE_WIDTH - MARGIN - 25, 15);

  currentY = 34;

  // Title block
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(assessment.title || 'Workplace Posture Assessment', MARGIN, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Task: ${assessment.taskType}  |  Assessor: ${assessment.assessor}  |  Date: ${assessment.date}`,
    MARGIN,
    currentY
  );
  currentY += 8;

  // Section 1: Executive Summary & Engineering Indices
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('1. Executive Engineering Summary', MARGIN, currentY);
  currentY += 4.5;

  const validAnglesCount = assessment.angles.filter((a) => a.isValid).length;
  const totalAnglesCount = assessment.angles.length;
  const rula = assessment.rulaAssessment;

  const summaryText = [
    `Assessment was conducted using non-invasive 2D landmark tracking (MediaPipe Pose).`,
    `A total of ${validAnglesCount} of ${totalAnglesCount} planar joint angles were successfully evaluated.`,
    rula.isComplete && rula.segmentScores.finalScore !== null
      ? `RULA Grand Score is ${rula.segmentScores.finalScore}/7 (Action Level ${rula.segmentScores.actionLevel}/4).`
      : `Complete RULA Grand Score is not available due to missing required manual inputs or limb angles.`,
    exposureRisk.ceriScore !== null
      ? `Cumulative Exposure Risk Index (CERI) is rated ${exposureRisk.ceriScore}/10.0 (${exposureRisk.estimatedShiftExposureRisk.toUpperCase()}).`
      : '',
    shoulderMoment.dimensionlessMomentIndex !== null
      ? `Glenohumeral gravitational torque index is ${(shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0)}% of maximum envelope.`
      : '',
    `Quality status: ${assessment.qualityChecks.overallStatus.toUpperCase()} (View suitability: ${assessment.qualityChecks.viewSuitability}).`,
  ].filter(Boolean).join(' ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARY);
  const splitSummary = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
  doc.text(splitSummary, MARGIN, currentY);
  currentY += splitSummary.length * 4.2 + 5;

  // Visual Posture & Skeletal Joint Tracking (Embedded Photograph)
  if (annotatedImageDataUrl) {
    try {
      const imgWidthMm = 95;
      const imgHeightMm = (assessment.imageMetadata.height && assessment.imageMetadata.width)
        ? Math.min(85, (assessment.imageMetadata.height / assessment.imageMetadata.width) * imgWidthMm)
        : 72;

      if (currentY + imgHeightMm + 20 > PAGE_HEIGHT) {
        doc.addPage();
        currentY = MARGIN;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('2. Photographic Posture & Skeletal Tracking Analysis', MARGIN, currentY);
      currentY += 4;

      // Draw box border around photo
      doc.setDrawColor(200, 205, 215);
      doc.rect(MARGIN, currentY, imgWidthMm + 4, imgHeightMm + 4);
      doc.addImage(annotatedImageDataUrl, 'JPEG', MARGIN + 2, currentY + 2, imgWidthMm, imgHeightMm);

      // Metadata callout next to photo
      const textX = MARGIN + imgWidthMm + 10;
      let textY = currentY + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_PRIMARY);
      doc.text('Pose Detection Summary', textX, textY);
      textY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(`Image: ${assessment.imageMetadata.filename}`, textX, textY); textY += 4;
      doc.text(`Resolution: ${assessment.imageMetadata.width} × ${assessment.imageMetadata.height} px`, textX, textY); textY += 4;
      doc.text(`Model: ${assessment.modelInfo.modelName}`, textX, textY); textY += 4;
      doc.text(`Landmark Completeness: ${(assessment.qualityChecks.landmarkCompleteness * 100).toFixed(0)}%`, textX, textY); textY += 4;
      doc.text(`View Angle Suitability: ${assessment.qualityChecks.viewSuitability.toUpperCase()}`, textX, textY); textY += 4;
      doc.text(`Verified Joint Angles: ${validAnglesCount} / ${totalAnglesCount}`, textX, textY); textY += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      const disclaimer = 'Skeletal lines and angle badges reflect 2D projected plane estimation via MediaPipe.';
      const splitDisc = doc.splitTextToSize(disclaimer, CONTENT_WIDTH - (imgWidthMm + 12));
      doc.text(splitDisc, textX, textY);

      currentY += imgHeightMm + 10;
    } catch (e) {
      console.warn('Failed to embed annotated image in PDF:', e);
    }
  }

  // Section: Joint Angle Measurements & ISO 11226 Comparison
  if (currentY > PAGE_HEIGHT - 65) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(annotatedImageDataUrl ? '3. Joint Angle Measurements & ISO 11226 Postural Envelopes' : '2. Joint Angle Measurements & ISO 11226 Postural Envelopes', MARGIN, currentY);
  currentY += 3;


  const angleTableRows = assessment.angles.map((a) => {
    // Find matching neutral range
    const wmsdReg = wmsdMap.regions.find((r) =>
      a.name.toLowerCase().includes(r.region.split('/')[0].toLowerCase().trim())
    );

    const neutralDesc = wmsdReg
      ? `${wmsdReg.neutralRangeDeg[0]}°–${wmsdReg.neutralRangeDeg[1]}°`
      : 'N/A';

    const dev = wmsdReg && wmsdReg.deviationDeg && wmsdReg.deviationDeg > 0
      ? `+${wmsdReg.deviationDeg.toFixed(0)}° Dev`
      : (wmsdReg && a.valueDegrees !== null ? 'Within Zone' : 'N/A');

    return [
      a.name,
      a.valueDegrees !== null ? `${a.valueDegrees}°` : 'Unavailable',
      neutralDesc,
      dev,
      a.isValid ? 'Valid' : 'Invalid / Occluded',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Measurement', 'Measured (°)', 'ISO 11226 Zone', 'Deviation Status', 'Validation']],
    body: angleTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLOR_PRIMARY,
    },
    alternateRowStyles: {
      fillColor: COLOR_LIGHT_BG,
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 7;

  // Section 3: RULA Ergonomic Breakdown
  if (currentY > PAGE_HEIGHT - 65) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('3. RULA Ergonomic Assessment Breakdown (McAtamney & Corlett, 1993)', MARGIN, currentY);
  currentY += 3;

  const ss = rula.segmentScores;
  const rulaTableRows = [
    ['Upper Arm Posture Score', ss.upperArm !== null ? String(ss.upperArm) : 'N/A', '1–6'],
    ['Lower Arm Posture Score', ss.lowerArm !== null ? String(ss.lowerArm) : 'N/A', '1–3'],
    ['Wrist & Wrist Twist Score', `${ss.wrist ?? 'N/A'} / Twist: ${ss.wristTwist ?? 'N/A'}`, 'Wrist: 1–4, Twist: 1–2'],
    ['Table A Intermediate Score', ss.tableAScore !== null ? String(ss.tableAScore) : 'N/A', 'Matrix lookup'],
    ['Upper Limb Score A (with Load/Muscle)', ss.scoreA !== null ? String(ss.scoreA) : 'N/A', 'Table A + adjustments'],
    ['Neck Posture Score', ss.neck !== null ? String(ss.neck) : 'N/A', '1–6'],
    ['Trunk Posture Score', ss.trunk !== null ? String(ss.trunk) : 'N/A', '1–6'],
    ['Leg Support Score', ss.legs !== null ? String(ss.legs) : 'N/A', '1–2'],
    ['Table B Intermediate Score', ss.tableBScore !== null ? String(ss.tableBScore) : 'N/A', 'Matrix lookup'],
    ['Neck/Trunk Score B (with Load/Muscle)', ss.scoreB !== null ? String(ss.scoreB) : 'N/A', 'Table B + adjustments'],
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
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLOR_PRIMARY,
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 7;

  // Section 4: WMSD Risk Mapping & Biomechanical Load Summary
  if (currentY > PAGE_HEIGHT - 60) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('4. WMSD Risk Mapping & Biomechanical Load Summary', MARGIN, currentY);
  currentY += 3;

  const wmsdRows = wmsdMap.regions.map((r) => [
    r.region,
    r.riskLevel.toUpperCase(),
    r.score !== null ? String(r.score) : 'N/A',
    r.basis,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Anatomical Region', 'Risk Level', 'RULA Score', 'Biomechanical Basis']],
    body: wmsdRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: COLOR_PRIMARY,
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 92 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 7;

  // Section 5: Workstation Anthropometric Fit & Evidence Actions
  if (currentY > PAGE_HEIGHT - 65) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('5. Evidence-Linked Corrective Actions & Workstation Guidance', MARGIN, currentY);
  currentY += 3;

  const recRows = assessment.recommendations.map((rec) => [
    rec.priority.toUpperCase(),
    rec.observation,
    rec.evidence,
    rec.suggestedAction,
  ]);

  if (recRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Priority', 'Observation', 'Evidence', 'Engineering Action']],
      body: recRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLOR_PRIMARY,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLOR_PRIMARY,
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 42 },
        2: { cellWidth: 42 },
        3: { cellWidth: 70 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    // @ts-expect-error autoTable extends doc
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // Workstation fit notes
  if (workstationFit.canEstimate && workstationFit.suggestions.length > 0) {
    if (currentY > PAGE_HEIGHT - 45) {
      doc.addPage();
      currentY = MARGIN;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('Workstation Layout Suggestions (ISO 9241-5):', MARGIN, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    for (const sug of workstationFit.suggestions.slice(0, 3)) {
      const line = `• ${sug.element}: ${sug.suggestion} [Ref: ${sug.reference}]`;
      const splitLine = doc.splitTextToSize(line, CONTENT_WIDTH);
      doc.text(splitLine, MARGIN, currentY);
      currentY += splitLine.length * 3.3 + 1;
    }
    currentY += 3;
  }

  // Section 6: Scientific Limitations & Scope Boundary
  if (currentY > PAGE_HEIGHT - 55) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('6. Scientific Limitations & Boundaries', MARGIN, currentY);
  currentY += 4;

  const limitations = [
    '1. 2D Planar Limitations: Single-camera 2D joint angles are susceptible to perspective foreshortening.',
    '2. Non-Diagnostic Boundary: ErgoSnap Analytics is an engineering screening aid, not a clinical diagnostic instrument.',
    '3. Manual Verification: External force and muscle use must be confirmed via workstation observation.',
    '4. Calibration Constraint: Workstation and torque estimates are non-calibrated dimensionless approximations.',
    `5. Methodological Reference: Standard RULA tables per McAtamney & Corlett (1993) [${RULA_TABLES_VERSION}].`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_PRIMARY);
  for (const lim of limitations) {
    doc.text(lim, MARGIN, currentY);
    currentY += 3.8;
  }
  currentY += 3;

  // Section 7: References
  if (currentY > PAGE_HEIGHT - 45) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('7. Authoritative References', MARGIN, currentY);
  currentY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MUTED);
  for (const ref of REFERENCES.slice(0, 6)) {
    const refLine = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.source}.`;
    const splitRef = doc.splitTextToSize(refLine, CONTENT_WIDTH);
    doc.text(splitRef, MARGIN, currentY);
    currentY += splitRef.length * 3.2 + 0.8;
  }

  // Add page numbers and footers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(220, 220, 230);
    doc.line(MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(
      `Generated by ErgoSnap Analytics v${assessment.appVersion}  |  Assessment ID: ${assessment.assessmentId.slice(0, 8)}`,
      MARGIN,
      PAGE_HEIGHT - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN - 18, PAGE_HEIGHT - 7);
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
