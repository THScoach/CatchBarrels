import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/player-assessments
 * Get all assessments (admin only)
 * Also returns athletes without assessments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users who are players (not admins/coaches)
    const allAthletes = await prisma.user.findMany({
      where: {
        role: 'player',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    // Get all assessments
    const assessments = await prisma.playerAssessment.findMany({
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

    // Create a map of athleteId to their latest assessment
    const assessmentsByAthlete = new Map();
    assessments.forEach((assessment) => {
      if (!assessmentsByAthlete.has(assessment.athleteId)) {
        assessmentsByAthlete.set(assessment.athleteId, assessment);
      }
    });

    // Create enriched athlete list with assessment status
    const enrichedAthletes = allAthletes.map((athlete) => {
      const assessment = assessmentsByAthlete.get(athlete.id);
      return {
        ...athlete,
        assessment: assessment || null,
        hasAssessment: !!assessment,
        isCompleted: assessment
          ? assessment.status === 'coach_verified' || assessment.status === 'reboot_verified'
          : false,
      };
    });

    return NextResponse.json({
      athletes: enrichedAthletes,
      totalAthletes: enrichedAthletes.length,
      withAssessments: enrichedAthletes.filter((a) => a.hasAssessment).length,
      completed: enrichedAthletes.filter((a) => a.isCompleted).length,
    });
  } catch (error) {
    console.error('Error fetching player assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player assessments' },
      { status: 500 }
    );
  }
}
