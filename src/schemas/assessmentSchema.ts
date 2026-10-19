import { z } from 'zod';
import type { Assessment, AssessmentSession } from '../types/assessment';

export const sourceTypes = ['user_upload', 'licensed_example', 'controlled_test'] as const;
export const observationStatuses = ['valid', 'review_required', 'unscorable'] as const;
export const actionLevels = [1, 2, 3, 4] as const;

export const imageTransformationSchema = z.object({
  type: z.enum(['rotate', 'crop', 'resize']),
  parameters: z.record(z.string(), z.number()),
  appliedAt: z.string(),
});

export const imageMetadataSchema = z.object({
  filename: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().nonnegative(),
  sourceType: z.enum(sourceTypes),
  transformations: z.array(imageTransformationSchema),
});

export const modelInfoSchema = z.object({
  modelName: z.string(),
  modelVersion: z.string(),
  assetUrl: z.string(),
  detectionConfidence: z.number().min(0).max(1),
  presenceConfidence: z.number().min(0).max(1),
});

export const landmarkSchema = z.object({
  index: z.number().int().min(0).max(32),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  visibility: z.number().min(0).max(1),
  presence: z.number().min(0).max(1),
  isVisible: z.boolean(),
});

export const angleMeasurementSchema = z.object({
  name: z.string(),
  description: z.string(),
  landmarkIndices: z.tuple([z.number(), z.number(), z.number()]),
  valueDegrees: z.number().nullable(),
  isValid: z.boolean(),
  invalidReason: z.string().optional(),
  isManuallyCorrected: z.boolean(),
  automatedValueDegrees: z.number().nullable(),
  unit: z.literal('degrees'),
});

export const manualInputsSchema = z.object({
  forceLoad: z.enum(['none', 'light', 'moderate_or_greater']).nullable(),
  muscleUse: z.enum(['occasional', 'static_or_repeated']).nullable(),
  wristTwist: z.enum(['mid_range', 'near_end']).nullable(),
  neckTwist: z.boolean().nullable(),
  neckSideBend: z.boolean().nullable(),
  trunkTwisted: z.boolean().nullable(),
  trunkSideBend: z.boolean().nullable(),
  upperArmAbducted: z.boolean().nullable(),
  shoulderRaised: z.boolean().nullable(),
  leaningArm: z.boolean().nullable(),
  legsSupported: z.boolean().nullable(),
});

export const rulaSegmentScoresSchema = z.object({
  upperArm: z.number().nullable(),
  lowerArm: z.number().nullable(),
  wrist: z.number().nullable(),
  wristTwist: z.number().nullable(),
  tableAScore: z.number().nullable(),
  muscleUseAdjustment: z.number().nullable(),
  forceLoadAdjustment: z.number().nullable(),
  scoreA: z.number().nullable(),
  neck: z.number().nullable(),
  trunk: z.number().nullable(),
  legs: z.number().nullable(),
  tableBScore: z.number().nullable(),
  muscleUseAdjustmentB: z.number().nullable(),
  forceLoadAdjustmentB: z.number().nullable(),
  scoreB: z.number().nullable(),
  finalScore: z.number().nullable(),
  actionLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
});

export const rulaAssessmentSchema = z.object({
  segmentScores: rulaSegmentScoresSchema,
  missingInputFlags: z.array(z.string()),
  scoringReferenceVersion: z.string(),
  isComplete: z.boolean(),
  manualCorrections: z.record(z.string(), z.number()),
  assessorConfirmed: z.boolean(),
});

export const qualityChecksSchema = z.object({
  overallStatus: z.enum(observationStatuses),
  landmarkCompleteness: z.number().min(0).max(1),
  requiredLandmarksPresent: z.boolean(),
  viewSuitability: z.enum(['suitable', 'marginal', 'unsuitable']),
  viewSuitabilityNotes: z.string(),
  processingStatus: z.enum(['success', 'partial', 'failed']),
  processingError: z.string().optional(),
});

export const referenceAssessmentSchema = z.object({
  assessorId: z.string(),
  assignedAt: z.string(),
  upperArmAngleDeg: z.number().nullable(),
  lowerArmAngleDeg: z.number().nullable(),
  wristAngleDeg: z.number().nullable(),
  neckAngleDeg: z.number().nullable(),
  trunkAngleDeg: z.number().nullable(),
  rulaFinalScore: z.number().nullable(),
  rulaActionLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
  notes: z.string(),
}).nullable();

export const recommendationSchema = z.object({
  id: z.string(),
  observation: z.string(),
  evidence: z.string(),
  rationale: z.string(),
  suggestedAction: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isVerifiedImprovement: z.boolean(),
  assessorNotes: z.string(),
});

export const assessmentSchema = z.object({
  assessmentId: z.string(),
  title: z.string(),
  taskType: z.string(),
  date: z.string(),
  assessor: z.string(),
  workstationDescription: z.string(),
  imageMetadata: imageMetadataSchema,
  imageUrl: z.string().optional(),
  analysisTimestamp: z.string(),
  modelInfo: modelInfoSchema,
  landmarks: z.array(landmarkSchema),
  angles: z.array(angleMeasurementSchema),
  manualInputs: manualInputsSchema,
  rulaAssessment: rulaAssessmentSchema,
  qualityChecks: qualityChecksSchema,
  referenceAssessment: referenceAssessmentSchema,
  recommendations: z.array(recommendationSchema),
  notes: z.string(),
  appVersion: z.string(),
  scoringReferenceVersion: z.string(),
});

export const assessmentSessionSchema = z.object({
  sessionId: z.string(),
  createdAt: z.string(),
  assessments: z.array(assessmentSchema),
  isDemoMode: z.boolean(),
  isValidationMode: z.boolean(),
});

export function validateAssessment(data: unknown): Assessment {
  return assessmentSchema.parse(data) as Assessment;
}

export function validateAssessmentSession(data: unknown): AssessmentSession {
  return assessmentSessionSchema.parse(data) as AssessmentSession;
}
