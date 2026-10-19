import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Camera,
  Award,
  Activity,
  ShieldAlert,
  Sliders,
  Flame,
  Printer,
  Bookmark,
  Armchair,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { ReportControls } from '../components/ReportControls';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { ImageViewer } from '../components/ImageViewer';
import { RadarScoreChart } from '../components/RadarScoreChart';
import { NeutralZoneGauge } from '../components/NeutralZoneGauge';
import { SensitivityChart } from '../components/SensitivityChart';
import { RiskHeatmap } from '../components/RiskHeatmap';
import { EvidenceActionMatrix } from '../components/EvidenceActionMatrix';
import { WorkstationRecommendationsView } from '../components/WorkstationRecommendationsView';

import { buildWmsdRiskMap } from '../modules/wmsdRiskMapping';
import { computeSensitivityAnalysis } from '../modules/sensitivityAnalysis';
import { analyzeWorkstationFit } from '../modules/workstationRecommender';
import { estimateShoulderMomentArm, evaluateExposureRisk } from '../modules/biomechanicalAnalysis';
import { RULA_TABLES_VERSION } from '../data/rulaTables';
import { REFERENCES } from '../data/references';

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const [activeSection, setActiveSection] = useState<string>('sec-summary');

  const assessment = currentAssessment;

  const wmsdRiskMap = useMemo(() => {
    if (!assessment) return null;
    return buildWmsdRiskMap(assessment.rulaAssessment, assessment.angles);
  }, [assessment]);

  const sensitivityReport = useMemo(() => {
    if (!assessment) return null;
    const getAngleVal = (name: string): number | null => {
      const match = assessment.angles.find((a) =>
        a.name.toLowerCase().includes(name.toLowerCase()) && a.isValid
      );
      return match?.valueDegrees ?? null;
    };

    return computeSensitivityAnalysis(
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
  }, [assessment]);

  const workstationRec = useMemo(() => {
    if (!assessment) return null;
    return analyzeWorkstationFit(assessment.landmarks);
  }, [assessment]);

  const shoulderMoment = useMemo(() => {
    if (!assessment) return null;
    return estimateShoulderMomentArm(assessment.angles);
  }, [assessment]);

  const exposureRisk = useMemo(() => {
    if (!assessment) return null;
    return evaluateExposureRisk(assessment.rulaAssessment, assessment.manualInputs);
  }, [assessment]);

  if (!assessment) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">No Assessment Record Available</h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete an image posture evaluation first to compile an industrial ergonomic report.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Go to Posture Upload
        </button>
      </div>
    );
  }

  const rula = assessment.rulaAssessment;
  const finalScore = rula.segmentScores.finalScore;
  const actionLevel = rula.segmentScores.actionLevel;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Bar with Export Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-900 text-xs flex items-center gap-1.5 font-semibold transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Technical Ergonomic Assessment Report
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Publication Preview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative A4 documentation compliant with ISO 11226:2000 and McAtamney & Corlett (1993) RULA standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReportControls assessment={assessment} />
          <button
            onClick={() => window.print()}
            title="Print this preview document"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Anchor Bar */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-2 flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none shadow-sm">
        <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-2">
          <Bookmark className="w-3.5 h-3.5 text-red-500" /> Jump to:
        </span>
        {[
          { id: 'sec-summary', label: '1. Summary' },
          { id: 'sec-skeleton', label: '2. Skeleton (Fig 1)' },
          { id: 'sec-angles', label: '3. ISO 11226 Zones' },
          { id: 'sec-rula', label: '4. RULA Radar (Fig 2)' },
          { id: 'sec-sensitivity', label: '5. Sensitivity (Fig 3)' },
          { id: 'sec-heatmap', label: '6. WMSD Map (Fig 4)' },
          { id: 'sec-actions', label: '7. Actions & Matrix' },
          { id: 'sec-references', label: '8. References' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
              activeSection === sec.id
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Editorial A4 Paper Container */}
      <div className="bg-white border border-slate-300/80 rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-12 space-y-9 font-sans text-slate-800 print-page">
        {/* Document Header Letterhead */}
        <div className="border-b-2 border-red-600 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span className="text-xs font-black text-red-600 tracking-widest uppercase">
                ErgoSnap Analytics Technical Engineering Audit
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              {assessment.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span><strong>Task Type:</strong> {assessment.taskType}</span>
              <span>•</span>
              <span><strong>Assessor:</strong> {assessment.assessor}</span>
              <span>•</span>
              <span><strong>Date:</strong> {assessment.date}</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <div className="text-slate-400">DOCUMENT REFERENCE</div>
            <div className="font-bold text-slate-800 text-xs mt-0.5">ES-RPT-{assessment.assessmentId.slice(0, 8).toUpperCase()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">ISO 11226:2000 COMPLIANT</div>
          </div>
        </div>

        {/* 3 Executive Metric Callout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              RULA Grand Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${
                finalScore !== null && finalScore >= 7
                  ? 'text-red-600'
                  : finalScore !== null && finalScore >= 5
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}>
                {finalScore !== null ? `${finalScore} / 7` : 'Pending'}
              </span>
              {actionLevel !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  actionLevel >= 4
                    ? 'bg-red-100 text-red-700'
                    : actionLevel === 3
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Action Level {actionLevel}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {actionLevel === 4
                ? 'Immediate change required'
                : actionLevel === 3
                ? 'Further investigation & change soon'
                : actionLevel === 2
                ? 'Further investigation may be needed'
                : 'Postures acceptable if not prolonged'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Cumulative Exposure (CERI)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">
                {exposureRisk && exposureRisk.ceriScore !== null ? `${exposureRisk.ceriScore} / 10.0` : 'Pending'}
              </span>
              {exposureRisk && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 uppercase">
                  {exposureRisk.estimatedShiftExposureRisk}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Integrated posture risk adjusted for duration & force
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Glenohumeral Torque
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">
                {shoulderMoment && shoulderMoment.dimensionlessMomentIndex !== null
                  ? `${(shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0)}%`
                  : 'N/A'}
              </span>
              {shoulderMoment && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  shoulderMoment.riskLevel === 'high'
                    ? 'bg-red-100 text-red-700'
                    : shoulderMoment.riskLevel === 'elevated'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {shoulderMoment.riskLevel} Load
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gravitational shoulder moment envelope (M ∝ sin θ)
            </p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section id="sec-summary" className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <FileText className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              1. Executive Engineering Summary
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            This technical ergonomic report provides a comprehensive posture evaluation for the operational task{' '}
            <strong>"{assessment.title}"</strong>. Analysis was performed using deterministic 2D landmark coordinate estimation (MediaPipe Pose Tasks-Vision) coupled with an authoritative multi-table implementation of the Rapid Upper Limb Assessment (McAtamney & Corlett, 1993). A total of {assessment.angles.filter((a) => a.isValid).length} planar joint angles were verified against standard anthropometric bounds.
            {rula.isComplete && finalScore !== null ? (
              <span>
                {' '}The computed RULA Grand Score is <strong>{finalScore} / 7 (Action Level {actionLevel}/4)</strong>, indicating that corrective engineering and administrative adjustments are recommended.
              </span>
            ) : (
              <span>
                {' '}The assessment is classified as preliminary pending complete entry of manual workstation parameters.
              </span>
            )}
          </p>
        </section>

        {/* Section 2: Photographic Posture & Skeletal Angle Analysis (Figure 1) */}
        {assessment.imageUrl && (
          <section id="sec-skeleton" className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Camera className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                2. Photographic Posture & Skeletal Joint Tracking (Figure 1)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Workplace photograph with MediaPipe 33-point tracking skeleton and measured joint angle callout badges.
            </p>
            <div className="max-w-2xl mx-auto border border-slate-200 rounded-xl p-3 bg-slate-50 shadow-inner">
              <ImageViewer
                imageUrl={assessment.imageUrl}
                imageWidth={assessment.imageMetadata.width}
                imageHeight={assessment.imageMetadata.height}
                landmarks={assessment.landmarks}
                angles={assessment.angles}
                viewSuitability={assessment.qualityChecks.viewSuitability}
                viewSuitabilityNotes={assessment.qualityChecks.viewSuitabilityNotes}
              />
              <div className="text-[11px] text-slate-500 text-center mt-2 italic">
                Figure 1: Planar 2D kinematic landmark projection with angle badges calculated on local device.
              </div>
            </div>
          </section>
        )}

        {/* Section 3: Verified Joint Measurements & Neutral Zone Envelopes */}
        <section id="sec-angles" className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <Activity className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              3. Joint Angle Measurements & ISO 11226 Postural Envelopes
            </h3>
          </div>
          <NeutralZoneGauge angles={assessment.angles} />
        </section>

        {/* Section 4: RULA Breakdown & Multiaxial Spider Radar Plot */}
        <section id="sec-rula" className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <Award className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              4. RULA Posture Audit & Multiaxial Risk Profile (Figure 2)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <ScoreBreakdown rula={rula} />
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <RadarScoreChart segmentScores={rula.segmentScores} />
              <div className="text-[11px] text-slate-500 text-center mt-2 italic">
                Figure 2: Multiaxial RULA Segment Score Radar Profile
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Intervention Sensitivity Analysis */}
        {sensitivityReport && sensitivityReport.entries.length > 0 && (
          <section id="sec-sensitivity" className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Sliders className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                5. Ergonomic Intervention Sensitivity Analysis (Figure 3)
              </h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <SensitivityChart sensitivityReport={sensitivityReport} />
              <div className="text-[11px] text-slate-500 text-center mt-2 italic">
                Figure 3: McAtamney & Corlett Table C score delta simulation across single-variable adjustments
              </div>
            </div>
          </section>
        )}

        {/* Section 6: WMSD Risk Mapping & Anatomical Heatmap */}
        {wmsdRiskMap && (
          <section id="sec-heatmap" className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Flame className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                6. WMSD Risk Mapping & Anatomical Heatmap (Figure 4)
              </h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <RiskHeatmap riskMap={wmsdRiskMap} />
              <div className="text-[11px] text-slate-500 text-center mt-2 italic">
                Figure 4: EU-OSHA & ISO 11226 musculoskeletal risk density map across bodily regions
              </div>
            </div>
          </section>
        )}

        {/* Section 7: Corrective Action Priority Matrix & Workstation Fit */}
        <section id="sec-actions" className="space-y-5 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              7. Lean Ergonomics 2×2 Corrective Action Priority Matrix
            </h3>
          </div>
          <EvidenceActionMatrix recommendations={assessment.recommendations} />

          {workstationRec && shoulderMoment && exposureRisk && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Armchair className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  ISO 9241-5 Workstation Dimensional Layout & Biomechanical Moments
                </h4>
              </div>
              <WorkstationRecommendationsView
                workstationRec={workstationRec}
                shoulderMoment={shoulderMoment}
                exposureRisk={exposureRisk}
              />
            </div>
          )}
        </section>

        {/* Section 8: Scientific Limitations */}
        <section className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              8. Scientific Protocol Boundaries & Limitations
            </h3>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>Single-camera 2D estimates are subject to perspective foreshortening in out-of-plane movements.</li>
            <li>ErgoSnap Analytics is an engineering screening instrument, not a clinical diagnostic instrument.</li>
            <li>RULA tables reference: McAtamney & Corlett (1993) [{RULA_TABLES_VERSION}].</li>
            <li>ISO standard compliance checks reference: ISO 11226:2000 and ISO 9241-5:1998.</li>
          </ul>
        </section>

        {/* Section 9: References */}
        <section id="sec-references" className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              9. Authoritative Academic & Standard References
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
            {REFERENCES.slice(0, 6).map((ref, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">{ref.authors} ({ref.year}).</span>{' '}
                <span className="italic">{ref.title}.</span> {ref.source}.
              </div>
            ))}
          </div>
        </section>

        {/* Document Footer */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>COMPILED VIA ERGOSNAP ANALYTICS v{assessment.appVersion}</span>
          <span>CONFIDENTIAL — PROPRIETARY ERGONOMIC AUDIT</span>
          <span>DATE: {assessment.date}</span>
        </div>
      </div>
    </div>
  );
}
