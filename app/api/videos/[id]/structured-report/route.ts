/**
 * Structured Coach Rick Report API
 * 
 * Returns a full structured analysis report with paragraphs, bullets, and coach notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateStructuredCoachReport, type StructuredCoachReport } from '@/lib/momentum-coaching';

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

    // Fetch video with scores
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        analyzed: true,
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
        goatyBand: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check authorization
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).roles?.includes('admin') || (session.user as any).roles?.includes('coach');
    
    if (video.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if video has been analyzed
    if (!video.analyzed) {
      return NextResponse.json(
        { error: 'Video has not been analyzed yet' },
        { status: 400 }
      );
    }

    // Generate structured report
    const report = generateStructuredCoachReport({
      momentumTransferScore: video.overallScore || 0,
      groundFlowScore: video.anchor || 0,
      powerFlowScore: video.engine || 0,
      barrelFlowScore: video.whip || 0,
      goatyBandLabel: getGoatyLabelFromBand(video.goatyBand || 0),
      // Legacy compatibility
      anchorScore: video.anchor || 0,
      engineScore: video.engine || 0,
      whipScore: video.whip || 0,
    });

    return NextResponse.json({
      report,
      isAdmin, // Let client know if user can see coach notes
    });
  } catch (error) {
    console.error('Structured report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate structured report' },
      { status: 500 }
    );
  }
}

function getGoatyLabelFromBand(band: number): string {
  if (band >= 2) return 'Elite';
  if (band >= 1) return 'Advanced';
  if (band >= 0) return 'Above Average';
  if (band >= -1) return 'Average';
  if (band >= -2) return 'Below Average';
  return 'Needs Work';
}
