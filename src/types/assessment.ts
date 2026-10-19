// Source: Section 3 of ErgoSnap Analytics Implementation Specification

export type SourceType = 'user_upload' | 'licensed_example' | 'controlled_test';
export type ObservationStatus = 'valid' | 'review_required' | 'unscorable';
export type ActionLevel = 1 | 2 | 3 | 4;

export interface ImageTransformation {
  type: 'rotate' | 'crop' | 'resize';
  parameters: Record<string, number>;
  appliedAt: string; // ISO timestamp
}

export interface ImageMetadata {
  filename: string;
  width: number;
  height: number;
  fileType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileSizeBytes: number;
  sourceType: SourceType;
  transformations: ImageTransformation[];
}

export interface ModelInfo {
  modelName: string;
  modelVersion: string;
  assetUrl: string;
  detectionConfidence: number;
  presenceConfidence: number;
}

export interface Landmark {
  index: number;
  name: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  z: number; // depth estimate
  visibility: number; // 0-1
  presence: number; // 0-1
  isVisible: boolean; // visibility > threshold
}

export interface AngleMeasurement {
  name: string;
  description: string;
  landmarkIndices: [number, number, number]; // [A, B, C] vertex at B
  valueDegrees: number | null; // null if invalid/missing, NEVER 0 for missing
  isValid: boolean;
  invalidReason?: string;
  isManuallyCorrected: boolean;
  automatedValueDegrees: number | null;
  unit: 'degrees';
}

export interface ManualInputs {
  forceLoad: 'none' | 'light' | 'moderate_or_greater' | null;
  muscleUse: 'occasional' | 'static_or_repeated' | null;
  wristTwist: 'mid_range' | 'near_end' | null;
  neckTwist: boolean | null;
  neckSideBend: boolean | null;
  trunkTwisted: boolean | null;
  trunkSideBend: boolean | null;
  upperArmAbducted: boolean | null;
  shoulderRaised: boolean | null;
  leaningArm: boolean | null;
  legsSupported: boolean | null;
}

export interface RulaSegmentScores {
  upperArm: number | null;
  lowerArm: number | null;
  wrist: number | null;
  wristTwist: number | null;
  tableAScore: number | null;
  muscleUseAdjustment: number | null;
  forceLoadAdjustment: number | null;
  scoreA: number | null; // tableA + muscle + force
  neck: number | null;
  trunk: number | null;
  legs: number | null;
  tableBScore: number | null;
  muscleUseAdjustmentB: number | null;
  forceLoadAdjustmentB: number | null;
  scoreB: number | null; // tableB + muscle + force
  finalScore: number | null; // from Table C
  actionLevel: ActionLevel | null;
}

export interface RulaAssessment {
  segmentScores: RulaSegmentScores;
  missingInputFlags: string[]; // list of missing required inputs
  scoringReferenceVersion: string;
  isComplete: boolean;
  manualCorrections: Record<string, number>;
  assessorConfirmed: boolean;
}

export interface QualityChecks {
  overallStatus: ObservationStatus;
  landmarkCompleteness: number; // 0-1 fraction of required landmarks visible
  requiredLandmarksPresent: boolean;
  viewSuitability: 'suitable' | 'marginal' | 'unsuitable';
  viewSuitabilityNotes: string;
  processingStatus: 'success' | 'partial' | 'failed';
  processingError?: string;
}

export interface ReferenceAssessment {
  assessorId: string;
  assignedAt: string;
  upperArmAngleDeg: number | null;
  lowerArmAngleDeg: number | null;
  wristAngleDeg: number | null;
  neckAngleDeg: number | null;
  trunkAngleDeg: number | null;
  rulaFinalScore: number | null;
  rulaActionLevel: ActionLevel | null;
  notes: string;
}

export interface Recommendation {
  id: string;
  observation: string;
  evidence: string;
  rationale: string;
  suggestedAction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isVerifiedImprovement: boolean;
  assessorNotes: string;
}

export interface Assessment {
  assessmentId: string;
  title: string;
  taskType: string;
  date: string;
  assessor: string;
  workstationDescription: string;
  imageMetadata: ImageMetadata;
  imageUrl?: string; // transient preview URL or data URL
  analysisTimestamp: string;
  modelInfo: ModelInfo;
  landmarks: Landmark[];
  angles: AngleMeasurement[];
  manualInputs: ManualInputs;
  rulaAssessment: RulaAssessment;
  qualityChecks: QualityChecks;
  referenceAssessment: ReferenceAssessment | null;
  recommendations: Recommendation[];
  notes: string;
  appVersion: string;
  scoringReferenceVersion: string;
}

export interface AssessmentSession {
  sessionId: string;
  createdAt: string;
  assessments: Assessment[];
  isDemoMode: boolean;
  isValidationMode: boolean;
}
