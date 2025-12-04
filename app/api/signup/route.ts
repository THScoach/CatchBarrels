
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, isAdmin, adminSecret } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Validate admin creation
    if (isAdmin && adminSecret !== 'barrels-admin-2024') {
      return NextResponse.json(
        { error: 'Invalid admin secret' },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: email,
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        profileComplete: isAdmin ? true : false,
        completedOnboarding: isAdmin ? true : false,
        isCoach: isAdmin ? true : false,
        role: isAdmin ? 'coach' : 'player',
      },
    });

    return NextResponse.json(
      { 
        message: `${isAdmin ? 'Admin' : 'User'} created successfully`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isCoach: user.isCoach,
          role: user.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
