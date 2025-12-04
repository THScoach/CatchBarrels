/**
 * Dashboard Summary Types
 * Functional Health-style layout for hitting analysis
 */

export type TrafficColor = 'green' | 'yellow' | 'red';

export interface CoreScore {
  label: 'POWER' | 'FLOW' | 'CONTACT';
  score: number;              // 0–100
  color: TrafficColor;        // based on score thresholds
  shortTagline: string;       // e.g. "You store power well"
}

export interface TimingLeak {
  phase: 'A' | 'B' | 'C';
  label: 'Trigger' | 'Fire' | 'Contact';
  color: TrafficColor;
  issueSummary: string;       // "Forward move starts 80 ms early"
  deltaMs?: number;           // +/- ms from ideal (optional)
}

export interface StrengthOrIssue {
  title: string;              // "Load → Fire Tempo"
  description: string;        // short, kid-friendly sentence
  category: 'power' | 'flow' | 'contact';
}

export interface DrillLink {
  id: string;
  title: string;
  primaryCategory: 'power' | 'flow' | 'contact';
}

export interface Next30DaysPlan {
  sessionsPerWeek: number;
  recommendedTier: 'athlete' | 'pro' | 'elite';
  focusBullets: string[];     // 3–5 items
}

export interface DashboardSummary {
  coreScores: CoreScore[];          // length 3: POWER/FLOW/CONTACT
  strengths: StrengthOrIssue[];     // "GREEN" items
  watchItems: StrengthOrIssue[];    // "YELLOW" items
  priorityIssue: StrengthOrIssue;   // "RED" item
  timingLeaks: TimingLeak[];        // phases A/B/C
  suggestedDrills: DrillLink[];     // for detail cards
  next30Days: Next30DaysPlan;       // training prescription
}
