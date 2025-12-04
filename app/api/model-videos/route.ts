
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - List all model videos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modelVideos = await prisma.modelVideo.findMany({
      orderBy: [
        { handedness: 'asc' },
        { uploadDate: 'desc' }
      ]
    });

    return NextResponse.json({ modelVideos });
  } catch (error) {
    console.error('Error fetching model videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model videos' },
      { status: 500 }
    );
  }
}

// POST - Upload new model video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const handedness = formData.get('handedness') as string;
    const description = formData.get('description') as string;
    const playerName = formData.get('playerName') as string;
    const playerLevel = formData.get('playerLevel') as string;

    if (!file || !title || !handedness) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (handedness !== 'right' && handedness !== 'left') {
      return NextResponse.json(
        { error: 'Handedness must be "right" or "left"' },
        { status: 400 }
      );
    }

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `model-videos/${handedness}/${Date.now()}-${file.name}`;
    const cloudStoragePath = await uploadFile(buffer, fileName);

    // Create database record
    const modelVideo = await prisma.modelVideo.create({
      data: {
        title,
        description,
        handedness,
        cloudStoragePath,
        playerName: playerName || null,
        playerLevel: playerLevel || null,
        active: true,
      },
    });

    return NextResponse.json({ modelVideo }, { status: 201 });
  } catch (error) {
    console.error('Error uploading model video:', error);
    return NextResponse.json(
      { error: 'Failed to upload model video' },
      { status: 500 }
    );
  }
}
