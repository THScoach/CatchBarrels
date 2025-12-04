/**
 * Flow Report API Endpoint (WO18)
 * 
 * GET /api/videos/[id]/flow-report
 * 
 * Returns the Flow Overlay Report data for a video, including:
 * - Overlay URLs (MP4/GIF) and frame markers (A/B/C)
 * - Flow metrics (momentum, tempo, smoothness, efficiency)
 * - Coaching notes (2-3 short tips)
 * - Drill recommendations (1-3 drills)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateFlowReport } from '@/lib/flow-report-generator';
import type { FlowReport } from '@/lib/flow-report-types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const videoId = params.id;

    // 2. Fetch video with necessary fields
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        analyzed: true,
        engine: true,  // Engine Flow score (formerly powerFlow)
        overallScore: true,
        tagA: true,
        tagB: true,
        tagC: true,
        flowOverlayMp4Url: true,
        flowOverlayGifUrl: true,
        flowMomentumScore: true,
        flowTempoRatio: true,
        flowSmoothnessScore: true,
        flowTransferEfficiency: true,
        flowReportGenerated: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // 3. Check authorization (user owns video or is admin/coach)
    const userRole = (session.user as any).role;
    const isAuthorized = video.userId === userId || userRole === 'admin' || userRole === 'coach';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Check if video has been analyzed
    if (!video.analyzed) {
      return NextResponse.json(
        {
          error: 'Video not analyzed',
          message: 'This video has not been analyzed yet. Please analyze it first.',
        },
        { status: 400 }
      );
    }

    // 5. Generate flow report from available data
    const flowReport: FlowReport = generateFlowReport({
      engine: video.engine,
      overallScore: video.overallScore,
      tagA: video.tagA,
      tagB: video.tagB,
      tagC: video.tagC,
      flowOverlayMp4Url: video.flowOverlayMp4Url,
      flowOverlayGifUrl: video.flowOverlayGifUrl,
      flowMomentumScore: video.flowMomentumScore,
      flowTempoRatio: video.flowTempoRatio,
      flowSmoothnessScore: video.flowSmoothnessScore,
      flowTransferEfficiency: video.flowTransferEfficiency,
    });

    // 6. If this is the first time generating the report, update the database
    if (!video.flowReportGenerated && flowReport.metrics.momentumFlowScore !== null) {
      await prisma.video.update({
        where: { id: videoId },
        data: {
          flowMomentumScore: flowReport.metrics.momentumFlowScore,
          flowTempoRatio: flowReport.metrics.tempoRatio,
          flowSmoothnessScore: flowReport.metrics.flowSmoothnessScore,
          flowTransferEfficiency: flowReport.metrics.transferEfficiencyScore,
          flowReportGenerated: true,
          flowReportGeneratedAt: new Date(),
        },
      });

      console.log('[Flow Report] Generated and saved for video:', videoId);
    }

    // 7. Return the flow report
    return NextResponse.json({
      success: true,
      flowReport,
    });
  } catch (error) {
    console.error('[Flow Report API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
