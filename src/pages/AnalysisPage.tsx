import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Sliders,
  HelpCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { ImageViewer } from '../components/ImageViewer';
import {
  detectPose,
  initializePoseDetector,
  getDetectorStatus,
} from '../modules/poseDetector';
import { validateLandmarks } from '../modules/landmarkValidation';
import { calculateRulaAngles } from '../modules/angleCalculations';
import { calculateRula } from '../modules/rulaScoring';
import { generateRecommendations } from '../modules/recommendations';
import type {
  Landmark,
  AngleMeasurement,
  ManualInputs,
} from '../types/assessment';

export default function AnalysisPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { session, dispatch } = useAssessment();

  const assessment = session.assessments.find((a) => a.assessmentId === assessmentId);

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const [manualInputs, setManualInputs] = useState<ManualInputs>(
    assessment?.manualInputs || {
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
    }
  );

  const [highlightedAngleName, setHighlightedAngleName] = useState<string | null>(null);

  // Hidden off-screen image for MediaPipe input
  const imgRef = useRef<HTMLImageElement>(null);

  const runDetection = useCallback(async () => {
    if (!assessment || !assessment.imageUrl) return;

    try {
      setIsDetecting(true);
      setDetectionError(null);

      // Load image into HTMLImageElement
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for landmark analysis'));
        img.src = assessment.imageUrl!;
      });

      // Initialize Pose Model
      setIsLoadingModel(true);
      await initializePoseDetector();
      setIsLoadingModel(false);

      // Detect Pose
      const result = await detectPose(img);

      if ('code' in result) {
        // If NO_PERSON detected (e.g. synthetic drawing or difficult lighting)
        if (session.isDemoMode) {
          // Provide synthetic benchmark keypoints for demonstration
          const demoLandmarks: Landmark[] = Array.from({ length: 33 }, (_, idx) => {
            let x = 0.44;
            let y = 0.5;
            // Place approximate upper body landmarks
            if (idx === 0) { x = 0.44; y = 0.25; } // Nose
            if (idx === 7 || idx === 8) { x = 0.44; y = 0.24; } // Ears
            if (idx === 11 || idx === 12) { x = 0.44; y = 0.34; } // Shoulders
            if (idx === 13 || idx === 14) { x = 0.53; y = 0.46; } // Elbows
            if (idx === 15 || idx === 16) { x = 0.68; y = 0.52; } // Wrists
            if (idx === 23 || idx === 24) { x = 0.41; y = 0.55; } // Hips
            if (idx === 25 || idx === 26) { x = 0.42; y = 0.70; } // Knees
            if (idx === 27 || idx === 28) { x = 0.43; y = 0.85; } // Ankles

            return {
              index: idx,
              name: `landmark_${idx}`,
              x,
              y,
              z: 0,
              visibility: 0.95,
              presence: 0.95,
              isVisible: true,
            };
          });

          processLandmarks(demoLandmarks, assessment.imageMetadata.width, assessment.imageMetadata.height);
          return;
        }

        setDetectionError(result.message);
        return;
      }

      processLandmarks(result.landmarks, assessment.imageMetadata.width, assessment.imageMetadata.height);
    } catch (err) {
      setDetectionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingModel(false);
      setIsDetecting(false);
    }
  }, [assessment, session.isDemoMode]);

  const processLandmarks = (
    landmarks: Landmark[],
    width: number,
    height: number
  ) => {
    if (!assessment) return;

    // Validate quality & completeness
    const valResult = validateLandmarks(landmarks, 'side profile');

    // Calculate angles
    const rawAngles = calculateRulaAngles(landmarks, width, height, 0.5);

    const angleMeasurements: AngleMeasurement[] = Object.values(rawAngles).map((ang) => ({
      name: ang.name,
      description: ang.description,
      landmarkIndices: ang.landmarkIndices,
      valueDegrees: ang.valueDegrees,
      isValid: ang.isValid,
      invalidReason: ang.invalidReason,
      isManuallyCorrected: false,
      automatedValueDegrees: ang.valueDegrees,
      unit: 'degrees',
    }));

    // Update assessment
    const updated: typeof assessment = {
      ...assessment,
      landmarks,
      angles: angleMeasurements,
      qualityChecks: valResult.qualityChecks,
    };

    dispatch({ type: 'UPDATE_ASSESSMENT', payload: updated });
  };

  useEffect(() => {
    if (assessment && assessment.landmarks.length === 0 && !isDetecting && !detectionError) {
      runDetection();
    }
  }, [assessment, runDetection, isDetecting, detectionError]);

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Assessment Not Found</h2>
        <button
          onClick={() => navigate('/upload')}
          className="mt-3 text-red-600 font-semibold hover:underline text-xs"
        >
          Return to Upload
        </button>
      </div>
    );
  }

  const handleCalculateRula = () => {
    // Extract required angles
    const getVal = (name: string) => {
      const a = assessment.angles.find((ang) => ang.name.toLowerCase().includes(name.toLowerCase()));
      return a && a.isValid ? a.valueDegrees : null;
    };

    const rulaAngles = {
      upperArmDeg: getVal('upper arm'),
      lowerArmDeg: getVal('lower arm'),
      wristDeg: null, // Default 2D planar neutral unless measured
      neckDeg: getVal('neck'),
      trunkDeg: getVal('trunk'),
    };

    const rulaResult = calculateRula(rulaAngles, manualInputs);
    const recs = generateRecommendations(assessment.angles, rulaResult, assessment.notes);

    const updatedAssessment: typeof assessment = {
      ...assessment,
      manualInputs,
      rulaAssessment: rulaResult,
      recommendations: recs,
    };

    dispatch({ type: 'UPDATE_ASSESSMENT', payload: updatedAssessment });
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span>Pose Landmarks & Ergonomic Input Parameters</span>
          </h1>
          <p className="text-xs text-slate-500">
            {assessment.title} • {assessment.imageMetadata.filename} ({assessment.imageMetadata.width}×{assessment.imageMetadata.height}px)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runDetection}
            disabled={isDetecting || isLoadingModel}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md flex items-center space-x-1 font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>Re-detect</span>
          </button>
        </div>
      </div>

      {/* Detection Error Alert */}
      {detectionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Landmark Detection Notice</h4>
            <p>{detectionError}</p>
            <p className="text-slate-600 mt-1">
              Ensure the photograph shows a clearly illuminated worker in side or oblique profile.
              You can still input manual angles in the next section or retry with another view.
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Image Viewer Left, Inputs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Viewer with Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800">Annotated Posture Photograph</span>
              <span className="text-[11px] text-slate-500">
                Landmarks Detected: {assessment.landmarks.filter((l) => l.isVisible).length} / 33
              </span>
            </div>

            {assessment.imageUrl && (
              <ImageViewer
                imageUrl={assessment.imageUrl}
                imageWidth={assessment.imageMetadata.width}
                imageHeight={assessment.imageMetadata.height}
                landmarks={assessment.landmarks}
                angles={assessment.angles}
                viewSuitability={assessment.qualityChecks.viewSuitability}
                viewSuitabilityNotes={assessment.qualityChecks.viewSuitabilityNotes}
                highlightedAngleName={highlightedAngleName}
              />
            )}
          </div>

          {/* Quality Breakdown Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs text-xs space-y-2">
            <h3 className="font-bold text-slate-800">Data-Quality Verification Gate</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Status
                </span>
                <span className="font-bold text-slate-800">
                  {assessment.qualityChecks.overallStatus.toUpperCase()}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Completeness
                </span>
                <span className="font-bold text-slate-800">
                  {(assessment.qualityChecks.landmarkCompleteness * 100).toFixed(0)}%
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Suitability
                </span>
                <span className="font-bold text-slate-800 capitalize">
                  {assessment.qualityChecks.viewSuitability}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Manual Parameters & RULA Factors */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>External Workstation Conditions</span>
            </h2>

            <p className="text-xs text-slate-500">
              Standard RULA requires force/load and muscle repetition factors that cannot be inferred
              from 2D still images alone.
            </p>

            <div className="space-y-3.5 text-xs">
              {/* 1. Force / Load Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Force / External Load Condition <span className="text-red-600">*</span>
                </label>
                <select
                  value={manualInputs.forceLoad || 'none'}
                  onChange={(e) =>
                    setManualInputs({ ...manualInputs, forceLoad: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="none">Score 0: Load &lt; 2 kg (intermittent)</option>
                  <option value="light">Score +1: Load 2 kg to 10 kg (intermittent)</option>
                  <option value="moderate_or_greater">
                    Score +2: Load 2–10 kg (static/repetitive) or &gt; 10 kg
                  </option>
                </select>
              </div>

              {/* 2. Muscle Use / Repetition */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Muscle Repetition / Static Duration <span className="text-red-600">*</span>
                </label>
                <select
                  value={manualInputs.muscleUse || 'occasional'}
                  onChange={(e) =>
                    setManualInputs({ ...manualInputs, muscleUse: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="occasional">Score 0: Intermittent / occasional actions</option>
                  <option value="static_or_repeated">
                    Score +1: Posture held &gt; 1 min or repeated &gt; 4 times/min
                  </option>
                </select>
              </div>

              {/* 3. Wrist Twist */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Forearm Pronation / Wrist Twist
                </label>
                <select
                  value={manualInputs.wristTwist || 'mid_range'}
                  onChange={(e) =>
                    setManualInputs({ ...manualInputs, wristTwist: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="mid_range">Score 1: Mid-range of twist</option>
                  <option value="near_end">Score 2: At or near end of twist range</option>
                </select>
              </div>

              {/* 4. Posture Adjustments Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-2">
                  Additional Postural Adjustments:
                </span>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!manualInputs.shoulderRaised}
                      onChange={(e) =>
                        setManualInputs({ ...manualInputs, shoulderRaised: e.target.checked })
                      }
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Shoulder is raised (+1 Upper Arm)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!manualInputs.upperArmAbducted}
                      onChange={(e) =>
                        setManualInputs({ ...manualInputs, upperArmAbducted: e.target.checked })
                      }
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Upper arm is abducted (+1 Upper Arm)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!manualInputs.neckTwist}
                      onChange={(e) =>
                        setManualInputs({ ...manualInputs, neckTwist: e.target.checked })
                      }
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Neck is twisted (+1 Neck)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!manualInputs.trunkTwisted}
                      onChange={(e) =>
                        setManualInputs({ ...manualInputs, trunkTwisted: e.target.checked })
                      }
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Trunk is twisted (+1 Trunk)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!manualInputs.legsSupported}
                      onChange={(e) =>
                        setManualInputs({ ...manualInputs, legsSupported: e.target.checked })
                      }
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Legs and feet are evenly supported & balanced (Score 1)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleCalculateRula}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <span>Compile RULA Assessment & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
