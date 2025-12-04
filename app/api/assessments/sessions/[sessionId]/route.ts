import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/assessments/sessions/[sessionId]
 * Get a single assessment session with all data
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
      include: {
        swings: {
          include: {
            metrics: true,
            joints: true,
            ballData: true,
            video: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                videoType: true,
                source: true,
              },
            },
          },
          orderBy: { swingNumber: 'asc' },
        },
        ballData: true,
        report: {
          include: {
            metrics: true,
          },
        },
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: assessmentSession });
  } catch (error: any) {
    console.error('[API] Get assessment session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment session', message: error.message },
      { status: 500 }
    );
  }
}
