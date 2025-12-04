/**
 * Barrel Calculator
 * 
 * Implements MLB Statcast barrel definition with level adjustments:
 * - A barrel is a batted ball that combines exit velocity + launch angle
 *   to produce at least .500 BA and 1.500 SLG historically
 * - At MLB level: minimum 98 mph exit velocity
 * - Level adjustments: HS = 92 mph, Youth = 85 mph
 * 
 * The angle window expands as EV increases, from 26-30° at 98 mph
 * to 8-50° at 116+ mph.
 */

export type PlayerLevel = 'youth' | 'hs' | 'high_school' | 'college' | 'pro' | 'mlb';

export interface BarrelResult {
  isBarrel: boolean;
  evMph: number;
  laDeg: number;
  level: PlayerLevel;
  angleWindow: { min: number; max: number } | null;
  evMinForLevel: number;
}

/**
 * Returns the allowed launch angle window for a given exit velocity
 * Based on MLB Statcast curve (approximation)
 * 
 * @param evMph Exit velocity in mph (in MLB scale, i.e., after level adjustment)
 * @returns Tuple of [minAngle, maxAngle] or null if below barrel threshold
 */
export function angleWindowForEv(evMph: number): { min: number; max: number } | null {
  // Below minimum threshold
  if (evMph < 98) return null;

  // Statcast barrel angle windows by EV (approximation)
  if (evMph < 99) return { min: 26, max: 30 };
  if (evMph < 100) return { min: 25, max: 31 };
  if (evMph < 101) return { min: 24, max: 33 };
  if (evMph < 103) return { min: 23, max: 35 };
  if (evMph < 105) return { min: 22, max: 37 };
  if (evMph < 107) return { min: 21, max: 39 };
  if (evMph < 109) return { min: 20, max: 41 };
  if (evMph < 111) return { min: 19, max: 43 };
  if (evMph < 113) return { min: 18, max: 45 };
  if (evMph < 115) return { min: 16, max: 48 };
  // 115+ mph: widest window
  return { min: 8, max: 50 };
}

/**
 * Get the minimum exit velocity threshold for a given level
 * 
 * @param level Player's competition level
 * @returns Minimum EV in mph for barrel consideration
 */
export function getEvMinForLevel(level: PlayerLevel | string): number {
  const normalizedLevel = level.toLowerCase();
  
  if (normalizedLevel === 'pro' || normalizedLevel === 'mlb') {
    return 98;
  }
  
  if (normalizedLevel === 'college' || normalizedLevel === 'hs' || normalizedLevel === 'high_school') {
    return 92;
  }
  
  // youth and default
  return 85;
}

/**
 * Compute whether a batted ball qualifies as a barrel
 * 
 * This implements level-adjusted Statcast barrel logic:
 * 1. Check if ball is fair
 * 2. Check if EV meets minimum for player's level
 * 3. Map player's EV into MLB scale (shift by level offset)
 * 4. Look up angle window for that mapped EV
 * 5. Check if actual LA falls within that window
 * 
 * @param evMph Exit velocity in mph
 * @param laDeg Launch angle in degrees
 * @param isFairBall Whether the ball was fair (not foul/miss)
 * @param level Player's competition level
 * @returns BarrelResult with isBarrel flag and context
 */
export function computeIsBarrel(
  evMph: number,
  laDeg: number,
  isFairBall: boolean,
  level: PlayerLevel | string = 'hs'
): BarrelResult {
  const evMinForLevel = getEvMinForLevel(level);
  
  // Not fair or below minimum EV for level
  if (!isFairBall || evMph < evMinForLevel) {
    return {
      isBarrel: false,
      evMph,
      laDeg,
      level: level as PlayerLevel,
      angleWindow: null,
      evMinForLevel,
    };
  }

  // Map player's EV into MLB scale
  // Example: HS 92 mph maps to MLB 98 mph (the baseline)
  const evForTable = evMph - (evMinForLevel - 98);

  // Get the angle window for this mapped EV
  const window = angleWindowForEv(evForTable);
  
  if (!window) {
    return {
      isBarrel: false,
      evMph,
      laDeg,
      level: level as PlayerLevel,
      angleWindow: null,
      evMinForLevel,
    };
  }

  // Check if LA falls within window
  const isBarrel = laDeg >= window.min && laDeg <= window.max;

  return {
    isBarrel,
    evMph,
    laDeg,
    level: level as PlayerLevel,
    angleWindow: window,
    evMinForLevel,
  };
}

/**
 * Batch compute barrel flags for multiple events
 * 
 * @param events Array of events with velo, la, isFair, and level
 * @returns Array of BarrelResult objects
 */
export function computeBarrelsForEvents(
  events: Array<{
    velo: number;
    la: number;
    isFair: boolean;
    level?: PlayerLevel | string;
  }>,
  defaultLevel: PlayerLevel | string = 'hs'
): BarrelResult[] {
  return events.map((event) =>
    computeIsBarrel(
      event.velo,
      event.la,
      event.isFair,
      event.level || defaultLevel
    )
  );
}
