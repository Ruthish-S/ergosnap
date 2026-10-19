import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SensitivityReport } from '../modules/sensitivityAnalysis';

interface SensitivityChartProps {
  sensitivityReport: SensitivityReport;
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ sensitivityReport }) => {
  const { entries, topImpactSegment, baseline } = sensitivityReport;

  if (!baseline.isComplete || entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs text-center">
        <p className="text-xs text-slate-500">
          Sensitivity analysis requires a completed RULA Grand Score with all manual adjustments completed.
        </p>
      </div>
    );
  }

  const chartData = entries.map((e) => ({
    name: e.segment.split('/')[0].trim(),
    fullName: e.segment,
    currentScore: e.currentGrandScore,
    simulatedScore: e.simulatedGrandScore ?? e.currentGrandScore,
    reduction: e.grandScoreReduction ?? 0,
    intervention: e.interventionLabel,
  }));

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Ergonomic Intervention Sensitivity Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Simulated Grand Score reduction achieved if individual anatomical segments are improved by one level.
          </p>
        </div>
        {topImpactSegment && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded text-xs font-semibold">
            Top Priority Intervention: {topImpactSegment.split('/')[0]}
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              domain={[0, 4]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: 'Score Reduction (Points)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded shadow-lg max-w-xs border border-slate-700">
                      <p className="font-bold text-white mb-1">{data.fullName}</p>
                      <p className="text-slate-300">
                        Current Grand Score: <span className="font-bold">{data.currentScore}</span>
                      </p>
                      <p className="text-emerald-400 font-semibold">
                        Simulated Grand Score: {data.simulatedScore} (-{data.reduction} pts)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-700 pt-1">
                        <strong>Simulated Fix:</strong> {data.intervention}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="reduction" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.reduction > 0 ? (entry.reduction >= 2 ? '#dc2626' : '#ea580c') : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table of interventions */}
      <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 text-xs">
        {entries.map((entry) => (
          <div key={entry.segment} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">{entry.segment}</span>
              <p className="text-[11px] text-slate-500">{entry.interventionLabel}</p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Segment: {entry.currentSegmentScore} &rarr; {entry.simulatedSegmentScore}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  entry.grandScoreReduction && entry.grandScoreReduction > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {entry.grandScoreReduction && entry.grandScoreReduction > 0
                  ? `Grand Score: -${entry.grandScoreReduction} pts`
                  : 'No Grand Score Change'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
