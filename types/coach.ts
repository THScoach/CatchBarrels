// types/coach.ts
// Coach/Admin types for BARRELS Command Center
// Version: 1.0
// Date: November 26, 2025

export type FlowLane = 'groundFlow' | 'powerFlow' | 'barrelFlow';

export type FlagType =
  | 'TIMING_REGRESSION'
  | 'GROUND_LEAK'
  | 'BARREL_CHAOS'
  | 'SEQUENCE_BREAKDOWN'
  | 'HEAD_MOVEMENT'
  | 'WEIGHT_SHIFT';

export type PlayerLevel = 'Youth' | 'HS' | 'College' | 'Pro';

export type BandLabel =
  | 'Elite'
  | 'Advanced'
  | 'Above Average'
  | 'Average'
  | 'Below Average'
  | 'Poor'
  | 'Very Poor';

export interface CoachPlayer {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  level: PlayerLevel;
  handedness: 'R' | 'L' | 'S';
  bats: 'R' | 'L' | 'S';
  throws: 'R' | 'L';
  
  // Latest assessment data
  lastAssessmentDate?: string;
  momentumTransferScore?: number;
  weakestFlowLane?: FlowLane;
  band?: BandLabel;
  
  // Flags
  activeFlags?: PlayerFlag[];
  
  // Metadata
  programId?: string;
  teamId?: string;
}

export interface PlayerFlag {
  id: string;
  playerId: string;
  type: FlagType;
  severity: 'low' | 'medium' | 'high';
  firstSeen: string; // ISO date
  lastUpdated: string; // ISO date
  summary: string;
  details?: string;
  resolved: boolean;
}

export interface CoachAssessment {
  id: string;
  playerId: string;
  player: CoachPlayer;
  date: string; // ISO date
  momentumTransferScore: number;
  groundFlowScore: number;
  powerFlowScore: number;
  barrelFlowScore: number;
  consistencyScore: number;
  weakestFlowLane: FlowLane;
  band: BandLabel;
  swingsCompleted: number;
}

export interface FlowLaneSnapshot {
  groundFlow: number; // percentage of players where this is weakest
  powerFlow: number;
  barrelFlow: number;
}

export interface TrendData {
  date: string; // ISO date
  value: number;
}

export interface CoachSession {
  id: string;
  playerId: string;
  player: CoachPlayer;
  date: string; // ISO date
  sessionType: 'Training' | 'Assessment' | 'Game';
  totalSwings: number;
  
  // Ball metrics (if available)
  avgExitVelo?: number;
  avgLaunchAngle?: number;
  hardHitRate?: number;
  
  // Flow scores
  avgMomentumTransfer?: number;
  avgGroundFlow?: number;
  avgPowerFlow?: number;
  avgBarrelFlow?: number;
}

export interface VideoClip {
  id: string;
  playerId: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl: string;
  date: string; // ISO date
  duration?: number; // seconds
  tags: ('Assessment' | 'Lesson' | 'Practice' | 'Game')[];
  momentumTransferScore?: number;
}

export interface PlayerNote {
  id: string;
  playerId: string;
  coachId: string;
  coachName: string;
  content: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  tags?: string[];
}

export interface FilmRoomState {
  leftVideo: VideoClip | null;
  rightVideo: VideoClip | null;
  currentTime: number;
  isPlaying: boolean;
  markers: VideoMarker[];
  comments: TimelineComment[];
}

export interface VideoMarker {
  id: string;
  label: 'A' | 'B' | 'C';
  time: number; // seconds
  description: string;
}

export interface TimelineComment {
  id: string;
  time: number; // seconds
  text: string;
  author: string;
  createdAt: string; // ISO date
}

export interface AILabQuery {
  question: string;
  filters: {
    programId?: string;
    teamId?: string;
    playerIds?: string[];
    dateRange?: {
      start: string; // ISO date
      end: string; // ISO date
    };
    metricFocus?: 'momentumTransfer' | 'flowLanes' | 'decision' | 'ballData';
  };
}

export interface AILabResponse {
  query: string;
  insights: string; // AI-generated text
  charts?: ChartData[];
  recommendations?: string[];
  timestamp: string; // ISO date
}

export interface ChartData {
  type: 'line' | 'bar' | 'scatter';
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}

// Helper functions
export function getFlowLaneLabel(lane: FlowLane): string {
  const labels: Record<FlowLane, string> = {
    groundFlow: 'Ground Flow',
    powerFlow: 'Power Flow',
    barrelFlow: 'Barrel Flow',
  };
  return labels[lane];
}

export function getFlagTypeLabel(type: FlagType): string {
  const labels: Record<FlagType, string> = {
    TIMING_REGRESSION: 'Timing Regression',
    GROUND_LEAK: 'Ground Leak',
    BARREL_CHAOS: 'Barrel Chaos',
    SEQUENCE_BREAKDOWN: 'Sequence Breakdown',
    HEAD_MOVEMENT: 'Excess Head Movement',
    WEIGHT_SHIFT: 'Weight Shift Issue',
  };
  return labels[type];
}

export function getFlagColor(severity: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'text-yellow-500',
    medium: 'text-orange-500',
    high: 'text-red-500',
  };
  return colors[severity];
}

export function getBandColor(band: BandLabel): string {
  const colors: Record<BandLabel, string> = {
    Elite: 'text-barrels-gold',
    Advanced: 'text-barrels-gold-light',
    'Above Average': 'text-green-400',
    Average: 'text-slate-400',
    'Below Average': 'text-orange-400',
    Poor: 'text-red-400',
    'Very Poor': 'text-red-600',
  };
  return colors[band];
}
