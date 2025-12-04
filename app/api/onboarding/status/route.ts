import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user onboarding status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        completedOnboarding: true,
        onboardingStep: true,
        onboardingVersion: true,
        profileComplete: true,
        firstSessionCompleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user needs onboarding (new user created within last 7 days and hasn't completed onboarding)
    const isNewUser = user.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const needsOnboarding = isNewUser && !user.completedOnboarding;

    return NextResponse.json({
      needsOnboarding,
      completedOnboarding: user.completedOnboarding,
      onboardingStep: user.onboardingStep,
      onboardingVersion: user.onboardingVersion,
      profileComplete: user.profileComplete,
      firstSessionCompleted: user.firstSessionCompleted,
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
}
