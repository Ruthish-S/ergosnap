import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import type { Assessment } from '../types/assessment';
import {
  continuousAgreement,
  ordinalAgreement,
  type PairedMeasurement,
} from '../modules/statistics';

interface ValidationChartsProps {
  assessments: Assessment[];
}

export function ValidationCharts({ assessments }: ValidationChartsProps) {
  // Extract paired assessments that possess independent reference labels
  const pairedWithRef = assessments.filter((a) => a.referenceAssessment !== null);

  const anglePairs: PairedMeasurement[] = [];
  const rulaPairs: PairedMeasurement[] = [];

  for (const a of pairedWithRef) {
    const ref = a.referenceAssessment!;

    // Pair RULA scores
    if (a.rulaAssessment.segmentScores.finalScore !== null && ref.rulaFinalScore !== null) {
      rulaPairs.push({
        automated: a.rulaAssessment.segmentScores.finalScore,
        reference: ref.rulaFinalScore,
      });
    }

    // Pair continuous angle estimates (Upper Arm)
    const autoUa = a.angles.find((ang) => ang.name.includes('Upper Arm'))?.valueDegrees;
    if (autoUa !== null && autoUa !== undefined && ref.upperArmAngleDeg !== null) {
      anglePairs.push({
        automated: autoUa,
        reference: ref.upperArmAngleDeg,
      });
    }
  }

  const rulaAgreement = ordinalAgreement(rulaPairs, 1, 7);
  const contAgreement = continuousAgreement(anglePairs);

  if (pairedWithRef.length < 2) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Validation Analytics Unavailable</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5">
          Validation statistics (Bland-Altman, weighted Cohen's Kappa, and confusion matrices)
          require at least two assessments paired with independent reference measurements.
          Navigate to the <span className="font-semibold text-red-600">Validation</span> tab to enter reference labels.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agreement Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Sample Size</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{pairedWithRef.length} pairs</div>
          <span className="text-[10px] text-slate-400">Independent Observations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Exact Agreement</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {rulaAgreement ? `${(rulaAgreement.exactAgreement * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400">
            {rulaAgreement?.exactAgreementCount ?? 0} of {rulaPairs.length} Exact Scores
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Weighted Kappa (κ)</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {rulaAgreement?.weightedKappa !== null ? rulaAgreement?.weightedKappa : 'N/A'}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            {rulaAgreement?.kappaInterpretation}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Angle MAE</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {contAgreement ? `${contAgreement.mae}°` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400">
            Bias: {contAgreement ? `${contAgreement.signedBias > 0 ? '+' : ''}${contAgreement.signedBias}°` : '—'}
          </span>
        </div>
      </div>

      {/* Plots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plot 1: AI vs Manual Scatter */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 mb-1">
            RULA Score Agreement: AI vs Independent Manual Reference
          </h4>
          <p className="text-[11px] text-slate-500 mb-3">
            Diagonal line represents identity (perfect agreement).
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <XAxis
                  type="number"
                  dataKey="reference"
                  name="Manual Reference"
                  domain={[1, 7]}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  unit=""
                  label={{ value: 'Reference RULA Score', position: 'bottom', offset: -5, fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="automated"
                  name="Automated AI"
                  domain={[1, 7]}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  unit=""
                  label={{ value: 'AI RULA Score', angle: -90, position: 'left', offset: 10, fontSize: 10 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine x={1} y={1} stroke="#CBD5E1" />
                <ReferenceLine
                  segment={[{ x: 1, y: 1 }, { x: 7, y: 7 }]}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                />
                <Scatter name="Assessments" data={rulaPairs} fill="#DC2626" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Bland-Altman for Continuous Angles */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 mb-1">
            Bland–Altman Plot: Upper Arm Joint Angles
          </h4>
          <p className="text-[11px] text-slate-500 mb-3">
            Mean of methods vs difference (AI − Reference). Dotted lines show 95% LoA.
          </p>

          {contAgreement ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <XAxis
                    type="number"
                    dataKey="mean"
                    name="Mean of methods"
                    unit="°"
                    label={{ value: 'Mean Angle (°)', position: 'bottom', offset: -5, fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="difference"
                    name="Difference (AI - Ref)"
                    unit="°"
                    label={{ value: 'Difference (°)', angle: -90, position: 'left', offset: 10, fontSize: 10 }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <ReferenceLine y={0} stroke="#64748B" />
                  <ReferenceLine
                    y={contAgreement.signedBias}
                    stroke="#2563EB"
                    strokeDasharray="3 3"
                    label={{ value: `Bias: ${contAgreement.signedBias}°`, fill: '#2563EB', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={contAgreement.loaUpper}
                    stroke="#DC2626"
                    strokeDasharray="2 2"
                    label={{ value: `+1.96 SD: ${contAgreement.loaUpper}°`, fill: '#DC2626', fontSize: 9 }}
                  />
                  <ReferenceLine
                    y={contAgreement.loaLower}
                    stroke="#DC2626"
                    strokeDasharray="2 2"
                    label={{ value: `-1.96 SD: ${contAgreement.loaLower}°`, fill: '#DC2626', fontSize: 9 }}
                  />
                  <Scatter name="Angle Pairs" data={contAgreement.blandAltmanPairs} fill="#2563EB" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              Insufficient continuous angle pairs for Bland-Altman limits.
            </div>
          )}
        </div>
      </div>

      {/* Confusion Matrix Table */}
      {rulaAgreement && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 mb-1">
            RULA Score Confusion Matrix (Reference vs Automated)
          </h4>
          <p className="text-[11px] text-slate-500 mb-3">
            Rows represent independent human reference scores; columns represent automated algorithm outputs.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-100 p-2 font-semibold text-slate-700">
                    Ref \ Auto
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <th
                      key={col}
                      className="border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-700 w-12"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rulaAgreement.confusionMatrix.map((row, refIdx) => (
                  <tr key={refIdx}>
                    <td className="border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800">
                      Score {refIdx + 1}
                    </td>
                    {row.map((cell, autoIdx) => (
                      <td
                        key={autoIdx}
                        className={`border border-slate-200 p-2 font-mono ${
                          refIdx === autoIdx && cell > 0
                            ? 'bg-emerald-100 font-bold text-emerald-900'
                            : cell > 0
                            ? 'bg-red-50 text-red-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
