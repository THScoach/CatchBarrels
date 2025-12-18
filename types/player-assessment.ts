/**
 * Player Assessment Types
 * Core system for assessment-first enforcement
 * Version: 1.0
 * Date: December 18, 2024
 */

// Assessment Type
export type AssessmentType = 'manual_in_person' | 'automated_onboarding';

// Confidence Level
export type ConfidenceLevel = 'automated' | 'coach_verified' | 'reboot_verified';

// Swing Identity (The Four Types)
export type SwingIdentity = 'Spinner' | 'Whipper' | 'Slingshot' | 'Titan';

// Primary Training Lane
export type TrainingLane = 'Pods' | '1:1' | 'Remote';

// Assessment Status (Workflow States)
export type AssessmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'automated_review_pending'
  | 'coach_verified'
  | 'reboot_verified';

// Baseline Metrics Structure
export interface BaselineMetrics {
  batSpeed?: number; // mph
  peakHandSpeed?: number; // mph
  rotationalVelocity?: number; // deg/s
  attackAngle?: number; // degrees
  timeToContact?: number; // ms
  [key: string]: number | undefined; // Allow additional metrics
}

// Reboot Motion File Reference
export interface RebootMotionFile {
  fileName: string;
  fileUrl: string;
  fileType: 'csv' | 'json' | 'pdf';
  uploadedAt: string; // ISO date string
}

// Constraints Structure (optional structured format)
export interface ConstraintsData {
  doNotChase?: string[]; // Array of things NOT to chase
  focusAreas?: string[]; // What TO focus on instead
  restrictions?: string[]; // Any movement restrictions
}

// Player Assessment Entity (matches Prisma model)
export interface PlayerAssessment {
  id: string;
  athleteId: string;
  createdBy: string;
  assessmentType: AssessmentType;
  confidenceLevel: ConfidenceLevel;
  swingIdentity: SwingIdentity | null;
  identityLocked: boolean;
  constraints: string | null; // Free-form text
  constraintsJson: ConstraintsData | null; // Structured format
  primaryTrainingLane: TrainingLane | null;
  baselineMetrics: BaselineMetrics | null;
  coachSystemStatement: string | null;
  status: AssessmentStatus;
  rebootMotionFiles: RebootMotionFile[] | null;
  rebootDerivedIdentityConfidence: number | null; // 0-100 confidence score from Reboot Motion
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional relations (if included in query)
  athlete?: {
    id: string;
    name: string | null;
    username: string;
    email: string | null;
  };
  createdByUser?: {
    id: string;
    name: string | null;
    username: string;
  };
  history?: AssessmentHistory[]; // Assessment change history
}

// Assessment Creation Input (for API)
export interface CreatePlayerAssessmentInput {
  athleteId: string;
  assessmentType: AssessmentType;
  confidenceLevel?: ConfidenceLevel;
  swingIdentity?: SwingIdentity;
  constraints?: string;
  constraintsJson?: ConstraintsData;
  primaryTrainingLane?: TrainingLane;
  baselineMetrics?: BaselineMetrics;
  coachSystemStatement?: string;
  status?: AssessmentStatus;
  notes?: string;
}

// Assessment Update Input (for API)
export interface UpdatePlayerAssessmentInput {
  assessmentType?: AssessmentType;
  confidenceLevel?: ConfidenceLevel;
  swingIdentity?: SwingIdentity;
  identityLocked?: boolean;
  constraints?: string;
  constraintsJson?: ConstraintsData;
  primaryTrainingLane?: TrainingLane;
  baselineMetrics?: BaselineMetrics;
  coachSystemStatement?: string;
  status?: AssessmentStatus;
  rebootMotionFiles?: RebootMotionFile[];
  rebootDerivedIdentityConfidence?: number;
  notes?: string;
  historyNote?: string; // Optional note for this specific change
}

// Assessment Status Check Response
export interface AssessmentStatusResponse {
  hasAssessment: boolean;
  isCompleted: boolean;
  assessment: PlayerAssessment | null;
}

// Status Display Labels
export const STATUS_LABELS: Record<AssessmentStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  automated_review_pending: 'Automated – Review Pending',
  coach_verified: 'Coach Verified',
  reboot_verified: 'Reboot Verified (Gold)',
};

// Confidence Level Display Labels
export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  automated: 'Automated',
  coach_verified: 'Coach Verified',
  reboot_verified: 'Reboot Verified',
};

// Helper function to check if assessment is complete
export function isAssessmentComplete(status: AssessmentStatus): boolean {
  return status === 'coach_verified' || status === 'reboot_verified';
}

// Helper function to check if identity is editable
export function isIdentityEditable(assessment: PlayerAssessment): boolean {
  return !assessment.identityLocked && assessment.confidenceLevel !== 'reboot_verified';
}

// Helper function to get status badge color
export function getStatusBadgeColor(status: AssessmentStatus): string {
  switch (status) {
    case 'not_started':
      return 'bg-gray-500';
    case 'in_progress':
      return 'bg-yellow-500';
    case 'automated_review_pending':
      return 'bg-blue-500';
    case 'coach_verified':
      return 'bg-green-500';
    case 'reboot_verified':
      return 'bg-amber-500'; // Gold
    default:
      return 'bg-gray-500';
  }
}

// ============================================================================
// ASSESSMENT HISTORY TYPES
// ============================================================================

// Assessment Change Type
export type AssessmentChangeType =
  | 'created'
  | 'swing_identity_updated'
  | 'confidence_updated'
  | 'status_updated'
  | 'constraints_updated'
  | 'training_lane_updated'
  | 'system_statement_updated'
  | 'reboot_verified'
  | 'reboot_files_uploaded'
  | 'identity_locked'
  | 'identity_unlocked';

// Assessment History Entry
export interface AssessmentHistory {
  id: string;
  assessmentId: string;
  changedBy: string;
  changeType: AssessmentChangeType;
  previousValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  notes: string | null;
  createdAt: Date;
  
  // Optional relation
  changedByUser?: {
    id: string;
    name: string | null;
    username: string;
  };
}

// Assessment History Creation Input
export interface CreateAssessmentHistoryInput {
  assessmentId: string;
  changedBy: string;
  changeType: AssessmentChangeType;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  notes?: string;
}

// Helper function to get change type display label
export const CHANGE_TYPE_LABELS: Record<AssessmentChangeType, string> = {
  created: 'Assessment Created',
  swing_identity_updated: 'Swing Identity Updated',
  confidence_updated: 'Confidence Level Updated',
  status_updated: 'Status Updated',
  constraints_updated: 'Constraints Updated',
  training_lane_updated: 'Training Lane Updated',
  system_statement_updated: 'System Statement Updated',
  reboot_verified: 'Reboot Verified',
  reboot_files_uploaded: 'Reboot Files Uploaded',
  identity_locked: 'Identity Locked',
  identity_unlocked: 'Identity Unlocked',
};

// Helper function to format history entry for display
export function formatHistoryChange(history: AssessmentHistory): string {
  const label = CHANGE_TYPE_LABELS[history.changeType];
  
  // Add specific details based on change type
  if (history.changeType === 'swing_identity_updated') {
    const prev = history.previousValues?.swingIdentity || 'None';
    const newVal = history.newValues?.swingIdentity || 'None';
    return `${label}: ${prev} → ${newVal}`;
  }
  
  if (history.changeType === 'status_updated') {
    const prev = history.previousValues?.status || 'None';
    const newVal = history.newValues?.status || 'None';
    return `${label}: ${STATUS_LABELS[prev as AssessmentStatus] || prev} → ${STATUS_LABELS[newVal as AssessmentStatus] || newVal}`;
  }
  
  return label;
}
