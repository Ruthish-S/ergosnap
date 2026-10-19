import React from 'react';
import type { AngleMeasurement } from '../types/assessment';

interface NeutralZoneSpec {
  name: string;
  keySubstr: string;
  neutralRange: [number, number]; // [min, max] degrees
  unit: string;
  sourceStandard: string;
  description: string;
}

const NEUTRAL_ZONE_SPECS: NeutralZoneSpec[] = [
  {
    name: 'Upper Arm Elevation',
    keySubstr: 'upper arm',
    neutralRange: [0, 20],
    unit: 'degrees',
    sourceStandard: 'ISO 11226:2000 §4.2.1',
    description: 'Arm flexion/abduction 0°–20° relative to trunk vertical.',
  },
  {
    name: 'Elbow / Forearm Flexion',
    keySubstr: 'lower arm',
    neutralRange: [60, 100],
    unit: 'degrees',
    sourceStandard: 'ISO 11226:2000 §4.2.2',
    description: 'Forearm resting angle 60°–100° minimizes biceps/brachioradialis strain.',
  },
  {
    name: 'Neck / Cervical Flexion',
    keySubstr: 'neck',
    neutralRange: [0, 20],
    unit: 'degrees',
    sourceStandard: 'ISO 11226:2000 §4.1.1',
    description: 'Cervical inclination 0°–20° prevents excessive extensor muscle demand.',
  },
  {
    name: 'Trunk / Thoracic Inclination',
    keySubstr: 'trunk',
    neutralRange: [0, 20],
    unit: 'degrees',
    sourceStandard: 'ISO 11226:2000 §4.1.2',
    description: 'Trunk sagittal tilt 0°–20° avoids elevated lumbar disc compression.',
  },
  {
    name: 'Wrist Flexion / Extension',
    keySubstr: 'wrist',
    neutralRange: [-15, 15],
    unit: 'degrees',
    sourceStandard: 'ISO 11226:2000 §4.2.3',
    description: 'Wrist deviation within ±15° from neutral prevents carpal tunnel pressure spikes.',
  },
];

interface NeutralZoneGaugeProps {
  angles: AngleMeasurement[];
}

export const NeutralZoneGauge: React.FC<NeutralZoneGaugeProps> = ({ angles }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Postural Neutral Zone Indicators (ISO 11226:2000)
          </h3>
          <p className="text-xs text-slate-500">
            Assessment of joint angles against internationally standardized comfort and acceptable static posture envelopes.
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          ISO 11226 Compliance Check
        </span>
      </div>

      <div className="space-y-4">
        {NEUTRAL_ZONE_SPECS.map((spec) => {
          const match = angles.find((a) =>
            a.name.toLowerCase().includes(spec.keySubstr.toLowerCase()) && a.isValid
          );
          const val = match?.valueDegrees ?? null;

          let deviation = 0;
          let status: 'neutral' | 'moderate_deviation' | 'severe_deviation' | 'missing' = 'missing';

          if (val !== null) {
            if (val < spec.neutralRange[0]) {
              deviation = spec.neutralRange[0] - val;
            } else if (val > spec.neutralRange[1]) {
              deviation = val - spec.neutralRange[1];
            } else {
              deviation = 0;
            }

            if (deviation === 0) {
              status = 'neutral';
            } else if (deviation <= 20) {
              status = 'moderate_deviation';
            } else {
              status = 'severe_deviation';
            }
          }

          // Gauge bar positioning calculation (0 to 120 degree visual scale)
          const maxScale = 120;
          const leftPercent = Math.min(100, Math.max(0, (spec.neutralRange[0] / maxScale) * 100));
          const widthPercent = Math.min(
            100 - leftPercent,
            Math.max(5, ((spec.neutralRange[1] - spec.neutralRange[0]) / maxScale) * 100)
          );
          const pointerPercent = val !== null
            ? Math.min(98, Math.max(2, (val / maxScale) * 100))
            : null;

          return (
            <div key={spec.name} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">{spec.name}</span>
                  <span className="text-[10px] text-slate-500 ml-2">({spec.sourceStandard})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {val !== null ? `${val}°` : 'Unavailable'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      status === 'neutral'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'moderate_deviation'
                        ? 'bg-amber-100 text-amber-800'
                        : status === 'severe_deviation'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {status === 'neutral'
                      ? 'Within Envelope'
                      : status === 'moderate_deviation'
                      ? `+${deviation.toFixed(0)}° Deviation`
                      : status === 'severe_deviation'
                      ? `+${deviation.toFixed(0)}° Severe`
                      : 'Unscorable'}
                  </span>
                </div>
              </div>

              {/* Visual Range Bar */}
              <div className="space-y-1">
                <div className="relative h-4 bg-slate-200 rounded-full overflow-visible">
                  {/* Neutral comfort zone envelope in green */}
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-400/60 border border-emerald-500 rounded-sm"
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                    title={`Neutral range: ${spec.neutralRange[0]}° to ${spec.neutralRange[1]}°`}
                  />

                  {/* Marker for current posture */}
                  {pointerPercent !== null && (
                    <div
                      className="absolute top-[-3px] bottom-[-3px] w-1.5 bg-slate-900 rounded-full shadow-md z-10"
                      style={{ left: `${pointerPercent}%` }}
                      title={`Current value: ${val}°`}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0°</span>
                  <span className="text-emerald-700 font-medium">
                    Comfort Zone: {spec.neutralRange[0]}°–{spec.neutralRange[1]}°
                  </span>
                  <span>120°</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">{spec.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
