import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { RulaAssessment } from '../types/assessment';
import { actionLevelDescription } from '../modules/rulaScoring';

interface ScoreBreakdownProps {
  rula: RulaAssessment;
  onConfirmAssessor?: () => void;
}

export function ScoreBreakdown({ rula, onConfirmAssessor }: ScoreBreakdownProps) {
  const ss = rula.segmentScores;
  const isComplete = rula.isComplete && ss.finalScore !== null && ss.actionLevel !== null;

  const actionInfo = isComplete ? actionLevelDescription(ss.actionLevel!) : null;

  const getActionBadgeColor = (level: number | null) => {
    switch (level) {
      case 1:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 2:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 4:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-6">
      {/* Header & Grand Score Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            RULA Ergonomic Evaluation (McAtamney & Corlett 1993)
          </h3>
          <p className="text-xs text-slate-500">
            Rapid Upper Limb Assessment — Complete multi-stage engineering matrix analysis
          </p>
        </div>

        {isComplete && ss.finalScore !== null && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Grand Score
              </span>
              <span className="text-2xl font-black text-slate-900">{ss.finalScore} / 7</span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-md border text-xs font-bold text-center ${getActionBadgeColor(
                ss.actionLevel
              )}`}
            >
              Action Level {ss.actionLevel}
              <span className="block text-[10px] font-medium opacity-90">
                {actionInfo?.urgency} Urgency
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Incomplete Warning Banner */}
      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Preliminary Assessment — Final Grand Score Pending</h4>
            <p>
              To prevent misleading ergonomic estimates, a final RULA score is issued only when all
              required parameters (including manual load and repetition conditions) are resolved.
            </p>
            {rula.missingInputFlags.length > 0 && (
              <ul className="list-disc list-inside mt-2 space-y-0.5 text-amber-800">
                {rula.missingInputFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Detailed Segment Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table A Group: Arm and Wrist */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Group A: Upper Limb & Wrist Analysis
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Score A: {ss.scoreA !== null ? ss.scoreA : 'Incomplete'}
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Upper Arm Posture</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.upperArm !== null ? ss.upperArm : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–6</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Lower Arm Posture</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.lowerArm !== null ? ss.lowerArm : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–3</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Wrist Posture</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.wrist !== null ? ss.wrist : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–4</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Wrist Twist</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.wristTwist !== null ? ss.wristTwist : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–2</td>
              </tr>
              <tr className="bg-slate-50/70 font-semibold">
                <td className="px-3.5 py-2 text-slate-800">Table A Matrix Lookup</td>
                <td className="px-3.5 py-2 text-right font-mono text-slate-900">
                  {ss.tableAScore !== null ? ss.tableAScore : '—'}
                </td>
                <td className="px-3 py-2 text-slate-500 text-[11px] text-right">Base Score</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-1.5 text-slate-600 pl-6">+ Muscle Use Adjustment</td>
                <td className="px-3.5 py-1.5 text-right font-mono text-slate-700">
                  +{ss.muscleUseAdjustment ?? 0}
                </td>
                <td className="px-3 py-1.5 text-slate-400 text-[11px] text-right">0 or +1</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-1.5 text-slate-600 pl-6">+ Force / Load Adjustment</td>
                <td className="px-3.5 py-1.5 text-right font-mono text-slate-700">
                  +{ss.forceLoadAdjustment ?? 0}
                </td>
                <td className="px-3 py-1.5 text-slate-400 text-[11px] text-right">0 to +2</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table B Group: Neck, Trunk and Legs */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">
              Group B: Neck, Trunk & Leg Analysis
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Score B: {ss.scoreB !== null ? ss.scoreB : 'Incomplete'}
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Neck Posture</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.neck !== null ? ss.neck : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–6</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Trunk Posture</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.trunk !== null ? ss.trunk : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–6</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-2 font-medium text-slate-700">Leg Support</td>
                <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                  {ss.legs !== null ? ss.legs : '—'}
                </td>
                <td className="px-3 py-2 text-slate-400 text-[11px] text-right">Range 1–2</td>
              </tr>
              <tr className="bg-slate-50/70 font-semibold">
                <td className="px-3.5 py-2 text-slate-800">Table B Matrix Lookup</td>
                <td className="px-3.5 py-2 text-right font-mono text-slate-900">
                  {ss.tableBScore !== null ? ss.tableBScore : '—'}
                </td>
                <td className="px-3 py-2 text-slate-500 text-[11px] text-right">Base Score</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-1.5 text-slate-600 pl-6">+ Muscle Use Adjustment</td>
                <td className="px-3.5 py-1.5 text-right font-mono text-slate-700">
                  +{ss.muscleUseAdjustmentB ?? 0}
                </td>
                <td className="px-3 py-1.5 text-slate-400 text-[11px] text-right">0 or +1</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3.5 py-1.5 text-slate-600 pl-6">+ Force / Load Adjustment</td>
                <td className="px-3.5 py-1.5 text-right font-mono text-slate-700">
                  +{ss.forceLoadAdjustmentB ?? 0}
                </td>
                <td className="px-3 py-1.5 text-slate-400 text-[11px] text-right">0 to +2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Level Guidance Note */}
      {actionInfo && (
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-700">
          <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-600" />
            <span>Recommended Ergonomic Action:</span>
          </div>
          <p>{actionInfo.description}</p>
        </div>
      )}
    </div>
  );
}
