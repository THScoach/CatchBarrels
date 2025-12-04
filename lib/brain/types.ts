/**
 * Brain Test Types for THS Brain Speed (Go/No-Go cognitive test)
 * 
 * IMPORTANT: Do NOT reference "S2 Cognition" in any user-facing text.
 * Use "THS Brain Speed" or "Go / No Go Pitch Challenge" instead.
 */

export interface BrainGoNoGoTrialScript {
  trials: {
    index: number;
    pitchZone: string;
    isSwingPitch: boolean;
    preStimDelayMs: number;
    stimWindowMs: number;
  }[];
}

export interface BrainGoNoGoSummary {
  totalTrials: number;
  correct: number;
  accuracyPercent: number;
  avgReactionMs: number | null;
  avgReactionMsSwing: number | null;
  swingAccuracyPercent: number;
  takeDisciplinePercent: number;
  compositeScore: number; // 0–100
}

export interface BrainTestTrialData {
  isCorrect: boolean;
  reactionMs?: number | null;
  isSwingPitch: boolean;
}
