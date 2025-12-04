/**
 * Import System Configuration (WO-IMPORT-01)
 * 
 * Centralized configuration for CSV parsing and matching logic
 */

// ============================================================================
// MATCHING CONFIGURATION
// ============================================================================

/**
 * Time window for matching HitTrax swings to sensor swings (milliseconds)
 * A sensor swing within ±TIME_WINDOW_MS of a HitTrax swing is considered a match
 */
export const TIME_WINDOW_MS = 300; // ±300ms default

/**
 * Default timezone for timestamp parsing
 */
export const DEFAULT_TIMEZONE = 'America/Chicago';

/**
 * Match quality thresholds
 */
export const MATCH_QUALITY_THRESHOLDS = {
  exact: 50, // Within 50ms = exact match
  good: 150, // Within 150ms = good match
  fair: 300, // Within 300ms = fair match
};

// ============================================================================
// HITTRAX CSV CONFIGURATION
// ============================================================================

/**
 * Expected HitTrax CSV column names (flexible mapping)
 */
export const HITTRAX_COLUMNS = {
  // Required columns
  rowNumber: ['row', 'rownum', '#', 'swing_number'],
  
  // Timestamp columns (at least one required)
  date: ['date', 'session_date', 'swing_date'],
  timestamp: ['timestamp', 'time', 'swing_time', 'time_stamp'],
  
  // Batter identification
  batterName: ['batter', 'batter_name', 'player', 'player_name', 'hitter'],
  batterId: ['batter_id', 'player_id', 'id'],
  batting: ['batting', 'hand', 'bats'], // L or R
  
  // Pitch data
  pitchSpeed: ['pitch', 'pitch_speed', 'pitch_velo', 'velo_p'],
  pitchType: ['ptype', 'pitch_type', 'type_p'],
  strikeZone: ['strike_zone', 'zone', 'sz'],
  
  // Ball data
  exitVelocity: ['velo', 'exit_velo', 'exit_velocity', 'ev'],
  launchAngle: ['la', 'launch_angle', 'angle'],
  distance: ['dist', 'distance', 'd'],
  result: ['res', 'result', 'outcome'],
  battedBallType: ['type', 'ball_type', 'bb_type'], // LD, GB, FB
  
  // Spray data
  horizAngle: ['horiz_angle', 'horizontal_angle', 'ha'],
  sprayChartX: ['spray_x', 'x'],
  sprayChartZ: ['spray_z', 'z'],
  
  // Player context
  level: ['level', 'player_level', 'age_group'],
};

/**
 * HitTrax result codes that indicate a miss/foul
 */
export const HITTRAX_MISS_CODES = ['Miss', 'Swing & Miss', 'K'];
export const HITTRAX_FOUL_CODES = ['Foul', 'F', 'FB'];

// ============================================================================
// BLAST CSV CONFIGURATION
// ============================================================================

/**
 * Expected Blast CSV column names
 */
export const BLAST_COLUMNS = {
  // Required
  timestamp: ['timestamp', 'time', 'date_time', 'swing_time'],
  
  // Player identification
  playerName: ['player', 'player_name', 'user', 'user_name'],
  deviceId: ['device_id', 'sensor_id', 'device'],
  
  // Core metrics
  batSpeed: ['bat_speed', 'speed', 'bat_speed_mph'],
  attackAngle: ['attack_angle', 'angle', 'aa'],
  timeToContact: ['time_to_contact', 'ttc', 'contact_time'],
  peakHandSpeed: ['peak_hand_speed', 'hand_speed', 'phs'],
  
  // Blast-specific
  blastFactor: ['blast_factor', 'bf'],
  powerOutput: ['power', 'power_output', 'watts'],
};

// ============================================================================
// DIAMOND KINETICS CSV CONFIGURATION
// ============================================================================

/**
 * Expected Diamond Kinetics CSV column names
 */
export const DK_COLUMNS = {
  // Required
  timestamp: ['timestamp', 'time', 'date_time', 'swing_time'],
  
  // Player identification
  playerName: ['player', 'player_name', 'athlete', 'athlete_name'],
  deviceId: ['device_id', 'sensor_id', 'device'],
  
  // Core metrics
  batSpeed: ['bat_speed', 'speed', 'peak_bat_speed'],
  attackAngle: ['attack_angle', 'angle', 'approach_angle'],
  timeToContact: ['time_to_contact', 'ttc'],
  peakHandSpeed: ['peak_hand_speed', 'hand_speed'],
  
  // DK-specific
  rotationMetric: ['rotation', 'rotation_metric', 'rot'],
};

// ============================================================================
// FILE DETECTION PATTERNS
// ============================================================================

/**
 * Patterns to detect file type from filename or content
 */
export const FILE_TYPE_PATTERNS = {
  hittrax: {
    filenamePatterns: [/hittrax/i, /ht_/i, /session.*csv/i],
    headerPatterns: ['velo', 'exit_velo', 'launch_angle', 'batter'],
  },
  blast: {
    filenamePatterns: [/blast/i, /blast_motion/i],
    headerPatterns: ['blast_factor', 'bat_speed', 'attack_angle'],
  },
  dk: {
    filenamePatterns: [/diamond.*kinetics/i, /dk_/i, /swingtrax/i],
    headerPatterns: ['rotation', 'peak_bat_speed', 'approach_angle'],
  },
};

// ============================================================================
// PLAYER MATCHING PATTERNS
// ============================================================================

/**
 * Patterns to extract player info from file names
 */
export const PLAYER_NAME_PATTERNS = [
  // "John_Doe_hittrax.csv" or "John Doe - HitTrax.csv"
  /^([A-Za-z]+[_\s-]+[A-Za-z]+)/,
  
  // "hittrax_John_Doe.csv"
  /hittrax[_-]([A-Za-z]+[_\s-]+[A-Za-z]+)/i,
  
  // "blast_John_Doe_20241128.csv"
  /blast[_-]([A-Za-z]+[_\s-]+[A-Za-z]+)/i,
];

/**
 * Name normalization for player matching
 */
export function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Check if two player names are likely the same person
 */
export function namesMatch(name1?: string, name2?: string): boolean {
  if (!name1 || !name2) return false;
  
  const n1 = normalizePlayerName(name1);
  const n2 = normalizePlayerName(name2);
  
  // Exact match
  if (n1 === n2) return true;
  
  // Check if one is substring of the other (e.g., "John" matches "John Doe")
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Check reversed (e.g., "Doe John" vs "John Doe")
  const [first1, last1] = n1.split(' ');
  const [first2, last2] = n2.split(' ');
  if (first1 === last2 && last1 === first2) return true;
  
  return false;
}
