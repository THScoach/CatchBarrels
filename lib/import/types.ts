/**
 * Import System Types (WO-IMPORT-01)
 * 
 * Type definitions for HitTrax + Sensor import system
 */

export type SwingSource = 'HITTRAX' | 'BLAST' | 'DIAMOND_KINETICS';

export type ImportType = 'per_player' | 'bulk';

export type ImportStatus = 'processing' | 'completed' | 'failed';

// ============================================================================
// RAW PARSED DATA
// ============================================================================

/**
 * Raw HitTrax swing data parsed from CSV
 */
export interface RawHitTraxSwing {
  rowNumber: number;
  ab?: number;
  date?: Date;
  timestamp?: string; // Original string timestamp
  
  // Pitch data
  pitchSpeed?: number;
  strikeZone?: number;
  pitchType?: string;
  
  // Ball data
  exitVelocity?: number;
  launchAngle?: number;
  distance?: number;
  result?: string; // HR, 1B-8, Foul, etc.
  battedBallType?: string; // LD, GB, FB
  
  // Spray data
  horizAngle?: number;
  sprayChartX?: number;
  sprayChartZ?: number;
  
  // Player
  batterName?: string;
  batterId?: string;
  batting?: 'L' | 'R';
  level?: string;
  
  // Calculated timestamp (for matching)
  calculatedTimestamp?: Date;
}

/**
 * Raw sensor swing data parsed from CSV (Blast or DK)
 */
export interface RawSensorSwing {
  // Metadata
  deviceId?: string;
  playerName?: string;
  timestamp?: string; // Original string timestamp
  
  // Core metrics (common across sensors)
  batSpeed?: number; // mph
  attackAngle?: number; // degrees
  timeToContact?: number; // ms
  peakHandSpeed?: number; // mph
  
  // Blast-specific
  blastFactor?: number;
  powerOutput?: number; // Watts
  
  // DK-specific
  rotationMetric?: number;
  
  // Raw data
  rawData?: Record<string, any>;
  
  // Calculated timestamp (for matching)
  calculatedTimestamp?: Date;
}

// ============================================================================
// MATCHED DATA
// ============================================================================

/**
 * A swing with matched HitTrax and/or sensor data
 */
export interface MatchedSwing {
  // Player assignment
  playerId?: string;
  playerName?: string;
  
  // Session context
  sessionDate?: Date;
  sessionId?: string;
  
  // Data sources
  hittrax?: RawHitTraxSwing;
  sensor?: RawSensorSwing;
  sources: SwingSource[]; // e.g., ['HITTRAX', 'BLAST']
  
  // Matching info
  timestamp: number; // Canonical timestamp (ms since epoch)
  matchTimeDelta?: number; // ms difference if matched
  matchQuality?: 'exact' | 'good' | 'fair';
}

// ============================================================================
// IMPORT CONTEXT
// ============================================================================

/**
 * Context for processing an import
 */
export interface ImportContext {
  importType: ImportType;
  userId: string; // Coach/admin initiating
  playerId?: string; // For per-player imports
  
  // Files
  files: ImportFile[];
  
  // Configuration
  matchingConfig: MatchingConfig;
}

/**
 * An uploaded file to process
 */
export interface ImportFile {
  fileName: string;
  fileType: 'hittrax' | 'blast' | 'dk' | 'unknown';
  s3Key: string; // Cloud storage path
  content?: string; // CSV content (if loaded)
}

/**
 * Configuration for timestamp matching
 */
export interface MatchingConfig {
  timeWindowMs: number; // Default: 300ms
  timezone?: string; // Default: 'America/Chicago'
}

// ============================================================================
// IMPORT RESULTS
// ============================================================================

/**
 * Summary of an import operation
 */
export interface ImportSummary {
  importSessionId: string;
  importType: ImportType;
  status: ImportStatus;
  
  // File stats
  filesProcessed: number;
  fileNames: string[];
  
  // Swing stats
  totalSwings: number;
  matchedSwings: number; // HitTrax + Sensor matched
  unmatchedSwings: number;
  
  // Player stats
  playersDetected: number;
  players: PlayerImportSummary[];
  
  // Unassigned data
  unassignedSwings: UnassignedSwing[];
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  
  // Errors
  errors?: string[];
}

/**
 * Per-player import summary
 */
export interface PlayerImportSummary {
  playerId?: string;
  playerName: string;
  
  hittraxSessionId?: string;
  swingsImported: number;
  swingsMatched: number;
  
  sources: SwingSource[];
}

/**
 * An unassigned swing that needs manual assignment
 */
export interface UnassignedSwing {
  id: string;
  sensorType: 'blast' | 'diamond_kinetics';
  timestamp: Date;
  playerName?: string;
  deviceId?: string;
  metrics: {
    batSpeed?: number;
    attackAngle?: number;
  };
}

// ============================================================================
// PARSER RESULTS
// ============================================================================

/**
 * Result from parsing a HitTrax CSV
 */
export interface HitTraxParseResult {
  success: boolean;
  swings: RawHitTraxSwing[];
  metadata?: {
    fileName?: string;
    sessionDate?: Date;
    playerName?: string;
    level?: string;
  };
  errors?: string[];
}

/**
 * Result from parsing a sensor CSV
 */
export interface SensorParseResult {
  success: boolean;
  sensorType: 'blast' | 'diamond_kinetics';
  swings: RawSensorSwing[];
  metadata?: {
    fileName?: string;
    deviceId?: string;
    playerName?: string;
  };
  errors?: string[];
}
