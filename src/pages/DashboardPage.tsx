import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Image as ImageIcon,
  Activity,
  Award,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { ImageViewer } from '../components/ImageViewer';
import { AngleChart } from '../components/AngleChart';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { ValidationCharts } from '../components/ValidationCharts';
import { ReportControls } from '../components/ReportControls';

type DashboardTab =
  | 'overview'
  | 'image'
  | 'angles'
  | 'rula'
  | 'validation'
  | 'recommendations';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session, currentAssessment, dispatch } = useAssessment();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [highlightedAngleName, setHighlightedAngleName] = useState<string | null>(null);

  if (!currentAssessment) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Assessments in Session</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please upload a workplace photograph to initiate pose landmark estimation and RULA posture analysis.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors"
        >
          Create New Assessment
        </button>
      </div>
    );
  }

  const assessment = currentAssessment;
  const rula = assessment.rulaAssessment;
  const validAnglesCount = assessment.angles.filter((a) => a.isValid).length;

  const validObservationsCount = session.assessments.filter(
    (a) => a.qualityChecks.overallStatus === 'valid'
  ).length;
  const reviewRequiredCount = session.assessments.filter(
    (a) => a.qualityChecks.overallStatus === 'review_required'
  ).length;
  const unscorableCount = session.assessments.filter(
    (a) => a.qualityChecks.overallStatus === 'unscorable'
  ).length;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Ergonomic Engineering Dashboard
            </h1>
            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
              {assessment.title}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated by {assessment.assessor} on {assessment.date} • Task: {assessment.taskType}
          </p>
        </div>

        {/* Assessment switcher if multiple exist */}
        {session.assessments.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Record:</span>
            <select
              value={assessment.assessmentId}
              onChange={(e) =>
                dispatch({ type: 'SET_CURRENT_ASSESSMENT', payload: e.target.value })
              }
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
            >
              {session.assessments.map((a, i) => (
                <option key={a.assessmentId} value={a.assessmentId}>
                  #{i + 1}: {a.title} ({a.date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Six Section Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg px-2 flex space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>A. Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'image'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>B. Image Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('angles')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'angles'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>C. Angle Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('rula')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'rula'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>D. RULA Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'validation'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>E. Validation Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>F. Corrective Actions</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Scientific Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Photographs Assessed
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {session.assessments.length}
              </div>
              <span className="text-[11px] text-slate-400">Total Observations</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Observation Quality
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {validObservationsCount} Valid
              </div>
              <span className="text-[11px] text-amber-600">
                {reviewRequiredCount} Review • {unscorableCount} Unscorable
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Current RULA Grand Score
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {rula.isComplete && rula.segmentScores.finalScore !== null
                  ? `${rula.segmentScores.finalScore} / 7`
                  : 'Incomplete'}
              </div>
              <span className="text-[11px] text-slate-500">
                {rula.isComplete && rula.segmentScores.actionLevel !== null
                  ? `Action Level ${rula.segmentScores.actionLevel}`
                  : 'Pending Manual Inputs'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Angle Completeness
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {validAnglesCount} / {assessment.angles.length}
              </div>
              <span className="text-[11px] text-slate-400">Verified 2D Angles</span>
            </div>
          </div>

          {/* High Priority Findings Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Highest-Priority Ergonomic Findings</h3>
            {assessment.recommendations.length > 0 ? (
              <div className="space-y-2">
                {assessment.recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{rec.observation}</div>
                      <div className="text-slate-600 mt-0.5">{rec.suggestedAction}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase ${
                        rec.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No high-risk findings detected. Posture angles remain within initial comfort envelopes.
              </p>
            )}
          </div>

          {/* Quick action to PDF */}
          <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold">Generate Auditable Engineering Report</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Download a formal technical A4 PDF containing exact joint measurements, RULA tables, and limitations.
              </p>
            </div>
            <ReportControls assessment={assessment} />
          </div>
        </div>
      )}

      {/* TAB B: IMAGE ANALYSIS */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            {assessment.imageUrl && (
              <ImageViewer
                imageUrl={assessment.imageUrl}
                imageWidth={assessment.imageMetadata.width}
                imageHeight={assessment.imageMetadata.height}
                landmarks={assessment.landmarks}
                angles={assessment.angles}
                viewSuitability={assessment.qualityChecks.viewSuitability}
                viewSuitabilityNotes={assessment.qualityChecks.viewSuitabilityNotes}
                highlightedAngleName={highlightedAngleName}
              />
            )}
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-slate-900">Landmark Tracking Visibility</h3>
            <p className="text-[11px] text-slate-500">
              MediaPipe confidence threshold &ge; 0.5. Occluded points are flagged rather than interpolated.
            </p>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {assessment.landmarks
                .filter((lm) => [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24].includes(lm.index))
                .map((lm) => (
                  <div key={lm.index} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-slate-700 capitalize">
                      {lm.name.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-600">{(lm.visibility * 100).toFixed(0)}%</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lm.isVisible ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: ANGLE ANALYSIS */}
      {activeTab === 'angles' && (
        <div className="space-y-6">
          <AngleChart
            angles={assessment.angles}
            onAngleSelected={(name) => setHighlightedAngleName(name)}
            highlightedAngleName={highlightedAngleName}
          />

          {/* Angles Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Verified 2D Planar Joint Measurements
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Measurement Name</th>
                  <th className="p-3">Measured Angle</th>
                  <th className="p-3">Validity</th>
                  <th className="p-3">Anatomical Vertex</th>
                  <th className="p-3">Assessment Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessment.angles.map((ang) => (
                  <tr key={ang.name} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{ang.name}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {ang.valueDegrees !== null ? `${ang.valueDegrees}°` : 'Unavailable'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ang.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ang.isValid ? 'VALID' : 'UNSCORABLE'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      Joint Index [{ang.landmarkIndices.join(', ')}]
                    </td>
                    <td className="p-3 text-slate-500">{ang.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: RULA BREAKDOWN */}
      {activeTab === 'rula' && (
        <ScoreBreakdown rula={assessment.rulaAssessment} />
      )}

      {/* TAB E: VALIDATION ANALYTICS */}
      {activeTab === 'validation' && (
        <div className="space-y-4">
          <ValidationCharts assessments={session.assessments} />
        </div>
      )}

      {/* TAB F: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Evidence-Linked Ergonomic Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            Every suggested engineering intervention is linked to measured joint angles and RULA scoring rules.
          </p>

          <div className="space-y-4">
            {assessment.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{rec.observation}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : rec.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                <div className="text-slate-600">
                  <strong>Evidence:</strong> {rec.evidence}
                </div>
                <div className="text-slate-600">
                  <strong>Biomechanics Rationale:</strong> {rec.rationale}
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-medium">
                  <strong>Suggested Action:</strong> {rec.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
