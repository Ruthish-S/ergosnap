import React, { useState } from 'react';
import type { WmsdRiskMap, BodyRegionRisk } from '../modules/wmsdRiskMapping';

interface RiskHeatmapProps {
  riskMap: WmsdRiskMap;
}

const COLOR_MAP: Record<string, { fill: string; stroke: string; badge: string; text: string }> = {
  low: {
    fill: '#dcfce7',
    stroke: '#16a34a',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'text-emerald-700',
  },
  moderate: {
    fill: '#fef3c7',
    stroke: '#d97706',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    text: 'text-amber-700',
  },
  high: {
    fill: '#ffedd5',
    stroke: '#ea580c',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    text: 'text-orange-700',
  },
  critical: {
    fill: '#fee2e2',
    stroke: '#dc2626',
    badge: 'bg-red-100 text-red-800 border-red-300',
    text: 'text-red-700',
  },
  unknown: {
    fill: '#f1f5f9',
    stroke: '#94a3b8',
    badge: 'bg-slate-100 text-slate-600 border-slate-300',
    text: 'text-slate-500',
  },
};

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ riskMap }) => {
  const [selectedRegion, setSelectedRegion] = useState<BodyRegionRisk | null>(
    riskMap.regions[0] ?? null
  );

  const getRegion = (keyword: string): BodyRegionRisk | undefined => {
    return riskMap.regions.find((r) =>
      r.region.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const neck = getRegion('neck');
  const trunk = getRegion('trunk');
  const shoulder = getRegion('shoulder');
  const elbow = getRegion('elbow');
  const wrist = getRegion('wrist');
  const legs = getRegion('legs');

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Work-Related Musculoskeletal Disorder (WMSD) Risk Mapping
          </h3>
          <p className="text-xs text-slate-500">
            Biomechanical stress distribution map synthesized from RULA scores and ISO 11226 neutral zones.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Overall Body Risk:</span>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${
              COLOR_MAP[riskMap.overallBodyRisk]?.badge ?? 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            {riskMap.overallBodyRisk}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Anatomical Schematic SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <svg viewBox="0 0 240 340" className="w-52 h-72 drop-shadow-sm select-none">
            {/* Head */}
            <circle
              cx="120"
              cy="35"
              r="22"
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="2"
            />

            {/* Neck */}
            <rect
              x="110"
              y="58"
              width="20"
              height="20"
              rx="4"
              fill={COLOR_MAP[neck?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[neck?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2.5"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => neck && setSelectedRegion(neck)}
            />

            {/* Shoulders / Clavicle bar */}
            <path
              d="M 65 80 L 175 80 L 165 98 L 75 98 Z"
              fill={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2.5"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => shoulder && setSelectedRegion(shoulder)}
            />

            {/* Trunk / Torso */}
            <rect
              x="85"
              y="102"
              width="70"
              height="95"
              rx="8"
              fill={COLOR_MAP[trunk?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[trunk?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2.5"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => trunk && setSelectedRegion(trunk)}
            />

            {/* Arms - Upper arms */}
            <rect
              x="52"
              y="85"
              width="18"
              height="55"
              rx="6"
              fill={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => shoulder && setSelectedRegion(shoulder)}
            />
            <rect
              x="170"
              y="85"
              width="18"
              height="55"
              rx="6"
              fill={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[shoulder?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => shoulder && setSelectedRegion(shoulder)}
            />

            {/* Elbows */}
            <circle
              cx="61"
              cy="148"
              r="10"
              fill={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => elbow && setSelectedRegion(elbow)}
            />
            <circle
              cx="179"
              cy="148"
              r="10"
              fill={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => elbow && setSelectedRegion(elbow)}
            />

            {/* Forearms */}
            <rect
              x="53"
              y="160"
              width="16"
              height="45"
              rx="5"
              fill={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => elbow && setSelectedRegion(elbow)}
            />
            <rect
              x="171"
              y="160"
              width="16"
              height="45"
              rx="5"
              fill={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[elbow?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => elbow && setSelectedRegion(elbow)}
            />

            {/* Wrists & Hands */}
            <circle
              cx="61"
              cy="215"
              r="9"
              fill={COLOR_MAP[wrist?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[wrist?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => wrist && setSelectedRegion(wrist)}
            />
            <circle
              cx="179"
              cy="215"
              r="9"
              fill={COLOR_MAP[wrist?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[wrist?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => wrist && setSelectedRegion(wrist)}
            />

            {/* Pelvis & Upper Legs */}
            <path
              d="M 85 200 L 155 200 L 145 220 L 95 220 Z"
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <rect
              x="92"
              y="222"
              width="24"
              height="65"
              rx="6"
              fill={COLOR_MAP[legs?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[legs?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => legs && setSelectedRegion(legs)}
            />
            <rect
              x="124"
              y="222"
              width="24"
              height="65"
              rx="6"
              fill={COLOR_MAP[legs?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[legs?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="2"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => legs && setSelectedRegion(legs)}
            />

            {/* Lower Legs */}
            <rect
              x="94"
              y="290"
              width="20"
              height="40"
              rx="5"
              fill={COLOR_MAP[legs?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[legs?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => legs && setSelectedRegion(legs)}
            />
            <rect
              x="126"
              y="290"
              width="20"
              height="40"
              rx="5"
              fill={COLOR_MAP[legs?.riskLevel ?? 'unknown'].fill}
              stroke={COLOR_MAP[legs?.riskLevel ?? 'unknown'].stroke}
              strokeWidth="1.5"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => legs && setSelectedRegion(legs)}
            />
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-200 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Missing</span>
          </div>
        </div>

        {/* Detailed Region Inspection Panel */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Anatomical Risk Diagnostics (Click diagram region to inspect)
          </div>

          {selectedRegion ? (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">{selectedRegion.region}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    COLOR_MAP[selectedRegion.riskLevel].badge
                  }`}
                >
                  {selectedRegion.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">RULA Segment Score</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedRegion.score !== null ? `${selectedRegion.score}` : 'Unavailable'}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Measured Joint Angle</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedRegion.angleDeg !== null ? `${selectedRegion.angleDeg}°` : 'Estimated / N/A'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold">ISO 11226:2000 Comfort Range</div>
                <div className="font-medium text-slate-800">
                  {selectedRegion.neutralRangeDeg[0] !== 0 || selectedRegion.neutralRangeDeg[1] !== 0
                    ? `${selectedRegion.neutralRangeDeg[0]}° to ${selectedRegion.neutralRangeDeg[1]}°`
                    : 'Bilateral balanced load required'}
                  {selectedRegion.deviationDeg !== null && selectedRegion.deviationDeg > 0 && (
                    <span className="text-red-600 font-bold ml-2">
                      (+{selectedRegion.deviationDeg.toFixed(1)}° deviation)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-slate-600">
                <strong>Basis:</strong> {selectedRegion.basis}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200 text-xs">
              Select any anatomical segment above to review biomechanical criteria.
            </div>
          )}

          {/* Quick listing of all 6 regions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {riskMap.regions.map((reg) => (
              <button
                key={reg.region}
                onClick={() => setSelectedRegion(reg)}
                className={`p-2 rounded text-left border text-xs transition-colors ${
                  selectedRegion?.region === reg.region
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-800 text-[11px] truncate">{reg.region.split('/')[0]}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">
                    {reg.score !== null ? `Score ${reg.score}` : 'Pending'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      reg.riskLevel === 'critical'
                        ? 'bg-red-500'
                        : reg.riskLevel === 'high'
                        ? 'bg-orange-500'
                        : reg.riskLevel === 'moderate'
                        ? 'bg-amber-500'
                        : reg.riskLevel === 'low'
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
