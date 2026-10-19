import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clipboard,
  Calendar,
  User,
  Building,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { useAssessment } from '../context/AssessmentContext';
import type { ProcessedImage } from '../modules/imagePreprocessing';
import type { Assessment, ManualInputs, QualityChecks } from '../types/assessment';
import { RULA_TABLES_VERSION } from '../data/rulaTables';

export default function UploadPage() {
  const navigate = useNavigate();
  const { session, dispatch } = useAssessment();

  const [title, setTitle] = useState('Packaging Assembly Workstation');
  const [taskType, setTaskType] = useState('Manual Box Taping & Palletizing');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessor, setAssessor] = useState('R. Srinivasan, Ergonomist');
  const [workstationDescription, setWorkstationDescription] = useState(
    'Standing conveyor line, conveyor height 92 cm, repetitive box reaching at 65 cm reach depth.'
  );

  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);

  const handleImageReady = (img: ProcessedImage) => {
    setProcessedImage(img);
  };

  const handleImageRemoved = () => {
    setProcessedImage(null);
  };

  const handleStartAnalysis = () => {
    if (!processedImage || !title || !assessor) return;

    const defaultManualInputs: ManualInputs = {
      forceLoad: 'none',
      muscleUse: 'occasional',
      wristTwist: 'mid_range',
      neckTwist: false,
      neckSideBend: false,
      trunkTwisted: false,
      trunkSideBend: false,
      upperArmAbducted: false,
      shoulderRaised: false,
      leaningArm: false,
      legsSupported: true,
    };

    const initialQuality: QualityChecks = {
      overallStatus: 'review_required',
      landmarkCompleteness: 0,
      requiredLandmarksPresent: false,
      viewSuitability: 'suitable',
      viewSuitabilityNotes: 'Initial image upload registered.',
      processingStatus: 'partial',
    };

    const newAssessment: Assessment = {
      assessmentId: crypto.randomUUID(),
      title,
      taskType,
      date,
      assessor,
      workstationDescription,
      imageMetadata: {
        filename: processedImage.originalFile.name,
        width: processedImage.width,
        height: processedImage.height,
        fileType: processedImage.originalFile.type as any,
        fileSizeBytes: processedImage.originalFile.size,
        sourceType: session.isDemoMode ? 'licensed_example' : 'user_upload',
        transformations: [],
      },
      imageUrl: processedImage.displayUrl,
      analysisTimestamp: new Date().toISOString(),
      modelInfo: {
        modelName: 'MediaPipe PoseLandmarker',
        modelVersion: 'pose_landmarker_lite_float16_v0.10.0',
        assetUrl: '/ergosnap/models/pose_landmarker_lite.task',
        detectionConfidence: 0.5,
        presenceConfidence: 0.5,
      },
      landmarks: [],
      angles: [],
      manualInputs: defaultManualInputs,
      rulaAssessment: {
        segmentScores: {
          upperArm: null,
          lowerArm: null,
          wrist: null,
          wristTwist: null,
          tableAScore: null,
          muscleUseAdjustment: null,
          forceLoadAdjustment: null,
          scoreA: null,
          neck: null,
          trunk: null,
          legs: null,
          tableBScore: null,
          muscleUseAdjustmentB: null,
          forceLoadAdjustmentB: null,
          scoreB: null,
          finalScore: null,
          actionLevel: null,
        },
        missingInputFlags: ['Pose landmarks not yet detected.'],
        scoringReferenceVersion: RULA_TABLES_VERSION,
        isComplete: false,
        manualCorrections: {},
        assessorConfirmed: false,
      },
      qualityChecks: initialQuality,
      referenceAssessment: null,
      recommendations: [],
      notes: '',
      appVersion: '1.0.0',
      scoringReferenceVersion: RULA_TABLES_VERSION,
    };

    dispatch({ type: 'ADD_ASSESSMENT', payload: newAssessment });
    navigate(`/analysis/${newAssessment.assessmentId}`);
  };

  // Demo sample loader
  const handleLoadDemo = async () => {
    dispatch({ type: 'SET_DEMO_MODE', payload: true });

    // Create synthetic demo canvas image of standing posture
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, 640, 800);
      // Floor
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, 680, 640, 120);
      // Table
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(360, 420, 260, 260);

      // Simple figure silhouette
      ctx.fillStyle = '#334155';
      // Head
      ctx.beginPath();
      ctx.arc(280, 200, 36, 0, Math.PI * 2);
      ctx.fill();
      // Torso
      ctx.lineWidth = 48;
      ctx.strokeStyle = '#1E293B';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(280, 240);
      ctx.lineTo(260, 440);
      ctx.stroke();
      // Arm reaching to table
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(280, 270);
      ctx.lineTo(340, 370);
      ctx.lineTo(440, 420);
      ctx.stroke();
      // Legs
      ctx.lineWidth = 24;
      ctx.strokeStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(260, 440);
      ctx.lineTo(270, 560);
      ctx.lineTo(275, 680);
      ctx.stroke();

      // Text label
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('ErgoSnap Demo Posture (Packaging Task)', 20, 40);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'demo_workstation_packaging.png', { type: 'image/png' });
      const displayUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setProcessedImage({
          originalFile: file,
          displayUrl,
          imageElement: img,
          width: 640,
          height: 800,
          exifOrientation: 1,
          transformApplied: 'Demo Mode Synthetic Benchmark',
          coordinateScale: { x: 1, y: 1 },
        });
      };
      img.src = displayUrl;
    }, 'image/png');
  };

  const isFormValid = !!processedImage && !!title && !!assessor;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title & Scope Boundary Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Create Ergonomic Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload workplace posture photographs for computer-vision landmark detection and RULA matrix scoring.
        </p>
      </div>

      {/* Scope Notice Box */}
      <div className="bg-slate-100 border-l-4 border-slate-700 p-3.5 rounded-r-md text-xs text-slate-700 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Protocol Boundary: </span>
          ErgoSnap computes 2D planar joint angles from still photographs. It does not certify workplace safety,
          diagnose injuries, or substitute for comprehensive multi-perspective occupational evaluations.
        </div>
      </div>

      {/* Assessment Metadata Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Clipboard className="w-4 h-4 text-red-600" />
          <span>Assessment Metadata</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Assessment Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Line 2 Box Stacking"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Task Classification / Type <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              placeholder="e.g. Manual Handling / Assembly"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Evaluation Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Assessor Name & Qualification <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={assessor}
              onChange={(e) => setAssessor(e.target.value)}
              placeholder="e.g. Jane Doe, CPE"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Workstation & Task Description (Optional)
            </label>
            <textarea
              rows={2}
              value={workstationDescription}
              onChange={(e) => setWorkstationDescription(e.target.value)}
              placeholder="Record task cycle time, workstation height, equipment in use..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Workplace Posture Photograph <span className="text-red-600">*</span>
          </h2>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Benchmark Posture</span>
          </button>
        </div>

        <ImageUploader
          onImageReady={handleImageReady}
          onImageRemoved={handleImageRemoved}
          currentImage={processedImage}
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleStartAnalysis}
          disabled={!isFormValid}
          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Run Pose Landmark Detection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
