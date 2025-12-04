
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/trial/activate
 * Activates a 7-day free trial for a user (default: athlete tier)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check current user status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trialUsed: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
        membershipTier: true,
        membershipStatus: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validation: Check if user has already used trial
    if (user.trialUsed) {
      return NextResponse.json(
        { 
          error: 'Trial already used',
          message: 'You have already used your free trial. Upgrade to a paid membership to continue!'
        },
        { status: 400 }
      );
    }

    // Validation: Check if user already has active paid membership
    if (user.membershipStatus === 'active' && user.membershipTier !== 'free') {
      return NextResponse.json(
        { 
          error: 'Already has membership',
          message: 'You already have an active membership!'
        },
        { status: 400 }
      );
    }

    // Get tier from request body (default to 'athlete')
    const { tier } = await req.json().catch(() => ({ tier: 'athlete' }));
    const trialTier = ['athlete', 'pro', 'elite'].includes(tier) ? tier : 'athlete';

    // Calculate trial dates (7 days from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Update user with trial info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        trialTier,
        trialStartDate,
        trialEndDate,
        trialUsed: true,
        membershipTier: trialTier,
        membershipStatus: 'active',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `7-day ${trialTier.toUpperCase()} trial activated!`,
      trial: {
        tier: trialTier,
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString(),
        daysRemaining: 7
      }
    });

  } catch (error) {
    console.error('Trial activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate trial' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trial/activate
 * Check trial eligibility and status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        trialUsed: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
        trialConvertedToPaid: true,
        membershipTier: true,
        membershipStatus: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate eligibility
    const isEligible = !user.trialUsed && 
                       (user.membershipStatus !== 'active' || user.membershipTier === 'free');

    // Calculate days remaining if trial active
    let daysRemaining = 0;
    let isActive = false;
    if (user.trialStartDate && user.trialEndDate) {
      const now = new Date();
      const endDate = new Date(user.trialEndDate);
      if (now < endDate) {
        isActive = true;
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    return NextResponse.json({
      eligible: isEligible,
      trialUsed: user.trialUsed,
      trialActive: isActive,
      trialTier: user.trialTier,
      daysRemaining,
      trialStartDate: user.trialStartDate?.toISOString(),
      trialEndDate: user.trialEndDate?.toISOString(),
      converted: user.trialConvertedToPaid,
      membershipTier: user.membershipTier,
      membershipStatus: user.membershipStatus
    });

  } catch (error) {
    console.error('Trial status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    );
  }
}
