/**
 * On-The-Ball Metrics Engine
 * 
 * Reusable engine for calculating contact quality & consistency metrics
 * Works with both HitTrax uploads and BARRELS assessment events
 * 
 * Key Metrics:
 * - Barrel Rate: % of fair balls that qualify as barrels
 * - Avg EV: Average exit velocity
 * - Avg LA: Average launch angle
 * - LA SD: Launch angle standard deviation (consistency)
 * - EV SD: Exit velocity standard deviation (consistency)
 * 
 * Philosophy: BARRELS measures barrels + consistency, not just max EV
 */

import { computeIsBarrel, type PlayerLevel } from './barrel-calculator';

export interface BattedBallEvent {
  velo: number;           // Exit velocity in mph (0 = no contact)
  la: number;             // Launch angle in degrees
  isFair: boolean;        // Fair ball in play
  isFoul: boolean;        // Foul ball
  isMiss: boolean;        // Swing and miss / no contact
  inZone?: boolean;       // Pitch in strike zone (optional)
  level?: PlayerLevel | string; // Player level for barrel calculation
}

export interface OnTheBallMetrics {
  // Core metrics
  barrelRate: number | null;          // 0.0 to 1.0
  avgEv: number | null;               // mph
  avgLa: number | null;               // degrees
  sdLa: number | null;                // degrees (lower = more consistent)
  sdEv: number | null;                // mph (lower = more consistent)

  // In-zone metrics (if zone data available)
  inzoneBarrelRate: number | null;
  inzoneSdLa: number | null;
  inzoneSdEv: number | null;

  // Breakdown metrics
  foulPct: number | null;             // 0.0 to 1.0
  missPct: number | null;             // 0.0 to 1.0
  fairPct: number | null;             // 0.0 to 1.0

  // Counts (for reference)
  totalEvents: number;
  ballsInPlay: number;                // Any contact (velo > 0)
  fairBalls: number;
  fouls: number;
  misses: number;
  barrels: number;
  inZoneBalls?: number;
  inZoneFair?: number;
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation (population SD)
 */
function std(values: number[]): number | null {
  if (values.length === 0) return null;
  const avg = mean(values);
  if (avg === null) return null;
  
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Compute On-The-Ball metrics for a set of batted ball events
 * 
 * This is the core engine that processes events from any source
 * (HitTrax, assessment, manual entry) and returns standardized metrics.
 * 
 * @param events Array of batted ball events
 * @param level Default player level if not specified per event
 * @returns OnTheBallMetrics object
 */
export function computeOnTheBallMetrics(
  events: BattedBallEvent[],
  level: PlayerLevel | string = 'hs'
): OnTheBallMetrics {
  // Filter event categories
  const ballsInPlay = events.filter((e) => e.velo && e.velo > 0);
  const fairBalls = ballsInPlay.filter((e) => e.isFair);
  const fouls = events.filter((e) => e.isFoul);
  const misses = events.filter((e) => e.isMiss);
  
  // In-zone events (if zone data available)
  const inZoneBalls = ballsInPlay.filter((e) => e.inZone === true);
  const inZoneFair = fairBalls.filter((e) => e.inZone === true);

  // Compute barrels for all fair balls
  const barrelResults = fairBalls.map((e) =>
    computeIsBarrel(e.velo, e.la, e.isFair, e.level || level)
  );
  const barrels = barrelResults.filter((r) => r.isBarrel);

  // Compute barrels for in-zone fair balls
  const inZoneBarrelResults = inZoneFair.map((e) =>
    computeIsBarrel(e.velo, e.la, e.isFair, e.level || level)
  );
  const inZoneBarrels = inZoneBarrelResults.filter((r) => r.isBarrel);

  // Core metrics
  const barrelRate = fairBalls.length > 0 ? barrels.length / fairBalls.length : null;
  const avgEv = mean(ballsInPlay.map((e) => e.velo));
  const avgLa = mean(ballsInPlay.map((e) => e.la));
  const sdLa = std(ballsInPlay.map((e) => e.la));
  const sdEv = std(ballsInPlay.map((e) => e.velo));

  // In-zone metrics
  const inzoneBarrelRate =
    inZoneFair.length > 0 ? inZoneBarrels.length / inZoneFair.length : null;
  const inzoneSdLa = std(inZoneBalls.map((e) => e.la));
  const inzoneSdEv = std(inZoneBalls.map((e) => e.velo));

  // Breakdown percentages
  const totalEvents = events.length;
  const foulPct = totalEvents > 0 ? fouls.length / totalEvents : null;
  const missPct = totalEvents > 0 ? misses.length / totalEvents : null;
  const fairPct = totalEvents > 0 ? fairBalls.length / totalEvents : null;

  return {
    // Core metrics
    barrelRate,
    avgEv,
    avgLa,
    sdLa,
    sdEv,

    // In-zone metrics
    inzoneBarrelRate,
    inzoneSdLa,
    inzoneSdEv,

    // Breakdown
    foulPct,
    missPct,
    fairPct,

    // Counts
    totalEvents,
    ballsInPlay: ballsInPlay.length,
    fairBalls: fairBalls.length,
    fouls: fouls.length,
    misses: misses.length,
    barrels: barrels.length,
    inZoneBalls: inZoneBalls.length,
    inZoneFair: inZoneFair.length,
  };
}

/**
 * Helper: Convert a single HitTrax row to a BattedBallEvent
 */
export function hittraxEventToBattedBall(event: {
  velo: number | null;
  la: number | null;
  res: string | null;
  strikeZone: number | null;
  playerLevel?: string | null;
}): BattedBallEvent {
  const velo = event.velo || 0;
  const la = event.la || 0;
  const res = event.res || '';
  
  // Determine flags
  const hasContact = velo > 0;
  const isFoul = res.toLowerCase().includes('foul');
  const isMiss = velo === 0 && !isFoul;
  const isFair = hasContact && !isFoul;
  
  // In-zone logic (adjust as needed)
  const inZone = event.strikeZone ? [4, 5, 6, 7, 8, 9, 10, 11, 12].includes(event.strikeZone) : undefined;

  return {
    velo,
    la,
    isFair,
    isFoul,
    isMiss,
    inZone,
    level: event.playerLevel || 'hs',
  };
}

/**
 * Helper: Convert assessment event to BattedBallEvent
 * Assessment events should already have these fields
 */
export function assessmentEventToBattedBall(event: {
  velo: number;
  la: number;
  isFair: boolean;
  isFoul: boolean;
  isMiss: boolean;
  inZone?: boolean;
  level?: string;
}): BattedBallEvent {
  return {
    velo: event.velo,
    la: event.la,
    isFair: event.isFair,
    isFoul: event.isFoul,
    isMiss: event.isMiss,
    inZone: event.inZone,
    level: event.level || 'hs',
  };
}
