import React from 'react';
import type { Landmark, AngleMeasurement } from '../types/assessment';

interface LandmarkOverlayProps {
  landmarks: Landmark[];
  angles: AngleMeasurement[];
  imageWidth: number;
  imageHeight: number;
  highlightedAngleName?: string | null;
}

// MediaPipe standard 33 pose landmark connection pairs
const POSE_CONNECTIONS: Array<[number, number]> = [
  // Face & Head
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Shoulders & Torso
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Left Arm
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  // Right Arm
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  // Left Leg
  [23, 25],
  [25, 27],
  [27, 29],
  [27, 31],
  [29, 31],
  // Right Leg
  [24, 26],
  [26, 28],
  [28, 30],
  [28, 32],
  [30, 32],
];

export function LandmarkOverlay({
  landmarks,
  angles,
  imageWidth,
  imageHeight,
  highlightedAngleName,
}: LandmarkOverlayProps) {
  if (landmarks.length === 0 || imageWidth === 0 || imageHeight === 0) {
    return null;
  }

  const getLm = (idx: number) => landmarks.find((l) => l.index === idx);

  // Check which joints are in the highlighted angle
  const highlightedAngle = angles.find((a) => a.name === highlightedAngleName);
  const highlightedIndices = new Set<number>(
    highlightedAngle ? highlightedAngle.landmarkIndices : []
  );

  return (
    <svg
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* Skeleton Bone Connections */}
      {POSE_CONNECTIONS.map(([startIdx, endIdx], i) => {
        const start = getLm(startIdx);
        const end = getLm(endIdx);
        if (!start || !end || !start.isVisible || !end.isVisible) return null;

        const isHighlighted =
          highlightedIndices.has(startIdx) && highlightedIndices.has(endIdx);

        return (
          <line
            key={`bone-${i}`}
            x1={start.x * imageWidth}
            y1={start.y * imageHeight}
            x2={end.x * imageWidth}
            y2={end.y * imageHeight}
            stroke={isHighlighted ? '#DC2626' : 'rgba(16, 185, 129, 0.75)'}
            strokeWidth={isHighlighted ? 4.5 : 2.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Landmark Joint Dots */}
      {landmarks.map((lm) => {
        if (!lm.isVisible) return null;
        const cx = lm.x * imageWidth;
        const cy = lm.y * imageHeight;
        const isHighlighted = highlightedIndices.has(lm.index);

        let fillColor = '#10B981'; // Green (high visibility)
        if (lm.visibility < 0.65) fillColor = '#F59E0B'; // Amber
        if (lm.visibility < 0.5) fillColor = '#EF4444'; // Red
        if (isHighlighted) fillColor = '#DC2626';

        return (
          <g key={`lm-${lm.index}`}>
            <circle
              cx={cx}
              cy={cy}
              r={isHighlighted ? 7 : 4}
              fill={fillColor}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Joint Angle Badges */}
      {angles.map((ang) => {
        if (!ang.isValid || ang.valueDegrees === null) return null;
        const vertexLm = getLm(ang.landmarkIndices[1]);
        if (!vertexLm || !vertexLm.isVisible) return null;

        const x = vertexLm.x * imageWidth;
        const y = vertexLm.y * imageHeight;
        const isHighlighted = ang.name === highlightedAngleName;

        return (
          <g key={`badge-${ang.name}`} transform={`translate(${x + 12}, ${y - 8})`} filter="url(#shadow)">
            <rect
              x="-4"
              y="-12"
              width="52"
              height="18"
              rx="4"
              fill={isHighlighted ? '#DC2626' : '#1A1A2E'}
              fillOpacity="0.85"
            />
            <text
              x="22"
              y="0"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {ang.valueDegrees}°
            </text>
          </g>
        );
      })}
    </svg>
  );
}
