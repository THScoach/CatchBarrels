import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { CreatePlayerAssessmentInput } from '@/types/player-assessment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/player-assessment
 * Get assessment for current user (or specific athleteId if admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get('athleteId');
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    // If athleteId is provided, only admins can query other users
    if (athleteId && athleteId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = athleteId || userId;

    const assessment = await prisma.playerAssessment.findFirst({
      where: {
        athleteId: targetUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ assessment: null });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player-assessment
 * Create new assessment (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create assessments' },
        { status: 403 }
      );
    }

    const body: CreatePlayerAssessmentInput = await request.json();
    const { athleteId, assessmentType, ...assessmentData } = body;

    if (!athleteId || !assessmentType) {
      return NextResponse.json(
        { error: 'athleteId and assessmentType are required' },
        { status: 400 }
      );
    }

    // Check if athlete exists
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // Create assessment
    const assessment = await prisma.playerAssessment.create({
      data: {
        athleteId,
        createdBy: (session.user as any).id,
        assessmentType,
        confidenceLevel: assessmentData.confidenceLevel || 'automated',
        swingIdentity: assessmentData.swingIdentity || null,
        constraints: assessmentData.constraints || null,
        constraintsJson: assessmentData.constraintsJson || null,
        primaryTrainingLane: assessmentData.primaryTrainingLane || null,
        baselineMetrics: assessmentData.baselineMetrics || null,
        coachSystemStatement: assessmentData.coachSystemStatement || null,
        status: assessmentData.status || 'in_progress',
        notes: assessmentData.notes || null,
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
