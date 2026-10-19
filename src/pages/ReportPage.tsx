import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Printer, ArrowLeft } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { ReportControls } from '../components/ReportControls';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { REFERENCES } from '../data/references';
import { RULA_TABLES_SOURCE, RULA_TABLES_VERSION } from '../data/rulaTables';

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();

  if (!currentAssessment) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Assessment Record Available</h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete an image posture evaluation first to compile a technical ergonomic report.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-md"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const assessment = currentAssessment;
  const rula = assessment.rulaAssessment;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar with Export Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span>Ergonomic Assessment Technical Report</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publication-ready A4 technical document generated from canonical assessment data.
          </p>
        </div>

        <ReportControls assessment={assessment} />
      </div>

      {/* HTML Report Document Preview (Mirrors PDF layout) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-8 sm:p-12 space-y-8 font-sans text-slate-800">
        {/* Document Header Band */}
        <div className="border-b-2 border-red-600 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-red-600 tracking-widest uppercase">
              ErgoSnap Analytics Technical Report
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{assessment.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Task: {assessment.taskType} • Date: {assessment.date} • Assessor: {assessment.assessor}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-mono">
            ID: {assessment.assessmentId.slice(0, 8)}
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            1. Executive Summary
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            This technical report documents the posture evaluation for{' '}
            <strong>"{assessment.title}"</strong>. Analysis was performed using deterministic
            2D landmark coordinate tracking (MediaPipe Pose Tasks-Vision) coupled with a complete,
            multi-table implementation of the Rapid Upper Limb Assessment (McAtamney & Corlett, 1993).
            A total of {assessment.angles.filter((a) => a.isValid).length} joint angles were
            successfully estimated.
            {rula.isComplete && rula.segmentScores.finalScore !== null ? (
              <span>
                {' '}
                The resulting Grand Score is{' '}
                <strong>
                  {rula.segmentScores.finalScore} / 7 (Action Level {rula.segmentScores.actionLevel})
                </strong>
                .
              </span>
            ) : (
              <span>
                {' '}
                The assessment is classified as preliminary pending complete resolution of manual
                workstation conditions.
              </span>
            )}
          </p>
        </section>

        {/* Section 2: Joint Measurements */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Verified Joint Angle Measurements
          </h3>
          <table className="w-full text-xs text-left border border-slate-200 rounded">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="p-2.5">Measurement</th>
                <th className="p-2.5">Angle (°)</th>
                <th className="p-2.5">Validity</th>
                <th className="p-2.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessment.angles.map((a) => (
                <tr key={a.name} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium">{a.name}</td>
                  <td className="p-2.5 font-mono font-bold">
                    {a.valueDegrees !== null ? `${a.valueDegrees}°` : 'Unavailable'}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        a.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {a.isValid ? 'VALID' : 'UNSCORABLE'}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 3: RULA Breakdown */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            3. RULA Posture Score Audit
          </h3>
          <ScoreBreakdown rula={rula} />
        </section>

        {/* Section 4: Recommendations */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            4. Evidence-Linked Recommendations
          </h3>
          {assessment.recommendations.length > 0 ? (
            <div className="space-y-2 text-xs">
              {assessment.recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{rec.observation}</span>
                    <span className="text-[10px] font-bold uppercase text-red-600">
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Evidence:</strong> {rec.evidence}
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Action:</strong> {rec.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No critical intervention thresholds exceeded.</p>
          )}
        </section>

        {/* Section 5: Scientific Limitations */}
        <section className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            5. Protocol Boundaries & Limitations
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Single-camera 2D estimates are subject to perspective foreshortening.</li>
            <li>ErgoSnap Analytics is an engineering screening instrument, not a medical diagnostic.</li>
            <li>RULA tables reference: McAtamney & Corlett (1993) [{RULA_TABLES_VERSION}].</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
