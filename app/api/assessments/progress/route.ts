import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/assessments/progress
 * Returns assessment history with scores for progress tracking
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch completed assessment sessions with report metrics
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        userId: session.user.id,
        status: 'completed',
      },
      include: {
        report: {
          include: {
            metrics: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // Chronological order for chart
    });

    // Transform to simplified format for charts
    const assessments = sessions
      .filter((s) => s.report?.metrics) // Only include sessions with calculated metrics
      .map((session) => ({
        id: session.id,
        sessionName: session.sessionName,
        createdAt: session.createdAt.toISOString(),
        overallScore: Math.round(session.report!.metrics!.overallSwingScore || 0),
        anchorScore: Math.round(session.report!.metrics!.anchorScore || 0),
        engineScore: Math.round(session.report!.metrics!.engineScore || 0),
        whipScore: Math.round(session.report!.metrics!.whipScore || 0),
      }));

    return NextResponse.json({ assessments });
  } catch (error: any) {
    console.error('[API] Get assessment progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment progress', message: error.message },
      { status: 500 }
    );
  }
}
