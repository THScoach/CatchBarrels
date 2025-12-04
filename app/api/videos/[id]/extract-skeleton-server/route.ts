
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

/**
 * Server-Side Skeleton Extraction API
 * Fallback for complex videos that crash in browser
 * Uses Python/MediaPipe on server for robust processing
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Verify video ownership
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if already extracted
    if (video.skeletonExtracted) {
      return NextResponse.json({
        message: 'Skeleton data already exists',
        skeletonData: video.skeletonData
      });
    }

    return NextResponse.json({
      error: 'Server-side skeleton extraction not yet implemented',
      message: 'This feature requires Python MediaPipe setup on server. Coming soon!',
      suggestion: 'Try browser extraction with shorter videos (5-10 seconds) or lower FPS'
    }, { status: 501 });

    // TODO: Implement server-side processing
    // 1. Download video from S3
    // 2. Process with Python MediaPipe
    // 3. Extract skeleton data
    // 4. Save to database
    // 5. Return results

  } catch (error) {
    console.error('Server skeleton extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process skeleton on server' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Get processing status
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      },
      select: {
        id: true,
        skeletonExtracted: true,
        skeletonData: true,
        fps: true,
        normalizedFps: true,
        impactFrame: true
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      videoId: video.id,
      skeletonExtracted: video.skeletonExtracted,
      hasSkeletonData: !!video.skeletonData,
      fps: video.fps,
      normalizedFps: video.normalizedFps,
      impactFrame: video.impactFrame
    });

  } catch (error) {
    console.error('Error checking skeleton status:', error);
    return NextResponse.json(
      { error: 'Failed to check processing status' },
      { status: 500 }
    );
  }
}
