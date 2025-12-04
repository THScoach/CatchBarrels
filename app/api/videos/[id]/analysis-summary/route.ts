/**
 * Analysis Summary API
 * 
 * Returns a comprehensive, standardized analysis output for a video.
 * Used by UI components and Coach Rick for swing analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { formatAnalysisOutput, type AnalysisOutput } from '@/lib/scoring/analysis-output';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Fetch video with user info
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            name: true,
            dateOfBirth: true,
            level: true,
            bats: true,
            throws: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check authorization
    const userId = (session.user as any).id;
    if (video.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if video has been analyzed
    if (!video.analyzed || !video.newScoringBreakdown) {
      return NextResponse.json(
        { error: 'Video has not been analyzed yet' },
        { status: 400 }
      );
    }

    // Parse new scoring breakdown
    const breakdown = typeof video.newScoringBreakdown === 'string'
      ? JSON.parse(video.newScoringBreakdown)
      : video.newScoringBreakdown;

    // Extract timing data from breakdown
    const timingData = {
      abRatio: breakdown.momentumTransfer?.components?.abRatio || 0,
      loadDurationMs: Math.round((breakdown.phases?.loadEnd - breakdown.phases?.loadStart) * 1000) || 0,
      swingDurationMs: Math.round((breakdown.phases?.impactFrame - breakdown.phases?.loadStart) * 1000) || 0,
      sequenceOrder: breakdown.sequence?.order || ['pelvis', 'torso', 'hands', 'bat'],
      segmentGapsMs: {
        pelvisToTorso: breakdown.momentumTransfer?.components?.pelvisTorsoGapMs || 0,
        torsoToHands: breakdown.momentumTransfer?.components?.torsoHandsGapMs || 0,
        handsToBat: breakdown.momentumTransfer?.components?.handsBarrelGapMs || 0,
      },
    };

    // Check if sequence is broken
    const sequenceBroken = breakdown.sequence?.broken || false;

    // Build scoring result object
    const scoringResult = {
      mechanicsScore: video.overallScore || 0,
      goatyBand: video.goatyBand || 0,
      subScores: {
        anchor: video.anchor || 0,
        engine: video.engine || 0,
        whip: video.whip || 0,
      },
      confidence: breakdown.confidence || 0.85,
    };

    // Calculate age from date of birth
    let age = 16; // Default
    if (video.user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(video.user.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    // Map level string to PlayerLevel type
    let playerLevel: 'MLB' | 'College' | 'HS' | 'Youth' = 'HS';
    if (video.user.level) {
      const levelStr = video.user.level.toLowerCase();
      if (levelStr.includes('mlb') || levelStr.includes('pro')) {
        playerLevel = 'MLB';
      } else if (levelStr.includes('college')) {
        playerLevel = 'College';
      } else if (levelStr.includes('youth') || age < 13) {
        playerLevel = 'Youth';
      }
    }
    
    // Map handedness strings (Right/Left/Switch → R/L/S)
    const batsValue = video.user.bats?.charAt(0).toUpperCase() as 'R' | 'L' | 'S' || 'R';
    const throwsValue = video.user.throws?.charAt(0).toUpperCase() as 'R' | 'L' | 'S' || 'R';
    
    // Build athlete info
    const athleteInfo = {
      name: video.user.name || 'Unknown',
      level: playerLevel,
      age,
      bats: batsValue,
      throws: throwsValue,
    };

    // Format analysis output
    const analysisOutput = formatAnalysisOutput(
      videoId,
      athleteInfo,
      scoringResult,
      timingData,
      sequenceBroken
    );

    return NextResponse.json(analysisOutput);
  } catch (error) {
    console.error('Analysis summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis summary' },
      { status: 500 }
    );
  }
}
