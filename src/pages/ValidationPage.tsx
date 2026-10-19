import React, { useState } from 'react';
import {
  CheckSquare,
  Upload,
  BarChart2,
  Save,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { ValidationCharts } from '../components/ValidationCharts';
import type { Assessment, ReferenceAssessment } from '../types/assessment';

export default function ValidationPage() {
  const { session, dispatch, currentAssessment } = useAssessment();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    currentAssessment?.assessmentId || session.assessments[0]?.assessmentId || ''
  );

  const targetAssessment = session.assessments.find(
    (a) => a.assessmentId === selectedAssessmentId
  );

  const [assessorId, setAssessorId] = useState('Senior Ergonomist #1');
  const [refUa, setRefUa] = useState<number | ''>(
    targetAssessment?.referenceAssessment?.upperArmAngleDeg ?? ''
  );
  const [refLa, setRefLa] = useState<number | ''>(
    targetAssessment?.referenceAssessment?.lowerArmAngleDeg ?? ''
  );
  const [refNeck, setRefNeck] = useState<number | ''>(
    targetAssessment?.referenceAssessment?.neckAngleDeg ?? ''
  );
  const [refTrunk, setRefTrunk] = useState<number | ''>(
    targetAssessment?.referenceAssessment?.trunkAngleDeg ?? ''
  );
  const [refScore, setRefScore] = useState<number | ''>(
    targetAssessment?.referenceAssessment?.rulaFinalScore ?? ''
  );
  const [refNotes, setRefNotes] = useState(
    targetAssessment?.referenceAssessment?.notes ?? ''
  );

  const handleSaveReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAssessment) return;

    const ref: ReferenceAssessment = {
      assessorId,
      assignedAt: new Date().toISOString(),
      upperArmAngleDeg: refUa === '' ? null : Number(refUa),
      lowerArmAngleDeg: refLa === '' ? null : Number(refLa),
      wristAngleDeg: null,
      neckAngleDeg: refNeck === '' ? null : Number(refNeck),
      trunkAngleDeg: refTrunk === '' ? null : Number(refTrunk),
      rulaFinalScore: refScore === '' ? null : Number(refScore),
      rulaActionLevel: refScore === '' ? null : (Number(refScore) <= 2 ? 1 : Number(refScore) <= 4 ? 2 : Number(refScore) <= 6 ? 3 : 4),
      notes: refNotes,
    };

    const updated: Assessment = {
      ...targetAssessment,
      referenceAssessment: ref,
    };

    dispatch({ type: 'UPDATE_ASSESSMENT', payload: updated });
    alert('Reference assessment recorded successfully.');
  };

  // Seed sample paired validation cohort for demonstration
  const handleLoadSampleCohort = () => {
    dispatch({ type: 'SET_VALIDATION_MODE', payload: true });

    const samplePairs = [
      { title: 'Conveyor Packing (Trial 1)', autoUa: 54, refUa: 50, autoRula: 5, refRula: 5 },
      { title: 'Drill Press Operation', autoUa: 72, refUa: 75, autoRula: 6, refRula: 6 },
      { title: 'Seated Terminal Inspection', autoUa: 22, refUa: 25, autoRula: 3, refRula: 3 },
      { title: 'Pallet Stacking Lower Tier', autoUa: 94, refUa: 90, autoRula: 7, refRula: 7 },
      { title: 'Overhead Electrical Harness', autoUa: 112, refUa: 115, autoRula: 7, refRula: 7 },
      { title: 'Soldering Bench Assembly', autoUa: 38, refUa: 35, autoRula: 4, refRula: 4 },
      { title: 'Cart Loading Maneuver', autoUa: 48, refUa: 55, autoRula: 5, refRula: 4 },
    ];

    for (const [idx, s] of samplePairs.entries()) {
      const demoAss: Assessment = {
        assessmentId: `validation-sample-${idx + 1}`,
        title: s.title,
        taskType: 'Paired Validation Sample',
        date: '2024-10-15',
        assessor: 'Validation Cohort #1',
        workstationDescription: 'Controlled ergonomic validation experiment trial',
        imageMetadata: {
          filename: `sample_${idx + 1}.png`,
          width: 800,
          height: 600,
          fileType: 'image/png',
          fileSizeBytes: 240000,
          sourceType: 'controlled_test',
          transformations: [],
        },
        imageUrl: '',
        analysisTimestamp: new Date().toISOString(),
        modelInfo: {
          modelName: 'MediaPipe Pose (Validation)',
          modelVersion: 'v0.10.0',
          assetUrl: '/ergosnap/models/pose_landmarker_lite.task',
          detectionConfidence: 0.5,
          presenceConfidence: 0.5,
        },
        landmarks: [],
        angles: [
          {
            name: 'Upper Arm Angle',
            description: 'Upper arm from vertical',
            landmarkIndices: [11, 11, 13],
            valueDegrees: s.autoUa,
            isValid: true,
            isManuallyCorrected: false,
            automatedValueDegrees: s.autoUa,
            unit: 'degrees',
          },
        ],
        manualInputs: {
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
        },
        rulaAssessment: {
          segmentScores: {
            upperArm: 3,
            lowerArm: 1,
            wrist: 1,
            wristTwist: 1,
            tableAScore: 3,
            muscleUseAdjustment: 0,
            forceLoadAdjustment: 0,
            scoreA: 3,
            neck: 2,
            trunk: 2,
            legs: 1,
            tableBScore: 2,
            muscleUseAdjustmentB: 0,
            forceLoadAdjustmentB: 0,
            scoreB: 2,
            finalScore: s.autoRula,
            actionLevel: (s.autoRula <= 2 ? 1 : s.autoRula <= 4 ? 2 : s.autoRula <= 6 ? 3 : 4) as any,
          },
          missingInputFlags: [],
          scoringReferenceVersion: '1993-McAtamney-Corlett',
          isComplete: true,
          manualCorrections: {},
          assessorConfirmed: true,
        },
        qualityChecks: {
          overallStatus: 'valid',
          landmarkCompleteness: 1,
          requiredLandmarksPresent: true,
          viewSuitability: 'suitable',
          viewSuitabilityNotes: 'Controlled validation trial',
          processingStatus: 'success',
        },
        referenceAssessment: {
          assessorId: 'Goniometer Reference Assessor A',
          assignedAt: new Date().toISOString(),
          upperArmAngleDeg: s.refUa,
          lowerArmAngleDeg: 85,
          wristAngleDeg: 0,
          neckAngleDeg: 15,
          trunkAngleDeg: 10,
          rulaFinalScore: s.refRula,
          rulaActionLevel: (s.refRula <= 2 ? 1 : s.refRula <= 4 ? 2 : s.refRula <= 6 ? 3 : 4) as any,
          notes: 'Independent manual goniometer measurement and certified RULA worksheet',
        },
        recommendations: [],
        notes: 'Preloaded sample cohort for scientific agreement analysis.',
        appVersion: '1.0.0',
        scoringReferenceVersion: '1993-McAtamney-Corlett',
      };

      dispatch({ type: 'ADD_ASSESSMENT', payload: demoAss });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-red-600" />
            <span>Scientific Validation & Agreement Analysis</span>
          </h1>
          <p className="text-xs text-slate-500">
            Compare automated AI estimates with independent manual goniometer/worksheet references.
          </p>
        </div>

        <button
          onClick={handleLoadSampleCohort}
          className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Paired Validation Cohort (N=7)</span>
        </button>
      </div>

      {/* Manual Reference Entry Form */}
      {targetAssessment && (
        <form
          onSubmit={handleSaveReference}
          className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900">
            Assign Independent Reference Measurement for: "{targetAssessment.title}"
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assessor Identifier</label>
              <input
                type="text"
                value={assessorId}
                onChange={(e) => setAssessorId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Manual Upper Arm Angle (deg)
              </label>
              <input
                type="number"
                step="0.5"
                value={refUa}
                onChange={(e) => setRefUa(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Manual RULA Final Score (1–7)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={refScore}
                onChange={(e) => setRefScore(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1 to 7"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-md flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Independent Reference Labels</span>
            </button>
          </div>
        </form>
      )}

      {/* Validation Charts */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Cohort Statistical Agreement Analytics
        </h2>
        <ValidationCharts assessments={session.assessments} />
      </div>
    </div>
  );
}
