/**
 * Annotated Image Renderer for ErgoSnap Analytics
 *
 * Renders the uploaded workplace photograph with overlaid skeletal connections,
 * landmark joint points, and measured angle badges onto an HTML Canvas,
 * exporting a composite JPEG/PNG data URL suitable for embedding in PDF reports.
 */

import type { Landmark, AngleMeasurement } from '../types/assessment';

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

/**
 * Creates an annotated skeletal image data URL from the original photo and tracked landmarks.
 */
export async function createAnnotatedPostureImage(
  imageUrl: string,
  landmarks: Landmark[],
  angles: AngleMeasurement[],
  targetWidth: number = 800
): Promise<string | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const aspect = img.height / img.width;
        const w = targetWidth;
        const h = Math.round(targetWidth * aspect);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        // 1. Draw base photo
        ctx.drawImage(img, 0, 0, w, h);

        // 2. Draw slight dark vignette to make skeleton and angle badges pop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, w, h);

        const getLm = (idx: number) => landmarks.find((l) => l.index === idx);

        // 3. Draw skeletal bone lines
        ctx.lineWidth = Math.max(3, Math.round(w / 250));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
          const start = getLm(startIdx);
          const end = getLm(endIdx);
          if (!start || !end || !start.isVisible || !end.isVisible) continue;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)'; // Emerald Green
          ctx.moveTo(start.x * w, start.y * h);
          ctx.lineTo(end.x * w, end.y * h);
          ctx.stroke();
        }

        // 4. Draw landmark joint points
        const pointRadius = Math.max(4, Math.round(w / 160));
        for (const lm of landmarks) {
          if (!lm.isVisible) continue;
          const cx = lm.x * w;
          const cy = lm.y * h;

          ctx.beginPath();
          ctx.arc(cx, cy, pointRadius, 0, Math.PI * 2);
          ctx.fillStyle = lm.visibility >= 0.75 ? '#10b981' : (lm.visibility >= 0.5 ? '#f59e0b' : '#ef4444');
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }

        // 5. Draw angle callout badges for verified joints
        ctx.font = `bold ${Math.max(12, Math.round(w / 55))}px sans-serif`;

        for (const ang of angles) {
          if (!ang.isValid || ang.valueDegrees === null) continue;
          const vertex = getLm(ang.landmarkIndices[1]);
          if (!vertex || !vertex.isVisible) continue;

          const vx = vertex.x * w;
          const vy = vertex.y * h;

          const text = `${ang.valueDegrees}°`;
          const subText = ang.name.split(' ')[0]; // e.g. "Upper", "Neck", "Trunk"
          const fullLabel = `${subText}: ${text}`;
          const metrics = ctx.measureText(fullLabel);
          const badgeWidth = metrics.width + 16;
          const badgeHeight = 22;

          const bx = Math.min(w - badgeWidth - 8, Math.max(8, vx + 12));
          const by = Math.min(h - badgeHeight - 8, Math.max(8, vy - 12));

          // Badge background
          ctx.fillStyle = 'rgba(26, 26, 46, 0.9)'; // Dark slate
          ctx.beginPath();
          // Rounded rect
          const r = 4;
          ctx.moveTo(bx + r, by);
          ctx.lineTo(bx + badgeWidth - r, by);
          ctx.quadraticCurveTo(bx + badgeWidth, by, bx + badgeWidth, by + r);
          ctx.lineTo(bx + badgeWidth, by + badgeHeight - r);
          ctx.quadraticCurveTo(bx + badgeWidth, by + badgeHeight, bx + badgeWidth - r, by + badgeHeight);
          ctx.lineTo(bx + r, by + badgeHeight);
          ctx.quadraticCurveTo(bx, by + badgeHeight, bx, by + badgeHeight - r);
          ctx.lineTo(bx, by + r);
          ctx.quadraticCurveTo(bx, by, bx + r, by);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#dc2626'; // Red accent outline
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text label
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText(fullLabel, bx + 8, by + badgeHeight / 2);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Could not generate annotated posture image:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageUrl;
  });
}
