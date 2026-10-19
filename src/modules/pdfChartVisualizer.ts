/**
 * PDF Chart Visualizer for ErgoSnap Analytics
 *
 * Generates crisp, high-resolution Canvas chart graphics (Radar Spider Plot,
 * Sensitivity Bar Chart, and Anatomical WMSD Diagram) specifically tailored
 * for high-DPI embedding into client-side jsPDF reports.
 */

import type { RulaSegmentScores } from '../types/assessment';
import type { SensitivityEntry } from './sensitivityAnalysis';
import type { WmsdRiskMap } from './wmsdRiskMapping';

/**
 * Generates a clean, high-resolution radar/spider chart of RULA segment scores.
 */
export function generateRadarChartDataUrl(
  segmentScores: RulaSegmentScores,
  size: number = 500
): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const center = size / 2;
    const radius = size * 0.38;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const segments = [
      { name: 'Upper Arm', score: segmentScores.upperArm ?? 0, max: 6 },
      { name: 'Lower Arm', score: segmentScores.lowerArm ?? 0, max: 3 },
      { name: 'Wrist', score: segmentScores.wrist ?? 0, max: 4 },
      { name: 'Neck', score: segmentScores.neck ?? 0, max: 6 },
      { name: 'Trunk', score: segmentScores.trunk ?? 0, max: 6 },
      { name: 'Legs', score: segmentScores.legs ?? 0, max: 2 },
    ];

    const totalAxes = segments.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // 1. Draw concentric grid polygons (levels 1 to 6)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;

    for (let level = 1; level <= 6; level++) {
      const r = (radius / 6) * level;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Level number
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(String(level), center + 3, center - r + 3);
    }

    // 2. Draw axis lines from center to outer edge
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Axis label
      const labelX = center + (radius + 28) * Math.cos(angle);
      const labelY = center + (radius + 28) * Math.sin(angle);
      const seg = segments[i];

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${seg.name} (${seg.score}/${seg.max})`, labelX, labelY);
    }

    // 3. Draw score polygon
    const points: Array<[number, number]> = [];
    for (let i = 0; i < totalAxes; i++) {
      const seg = segments[i];
      const normalizedScore = Math.min(6, Math.max(0, seg.score));
      const r = (radius / 6) * normalizedScore;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push([x, y]);
    }

    // Fill polygon
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(220, 38, 38, 0.25)'; // Red accent with opacity
    ctx.fill();

    // Stroke polygon
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw vertex dots
    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to render radar chart for PDF:', err);
    return null;
  }
}

/**
 * Generates a clean bar chart image of the sensitivity analysis.
 */
export function generateSensitivityChartDataUrl(
  entries: SensitivityEntry[],
  width: number = 650,
  height: number = 300
): string | null {
  if (typeof document === 'undefined' || entries.length === 0) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padLeft = 140;
    const padRight = 50;
    const padTop = 30;
    const padBottom = 40;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Grid lines for 0 to 3 reduction points
    const maxReduction = 3;
    for (let p = 0; p <= maxReduction; p++) {
      const x = padLeft + (chartW / maxReduction) * p;
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p} pts`, x, height - padBottom + 16);
    }

    const barCount = entries.length;
    const barHeight = Math.min(26, (chartH / barCount) * 0.7);
    const rowStep = chartH / barCount;

    entries.forEach((entry, idx) => {
      const y = padTop + idx * rowStep + (rowStep - barHeight) / 2;
      const reduction = entry.grandScoreReduction ?? 0;
      const barW = Math.max(4, (reduction / maxReduction) * chartW);

      // Label
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const shortName = entry.segment.split('/')[0].trim();
      ctx.fillText(shortName, padLeft - 10, y + barHeight / 2);

      // Bar
      ctx.fillStyle = reduction > 0 ? (reduction >= 2 ? '#dc2626' : '#ea580c') : '#cbd5e1';
      ctx.beginPath();
      // Rounded bar right edge
      const r = 3;
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + barW - r, y);
      ctx.quadraticCurveTo(padLeft + barW, y, padLeft + barW, y + r);
      ctx.lineTo(padLeft + barW, y + barHeight - r);
      ctx.quadraticCurveTo(padLeft + barW, y + barHeight, padLeft + barW - r, y + barHeight);
      ctx.lineTo(padLeft, y + barHeight);
      ctx.closePath();
      ctx.fill();

      // Value text after bar
      ctx.fillStyle = reduction > 0 ? '#1e293b' : '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        reduction > 0 ? `-${reduction} pt (New: ${entry.simulatedGrandScore})` : 'No change',
        padLeft + barW + 8,
        y + barHeight / 2
      );
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to render sensitivity chart for PDF:', err);
    return null;
  }
}

/**
 * Generates an anatomical schematic graphic representing WMSD risks.
 */
export function generateWmsdHeatmapDataUrl(
  riskMap: WmsdRiskMap,
  width: number = 400,
  height: number = 420
): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const colorFor = (level: string) => {
      switch (level) {
        case 'critical': return '#dc2626'; // Red
        case 'high': return '#ea580c';     // Orange
        case 'moderate': return '#d97706'; // Amber
        case 'low': return '#16a34a';      // Green
        default: return '#94a3b8';         // Slate
      }
    };

    const neck = riskMap.regions.find((r) => r.region.toLowerCase().includes('neck'));
    const trunk = riskMap.regions.find((r) => r.region.toLowerCase().includes('trunk'));
    const shoulder = riskMap.regions.find((r) => r.region.toLowerCase().includes('shoulder'));
    const elbow = riskMap.regions.find((r) => r.region.toLowerCase().includes('elbow'));
    const wrist = riskMap.regions.find((r) => r.region.toLowerCase().includes('wrist'));
    const legs = riskMap.regions.find((r) => r.region.toLowerCase().includes('legs'));

    const cx = width / 2;

    // Head
    ctx.beginPath();
    ctx.arc(cx, 50, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Neck
    ctx.fillStyle = colorFor(neck?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 12, 78, 24, 20);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 12, 78, 24, 20);

    // Shoulders
    ctx.fillStyle = colorFor(shoulder?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 65, 100, 130, 20);
    ctx.strokeRect(cx - 65, 100, 130, 20);

    // Trunk
    ctx.fillStyle = colorFor(trunk?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 45, 122, 90, 100);
    ctx.strokeRect(cx - 45, 122, 90, 100);

    // Upper Arms
    ctx.fillStyle = colorFor(shoulder?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 85, 105, 18, 60);
    ctx.strokeRect(cx - 85, 105, 18, 60);
    ctx.fillRect(cx + 67, 105, 18, 60);
    ctx.strokeRect(cx + 67, 105, 18, 60);

    // Forearms / Elbows
    ctx.fillStyle = colorFor(elbow?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 85, 168, 18, 55);
    ctx.strokeRect(cx - 85, 168, 18, 55);
    ctx.fillRect(cx + 67, 168, 18, 55);
    ctx.strokeRect(cx + 67, 168, 18, 55);

    // Wrists / Hands
    ctx.fillStyle = colorFor(wrist?.riskLevel ?? 'unknown');
    ctx.beginPath();
    ctx.arc(cx - 76, 235, 12, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 76, 235, 12, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Legs
    ctx.fillStyle = colorFor(legs?.riskLevel ?? 'unknown');
    ctx.fillRect(cx - 38, 226, 32, 120);
    ctx.strokeRect(cx - 38, 226, 32, 120);
    ctx.fillRect(cx + 6, 226, 32, 120);
    ctx.strokeRect(cx + 6, 226, 32, 120);

    // Legend on bottom
    const legY = height - 30;
    const legendItems = [
      { label: 'Low', color: '#16a34a' },
      { label: 'Moderate', color: '#d97706' },
      { label: 'High', color: '#ea580c' },
      { label: 'Critical', color: '#dc2626' },
    ];
    let startX = 35;
    legendItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(startX, legY, 14, 14);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(startX, legY, 14, 14);

      ctx.fillStyle = '#334155';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, startX + 18, legY + 11);
      startX += 85;
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to render WMSD map for PDF:', err);
    return null;
  }
}
