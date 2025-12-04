import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - require a secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'barrels-seed-2024') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Create test user (john@doe.com / johndoe123)
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const testUser = await prisma.user.upsert({
      where: { username: 'john@doe.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        username: 'john@doe.com',
        password: hashedPassword,
        email: 'john@doe.com',
        name: 'John Doe',
        height: 70,
        weight: 175,
        bats: 'Right',
        throws: 'Right',
        position: 'Center Field',
        level: 'High School (13-18)',
        batLength: 33,
        batWeight: 30,
        batType: 'BBCOR',
        struggles: ['Getting jammed on inside pitches', 'Rolling over for ground balls'],
        goals: ['Hit for more power', 'More consistent contact'],
        mentalApproach: 'Balanced',
        confidenceLevel: 7,
        profileComplete: true,
        completedOnboarding: true,
        onboardingStep: 4,
      },
    });

    // Create admin user (admin@barrels.com / admin123)
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin@barrels.com' },
      update: {
        password: hashedAdminPassword,
        isCoach: true,
        role: 'coach',
      },
      create: {
        username: 'admin@barrels.com',
        password: hashedAdminPassword,
        email: 'admin@barrels.com',
        name: 'Coach Rick',
        isCoach: true,
        role: 'coach',
        profileComplete: true,
        completedOnboarding: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test users created successfully',
      users: [
        { email: 'john@doe.com', password: 'johndoe123', role: 'player' },
        { email: 'admin@barrels.com', password: 'admin123', role: 'coach' },
      ],
    });
  } catch (error: any) {
    console.error('Error seeding users:', error);
    return NextResponse.json(
      { error: 'Failed to seed users', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
