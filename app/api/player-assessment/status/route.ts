import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { AssessmentStatusResponse } from '@/types/player-assessment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/player-assessment/status
 * Check if the current user has a completed assessment
 * Used for access gating
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Check if user is admin/coach - they bypass assessment requirement
    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';
    
    if (isAdmin) {
      // Admins don't need assessments
      return NextResponse.json({
        hasAssessment: true,
        isCompleted: true,
        assessment: null,
        bypassReason: 'admin',
      } as AssessmentStatusResponse & { bypassReason: string });
    }

    // Find the latest assessment for this user
    const assessment = await prisma.playerAssessment.findFirst({
      where: {
        athleteId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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
      return NextResponse.json({
        hasAssessment: false,
        isCompleted: false,
        assessment: null,
      } as AssessmentStatusResponse);
    }

    // Check if assessment is completed
    const isCompleted = 
      assessment.status === 'coach_verified' || 
      assessment.status === 'reboot_verified';

    const response: AssessmentStatusResponse = {
      hasAssessment: true,
      isCompleted,
      assessment: {
        ...assessment,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking assessment status:', error);
    return NextResponse.json(
      { error: 'Failed to check assessment status' },
      { status: 500 }
    );
  }
}
