import { prisma } from '../db';
import { AdminDashboardData, AdminRosterAthlete, AdminRecentSession } from './types';
import { subDays, format } from 'date-fns';

/**
 * Fetch admin dashboard data: roster summary + recent sessions
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sevenDaysAgo = subDays(new Date(), 7);

  // Get all users (athletes)
  const users = await prisma.user.findMany({
    where: {
      role: 'player', // Only players, not coaches
    },
    select: {
      id: true,
      name: true,
      email: true,
      level: true,
      videos: {
        orderBy: { uploadDate: 'desc' },
        take: 1,
        select: {
          uploadDate: true,
        },
      },
    },
  });

  // For each user, calculate 30-day avg and recent trend
  const rosterSummary: AdminRosterAthlete[] = await Promise.all(
    users.map(async (user) => {
      // Get last 30 days of videos
      const recentVideos = await prisma.video.findMany({
        where: {
          userId: user.id,
          uploadDate: { gte: thirtyDaysAgo },
        },
        select: {
          overallScore: true,
          uploadDate: true,
        },
        orderBy: { uploadDate: 'desc' },
      });

      // Calculate 30-day average
      const validScores = recentVideos
        .map((v) => v.overallScore)
        .filter((s): s is number => s !== null && s !== undefined);
      
      const thirtyDayAvgScore =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : 0;

      // Calculate trend from last 3 sessions
      const lastThree = validScores.slice(0, 3);
      let recentTrend: 'up' | 'flat' | 'down' = 'flat';
      
      if (lastThree.length >= 2) {
        const recent = lastThree.slice(0, Math.ceil(lastThree.length / 2));
        const older = lastThree.slice(Math.ceil(lastThree.length / 2));
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg > olderAvg + 3) recentTrend = 'up';
        else if (recentAvg < olderAvg - 3) recentTrend = 'down';
      }

      return {
        id: user.id,
        name: user.name || 'Unknown Player',
        email: user.email,
        level: user.level,
        lastSessionDate: user.videos[0]?.uploadDate || null,
        thirtyDayAvgScore,
        recentTrend,
        totalSessions: recentVideos.length,
      };
    })
  );

  // Get recent sessions (last 30 across all players)
  const recentVideos = await prisma.video.findMany({
    where: {
      uploadDate: { gte: thirtyDaysAgo },
    },
    orderBy: { uploadDate: 'desc' },
    take: 30,
    select: {
      id: true,
      userId: true,
      uploadDate: true,
      overallScore: true,
      newScoringBreakdown: true,
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  const recentSessions: AdminRecentSession[] = await Promise.all(
    recentVideos.map(async (video) => {
      const score = video.overallScore || 0;
      
      // Get player's 30-day average
      const playerVideos = await prisma.video.findMany({
        where: {
          userId: video.userId,
          uploadDate: { gte: thirtyDaysAgo },
        },
        select: {
          overallScore: true,
        },
      });
      
      const playerScores = playerVideos
        .map((v) => v.overallScore)
        .filter((s): s is number => s !== null && s !== undefined);
      
      const playerAvgScore =
        playerScores.length > 0
          ? Math.round(playerScores.reduce((a, b) => a + b, 0) / playerScores.length)
          : 0;

      // Determine weakest flow path
      let weakestFlow = 'Unknown';
      let weakestScore = 100;
      
      if (video.newScoringBreakdown && typeof video.newScoringBreakdown === 'object') {
        const breakdown = video.newScoringBreakdown as any;
        const categories = breakdown.categoryScores || {};
        
        const catScores = [
          { name: 'Timing & Rhythm', score: categories.timing || 0 },
          { name: 'Sequence & Braking', score: categories.sequence || 0 },
          { name: 'Stability & Balance', score: categories.stability || 0 },
          { name: 'Directional Barrels', score: categories.directional || 0 },
          { name: 'Posture & Spine', score: categories.posture || 0 },
        ];
        
        const weakest = catScores.reduce((min, cat) =>
          cat.score < min.score ? cat : min
        );
        
        weakestFlow = weakest.name;
        weakestScore = Math.round(weakest.score);
      }

      // Flag if score below 60 or 10+ points below player avg
      const flagged = score < 60 || score < playerAvgScore - 10;
      const flagReason = score < 60
        ? 'Low score'
        : score < playerAvgScore - 10
        ? 'Large drop vs avg'
        : null;

      return {
        id: video.id,
        videoId: video.id,
        playerName: video.user.name || 'Unknown',
        playerId: video.userId,
        date: video.uploadDate,
        momentumScore: score,
        weakestFlow,
        weakestScore,
        flagged,
        flagReason,
        playerAvgScore,
      };
    })
  );

  // Calculate summary stats
  const totalAthletes = rosterSummary.length;
  const activeLast7Days = await prisma.user.count({
    where: {
      role: 'player',
      videos: {
        some: {
          uploadDate: { gte: sevenDaysAgo },
        },
      },
    },
  });

  const allScores = recentSessions.map((s) => s.momentumScore).filter((s) => s > 0);
  const avgMomentumScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  return {
    rosterSummary: rosterSummary.sort(
      (a, b) => (b.lastSessionDate?.getTime() || 0) - (a.lastSessionDate?.getTime() || 0)
    ),
    recentSessions,
    totalAthletes,
    activeLast7Days,
    avgMomentumScore,
  };
}
