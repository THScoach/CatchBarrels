
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch assessments for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const assessmentType = searchParams.get('type');

    const where: any = { userId: (session.user as any).id };
    if (videoId) where.videoId = videoId;
    if (assessmentType) where.assessmentType = assessmentType;

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        video: {
          select: {
            title: true,
            videoType: true,
          },
        },
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      assessmentType,
      assessmentName,
      videoId,
      ...assessmentData
    } = body;

    // Validate required fields
    if (!assessmentType) {
      return NextResponse.json(
        { error: 'Assessment type is required' },
        { status: 400 }
      );
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: (session.user as any).id,
        videoId,
        assessmentType,
        assessmentName,
        ...assessmentData,
        status: 'completed', // Default to completed for manual entry
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
