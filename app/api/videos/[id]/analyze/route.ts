/**
 * API Route: Analyze Video
 * - Runs skeleton-based swing analysis
 * - Calculates Anchor/Engine/Whip scores
 * - Supports both old and new scoring engines (via feature flag)
 * - Stores results in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { analyzeSwing } from '@/lib/swing-analyzer';
import { Decimal } from '@prisma/client/runtime/library';

// New scoring engine imports
import { NEW_SCORING_ENGINE_ENABLED, scoreSwing } from '@/lib/scoring/newScoringEngine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/videos/[id]/analyze
 * Runs full swing analysis on a video with skeleton data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  console.log(`[Analyze] Starting analysis for video ${params.id}`);
  
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
        skeletonData: true,
        skeletonExtracted: true,
        skeletonStatus: true,
        impactFrame: true,
        fps: true,
        cameraAngle: true,
        user: {
          select: {
            height: true,
            level: true,
          },
        },
      },
    });

    if (!video || video.userId !== session.user.id) {
      console.error(`[Analyze] Video not found or unauthorized`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (!video.skeletonExtracted || !video.skeletonData) {
      console.error(`[Analyze] No skeleton data available`);
      return NextResponse.json(
        { error: 'No skeleton data available. Please run skeleton extraction first.' },
        { status: 400 }
      );
    }

    console.log(`[Analyze] Running swing analysis... (New Engine: ${NEW_SCORING_ENGINE_ENABLED})`);
    
    let updatedVideo;
    let analysisResult;
    
    if (NEW_SCORING_ENGINE_ENABLED) {
      // ===== NEW SCORING ENGINE =====
      console.log('[Analyze] Using NEW Kwon/THSS-aligned scoring engine');
      
      const newScoring = await scoreSwing({
        jointData: video.skeletonData as any,
        fps: video.fps || 60,
        playerHeight: video.user?.height ?? undefined,
        playerLevel: video.user?.level ?? undefined,
        manualImpactFrame: video.impactFrame ?? undefined,
      });
      
      console.log(`[Analyze] New scoring complete. Mechanics: ${newScoring.mechanicsScore}, Band: ${newScoring.goatyBand}`);
      
      // Update video with new scores
      updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data: {
          analyzed: true,
          overallScore: newScoring.mechanicsScore,
          anchor: newScoring.legacyScores.anchor,
          engine: newScoring.legacyScores.engine,
          whip: newScoring.legacyScores.whip,
          goatyBand: newScoring.goatyBand,
          newScoringBreakdown: newScoring.debugBreakdown as any,
          tier: newScoring.goatyBandLabel,
        },
      });
      
      analysisResult = {
        engineVersion: 'new',
        overallScore: newScoring.mechanicsScore,
        goatyBand: newScoring.goatyBand,
        goatyBandLabel: newScoring.goatyBandLabel,
        anchorScore: newScoring.legacyScores.anchor,
        engineScore: newScoring.legacyScores.engine,
        whipScore: newScoring.legacyScores.whip,
        categoryScores: newScoring.categoryScores,
        confidence: newScoring.confidence,
        dataQuality: newScoring.dataQuality,
      };
      
    } else {
      // ===== OLD SCORING ENGINE =====
      console.log('[Analyze] Using OLD scoring engine (legacy)');
      
      // Prepare swing data for analysis
      const swing = {
        video: {
          skeletonData: video.skeletonData,
          impactFrame: video.impactFrame,
          fps: video.fps,
          cameraAngle: video.cameraAngle,
          playerHeight: video.user?.height,
        },
      };

      // Run analysis
      const analysis = await analyzeSwing(swing);
      console.log(`[Analyze] Old analysis complete. Overall score: ${analysis.metrics.overallScore}`);

      // Calculate Anchor/Engine/Whip scores from metrics
      const metrics = analysis.metrics;
      
      const anchorScore = calculateComponentScore([
        metrics.spineTiltAtLaunchDeg,
        metrics.pelvisAngleAtLaunchDeg,
        metrics.backKneeFlexionAtLaunchDeg,
      ]);
      
      const engineScore = calculateComponentScore([
        metrics.pelvisMaxAngularVelocity,
        metrics.torsoMaxAngularVelocity,
        metrics.hipShoulderSeparation,
      ]);
      
      const whipScore = calculateComponentScore([
        metrics.armMaxAngularVelocity,
        metrics.batMaxAngularVelocity,
        metrics.avgBatSpeedMph,
      ]);

      // Calculate sub-scores using existing Integer fields
      const anchorStance = Math.round(calculateStabilityScore([
        metrics.spineTiltAtLaunchDeg,
      ]));
      const anchorWeightShift = Math.round(calculateTimingScore([
        metrics.loadToLaunchMs,
      ]));
      const engineHipRotation = Math.round(calculateComponentScore([
        metrics.pelvisMaxAngularVelocity,
      ]));
      const engineSeparation = Math.round(calculateComponentScore([
        metrics.hipShoulderSeparation,
      ]));
      const whipBatSpeed = Math.round(calculateComponentScore([
        metrics.avgBatSpeedMph,
      ]));
      const whipBatPath = Math.round(metrics.sequenceScore || 0);

      // Update video with analysis results
      updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data: {
          analyzed: true,
          overallScore: Math.round(metrics.overallScore || 0),
          anchor: Math.round(anchorScore),
          engine: Math.round(engineScore),
          whip: Math.round(whipScore),
          
          // Sub-scores using existing Integer fields
          anchorStance,
          anchorWeightShift,
          anchorGroundConnection: Math.round(anchorScore),
          anchorLowerBodyMechanics: Math.round(anchorScore),
          
          engineHipRotation,
          engineSeparation,
          engineCorePower: Math.round(engineScore),
          engineTorsoMechanics: Math.round(engineScore),
          
          whipBatSpeed,
          whipBatPath,
          whipArmPath: Math.round(whipScore),
          whipConnection: Math.round(whipScore),
          
          tier: getTier(metrics.overallScore || 0),
        },
      });
      
      analysisResult = {
        engineVersion: 'old',
        overallScore: metrics.overallScore,
        anchorScore,
        engineScore,
        whipScore,
        metrics,
      };
    }

    const duration = Date.now() - startTime;
    console.log(`[Analyze] Complete in ${duration}ms`);

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      analysis: analysisResult,
      processingTime: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Analyze] Error after ${duration}ms:`, error);
    console.error(error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json(
      {
        error: 'Failed to analyze video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/videos/[id]/analyze
 * Returns current analysis status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        analyzed: true,
        skeletonExtracted: true,
        skeletonStatus: true,
        skeletonErrorMessage: true,
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
        goatyBand: true,
      },
    });

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      analyzed: video.analyzed,
      skeletonExtracted: video.skeletonExtracted,
      skeletonStatus: video.skeletonStatus,
      skeletonErrorMessage: video.skeletonErrorMessage,
      scores: video.analyzed
        ? {
            overall: video.overallScore,
            anchor: video.anchor,
            engine: video.engine,
            whip: video.whip,
            goatyBand: video.goatyBand,
          }
        : null,
    });

  } catch (error) {
    console.error('[Analyze Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis status' },
      { status: 500 }
    );
  }
}

// Helper functions (for old engine)
function calculateComponentScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + Math.abs(val), 0);
  const avg = sum / validValues.length;
  
  return Math.min(100, Math.max(0, avg));
}

function calculateTimingScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const avg = validValues.reduce((acc, val) => acc + Math.abs(val), 0) / validValues.length;
  return Math.min(100, Math.max(0, 100 - (avg / 10)));
}

function calculateStabilityScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const avg = validValues.reduce((acc, val) => acc + Math.abs(val), 0) / validValues.length;
  return Math.min(100, Math.max(0, 100 - avg));
}

function getTier(score: number): string {
  if (score >= 85) return 'Elite';
  if (score >= 75) return 'Advanced';
  if (score >= 65) return 'Intermediate';
  return 'Developing';
}