import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, AlertCircle, FileImage, Loader2, CheckCircle2 } from 'lucide-react';
import {
  preprocessImage,
  type ProcessedImage,
  type PreprocessingError,
} from '../modules/imagePreprocessing';

interface ImageUploaderProps {
  onImageReady: (image: ProcessedImage) => void;
  onImageRemoved?: () => void;
  currentImage?: ProcessedImage | null;
  disabled?: boolean;
}

export function ImageUploader({
  onImageReady,
  onImageRemoved,
  currentImage,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PreprocessingError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      const result = await preprocessImage(file);
      setIsProcessing(false);

      if ('code' in result) {
        setError(result);
      } else {
        onImageReady(result);
      }
    },
    [onImageReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isProcessing) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, isProcessing, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      {!currentImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[220px] ${
            isDragging
              ? 'border-red-500 bg-red-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={disabled || isProcessing}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <p className="text-sm font-medium text-slate-700">Decoding & verifying image...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <Upload className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">
                Drag and drop a posture photograph here, or{' '}
                <span className="text-red-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Supported formats: JPEG, PNG, WebP (Max 20 MB). Side/sagittal profile recommended
                for standard ergonomic RULA analysis.
              </p>
            </>
          )}
        </div>
      ) : (
        /* Preview Strip */
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={currentImage.displayUrl}
              alt="Uploaded posture preview"
              className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
            />
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <FileImage className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {currentImage.originalFile.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentImage.width} × {currentImage.height} px •{' '}
                {(currentImage.originalFile.size / 1024).toFixed(0)} KB •{' '}
                {currentImage.originalFile.type}
              </p>
              {currentImage.transformApplied && (
                <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1">
                  {currentImage.transformApplied}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onImageRemoved && onImageRemoved()}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Error [{error.code}]: </span>
            <span>{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
