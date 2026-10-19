import React, { useState } from 'react';
import { Download, FileText, Table, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { Assessment } from '../types/assessment';
import { generateReport, generateCsvExport } from '../modules/reportGenerator';

import { createAnnotatedPostureImage } from '../modules/annotatedImageRenderer';

interface ReportControlsProps {
  assessment: Assessment;
}

export function ReportControls({ assessment }: ReportControlsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Brief micro-yield to allow UI spinner render
      await new Promise((resolve) => setTimeout(resolve, 50));

      let annotatedImgDataUrl: string | null = null;
      if (assessment.imageUrl && assessment.landmarks && assessment.landmarks.length > 0) {
        try {
          annotatedImgDataUrl = await createAnnotatedPostureImage(
            assessment.imageUrl,
            assessment.landmarks,
            assessment.angles,
            750
          );
        } catch (imgErr) {
          console.warn('Could not render annotated skeleton image:', imgErr);
        }
      }

      const doc = generateReport(assessment, annotatedImgDataUrl);
      const filename = `ErgoSnap_Report_${assessment.assessmentId.slice(0, 8)}_${assessment.date}.pdf`;
      doc.save(filename);

      setSuccessMessage(`PDF saved as "${filename}" with embedded skeletal analysis`);
    } catch (err) {
      setErrorMessage(`Failed to build PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    try {
      setIsExportingCsv(true);
      setErrorMessage(null);

      const csvContent = generateCsvExport(assessment);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ErgoSnap_Data_${assessment.assessmentId.slice(0, 8)}_${assessment.date}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('CSV dataset downloaded successfully.');
    } catch (err) {
      setErrorMessage(`Failed to export CSV: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf || isExportingCsv}
          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>{isGeneratingPdf ? 'Compiling PDF Report...' : 'Download Technical PDF Report'}</span>
        </button>

        <button
          onClick={handleDownloadCsv}
          disabled={isGeneratingPdf || isExportingCsv}
          className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
        >
          {isExportingCsv ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Table className="w-4 h-4" />
          )}
          <span>{isExportingCsv ? 'Exporting...' : 'Export Raw Data (CSV)'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
