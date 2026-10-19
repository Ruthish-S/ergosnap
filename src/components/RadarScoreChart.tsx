import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { RulaSegmentScores } from '../types/assessment';

interface RadarScoreChartProps {
  segmentScores: RulaSegmentScores;
}

export const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ segmentScores }) => {
  const data = [
    {
      segment: 'Upper Arm',
      score: segmentScores.upperArm ?? 0,
      max: 6,
      status: segmentScores.upperArm !== null ? 'Valid' : 'Missing',
    },
    {
      segment: 'Lower Arm',
      score: segmentScores.lowerArm ?? 0,
      max: 3,
      status: segmentScores.lowerArm !== null ? 'Valid' : 'Missing',
    },
    {
      segment: 'Wrist',
      score: segmentScores.wrist ?? 0,
      max: 4,
      status: segmentScores.wrist !== null ? 'Valid' : 'Missing',
    },
    {
      segment: 'Neck',
      score: segmentScores.neck ?? 0,
      max: 6,
      status: segmentScores.neck !== null ? 'Valid' : 'Missing',
    },
    {
      segment: 'Trunk',
      score: segmentScores.trunk ?? 0,
      max: 6,
      status: segmentScores.trunk !== null ? 'Valid' : 'Missing',
    },
    {
      segment: 'Legs',
      score: segmentScores.legs ?? 0,
      max: 2,
      status: segmentScores.legs !== null ? 'Valid' : 'Missing',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">RULA Segment Risk Profile (Spider Radar)</h3>
          <p className="text-xs text-slate-500">
            Multiaxial visualization of postural strain distribution across 6 anatomical segments.
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          McAtamney & Corlett (1993)
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="segment"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 6]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              stroke="#cbd5e1"
            />
            <Radar
              name="RULA Segment Score"
              dataKey="score"
              stroke="#dc2626"
              fill="#ef4444"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg border border-slate-700">
                      <p className="font-bold">{item.segment}</p>
                      <p className="text-slate-300">
                        Score: <span className="font-bold text-red-400">{item.score}</span> / {item.max}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Status: {item.status}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
        {data.map((d) => (
          <div key={d.segment} className="bg-slate-50 p-1.5 rounded border border-slate-200">
            <div className="text-[10px] font-medium text-slate-500 truncate">{d.segment}</div>
            <div className={`text-xs font-bold ${d.score >= 4 ? 'text-red-600' : d.score >= 3 ? 'text-amber-600' : 'text-slate-700'}`}>
              {d.score > 0 ? `${d.score} / ${d.max}` : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
