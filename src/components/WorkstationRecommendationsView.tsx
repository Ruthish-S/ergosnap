import React from 'react';
import type { WorkstationRecommendation } from '../modules/workstationRecommender';
import type { ShoulderMomentEstimate, ExposureRiskEvaluation } from '../modules/biomechanicalAnalysis';
import { Armchair, Monitor, Sliders, ShieldAlert, AlertCircle, Info } from 'lucide-react';

interface WorkstationRecommendationsViewProps {
  workstationRec: WorkstationRecommendation;
  shoulderMoment: ShoulderMomentEstimate;
  exposureRisk: ExposureRiskEvaluation;
}

export const WorkstationRecommendationsView: React.FC<WorkstationRecommendationsViewProps> = ({
  workstationRec,
  shoulderMoment,
  exposureRisk,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Cumulative Exposure & Biomechanical Torque Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cumulative Exposure Risk Index (CERI) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Cumulative Exposure Risk Index (CERI)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                exposureRisk.estimatedShiftExposureRisk === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : exposureRisk.estimatedShiftExposureRisk === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : exposureRisk.estimatedShiftExposureRisk === 'moderate'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {exposureRisk.estimatedShiftExposureRisk} Risk
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-black text-slate-900">
              {exposureRisk.ceriScore !== null ? exposureRisk.ceriScore : 'N/A'}
            </div>
            <span className="text-xs text-slate-500 font-medium">/ 10.0 scale (NIOSH / ISO model)</span>
          </div>

          <p className="text-xs text-slate-600">{exposureRisk.recommendationCategory}</p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Repetition: {exposureRisk.repetitionCategory.replace('_', ' ')}</span>
            <span>RULA Grand Score: {exposureRisk.rulaGrandScore ?? 'Pending'}</span>
          </div>
        </div>

        {/* Biomechanical Shoulder Moment Arm Index */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              Glenohumeral Torque Index
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                shoulderMoment.riskLevel === 'high'
                  ? 'bg-red-100 text-red-800'
                  : shoulderMoment.riskLevel === 'elevated'
                  ? 'bg-orange-100 text-orange-800'
                  : shoulderMoment.riskLevel === 'moderate'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {shoulderMoment.riskLevel} Load
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-black text-slate-900">
              {shoulderMoment.dimensionlessMomentIndex !== null
                ? (shoulderMoment.dimensionlessMomentIndex * 100).toFixed(0) + '%'
                : 'N/A'}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              of max gravitational lever envelope (sin &theta;)
            </span>
          </div>

          <p className="text-xs text-slate-600">{shoulderMoment.biomechanicalNote}</p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Upper Arm Elevation: {shoulderMoment.upperArmFlexionDeg ?? 'N/A'}°</span>
            <span className="italic">Chaffin et al. (2006) model</span>
          </div>
        </div>
      </div>

      {/* Anthropometric Workstation Fit Guidance */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Workstation Anthropometric Fit & Dimensional Adjustments
            </h3>
            <p className="text-xs text-slate-500">
              Directional engineering suggestions derived from MediaPipe landmark geometry and ISO 9241-5 / NIOSH guidelines.
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            ISO 9241-5 Layout
          </span>
        </div>

        {/* Calibration disclaimer alert */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{workstationRec.calibrationNote}</p>
        </div>

        <div className="space-y-3">
          {workstationRec.suggestions.map((sug, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {sug.element.toLowerCase().includes('desk') || sug.element.toLowerCase().includes('surface') ? (
                    <Sliders className="w-4 h-4 text-red-600" />
                  ) : sug.element.toLowerCase().includes('seat') || sug.element.toLowerCase().includes('chair') ? (
                    <Armchair className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Monitor className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="font-bold text-slate-900">{sug.element}</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  Confidence: {sug.confidence.toUpperCase()}
                </span>
              </div>

              <div className="text-slate-600">
                <strong>Observation:</strong> {sug.observedIndicator}
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800 font-medium">
                <strong>Engineering Recommendation:</strong> {sug.suggestion}
              </div>

              <div className="text-[10px] text-slate-400 italic">
                Reference Standard: {sug.reference}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
