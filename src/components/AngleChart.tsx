import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import type { AngleMeasurement } from '../types/assessment';

interface AngleChartProps {
  angles: AngleMeasurement[];
  onAngleSelected?: (angleName: string) => void;
  highlightedAngleName?: string | null;
}

export function AngleChart({
  angles,
  onAngleSelected,
  highlightedAngleName,
}: AngleChartProps) {
  // Filter for chart: valid angles only
  const validAngles = angles.filter((a) => a.isValid && a.valueDegrees !== null);
  const invalidAngles = angles.filter((a) => !a.isValid || a.valueDegrees === null);

  const chartData = validAngles.map((a) => ({
    name: a.name,
    degrees: a.valueDegrees,
    unit: '°',
    isHighlighted: a.name === highlightedAngleName,
  }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Joint Angle Analysis</h3>
          <p className="text-xs text-slate-500">
            Click any bar to highlight the corresponding skeletal joint on the photograph.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {validAngles.length} Valid / {angles.length} Total
        </span>
      </div>

      {/* Recharts Bar Chart */}
      {validAngles.length > 0 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 180]}
                unit="°"
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip
                formatter={(value: any) => [`${value}°`, 'Measured Angle']}
                contentStyle={{
                  backgroundColor: '#1A1A2E',
                  borderRadius: '6px',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
              />
              <ReferenceLine x={45} stroke="#CBD5E1" strokeDasharray="3 3" />
              <ReferenceLine x={90} stroke="#94A3B8" strokeDasharray="3 3" />
              <Bar
                dataKey="degrees"
                radius={[0, 4, 4, 0]}
                onClick={(data: any) => onAngleSelected && onAngleSelected(data.name)}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isHighlighted ? '#DC2626' : '#2563EB'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-md p-6 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Valid Joint Angles Available</p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Required body landmarks could not be detected with sufficient confidence (&gt; 0.5) to
            compute geometric angles without fabrication.
          </p>
        </div>
      )}

      {/* Unavailable Angles Explicit Notice */}
      {invalidAngles.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-600 block mb-1">
            Unavailable / Occluded Joint Angles (Excluded from numerical plot):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {invalidAngles.map((inv) => (
              <span
                key={inv.name}
                className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                title={inv.invalidReason || 'Landmark visibility below threshold'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                {inv.name}: Unavailable
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
