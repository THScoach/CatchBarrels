/**
 * 52-Pitch Assessment API Route
 * 
 * Example of product gating: Requires Pro tier or higher
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkTierAccess } from '@/lib/tier-access';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

/**
 * GET /api/assessments/52-pitch
 * 
 * Get all 52-pitch assessments for the current user
 * Requires: Pro tier or higher
 */
export async function GET(request: NextRequest) {
  try {
    // Check tier access
    const access = await checkTierAccess('pro');
    
    if (!access.hasAccess) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: access.upgradeMessage,
          tier: access.tier,
          requiredTier: 'pro',
        },
        { status: 403 }
      );
    }

    // Get current user
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch 52-pitch assessments
    const assessments = await prisma.assessment.findMany({
      where: {
        userId,
        assessmentType: '52_pitch',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      assessments,
      count: assessments.length,
    });
  } catch (error) {
    console.error('Error fetching 52-pitch assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessments/52-pitch
 * 
 * Create a new 52-pitch assessment
 * Requires: Pro tier or higher
 */
export async function POST(request: NextRequest) {
  try {
    // Check tier access
    const access = await checkTierAccess('pro');
    
    if (!access.hasAccess) {
      return NextResponse.json(
        {
          error: 'Access denied',
          message: access.upgradeMessage,
          tier: access.tier,
          requiredTier: 'pro',
        },
        { status: 403 }
      );
    }

    // Get current user
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Create new assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        assessmentType: '52_pitch',
        status: 'pending',
        ...body,
      },
    });

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('Error creating 52-pitch assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
