/**
 * Admin Panel Type Definitions
 */

export interface AdminRosterAthlete {
  id: string;
  name: string;
  email: string | null;
  level: string | null;
  lastSessionDate: Date | null;
  thirtyDayAvgScore: number;
  recentTrend: 'up' | 'flat' | 'down';
  totalSessions: number;
}

export interface AdminRecentSession {
  id: string;
  videoId: string;
  playerName: string;
  playerId: string;
  date: Date;
  momentumScore: number;
  weakestFlow: string;
  weakestScore: number;
  flagged: boolean;
  flagReason: string | null;
  playerAvgScore: number;
}

export interface AdminSessionDetail {
  id: string;
  videoId: string;
  playerId: string;
  playerName: string;
  playerLevel: string | null;
  date: Date;
  
  // Scores
  momentumScore: number;
  goatyBand: number | null;
  
  // Category scores
  timing: number;
  sequence: number;
  stability: number;
  directional: number;
  posture: number;
  
  // Legacy scores
  anchor: number;
  engine: number;
  whip: number;
  
  // Analysis
  weakestCategory: string;
  weakestScore: number;
  strongestCategory: string;
  strongestScore: number;
  
  // Flags
  flags: string[];
  
  // Video
  videoUrl: string | null;
  videoFileName: string | null;
  
  // Raw data for AI
  rawScoringData: any;
}

export interface AdminDashboardData {
  rosterSummary: AdminRosterAthlete[];
  recentSessions: AdminRecentSession[];
  totalAthletes: number;
  activeLast7Days: number;
  avgMomentumScore: number;
}

export interface CoachAnalystRequest {
  sessionId: string;
  playerName: string;
  playerLevel: string | null;
  momentumScore: number;
  categoryScores: {
    timing: number;
    sequence: number;
    stability: number;
    directional: number;
    posture: number;
  };
  flags: string[];
  context: string;
}

export interface CoachAnalystResponse {
  analysis: string;
  error?: string;
}
