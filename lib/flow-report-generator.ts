/**
 * Flow Report Generator (WO18)
 * 
 * Generates coaching notes and drill recommendations for the Flow Overlay Report.
 * Based on existing video analysis scores and timing data.
 */

import type { FlowReport, FlowMetrics, FlowCoachingNote, FlowDrill, FlowOverlayData } from './flow-report-types';

interface VideoAnalysisData {
  engine: number | null;  // Engine Flow score (formerly powerFlow)
  overallScore: number | null;
  tagA: number | null;
  tagB: number | null;
  tagC: number | null;
  flowOverlayMp4Url: string | null;
  flowOverlayGifUrl: string | null;
  flowMomentumScore: number | null;
  flowTempoRatio: string | null;
  flowSmoothnessScore: number | null;
  flowTransferEfficiency: number | null;
}

/**
 * Generate a complete Flow Report from video analysis data
 */
export function generateFlowReport(data: VideoAnalysisData): FlowReport {
  // Extract overlay data
  const overlay: FlowOverlayData = {
    flowOverlayMp4Url: data.flowOverlayMp4Url,
    flowOverlayGifUrl: data.flowOverlayGifUrl,
    triggerFrame: data.tagA !== null ? Math.round(data.tagA * 30) : null, // Assume 30fps
    fireFrame: data.tagB !== null ? Math.round(data.tagB * 30) : null,
    contactFrame: data.tagC !== null ? Math.round(data.tagC * 30) : null,
  };

  // Calculate or use existing flow metrics
  const metrics: FlowMetrics = {
    momentumFlowScore: data.flowMomentumScore ?? data.engine ?? data.overallScore,
    tempoRatio: data.flowTempoRatio ?? calculateTempoRatio(data.tagA, data.tagB, data.tagC),
    flowSmoothnessScore: data.flowSmoothnessScore ?? (data.engine ? data.engine * 0.9 : null),
    transferEfficiencyScore: data.flowTransferEfficiency ?? (data.engine ? data.engine * 0.95 : null),
  };

  // Generate coaching notes based on metrics
  const notes = generateCoachingNotes(metrics);

  // Suggest drills based on weak areas
  const drills = suggestFlowDrills(metrics);

  return {
    overlay,
    metrics,
    notes,
    drills,
  };
}

/**
 * Calculate tempo ratio from A-B-C timing tags
 */
function calculateTempoRatio(tagA: number | null, tagB: number | null, tagC: number | null): string | null {
  if (tagA === null || tagB === null || tagC === null) return null;

  const loadDuration = tagB - tagA;  // Trigger to Fire
  const fireDuration = tagC - tagB;  // Fire to Contact

  if (loadDuration <= 0 || fireDuration <= 0) return null;

  // Express as ratio (normalized to 1.0 for fire)
  const ratio = loadDuration / fireDuration;
  return `${ratio.toFixed(1)} : 1.0`;
}

/**
 * Generate 2-3 coaching notes based on flow metrics
 */
function generateCoachingNotes(metrics: FlowMetrics): FlowCoachingNote[] {
  const notes: FlowCoachingNote[] = [];
  const flowScore = metrics.momentumFlowScore ?? 0;
  const smoothness = metrics.flowSmoothnessScore ?? 0;
  const efficiency = metrics.transferEfficiencyScore ?? 0;

  // Note 1: Overall flow assessment
  if (flowScore >= 85) {
    notes.push({
      id: 'flow-excellent',
      text: 'Your momentum transfer through your core is excellent. You\'re generating power efficiently from your hips to your torso.',
    });
  } else if (flowScore >= 70) {
    notes.push({
      id: 'flow-good',
      text: 'Your Engine Flow (hips → torso) shows solid fundamentals. Focus on accelerating your hip rotation to unlock more power.',
    });
  } else {
    notes.push({
      id: 'flow-needs-work',
      text: 'Your Engine Flow needs attention. Work on rotating your hips faster and earlier to create better separation from your shoulders.',
    });
  }

  // Note 2: Tempo ratio feedback
  if (metrics.tempoRatio) {
    const ratio = parseFloat(metrics.tempoRatio.split(':')[0]);
    if (ratio > 3.0) {
      notes.push({
        id: 'tempo-slow-load',
        text: 'Your load phase is longer than ideal. Try to feel more explosive out of your trigger, creating a quicker transition to launch.',
      });
    } else if (ratio < 2.0) {
      notes.push({
        id: 'tempo-rushed',
        text: 'Your swing tempo is quick. Consider taking a slightly longer load to gather more power before firing.',
      });
    } else {
      notes.push({
        id: 'tempo-good',
        text: 'Your timing rhythm (load to fire) is in a solid range. This tempo allows you to generate power without rushing.',
      });
    }
  }

  // Note 3: Smoothness or efficiency feedback (if different from overall score)
  if (smoothness < flowScore - 10) {
    notes.push({
      id: 'smoothness-issue',
      text: 'Your kinematic sequence shows some interruptions. Focus on a smooth, connected rotation—hips lead, then shoulders follow naturally.',
    });
  } else if (efficiency < flowScore - 10) {
    notes.push({
      id: 'efficiency-issue',
      text: 'Some energy is being lost in your transfer. Make sure your front side stays firm at contact to transfer force into the ball.',
    });
  }

  // Return up to 3 notes
  return notes.slice(0, 3);
}

/**
 * Suggest 1-3 drills based on flow weaknesses
 */
function suggestFlowDrills(metrics: FlowMetrics): FlowDrill[] {
  const drills: FlowDrill[] = [];
  const flowScore = metrics.momentumFlowScore ?? 0;
  const smoothness = metrics.flowSmoothnessScore ?? 0;

  // Low overall flow score → Hip rotation drills
  if (flowScore < 70) {
    drills.push({
      id: 'hip-rotation-drill',
      title: 'Hip Rotation Isolations',
      description: 'Practice rotating your hips aggressively without a bat. Focus on speed and separation from your upper body. 3 sets of 10 reps.',
    });
  }

  // Smoothness issue → Sequencing drill
  if (smoothness < 70) {
    drills.push({
      id: 'kinematic-sequence-drill',
      title: 'Step-Behind Soft Toss',
      description: 'Take a small step behind with your back foot, then explode forward. This enforces proper ground → hips → torso sequencing. 2 rounds of 10 swings.',
    });
  }

  // General engine flow drill for anyone
  if (drills.length < 2) {
    drills.push({
      id: 'separation-drill',
      title: 'Torque & Separation Drill',
      description: 'Start with your shoulders turned away from the pitcher. Load back, then fire your hips first while holding your shoulders. Feel the stretch, then release. 2 rounds of 8 swings.',
    });
  }

  // Always suggest at least one drill
  if (drills.length === 0) {
    drills.push({
      id: 'general-flow-drill',
      title: 'Medicine Ball Rotational Throws',
      description: 'Stand sideways to a wall, rotate your hips explosively, and throw a 6-8 lb medicine ball. This builds rotational power. 3 sets of 8 throws per side.',
    });
  }

  return drills.slice(0, 3);
}
