
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Transform data to match schema types
    const updateData: any = {
      profileComplete: true,
    };

    // String fields
    if (body.name) updateData.name = body.name;
    if (body.bats) updateData.bats = body.bats;
    if (body.throws) updateData.throws = body.throws;
    if (body.position) updateData.position = body.position;
    if (body.level) updateData.level = body.level;
    if (body.batType) updateData.batType = body.batType;
    if (body.mentalApproach) updateData.mentalApproach = body.mentalApproach;

    // Integer fields - convert from string
    if (body.height) updateData.height = parseInt(body.height);
    if (body.weight) updateData.weight = parseInt(body.weight);
    if (body.batLength) updateData.batLength = parseInt(body.batLength);
    if (body.batWeight) updateData.batWeight = parseInt(body.batWeight);
    if (body.confidenceLevel !== undefined) updateData.confidenceLevel = parseInt(body.confidenceLevel);

    // DateTime field
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth);
    }

    // Array fields
    if (body.struggles) updateData.struggles = body.struggles;
    if (body.goals) updateData.goals = body.goals;

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
