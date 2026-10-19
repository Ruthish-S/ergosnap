import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Camera, Award, Activity, ShieldAlert, Sliders, Flame } from 'lucide-react';
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

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();

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

  const rula = assessment.rulaAssessment;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar with Export Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-red-600" />
            <span>Ergonomic Assessment Technical Report & Publication Preview</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full comprehensive A4 technical document containing photographs, charts, plots, and evidence-linked interventions.
          </p>
        </div>

        <ReportControls assessment={assessment} />
      </div>

      {/* HTML Report Document Preview (Mirrors PDF layout) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 sm:p-10 space-y-8 font-sans text-slate-800">
        {/* Document Header Band */}
        <div className="border-b-2 border-red-600 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-red-600 tracking-widest uppercase">
              ErgoSnap Analytics Technical Engineering Report
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
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-700" />
            1. Executive Engineering Summary
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            This technical report documents the comprehensive posture evaluation for{' '}
            <strong>"{assessment.title}"</strong>. Analysis was performed using deterministic
            2D landmark coordinate tracking (MediaPipe Pose Tasks-Vision) coupled with an authoritative
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

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">RULA Grand Score</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {rula.segmentScores.finalScore !== null ? `${rula.segmentScores.finalScore} / 7` : 'Pending'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Cumulative Exposure (CERI)</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {exposureRisk && exposureRisk.ceriScore !== null ? `${exposureRisk.ceriScore} / 10.0` : 'Pending'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Glenohumeral Torque Index</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {shoulderMoment && shoulderMoment.dimensionlessMomentIndex !== null
                  ? `${(shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0)}% envelope`
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Quality Status</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5 uppercase">
                {assessment.qualityChecks.overallStatus}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Uploaded Photograph with Skeletal Tracking Analysis */}
        {assessment.imageUrl && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-700" />
              2. Photographic Posture & Skeletal Angle Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Workplace photograph with MediaPipe 33-point tracking skeleton and measured joint angle callout badges.
            </p>
            <div className="max-w-xl mx-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
              <ImageViewer
                imageUrl={assessment.imageUrl}
                imageWidth={assessment.imageMetadata.width}
                imageHeight={assessment.imageMetadata.height}
                landmarks={assessment.landmarks}
                angles={assessment.angles}
                viewSuitability={assessment.qualityChecks.viewSuitability}
                viewSuitabilityNotes={assessment.qualityChecks.viewSuitabilityNotes}
              />
            </div>
          </section>
        )}

        {/* Section 3: Verified Joint Measurements & Neutral Zone Envelopes */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-700" />
            3. Verified Joint Measurements & ISO 11226 Comfort Envelopes
          </h3>
          <NeutralZoneGauge angles={assessment.angles} />
        </section>

        {/* Section 4: RULA Breakdown & Multiaxial Spider Radar Plot */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-slate-700" />
            4. RULA Posture Audit & Multiaxial Risk Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <ScoreBreakdown rula={rula} />
            <RadarScoreChart segmentScores={rula.segmentScores} />
          </div>
        </section>

        {/* Section 5: Intervention Sensitivity Analysis */}
        {sensitivityReport && sensitivityReport.entries.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-700" />
              5. Ergonomic Intervention Sensitivity Analysis
            </h3>
            <SensitivityChart sensitivityReport={sensitivityReport} />
          </section>
        )}

        {/* Section 6: WMSD Risk Mapping & Anatomical Heatmap */}
        {wmsdRiskMap && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-slate-700" />
              6. WMSD Risk Mapping & Biomechanical Load Summary
            </h3>
            <RiskHeatmap riskMap={wmsdRiskMap} />
          </section>
        )}

        {/* Section 7: Corrective Action Priority Matrix & Workstation Fit */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            7. Corrective Action Priority Matrix & Workstation Fit
          </h3>
          <EvidenceActionMatrix recommendations={assessment.recommendations} />

          {workstationRec && shoulderMoment && exposureRisk && (
            <WorkstationRecommendationsView
              workstationRec={workstationRec}
              shoulderMoment={shoulderMoment}
              exposureRisk={exposureRisk}
            />
          )}
        </section>

        {/* Section 8: Scientific Limitations */}
        <section className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            8. Scientific Protocol Boundaries & Limitations
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Single-camera 2D estimates are subject to perspective foreshortening.</li>
            <li>ErgoSnap Analytics is an engineering screening instrument, not a medical diagnostic.</li>
            <li>RULA tables reference: McAtamney & Corlett (1993) [{RULA_TABLES_VERSION}].</li>
            <li>ISO standard compliance checks reference: ISO 11226:2000 and ISO 9241-5:1998.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
