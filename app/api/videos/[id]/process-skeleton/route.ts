
/**
 * API Route: Process Skeleton Data
 * - Extract skeleton from video
 * - Detect impact frame
 * - Trim and normalize
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { 
  detectImpactFrame, 
  calculateTrimRange, 
  normalizeSkeletonData,
  trimSkeletonData,
  validateSkeletonData
} from '@/lib/video-processing';

export const dynamic = 'force-dynamic';

/**
 * POST /api/videos/[id]/process-skeleton
 * Body: { skeletonData, fps, impactFrame? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skeletonData, fps, impactFrame: manualImpactFrame } = await req.json();

    if (!skeletonData || !fps) {
      return NextResponse.json(
        { error: 'Missing required fields: skeletonData, fps' },
        { status: 400 }
      );
    }

    // Validate skeleton data structure
    if (!validateSkeletonData(skeletonData)) {
      return NextResponse.json(
        { error: 'Invalid skeleton data format' },
        { status: 400 }
      );
    }

    const videoId = params.id;

    // Verify video ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true
      }
    });

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Detect impact frame (or use manual)
    let impactResult;
    if (manualImpactFrame !== undefined && manualImpactFrame !== null) {
      impactResult = {
        impactFrame: manualImpactFrame,
        confidence: 1.0,
        method: 'manual' as const
      };
    } else {
      impactResult = await detectImpactFrame(skeletonData, fps);
    }

    // Calculate trim range (2 seconds before/after impact)
    const { startFrame, endFrame } = calculateTrimRange(
      impactResult.impactFrame,
      fps,
      skeletonData.length
    );

    // Trim skeleton data
    const trimmedSkeleton = trimSkeletonData(skeletonData, startFrame, endFrame);

    // Normalize to 60 FPS baseline
    const normalizedSkeleton = normalizeSkeletonData(trimmedSkeleton, fps, 60);

    // Update database
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        skeletonData: normalizedSkeleton,
        skeletonExtracted: true,
        skeletonStatus: 'COMPLETE',
        skeletonErrorMessage: null, // Clear any previous errors
        impactFrame: impactResult.impactFrame - startFrame, // Adjust for trimmed range
        fps,
        normalizedFps: 60
      }
    });

    console.log(`[ProcessSkeleton] Successfully processed skeleton for video ${videoId}`);

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      processing: {
        originalFrames: skeletonData.length,
        trimmedFrames: trimmedSkeleton.length,
        normalizedFrames: normalizedSkeleton.length,
        impactDetection: impactResult,
        trimRange: { startFrame, endFrame }
      }
    });

  } catch (error) {
    console.error('Skeleton processing error:', error);
    
    // Update status to FAILED
    try {
      await prisma.video.update({
        where: { id: params.id },
        data: {
          skeletonStatus: 'FAILED',
          skeletonErrorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (dbError) {
      console.error('Failed to update error status:', dbError);
    }
    
    return NextResponse.json(
      { error: 'Failed to process skeleton data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/videos/[id]/process-skeleton
 * Returns skeleton data if already processed
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        skeletonData: true,
        skeletonExtracted: true,
        impactFrame: true,
        fps: true,
        normalizedFps: true
      }
    });

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);

  } catch (error) {
    console.error('Error fetching skeleton data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skeleton data' },
      { status: 500 }
    );
  }
}
