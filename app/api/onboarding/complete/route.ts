import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark onboarding as complete
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        completedOnboarding: true,
        onboardingStep: 3, // All steps complete
      },
    });

    return NextResponse.json({
      success: true,
      completedOnboarding: updatedUser.completedOnboarding,
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
