/**
 * Assessment Comparison Utility
 * 
 * Compares current assessment with previous assessment for the same athlete
 * Calculates deltas for key metrics and generates progress summaries
 */

import { prisma } from './db';

export interface ComparisonMetrics {
  // Overall scores
  overallScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  anchorScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  engineScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  whipScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  
  // Motion metrics
  avgBatSpeed: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  
  // Stability metrics
  headStabilityScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  overallStabilityScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  
  // Sequencing metrics
  avgSequenceScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  avgSequenceOrderScore: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  
  // Ball data
  avgExitVelocity: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  barrelRate: { current: number | null; previous: number | null; delta: number | null; percentChange: number | null };
  
  // Metadata
  previousAssessmentDate: Date | null;
  daysSincePrevious: number | null;
}

export interface ComparisonSummary {
  metrics: ComparisonMetrics;
  improvements: string[]; // List of improved metrics
  declines: string[]; // List of declined metrics
  unchanged: string[]; // List of unchanged metrics
  overallTrend: 'improving' | 'declining' | 'stable';
  narrativeSummary: string; // AI-friendly text summary
}

/**
 * Calculate delta between two values
 */
function calculateDelta(
  current: number | null | undefined,
  previous: number | null | undefined
): { current: number | null; previous: number | null; delta: number | null; percentChange: number | null } {
  const curr = current ?? null;
  const prev = previous ?? null;
  
  if (curr === null || prev === null) {
    return { current: curr, previous: prev, delta: null, percentChange: null };
  }
  
  const delta = curr - prev;
  const percentChange = prev !== 0 ? (delta / prev) * 100 : null;
  
  return { current: curr, previous: prev, delta, percentChange };
}

/**
 * Find the previous assessment for a given user
 */
export async function findPreviousAssessment(
  userId: string,
  currentSessionDate: Date
): Promise<{ sessionId: string; report: any; metrics: any } | null> {
  const previousSession = await prisma.assessmentSession.findFirst({
    where: {
      userId,
      createdAt: { lt: currentSessionDate },
      status: 'completed',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      report: {
        include: {
          metrics: true,
        },
      },
    },
  });
  
  if (!previousSession || !previousSession.report) {
    return null;
  }
  
  return {
    sessionId: previousSession.id,
    report: previousSession.report,
    metrics: previousSession.report.metrics,
  };
}

/**
 * Compare current assessment with previous assessment
 */
export async function compareAssessments(
  userId: string,
  currentSessionId: string
): Promise<ComparisonSummary | null> {
  // Get current assessment
  const currentSession = await prisma.assessmentSession.findUnique({
    where: { id: currentSessionId },
    include: {
      report: {
        include: {
          metrics: true,
        },
      },
    },
  });
  
  if (!currentSession || !currentSession.report) {
    return null;
  }
  
  // Find previous assessment
  const previous = await findPreviousAssessment(userId, currentSession.createdAt);
  
  if (!previous) {
    // No previous assessment to compare
    return null;
  }
  
  const currentMetrics = currentSession.report.metrics;
  const previousMetrics = previous.metrics;
  const currentBallData = currentSession.report.ballDataSummary as any;
  const previousBallData = previous.report.ballDataSummary as any;
  
  // Calculate all metric deltas
  const metrics: ComparisonMetrics = {
    overallScore: calculateDelta(currentSession.report.overallScore, previous.report.overallScore),
    anchorScore: calculateDelta(currentMetrics?.anchorScore, previousMetrics?.anchorScore),
    engineScore: calculateDelta(currentMetrics?.engineScore, previousMetrics?.engineScore),
    whipScore: calculateDelta(currentMetrics?.whipScore, previousMetrics?.whipScore),
    avgBatSpeed: calculateDelta(currentMetrics?.avgBatSpeed, previousMetrics?.avgBatSpeed),
    headStabilityScore: calculateDelta(currentMetrics?.headStabilityScore, previousMetrics?.headStabilityScore),
    overallStabilityScore: calculateDelta(currentMetrics?.overallStabilityScore, previousMetrics?.overallStabilityScore),
    avgSequenceScore: calculateDelta(currentMetrics?.avgSequenceScore, previousMetrics?.avgSequenceScore),
    avgSequenceOrderScore: calculateDelta(currentMetrics?.avgSequenceOrderScore, previousMetrics?.avgSequenceOrderScore),
    avgExitVelocity: calculateDelta(currentBallData?.avgExitVelo, previousBallData?.avgExitVelo),
    barrelRate: calculateDelta(currentBallData?.barrelRate, previousBallData?.barrelRate),
    previousAssessmentDate: previous.report.createdAt,
    daysSincePrevious: Math.floor((currentSession.createdAt.getTime() - previous.report.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  };
  
  // Categorize changes
  const improvements: string[] = [];
  const declines: string[] = [];
  const unchanged: string[] = [];
  
  const metricNames: { key: keyof ComparisonMetrics; label: string; threshold: number }[] = [
    { key: 'overallScore', label: 'Overall Score', threshold: 2 },
    { key: 'anchorScore', label: 'Anchor (Lower Body)', threshold: 2 },
    { key: 'engineScore', label: 'Engine (Core Rotation)', threshold: 2 },
    { key: 'whipScore', label: 'Whip (Bat Speed)', threshold: 2 },
    { key: 'avgBatSpeed', label: 'Bat Speed', threshold: 1 },
    { key: 'headStabilityScore', label: 'Head Stability', threshold: 2 },
    { key: 'overallStabilityScore', label: 'Overall Stability', threshold: 2 },
    { key: 'avgSequenceScore', label: 'Kinematic Sequence', threshold: 2 },
    { key: 'avgExitVelocity', label: 'Exit Velocity', threshold: 1 },
    { key: 'barrelRate', label: 'Barrel Rate', threshold: 2 },
  ];
  
  metricNames.forEach(({ key, label, threshold }) => {
    const metric = metrics[key] as { delta: number | null; current: number | null; previous: number | null };
    if (metric && metric.delta !== null && metric.current !== null && metric.previous !== null) {
      if (Math.abs(metric.delta) < threshold) {
        unchanged.push(label);
      } else if (metric.delta > 0) {
        improvements.push(`${label} (+${metric.delta.toFixed(1)})`);
      } else {
        declines.push(`${label} (${metric.delta.toFixed(1)})`);
      }
    }
  });
  
  // Determine overall trend
  let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (improvements.length > declines.length && improvements.length > 0) {
    overallTrend = 'improving';
  } else if (declines.length > improvements.length && declines.length > 0) {
    overallTrend = 'declining';
  }
  
  // Generate narrative summary
  const narrativeSummary = generateNarrativeSummary(metrics, improvements, declines, overallTrend);
  
  return {
    metrics,
    improvements,
    declines,
    unchanged,
    overallTrend,
    narrativeSummary,
  };
}

/**
 * Generate a narrative summary for AI/Gamma integration
 */
function generateNarrativeSummary(
  metrics: ComparisonMetrics,
  improvements: string[],
  declines: string[],
  trend: 'improving' | 'declining' | 'stable'
): string {
  const parts: string[] = [];
  
  // Time since last assessment
  if (metrics.daysSincePrevious) {
    parts.push(`Assessment conducted ${metrics.daysSincePrevious} days after previous evaluation.`);
  }
  
  // Overall trend
  if (trend === 'improving') {
    parts.push(`\n\n**Overall Trend: IMPROVING** 📈`);
  } else if (trend === 'declining') {
    parts.push(`\n\n**Overall Trend: DECLINING** 📉`);
  } else {
    parts.push(`\n\n**Overall Trend: STABLE** ➡️`);
  }
  
  // Key improvements
  if (improvements.length > 0) {
    parts.push(`\n\n**Key Improvements:**`);
    improvements.forEach((imp) => parts.push(`\n- ${imp}`));
  }
  
  // Areas of concern
  if (declines.length > 0) {
    parts.push(`\n\n**Areas Needing Attention:**`);
    declines.forEach((dec) => parts.push(`\n- ${dec}`));
  }
  
  // Specific callouts
  if (metrics.overallScore.delta !== null) {
    const delta = metrics.overallScore.delta;
    if (Math.abs(delta) >= 5) {
      parts.push(`\n\n**Notable:** Overall score ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta).toFixed(1)} points.`);
    }
  }
  
  if (metrics.avgBatSpeed.delta !== null && Math.abs(metrics.avgBatSpeed.delta) >= 2) {
    parts.push(`\n**Notable:** Bat speed ${metrics.avgBatSpeed.delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(metrics.avgBatSpeed.delta).toFixed(1)} mph.`);
  }
  
  if (metrics.avgSequenceScore.delta !== null && Math.abs(metrics.avgSequenceScore.delta) >= 5) {
    parts.push(`\n**Notable:** Kinematic sequencing ${metrics.avgSequenceScore.delta > 0 ? 'improved' : 'declined'} significantly.`);
  }
  
  return parts.join('');
}

/**
 * Format comparison data for Gamma prompt integration
 */
export function formatComparisonForGamma(comparison: ComparisonSummary | null): string {
  if (!comparison) {
    return '';
  }
  
  return `\n\n## Change Since Last Assessment\n\n${comparison.narrativeSummary}`;
}
