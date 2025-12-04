/**
 * Flow Overlay Report Types (WO18)
 * 
 * Defines data structures for the Flow Overlay Report that replaces
 * the second motion video analyzer with A/B/C timing + momentum flow analysis.
 */

export interface FlowOverlayData {
  flowOverlayMp4Url: string | null;
  flowOverlayGifUrl: string | null;
  triggerFrame: number | null;  // Frame A
  fireFrame: number | null;     // Frame B
  contactFrame: number | null;  // Frame C
}

export interface FlowMetrics {
  momentumFlowScore: number | null;    // 0–100, overall flow score
  tempoRatio: string | null;           // e.g. "2.8 : 1.0" (A→B : B→C)
  flowSmoothnessScore: number | null;  // 0–100, kinematic sequence quality
  transferEfficiencyScore: number | null; // 0–100, energy transfer
}

export interface FlowCoachingNote {
  id: string;
  text: string;
}

export interface FlowDrill {
  id: string;
  title: string;
  description: string;
}

export interface FlowReport {
  overlay: FlowOverlayData;
  metrics: FlowMetrics;
  notes: FlowCoachingNote[];
  drills: FlowDrill[];
}

/**
 * Helper to check if flow report data is available
 */
export function hasFlowReportData(report: FlowReport | null): boolean {
  if (!report) return false;
  
  // Check if we have at least overlay URLs or metrics
  const hasOverlay = !!(report.overlay.flowOverlayMp4Url || report.overlay.flowOverlayGifUrl);
  const hasMetrics = report.metrics.momentumFlowScore !== null;
  
  return hasOverlay || hasMetrics;
}

/**
 * Get traffic light color for flow score
 */
export function getFlowScoreColor(score: number | null): 'green' | 'yellow' | 'red' | 'gray' {
  if (score === null) return 'gray';
  if (score >= 85) return 'green';
  if (score >= 70) return 'yellow';
  return 'red';
}
