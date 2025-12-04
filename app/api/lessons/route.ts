import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal, notes } = await request.json();

    // Check if there's already an active lesson
    const existingActive = await prisma.playerLesson.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: 'You already have an active lesson. Please complete it first.' },
        { status: 400 }
      );
    }

    // Create new lesson
    const lesson = await prisma.playerLesson.create({
      data: {
        userId: session.user.id,
        goal: goal || null,
        notes: notes || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/lessons - Get all lessons for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const lessons = await prisma.playerLesson.findMany({
      where,
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            uploadDate: true,
          },
          orderBy: { uploadDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
