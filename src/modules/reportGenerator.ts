/**
 * PDF and CSV report generator for ErgoSnap Analytics.
 *
 * Requirements:
 * - Uses jsPDF and jspdf-autotable for client-side A4 technical reporting.
 * - Sourced strictly from the canonical Assessment data object (no recomputing scores).
 * - Implements clean engineering aesthetics: Charcoal (#1A1A2E), Red accent (#DC2626),
 *   page numbers, headers, footers, data dictionary, and references appendix.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  Assessment,
  AngleMeasurement,
  Recommendation,
} from '../types/assessment';
import { REFERENCES } from '../data/references';
import { RULA_TABLES_SOURCE, RULA_TABLES_VERSION } from '../data/rulaTables';

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const MARGIN = 18; // mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Styling constants
const COLOR_PRIMARY: [number, number, number] = [26, 26, 46]; // Charcoal
const COLOR_ACCENT: [number, number, number] = [220, 38, 38]; // Red
const COLOR_MUTED: [number, number, number] = [100, 100, 115]; // Slate grey
const COLOR_LIGHT_BG: [number, number, number] = [245, 246, 248];

export function generateReport(assessment: Assessment): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

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
  doc.text('Ergonomic Posture Assessment & Technical Report', MARGIN + 62, 15);

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
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(
    `Task: ${assessment.taskType}  |  Assessor: ${assessment.assessor}  |  Date: ${assessment.date}`,
    MARGIN,
    currentY
  );
  currentY += 9;

  // Section 1: Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('1. Executive Summary', MARGIN, currentY);
  currentY += 5;

  const validAnglesCount = assessment.angles.filter((a) => a.isValid).length;
  const totalAnglesCount = assessment.angles.length;
  const rula = assessment.rulaAssessment;

  const summaryText = [
    `Assessment was conducted using image-based 2D landmark tracking (MediaPipe Pose).`,
    `A total of ${validAnglesCount} of ${totalAnglesCount} joint angles were successfully evaluated.`,
    rula.isComplete && rula.segmentScores.finalScore !== null
      ? `RULA Grand Score is ${rula.segmentScores.finalScore}/7 (Action Level ${rula.segmentScores.actionLevel}/4).`
      : `Complete RULA Grand Score is not available due to missing required manual inputs or limb angles.`,
    `Quality status: ${assessment.qualityChecks.overallStatus.toUpperCase()} (View suitability: ${assessment.qualityChecks.viewSuitability}).`,
  ].join(' ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_PRIMARY);
  const splitSummary = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
  doc.text(splitSummary, MARGIN, currentY);
  currentY += splitSummary.length * 4.5 + 4;

  // Section 2: Joint Angle Measurements Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Joint Angle Measurements', MARGIN, currentY);
  currentY += 3;

  const angleTableRows = assessment.angles.map((a) => [
    a.name,
    a.valueDegrees !== null ? `${a.valueDegrees}°` : 'Unavailable',
    a.isValid ? 'Valid' : 'Invalid / Occluded',
    a.invalidReason || (a.isManuallyCorrected ? 'Manually adjusted' : 'Automated 2D estimate'),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Measurement', 'Angle (°)', 'Status', 'Notes']],
    body: angleTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: COLOR_PRIMARY,
    },
    alternateRowStyles: {
      fillColor: COLOR_LIGHT_BG,
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Section 3: RULA Ergonomic Breakdown
  if (currentY > PAGE_HEIGHT - 60) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('3. RULA Ergonomic Assessment Breakdown', MARGIN, currentY);
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
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLOR_PRIMARY,
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // @ts-expect-error autoTable extends doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Section 4: Evidence-Based Recommendations
  if (currentY > PAGE_HEIGHT - 60) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('4. Evidence-Linked Ergonomic Recommendations', MARGIN, currentY);
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
      head: [['Priority', 'Observation', 'Evidence', 'Suggested Engineering Action']],
      body: recRows,
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
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 },
        3: { cellWidth: 62 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    // @ts-expect-error autoTable extends doc
    currentY = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('No critical postural risks exceeded intervention thresholds.', MARGIN, currentY + 4);
    currentY += 10;
  }

  // Section 5: Scientific Limitations & Scope Boundary
  if (currentY > PAGE_HEIGHT - 65) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('5. Scientific Limitations & Boundaries', MARGIN, currentY);
  currentY += 5;

  const limitations = [
    '1. 2D Planar Limitations: Single-camera 2D joint angles are susceptible to perspective foreshortening.',
    '2. Non-Diagnostic Boundary: ErgoSnap Analytics is an engineering screening aid, not a clinical diagnostic instrument.',
    '3. Manual Verification: External force and muscle use must be confirmed via workstation observation.',
    `4. Methodological Reference: Standard RULA tables per McAtamney & Corlett (1993) [${RULA_TABLES_VERSION}].`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARY);
  for (const lim of limitations) {
    doc.text(lim, MARGIN, currentY);
    currentY += 4.5;
  }
  currentY += 4;

  // Section 6: Bibliographic References
  if (currentY > PAGE_HEIGHT - 50) {
    doc.addPage();
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('6. References', MARGIN, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  for (const ref of REFERENCES.slice(0, 4)) {
    const refLine = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.source}.`;
    const splitRef = doc.splitTextToSize(refLine, CONTENT_WIDTH);
    doc.text(splitRef, MARGIN, currentY);
    currentY += splitRef.length * 3.5 + 1;
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
