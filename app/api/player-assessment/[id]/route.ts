import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { UpdatePlayerAssessmentInput } from '@/types/player-assessment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/player-assessment/[id]
 * Get specific assessment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    const assessment = await prisma.playerAssessment.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check authorization - athletes can only view their own assessments
    if (!isAdmin && assessment.athleteId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
 * PATCH /api/player-assessment/[id]
 * Update assessment (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can update assessments' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body: UpdatePlayerAssessmentInput = await request.json();

    // Check if assessment exists
    const existingAssessment = await prisma.playerAssessment.findUnique({
      where: { id },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.assessmentType !== undefined) {
      updateData.assessmentType = body.assessmentType;
    }
    if (body.confidenceLevel !== undefined) {
      updateData.confidenceLevel = body.confidenceLevel;
    }
    if (body.swingIdentity !== undefined) {
      updateData.swingIdentity = body.swingIdentity;
    }
    if (body.identityLocked !== undefined) {
      updateData.identityLocked = body.identityLocked;
    }
    if (body.constraints !== undefined) {
      updateData.constraints = body.constraints;
    }
    if (body.constraintsJson !== undefined) {
      updateData.constraintsJson = body.constraintsJson;
    }
    if (body.primaryTrainingLane !== undefined) {
      updateData.primaryTrainingLane = body.primaryTrainingLane;
    }
    if (body.baselineMetrics !== undefined) {
      updateData.baselineMetrics = body.baselineMetrics;
    }
    if (body.coachSystemStatement !== undefined) {
      updateData.coachSystemStatement = body.coachSystemStatement;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.rebootMotionFiles !== undefined) {
      updateData.rebootMotionFiles = body.rebootMotionFiles;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Update assessment
    const assessment = await prisma.playerAssessment.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/player-assessment/[id]
 * Delete assessment (admin only) - use with caution
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete assessments' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if assessment exists
    const assessment = await prisma.playerAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Delete assessment
    await prisma.playerAssessment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}
