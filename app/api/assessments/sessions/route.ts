import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/assessments/sessions
 * Create a new assessment session
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionName, location, assessorName } = await req.json();

    const assessmentSession = await prisma.assessmentSession.create({
      data: {
        userId: session.user.id,
        sessionName: sessionName || 'Assessment Session',
        location,
        assessorName,
        status: 'pending',
      },
    });

    return NextResponse.json({
      sessionId: assessmentSession.id,
      status: assessmentSession.status,
      totalSwings: 0,
    });
  } catch (error: any) {
    console.error('[API] Create assessment session error:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment session', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessments/sessions
 * List all assessment sessions for the current user
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.assessmentSession.findMany({
      where: { userId: session.user.id },
      include: {
        swings: {
          include: {
            metrics: true,
            video: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
              },
            },
          },
        },
        ballData: true,
        report: {
          include: {
            metrics: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('[API] List assessment sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment sessions', message: error.message },
      { status: 500 }
    );
  }
}
