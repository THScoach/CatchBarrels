/**
 * DEV ONLY: Scoring Debug API
 * Returns full debug breakdown for new scoring engine
 * 
 * GET /api/dev/videos/[id]/scoring-debug
 * 
 * Auth: Requires authentication
 * Purpose: Inspect detailed scoring calculations for debugging/tuning
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { scoreSwing, NEW_SCORING_ENGINE_ENABLED } from '@/lib/scoring/newScoringEngine';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Fetch video with skeleton data
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        title: true,
        skeletonData: true,
        skeletonExtracted: true,
        fps: true,
        impactFrame: true,
        user: {
          select: {
            height: true,
            level: true,
          },
        },
        // Existing scores for comparison
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
        // New scoring data
        newScoringBreakdown: true,
        goatyBand: true,
      },
    });

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (!video.skeletonExtracted || !video.skeletonData) {
      return NextResponse.json(
        { error: 'No skeleton data available' },
        { status: 400 }
      );
    }

    // Run new scoring engine
    const scoringResult = await scoreSwing({
      jointData: video.skeletonData as any,
      fps: video.fps || 60,
      playerHeight: video.user?.height ?? undefined,
      playerLevel: video.user?.level ?? undefined,
      manualImpactFrame: video.impactFrame ?? undefined,
    });

    // Return full debug breakdown
    return NextResponse.json({
      videoId: video.id,
      videoTitle: video.title,
      
      // Momentum Transfer Score (NEW - 60% weight)
      momentumTransferScore: scoringResult.momentumTransferScore.overall,
      momentumComponents: scoringResult.momentumTransferScore.components,
      
      // Sub-Scores (NEW - 40% weight total)
      anchorScore: scoringResult.subScores.anchor,
      engineScore: scoringResult.subScores.engine,
      whipScore: scoringResult.subScores.whip,
      
      // Final Score
      finalMechanicsScore: scoringResult.mechanicsScore,
      goatyBand: scoringResult.goatyBand,
      goatyBandLabel: scoringResult.goatyBandLabel,
      
      // New scoring engine results
      newScoring: {
        mechanicsScore: scoringResult.mechanicsScore,
        goatyBand: scoringResult.goatyBand,
        goatyBandLabel: scoringResult.goatyBandLabel,
        momentumTransferScore: scoringResult.momentumTransferScore,
        subScores: scoringResult.subScores,
        categoryScores: scoringResult.categoryScores,
        legacyScores: scoringResult.legacyScores,
        confidence: scoringResult.confidence,
        dataQuality: scoringResult.dataQuality,
        adjustments: scoringResult.adjustments,
      },
      
      // Existing scores for comparison
      existingScores: {
        overall: video.overallScore,
        anchor: video.anchor,
        engine: video.engine,
        whip: video.whip,
      },
      
      // Full debug breakdown
      debugBreakdown: scoringResult.debugBreakdown,
      
      // Feature scores summary
      featureScores: scoringResult.featureScores,
      
      // Config info
      config: {
        newScoringEngineEnabled: NEW_SCORING_ENGINE_ENABLED,
        compositWeights: {
          momentumTransfer: 0.60,
          anchor: 0.15,
          engine: 0.15,
          whip: 0.10,
        },
        message: NEW_SCORING_ENGINE_ENABLED
          ? 'Momentum-Transfer First scoring engine is ENABLED'
          : 'New scoring engine is DISABLED (using old engine in production)',
      },
    });

  } catch (error) {
    console.error('[Scoring Debug] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate scoring debug output',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
