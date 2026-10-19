import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import type { Landmark, AngleMeasurement } from '../types/assessment';
import { LandmarkOverlay } from './LandmarkOverlay';

interface ImageViewerProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  landmarks: Landmark[];
  angles: AngleMeasurement[];
  viewSuitability?: 'suitable' | 'marginal' | 'unsuitable';
  viewSuitabilityNotes?: string;
  highlightedAngleName?: string | null;
}

export function ImageViewer({
  imageUrl,
  imageWidth,
  imageHeight,
  landmarks,
  angles,
  viewSuitability = 'suitable',
  viewSuitabilityNotes,
  highlightedAngleName,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale((s) => Math.min(3.5, s + 0.25));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col space-y-2">
      {/* View suitability alert */}
      {viewSuitability !== 'suitable' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-md flex items-start space-x-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">View Caution ({viewSuitability.toUpperCase()}): </span>
            <span>{viewSuitabilityNotes || 'Camera perspective may foreshorten planar joint angles.'}</span>
          </div>
        </div>
      )}

      {/* Main Image Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative overflow-hidden bg-slate-900 rounded-lg border border-slate-700 min-h-[360px] max-h-[560px] flex items-center justify-center select-none ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative inline-block"
        >
          <img
            src={imageUrl}
            alt="Ergonomic assessment posture"
            className="block max-h-[520px] max-w-full object-contain pointer-events-none rounded"
            draggable={false}
          />

          {showOverlay && (
            <LandmarkOverlay
              landmarks={landmarks}
              angles={angles}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              highlightedAngleName={highlightedAngleName}
            />
          )}
        </div>

        {/* Floating Controls Bar */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs border border-slate-700 rounded-md px-2 py-1 flex items-center space-x-1.5 text-white shadow-md">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            title={showOverlay ? 'Hide skeleton overlay' : 'Show skeleton overlay'}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
              showOverlay ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            title="Zoom out"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 transition-colors text-slate-200"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono w-12 text-center text-slate-300">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            title="Zoom in"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 transition-colors text-slate-200"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={handleReset}
            title="Reset view"
            className="p-1.5 rounded hover:bg-slate-800 transition-colors text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend in Top-Left */}
        {showOverlay && landmarks.length > 0 && (
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-700 rounded-md p-2 text-[10px] text-slate-200 shadow-md pointer-events-none">
            <div className="font-semibold text-slate-300 mb-1">Landmark Visibility</div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> &gt;0.65
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 0.5–0.65
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> &lt;0.5 /
                Highlighted
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
