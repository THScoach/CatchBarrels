/**
 * Dashboard Summary Provider
 * Builds Functional Health-style dashboard data from existing scoring
 */

import { prisma } from '@/lib/db';
import { DashboardSummary, CoreScore, TrafficColor, TimingLeak, StrengthOrIssue, DrillLink, Next30DaysPlan } from './types';

/**
 * Convert score (0-100) to traffic light color
 */
function scoreToColor(score: number): TrafficColor {
  if (score >= 85) return 'green';
  if (score >= 70) return 'yellow';
  return 'red';
}

/**
 * Map BARRELS scoring to POWER/FLOW/CONTACT model:
 * - POWER: Ground Flow + Posture (Anchor score)
 * - FLOW: Engine Flow + Tempo/Sequence (Engine score)
 * - CONTACT: Barrel Flow + Hand Path (Whip score)
 */
export async function buildDashboardSummaryForUser(userId: string): Promise<DashboardSummary> {
  // 1. Get latest analyzed video/session for this user
  const latestVideo = await prisma.video.findFirst({
    where: {
      userId: userId,
      analyzed: true,
    },
    orderBy: {
      uploadDate: 'desc',
    },
    select: {
      id: true,
      overallScore: true,
      anchor: true,
      engine: true,
      whip: true,
      goatyBand: true,
      newScoringBreakdown: true,
      tagA: true,
      tagB: true,
      tagC: true,
    },
  });

  // If no analyzed videos, return default/empty summary
  if (!latestVideo) {
    return buildEmptySummary();
  }

  // 2. Extract scores from latest video
  const anchorScore = latestVideo.anchor || 0;
  const engineScore = latestVideo.engine || 0;
  const whipScore = latestVideo.whip || 0;
  const overallScore = latestVideo.overallScore || 0;

  // 3. Map to POWER/FLOW/CONTACT (using legacy Anchor/Engine/Whip scores)
  const powerScore = anchorScore;      // POWER = Ground Flow + Anchor
  const flowScore = engineScore;       // FLOW = Engine Flow + Sequence
  const contactScore = whipScore;      // CONTACT = Barrel Flow + Hand Path

  // 4. Build core scores
  const coreScores: CoreScore[] = [
    {
      label: 'POWER',
      score: Math.round(powerScore),
      color: scoreToColor(powerScore),
      shortTagline: getPowerTagline(powerScore),
    },
    {
      label: 'FLOW',
      score: Math.round(flowScore),
      color: scoreToColor(flowScore),
      shortTagline: getFlowTagline(flowScore),
    },
    {
      label: 'CONTACT',
      score: Math.round(contactScore),
      color: scoreToColor(contactScore),
      shortTagline: getContactTagline(contactScore),
    },
  ];

  // 5. Extract timing data from newScoringBreakdown (if available)
  let timingLeaks: TimingLeak[] = [];
  if (latestVideo.newScoringBreakdown) {
    try {
      const breakdown = latestVideo.newScoringBreakdown as any;
      timingLeaks = extractTimingLeaks(breakdown, latestVideo.tagA, latestVideo.tagB, latestVideo.tagC);
    } catch (e) {
      console.error('[Dashboard] Error parsing newScoringBreakdown:', e);
      timingLeaks = buildDefaultTimingLeaks();
    }
  } else {
    timingLeaks = buildDefaultTimingLeaks();
  }

  // 6. Build strengths / watch items / priority issue
  const { strengths, watchItems, priorityIssue } = categorizeIssues(
    powerScore,
    flowScore,
    contactScore,
    overallScore
  );

  // 7. Suggested drills (fetch from database)
  const suggestedDrills = await fetchSuggestedDrills(powerScore, flowScore, contactScore);

  // 8. Next 30 days plan
  const next30Days = buildNext30DaysPlan(
    powerScore,
    flowScore,
    contactScore,
    overallScore,
    userId
  );

  return {
    coreScores,
    strengths,
    watchItems,
    priorityIssue,
    timingLeaks,
    suggestedDrills,
    next30Days,
  };
}

/**
 * Build empty summary for users with no analyzed videos
 */
function buildEmptySummary(): DashboardSummary {
  return {
    coreScores: [
      { label: 'POWER', score: 0, color: 'red', shortTagline: 'Upload your first swing to get scored' },
      { label: 'FLOW', score: 0, color: 'red', shortTagline: 'Upload your first swing to get scored' },
      { label: 'CONTACT', score: 0, color: 'red', shortTagline: 'Upload your first swing to get scored' },
    ],
    strengths: [],
    watchItems: [],
    priorityIssue: {
      title: 'No Analysis Yet',
      description: 'Upload your first swing video to get personalized feedback',
      category: 'flow',
    },
    timingLeaks: buildDefaultTimingLeaks(),
    suggestedDrills: [],
    next30Days: {
      sessionsPerWeek: 2,
      recommendedTier: 'athlete',
      focusBullets: [
        'Upload your first swing video',
        'Complete your player profile',
        'Review the drill library',
      ],
    },
  };
}

/**
 * Generate tagline for POWER score
 */
function getPowerTagline(score: number): string {
  if (score >= 85) return 'You store and release power well';
  if (score >= 70) return 'Solid power foundation, room to improve';
  return 'Focus on grounding and stability';
}

/**
 * Generate tagline for FLOW score
 */
function getFlowTagline(score: number): string {
  if (score >= 85) return 'Smooth momentum transfer';
  if (score >= 70) return 'Your sequence is decent but a bit rushed';
  return 'Timing issues disrupting flow';
}

/**
 * Generate tagline for CONTACT score
 */
function getContactTagline(score: number): string {
  if (score >= 85) return 'Consistent barrel control';
  if (score >= 70) return 'Contact quality is good, minor adjustments needed';
  return 'Contact quality is inconsistent';
}

/**
 * Extract timing leaks from scoring breakdown
 */
function extractTimingLeaks(
  breakdown: any,
  tagA: number | null,
  tagB: number | null,
  tagC: number | null
): TimingLeak[] {
  // TODO: Extract actual timing data from breakdown.phases
  // For now, use default leaks with scores to determine colors
  const phases = breakdown?.phases;
  
  if (!phases) {
    return buildDefaultTimingLeaks();
  }

  // Use A/B/C tags if available, otherwise use detected phases
  const loadDuration = phases.loadDuration || 0;
  const swingDuration = phases.swingDuration || 0;
  const abRatio = phases.abRatio || 0;

  // Phase A: Trigger (load)
  const phaseA: TimingLeak = {
    phase: 'A',
    label: 'Trigger',
    color: loadDuration >= 200 && loadDuration <= 400 ? 'green' : loadDuration < 200 ? 'red' : 'yellow',
    issueSummary: loadDuration >= 200 && loadDuration <= 400
      ? 'Load rhythm is in a good window'
      : loadDuration < 200
      ? 'Load happens too fast, rushing the sequence'
      : 'Load is too slow, losing momentum',
    deltaMs: loadDuration >= 200 && loadDuration <= 400 ? 0 : loadDuration < 200 ? loadDuration - 200 : loadDuration - 400,
  };

  // Phase B: Fire (forward move)
  const phaseB: TimingLeak = {
    phase: 'B',
    label: 'Fire',
    color: swingDuration >= 100 && swingDuration <= 200 ? 'green' : swingDuration < 100 ? 'red' : 'yellow',
    issueSummary: swingDuration >= 100 && swingDuration <= 200
      ? 'Forward move timing is good'
      : swingDuration < 100
      ? 'Forward move starts too early, rushing the swing'
      : 'Forward move is too slow, late to the ball',
    deltaMs: swingDuration >= 100 && swingDuration <= 200 ? 0 : swingDuration < 100 ? swingDuration - 100 : swingDuration - 200,
  };

  // Phase C: Contact
  const phaseC: TimingLeak = {
    phase: 'C',
    label: 'Contact',
    color: abRatio >= 1.2 && abRatio <= 2.0 ? 'green' : abRatio < 1.2 ? 'red' : 'yellow',
    issueSummary: abRatio >= 1.2 && abRatio <= 2.0
      ? 'Load-to-fire ratio is balanced'
      : abRatio < 1.2
      ? 'Hands catch up late vs. the pelvis turn'
      : 'Hands fire too early, getting ahead of rotation',
    deltaMs: abRatio >= 1.2 && abRatio <= 2.0 ? 0 : Math.round((abRatio - 1.6) * 100),
  };

  return [phaseA, phaseB, phaseC];
}

/**
 * Build default timing leaks (used when no breakdown data)
 */
function buildDefaultTimingLeaks(): TimingLeak[] {
  return [
    {
      phase: 'A',
      label: 'Trigger',
      color: 'yellow',
      issueSummary: 'No timing data available yet',
    },
    {
      phase: 'B',
      label: 'Fire',
      color: 'yellow',
      issueSummary: 'Upload a video to analyze timing',
    },
    {
      phase: 'C',
      label: 'Contact',
      color: 'yellow',
      issueSummary: 'Timing analysis requires video data',
    },
  ];
}

/**
 * Categorize issues into strengths / watch items / priority
 */
function categorizeIssues(
  powerScore: number,
  flowScore: number,
  contactScore: number,
  overallScore: number
): {
  strengths: StrengthOrIssue[];
  watchItems: StrengthOrIssue[];
  priorityIssue: StrengthOrIssue;
} {
  const items: Array<StrengthOrIssue & { score: number }> = [
    {
      title: 'Ground Power',
      description: 'Your ability to store and release energy from the ground',
      category: 'power',
      score: powerScore,
    },
    {
      title: 'Momentum Flow',
      description: 'How smoothly energy transfers from ground to barrel',
      category: 'flow',
      score: flowScore,
    },
    {
      title: 'Barrel Control',
      description: 'Your consistency making solid contact with the ball',
      category: 'contact',
      score: contactScore,
    },
  ];

  // Sort by score (highest to lowest)
  items.sort((a, b) => b.score - a.score);

  // Green = 85+, Yellow = 70-84, Red = <70
  const strengths = items.filter((item) => item.score >= 85).map((item) => ({
    title: item.title,
    description: item.description,
    category: item.category,
  }));

  const watchItems = items.filter((item) => item.score >= 70 && item.score < 85).map((item) => ({
    title: item.title,
    description: item.description,
    category: item.category,
  }));

  const redItems = items.filter((item) => item.score < 70);
  const priorityIssue = redItems.length > 0
    ? {
        title: redItems[0].title,
        description: redItems[0].description,
        category: redItems[0].category,
      }
    : {
        title: 'Keep Improving',
        description: 'Continue working on all areas to reach elite status',
        category: 'flow' as const,
      };

  return { strengths, watchItems, priorityIssue };
}

/**
 * Fetch suggested drills based on scores
 */
async function fetchSuggestedDrills(
  powerScore: number,
  flowScore: number,
  contactScore: number
): Promise<DrillLink[]> {
  // Find lowest score to prioritize drills
  const lowestCategory =
    powerScore <= flowScore && powerScore <= contactScore
      ? 'power'
      : flowScore <= contactScore
      ? 'flow'
      : 'contact';

  // TODO: Implement drill category filtering in the database
  // For now, fetch any drills and map them to categories
  const drills = await prisma.drill.findMany({
    take: 6,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  return drills.map((drill) => ({
    id: drill.id,
    title: drill.name,
    primaryCategory: mapDrillCategory(drill.category),
  }));
}

/**
 * Map drill category to power/flow/contact
 */
function mapDrillCategory(category: string | null): 'power' | 'flow' | 'contact' {
  if (!category) return 'flow';
  
  const cat = category.toLowerCase();
  if (cat.includes('ground') || cat.includes('anchor') || cat.includes('power')) return 'power';
  if (cat.includes('barrel') || cat.includes('whip') || cat.includes('contact')) return 'contact';
  return 'flow';
}

/**
 * Build Next 30 Days plan
 */
function buildNext30DaysPlan(
  powerScore: number,
  flowScore: number,
  contactScore: number,
  overallScore: number,
  userId: string
): Next30DaysPlan {
  // Determine recommended tier based on overall score
  const recommendedTier: 'athlete' | 'pro' | 'elite' =
    overallScore >= 85 ? 'elite' : overallScore >= 70 ? 'pro' : 'athlete';

  // Determine sessions per week
  const sessionsPerWeek = overallScore >= 85 ? 3 : overallScore >= 70 ? 2 : 2;

  // Build focus bullets based on scores
  const focusBullets: string[] = [];

  if (powerScore < 70) {
    focusBullets.push('Strengthen your ground power and stability');
  } else if (powerScore < 85) {
    focusBullets.push('Fine-tune your power generation mechanics');
  }

  if (flowScore < 70) {
    focusBullets.push('Clean up timing between load and fire');
  } else if (flowScore < 85) {
    focusBullets.push('Improve momentum transfer consistency');
  }

  if (contactScore < 70) {
    focusBullets.push('Work on barrel control and hand path');
  } else if (contactScore < 85) {
    focusBullets.push('Refine contact quality and bat speed');
  }

  // If all scores are good, add general improvement bullets
  if (focusBullets.length === 0) {
    focusBullets.push('Maintain elite mechanics under pressure');
    focusBullets.push('Focus on in-game adjustments');
    focusBullets.push('Continue building bat speed and power');
  }

  // Ensure at least 3 bullets
  while (focusBullets.length < 3) {
    focusBullets.push('Review video analysis with Coach Rick');
  }

  return {
    sessionsPerWeek,
    recommendedTier,
    focusBullets: focusBullets.slice(0, 5), // Max 5 bullets
  };
}
