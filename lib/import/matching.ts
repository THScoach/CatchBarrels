/**
 * Timestamp-Based Matching Logic (WO-IMPORT-01)
 * 
 * Matches HitTrax swings to sensor swings based on timestamps
 */

import { TIME_WINDOW_MS, MATCH_QUALITY_THRESHOLDS } from './config';
import type { RawHitTraxSwing, RawSensorSwing, MatchedSwing } from './types';

/**
 * Match HitTrax swings to sensor swings based on timestamps
 * 
 * Algorithm:
 * 1. For each HitTrax swing, find the closest sensor swing within the time window
 * 2. Ensure one-to-one matching (no reuse of sensor swings)
 * 3. Calculate match quality based on time delta
 * 
 * @param hittraxSwings Array of HitTrax swings
 * @param sensorSwings Array of sensor swings
 * @param timeWindowMs Time window for matching (default: 300ms)
 * @returns Matched swings and unmatched swings
 */
export function matchSwingsByTimestamp(
  hittraxSwings: RawHitTraxSwing[],
  sensorSwings: RawSensorSwing[],
  timeWindowMs: number = TIME_WINDOW_MS
): {
  matched: MatchedSwing[];
  unmatchedHitTrax: RawHitTraxSwing[];
  unmatchedSensor: RawSensorSwing[];
} {
  console.log('[Matching] Starting timestamp-based matching...', {
    hittraxCount: hittraxSwings.length,
    sensorCount: sensorSwings.length,
    timeWindowMs,
  });

  const matched: MatchedSwing[] = [];
  const unmatchedHitTrax: RawHitTraxSwing[] = [];
  const unmatchedSensor: RawSensorSwing[] = [];
  const usedSensorIndices = new Set<number>();

  // Sort both arrays by timestamp for efficient matching
  const sortedHitTrax = [...hittraxSwings].sort((a, b) => {
    const timeA = a.calculatedTimestamp?.getTime() ?? 0;
    const timeB = b.calculatedTimestamp?.getTime() ?? 0;
    return timeA - timeB;
  });

  const sortedSensor = [...sensorSwings].sort((a, b) => {
    const timeA = a.calculatedTimestamp?.getTime() ?? 0;
    const timeB = b.calculatedTimestamp?.getTime() ?? 0;
    return timeA - timeB;
  });

  // Match each HitTrax swing
  for (const hittraxSwing of sortedHitTrax) {
    if (!hittraxSwing.calculatedTimestamp) {
      unmatchedHitTrax.push(hittraxSwing);
      continue;
    }

    const hittraxTime = hittraxSwing.calculatedTimestamp.getTime();
    let bestMatch: { index: number; delta: number } | null = null;

    // Find closest sensor swing within time window
    for (let i = 0; i < sortedSensor.length; i++) {
      if (usedSensorIndices.has(i)) {
        continue; // Already matched
      }

      const sensorSwing = sortedSensor[i];
      if (!sensorSwing.calculatedTimestamp) {
        continue;
      }

      const sensorTime = sensorSwing.calculatedTimestamp.getTime();
      const delta = Math.abs(hittraxTime - sensorTime);

      // Check if within time window
      if (delta <= timeWindowMs) {
        // Track best match (closest timestamp)
        if (!bestMatch || delta < bestMatch.delta) {
          bestMatch = { index: i, delta };
        }
      } else if (sensorTime > hittraxTime + timeWindowMs) {
        // Sensor swings are sorted, so we can break early
        break;
      }
    }

    // Create matched swing or mark as unmatched
    if (bestMatch !== null) {
      const sensorSwing = sortedSensor[bestMatch.index];
      usedSensorIndices.add(bestMatch.index);

      const matchQuality = getMatchQuality(bestMatch.delta);
      const sensorType = sensorSwing.rawData?.blast_factor !== undefined ? 'BLAST' : 'DIAMOND_KINETICS';

      matched.push({
        hittrax: hittraxSwing,
        sensor: sensorSwing,
        sources: ['HITTRAX', sensorType],
        timestamp: hittraxTime,
        matchTimeDelta: bestMatch.delta,
        matchQuality,
        playerName: hittraxSwing.batterName || sensorSwing.playerName,
        sessionDate: hittraxSwing.calculatedTimestamp,
      });

      console.log(`[Matching] Matched HitTrax row ${hittraxSwing.rowNumber} with sensor swing (delta: ${bestMatch.delta}ms, quality: ${matchQuality})`);
    } else {
      unmatchedHitTrax.push(hittraxSwing);
    }
  }

  // Collect unmatched sensor swings
  for (let i = 0; i < sortedSensor.length; i++) {
    if (!usedSensorIndices.has(i)) {
      unmatchedSensor.push(sortedSensor[i]);
    }
  }

  console.log('[Matching] Matching complete:', {
    matched: matched.length,
    unmatchedHitTrax: unmatchedHitTrax.length,
    unmatchedSensor: unmatchedSensor.length,
  });

  return { matched, unmatchedHitTrax, unmatchedSensor };
}

/**
 * Determine match quality based on time delta
 */
function getMatchQuality(deltaMs: number): 'exact' | 'good' | 'fair' {
  if (deltaMs <= MATCH_QUALITY_THRESHOLDS.exact) {
    return 'exact';
  } else if (deltaMs <= MATCH_QUALITY_THRESHOLDS.good) {
    return 'good';
  } else {
    return 'fair';
  }
}

/**
 * Group swings by player for bulk imports
 * Uses player names from HitTrax and sensor data
 */
export function groupSwingsByPlayer(
  hittraxSwings: RawHitTraxSwing[],
  sensorSwings: RawSensorSwing[]
): Map<string, { hittrax: RawHitTraxSwing[]; sensor: RawSensorSwing[] }> {
  const playerMap = new Map<
    string,
    { hittrax: RawHitTraxSwing[]; sensor: RawSensorSwing[] }
  >();

  // Group HitTrax swings by player
  for (const swing of hittraxSwings) {
    if (!swing.batterName) continue;

    const normalizedName = swing.batterName.toLowerCase().trim();
    if (!playerMap.has(normalizedName)) {
      playerMap.set(normalizedName, { hittrax: [], sensor: [] });
    }
    playerMap.get(normalizedName)!.hittrax.push(swing);
  }

  // Group sensor swings by player
  for (const swing of sensorSwings) {
    if (!swing.playerName) continue;

    const normalizedName = swing.playerName.toLowerCase().trim();
    if (!playerMap.has(normalizedName)) {
      playerMap.set(normalizedName, { hittrax: [], sensor: [] });
    }
    playerMap.get(normalizedName)!.sensor.push(swing);
  }

  console.log(`[Matching] Grouped swings into ${playerMap.size} player(s)`);
  return playerMap;
}
