import { prisma } from '../db';
import { AdminSessionDetail } from './types';

/**
 * Fetch detailed session data for admin view
 */
export async function getSessionDetail(videoId: string): Promise<AdminSessionDetail | null> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      userId: true,
      uploadDate: true,
      overallScore: true,
      goatyBand: true,
      newScoringBreakdown: true,
      videoUrl: true,
      title: true,
      user: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  if (!video) {
    return null;
  }

  // Extract category scores from new scoring breakdown
  let categoryScores = {
    timing: 0,
    sequence: 0,
    stability: 0,
    directional: 0,
    posture: 0,
  };
  
  let anchor = 0;
  let engine = 0;
  let whip = 0;

  if (video.newScoringBreakdown && typeof video.newScoringBreakdown === 'object') {
    const breakdown = video.newScoringBreakdown as any;
    
    if (breakdown.categoryScores) {
      categoryScores = {
        timing: Math.round(breakdown.categoryScores.timing || 0),
        sequence: Math.round(breakdown.categoryScores.sequence || 0),
        stability: Math.round(breakdown.categoryScores.stability || 0),
        directional: Math.round(breakdown.categoryScores.directional || 0),
        posture: Math.round(breakdown.categoryScores.posture || 0),
      };
    }

    // Map to legacy A/E/W scores
    if (breakdown.legacyMapping) {
      anchor = Math.round(breakdown.legacyMapping.anchor || 0);
      engine = Math.round(breakdown.legacyMapping.engine || 0);
      whip = Math.round(breakdown.legacyMapping.whip || 0);
    }
  }

  // Find weakest and strongest categories
  const catEntries = Object.entries(categoryScores) as [string, number][];
  const weakest = catEntries.reduce((min, [name, score]) =>
    score < min.score ? { name, score } : min
  , { name: catEntries[0][0], score: catEntries[0][1] });
  
  const strongest = catEntries.reduce((max, [name, score]) =>
    score > max.score ? { name, score } : max
  , { name: catEntries[0][0], score: catEntries[0][1] });

  // Generate flags
  const flags: string[] = [];
  
  if (video.overallScore && video.overallScore < 60) {
    flags.push('Low overall score');
  }
  
  if (categoryScores.sequence < 50) {
    flags.push('Broken sequence');
  }
  
  if (categoryScores.timing < 50) {
    flags.push('Poor timing/rhythm');
  }
  
  if (categoryScores.stability < 50) {
    flags.push('Stability issues');
  }

  const detail: AdminSessionDetail = {
    id: video.id,
    videoId: video.id,
    playerId: video.userId,
    playerName: video.user.name || 'Unknown Player',
    playerLevel: video.user.level,
    date: video.uploadDate,
    
    momentumScore: Math.round(video.overallScore || 0),
    goatyBand: video.goatyBand,
    
    ...categoryScores,
    
    anchor,
    engine,
    whip,
    
    weakestCategory: weakest.name,
    weakestScore: weakest.score,
    strongestCategory: strongest.name,
    strongestScore: strongest.score,
    
    flags,
    
    videoUrl: video.videoUrl,
    videoFileName: video.title,
    
    rawScoringData: video.newScoringBreakdown,
  };

  return detail;
}
