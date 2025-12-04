// Video Source Types
export type VideoSource = 'pwa-camera' | 'onform' | 'hudl' | 'upload' | 'other';
export type CameraAngle = 'side' | 'face-on' | 'overhead';
export type ThreeDSource = 'onform' | null;

// Video Types
export const VIDEO_TYPES = [
  'Tee Work',
  'Front Toss',
  'Live BP',
  'Game Swings',
  'Cage Work',
  'Other'
] as const;

export type VideoType = typeof VIDEO_TYPES[number];

// Video Interface (matches Prisma schema)
export interface Video {
  id: string;
  userId: string;
  title: string;
  videoType?: string;
  source: string;
  originalUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  
  // Video Processing
  impactFrame?: number;
  trimmedPath?: string;
  fps?: number;
  normalizedFps: number;
  
  // Skeleton Data
  skeletonData?: any;
  skeletonExtracted: boolean;
  
  // Analysis
  analyzed: boolean;
  anchor?: number;
  engine?: number;
  whip?: number;
  overallScore?: number;
  tier?: string;
  
  // Subcategories
  anchorStance?: number;
  anchorWeightShift?: number;
  anchorGroundConnection?: number;
  anchorLowerBodyMechanics?: number;
  engineHipRotation?: number;
  engineSeparation?: number;
  engineCorePower?: number;
  engineTorsoMechanics?: number;
  whipArmPath?: number;
  whipBatSpeed?: number;
  whipBatPath?: number;
  whipConnection?: number;
  
  exitVelocity?: number;
  coachFeedback?: string;
  
  // Community
  isPublic: boolean;
  shareableLink?: string;
  views: number;
  sharedAt?: Date;
  
  // OnForm Integration
  threeDSource?: string;
  threeDData?: any;
  cameraAngle?: string;
  
  uploadDate: Date;
}

// OnForm Import Props
export interface OnFormImportPanelProps {
  athleteId?: string;
  sessionId?: string;
  onImported?: (result: { 
    videoId: string; 
    athleteId: string; 
    sessionId?: string;
    video?: Video;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// OnForm Import Result
export interface OnFormImportResult {
  success: boolean;
  videoId?: string;
  video?: Video;
  error?: string;
  metadata?: {
    source: VideoSource;
    originalUrl?: string;
    onformVideoId?: string;
  };
}

// Athlete Interface (for future use)
export interface Athlete {
  id: string;
  name: string;
  email?: string;
  dateOfBirth?: Date;
  height?: number; // inches
  weight?: number; // lbs
  bats?: string;
  throws?: string;
  position?: string;
  level?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session Interface (for future use)
export interface Session {
  id: string;
  athleteId: string;
  title: string;
  description?: string;
  sessionDate: Date;
  sessionType?: string; // 'practice' | 'game' | 'assessment' | 'other'
  location?: string;
  videos?: Video[];
  createdAt: Date;
  updatedAt: Date;
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// ============================================
// JOINT DATA STRUCTURES (v1 - AI-Ready)
// ============================================
// Clean, normalized joint position data for swing analysis and AI coaching

/**
 * Single 2D joint position in video frame
 * Coordinates are normalized (0-1) for camera-independent comparison
 */
export interface Joint2D {
  name: string;          // e.g. 'left_hip', 'right_shoulder', 'left_wrist'
  x: number;             // normalized 0-1 (0 = left edge, 1 = right edge)
  y: number;             // normalized 0-1 (0 = top edge, 1 = bottom edge)
  confidence?: number;   // 0-1 (MediaPipe confidence score)
}

/**
 * All joints captured at a single point in time
 * Represents one frame of skeleton data
 */
export interface FrameJoints {
  t: number;             // time in seconds (or frame index if normalized)
  joints: Joint2D[];     // array of all tracked joints for this frame
}

/**
 * Complete joint series for an entire swing
 * This is the primary data structure for joint-only comparison and AI analysis
 */
export interface SwingJointSeries {
  swingId: string;                                          // Video ID this data belongs to
  cameraAngle: 'face-on' | 'side' | 'dtl' | 'unknown';    // Camera angle (critical for comparison)
  frames: FrameJoints[];                                    // Complete frame-by-frame joint data
  impactFrame?: number;                                     // Index of impact frame (for syncing)
  fps?: number;                                             // Original FPS
  normalizedFps?: number;                                   // Normalized FPS (e.g., 60)
  extractedAt?: Date;                                       // When skeleton was extracted
  
  // Metadata for future AI coaching
  metadata?: {
    playerHeight?: number;        // inches (for height normalization)
    handedness?: 'right' | 'left'; // batting handedness
    videoType?: string;            // 'Tee Work', 'Live BP', etc.
    qualityScore?: number;         // 0-1 (overall joint detection quality)
  };
}

/**
 * Comparison result between two joint series
 * Used for displaying differences and generating coaching feedback
 */
export interface JointComparisonResult {
  referenceSwing: SwingJointSeries;
  currentSwing: SwingJointSeries;
  differences: {
    jointName: string;
    avgDifference: number;          // Average positional difference (pixels or normalized units)
    maxDifference: number;          // Maximum difference across all frames
    atFrame: number;                // Frame where max difference occurs
  }[];
  alignmentMethod: 'impact' | 'manual' | 'auto'; // How swings were time-aligned
  cameraAnglesMatch: boolean;      // Critical validation flag
}