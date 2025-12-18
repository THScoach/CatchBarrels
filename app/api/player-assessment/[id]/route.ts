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
        // Include history for admin users only
        history: isAdmin ? {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            changedByUser: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        } : false,
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
 * Includes history tracking and data authority enforcement
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
    const userId = (session.user as any).id;
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

    // Data Authority Enforcement
    // If swing identity is locked and user is trying to change it, reject unless explicitly unlocking
    if (existingAssessment.identityLocked && body.swingIdentity !== undefined && body.identityLocked !== false) {
      return NextResponse.json(
        { error: 'Swing identity is locked. Unlock it first to make changes.' },
        { status: 400 }
      );
    }

    // Track changes for history
    const previousValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    const changeTypes: string[] = [];

    // Prepare update data and track changes
    const updateData: any = {};

    if (body.assessmentType !== undefined) {
      updateData.assessmentType = body.assessmentType;
    }
    
    if (body.confidenceLevel !== undefined && body.confidenceLevel !== existingAssessment.confidenceLevel) {
      updateData.confidenceLevel = body.confidenceLevel;
      previousValues.confidenceLevel = existingAssessment.confidenceLevel;
      newValues.confidenceLevel = body.confidenceLevel;
      changeTypes.push('confidence_updated');
    }
    
    if (body.swingIdentity !== undefined && body.swingIdentity !== existingAssessment.swingIdentity) {
      updateData.swingIdentity = body.swingIdentity;
      previousValues.swingIdentity = existingAssessment.swingIdentity;
      newValues.swingIdentity = body.swingIdentity;
      changeTypes.push('swing_identity_updated');
    }
    
    if (body.identityLocked !== undefined && body.identityLocked !== existingAssessment.identityLocked) {
      updateData.identityLocked = body.identityLocked;
      previousValues.identityLocked = existingAssessment.identityLocked;
      newValues.identityLocked = body.identityLocked;
      changeTypes.push(body.identityLocked ? 'identity_locked' : 'identity_unlocked');
    }
    
    if (body.constraints !== undefined && body.constraints !== existingAssessment.constraints) {
      updateData.constraints = body.constraints;
      previousValues.constraints = existingAssessment.constraints;
      newValues.constraints = body.constraints;
      changeTypes.push('constraints_updated');
    }
    
    if (body.constraintsJson !== undefined) {
      updateData.constraintsJson = body.constraintsJson;
    }
    
    if (body.primaryTrainingLane !== undefined && body.primaryTrainingLane !== existingAssessment.primaryTrainingLane) {
      updateData.primaryTrainingLane = body.primaryTrainingLane;
      previousValues.primaryTrainingLane = existingAssessment.primaryTrainingLane;
      newValues.primaryTrainingLane = body.primaryTrainingLane;
      changeTypes.push('training_lane_updated');
    }
    
    if (body.baselineMetrics !== undefined) {
      updateData.baselineMetrics = body.baselineMetrics;
    }
    
    if (body.coachSystemStatement !== undefined && body.coachSystemStatement !== existingAssessment.coachSystemStatement) {
      updateData.coachSystemStatement = body.coachSystemStatement;
      previousValues.coachSystemStatement = existingAssessment.coachSystemStatement;
      newValues.coachSystemStatement = body.coachSystemStatement;
      changeTypes.push('system_statement_updated');
    }
    
    if (body.status !== undefined && body.status !== existingAssessment.status) {
      updateData.status = body.status;
      previousValues.status = existingAssessment.status;
      newValues.status = body.status;
      changeTypes.push('status_updated');
      
      // Special handling for reboot_verified status
      if (body.status === 'reboot_verified') {
        updateData.identityLocked = true; // Auto-lock identity when reboot verified
        changeTypes.push('reboot_verified');
        changeTypes.push('identity_locked');
      }
    }
    
    if (body.rebootMotionFiles !== undefined) {
      updateData.rebootMotionFiles = body.rebootMotionFiles;
    }
    
    if (body.rebootDerivedIdentityConfidence !== undefined) {
      updateData.rebootDerivedIdentityConfidence = body.rebootDerivedIdentityConfidence;
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

    // Create history entries for each change type
    if (changeTypes.length > 0) {
      const historyNote = body.historyNote || null;
      
      for (const changeType of changeTypes) {
        await prisma.assessmentHistory.create({
          data: {
            assessmentId: id,
            changedBy: userId,
            changeType,
            previousValues,
            newValues,
            notes: historyNote,
          },
        });
      }
    }

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
