/**
 * Go/No-Go Test Script Generator and Scoring Logic
 * For THS Brain Speed cognitive assessment
 */

import type { BrainGoNoGoTrialScript, BrainGoNoGoSummary, BrainTestTrialData } from "./types";

const ZONES = ["up_in", "up_mid", "up_away", "down_in", "down_mid", "down_away"] as const;

/**
 * Generate a randomized Go/No-Go test script
 * @param trialCount - Number of trials to generate (default 40)
 * @returns A script with randomized trials
 */
export function generateGoNoGoScript(trialCount: number = 40): BrainGoNoGoTrialScript {
  // 70% "swing" pitches in the zone, 30% "take" pitches out of zone
  const trials = [];
  
  for (let i = 0; i < trialCount; i++) {
    const inZone = Math.random() < 0.7;
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    
    trials.push({
      index: i,
      pitchZone: zone,
      isSwingPitch: inZone,
      // Random delay before showing (800-1500ms)
      preStimDelayMs: 800 + Math.floor(Math.random() * 700),
      // Time stimulus is visible (1200ms)
      stimWindowMs: 1200,
    });
  }
  
  return { trials };
}

/**
 * Summarize Go/No-Go test results and calculate composite score
 * @param trials - Array of trial results
 * @returns Summary with accuracy, reaction time, and composite score
 */
export function summarizeGoNoGo(trials: BrainTestTrialData[]): BrainGoNoGoSummary {
  const total = trials.length;
  const correct = trials.filter(t => t.isCorrect).length;

  const swingTrials = trials.filter(t => t.isSwingPitch);
  const takeTrials = trials.filter(t => !t.isSwingPitch);

  const avgReactAll = avg(trials.map(t => t.reactionMs).filter(isNumber));
  const avgReactSwing = avg(swingTrials.map(t => t.reactionMs).filter(isNumber));
  const hitRateSwing = pct(swingTrials.filter(t => t.isCorrect).length, swingTrials.length);
  const hitRateTake = pct(takeTrials.filter(t => t.isCorrect).length, takeTrials.length);

  // Simple 0–100 score calculation
  const accuracyScore = correct / Math.max(1, total);
  const speedScore = avgReactAll ? Math.min(1, 450 / avgReactAll) : 0; // 450ms ideal
  const composite = Math.round((accuracyScore * 0.6 + speedScore * 0.4) * 100);

  return {
    totalTrials: total,
    correct,
    accuracyPercent: Math.round(accuracyScore * 100),
    avgReactionMs: avgReactAll ?? null,
    avgReactionMsSwing: avgReactSwing ?? null,
    swingAccuracyPercent: hitRateSwing,
    takeDisciplinePercent: hitRateTake,
    compositeScore: composite,
  };
}

/**
 * Calculate average of numeric values
 */
function avg(arr: (number | undefined | null)[]): number | null {
  const vals = arr.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/**
 * Calculate percentage
 */
function pct(hit: number, total: number): number {
  if (!total) return 0;
  return Math.round((hit / total) * 100);
}

/**
 * Type guard for number
 */
function isNumber(v: any): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
