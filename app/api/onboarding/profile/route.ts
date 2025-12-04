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

    const body = await req.json();
    const { height, weight, bats, level } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        height: height || null,
        weight: weight || null,
        bats: bats || null,
        level: level || null,
        profileComplete: true,
        onboardingStep: 1, // Profile step complete
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        height: updatedUser.height,
        weight: updatedUser.weight,
        bats: updatedUser.bats,
        level: updatedUser.level,
      },
    });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
