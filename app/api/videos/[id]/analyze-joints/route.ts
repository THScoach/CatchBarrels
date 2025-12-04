/**
 * POST /api/videos/[id]/analyze-joints
 * 
 * Analyze joints for a video using MediaPipe (client-side) or Abacus AI (future).
 * 
 * This endpoint expects the client to:
 * 1. Extract joints using MediaPipe in the browser
 * 2. Send the extracted joint data to this endpoint
 * 3. This endpoint saves it to the database
 * 
 * For Abacus integration (future):
 * - Client can request server-side processing
 * - This endpoint will call Abacus API and poll for results
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { JointData } from '@/types/pose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;
    
    // Get video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { user: true }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check ownership
    if (video.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already analyzed
    if (video.jointAnalyzed && video.jointData) {
      return NextResponse.json({
        success: true,
        message: 'Joints already analyzed',
        jointData: video.jointData,
        analyzedAt: video.jointAnalysisDate,
        source: video.jointAnalysisSource
      });
    }

    // Parse request body
    const body = await request.json();
    const { jointData, source = 'mediapipe' } = body as {
      jointData?: JointData;
      source?: 'mediapipe' | 'abacus';
    };

    // Validate joint data
    if (!jointData || !Array.isArray(jointData) || jointData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid joint data. Expected non-empty array of JointFrame objects.' },
        { status: 400 }
      );
    }

    // Validate structure
    const isValidJointData = jointData.every(frame => 
      typeof frame.timestamp === 'number' &&
      Array.isArray(frame.joints) &&
      frame.joints.every(joint => 
        typeof joint.name === 'string' &&
        typeof joint.x === 'number' &&
        typeof joint.y === 'number' &&
        typeof joint.confidence === 'number'
      )
    );

    if (!isValidJointData) {
      return NextResponse.json(
        { error: 'Invalid joint data structure' },
        { status: 400 }
      );
    }

    // Save joint data to database
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        jointData: jointData as any, // Prisma Json type
        jointAnalyzed: true,
        jointAnalysisDate: new Date(),
        jointAnalysisSource: source
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Joint analysis complete',
      jointData: updatedVideo.jointData,
      analyzedAt: updatedVideo.jointAnalysisDate,
      source: updatedVideo.jointAnalysisSource
    });

  } catch (error) {
    console.error('Joint analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze joints',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/videos/[id]/analyze-joints
 * 
 * Get joint analysis status and data for a video
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;
    
    // Get video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { user: true }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check ownership (or public)
    if (!video.isPublic && video.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      videoId: video.id,
      jointAnalyzed: video.jointAnalyzed,
      jointData: video.jointData,
      analyzedAt: video.jointAnalysisDate,
      source: video.jointAnalysisSource || null
    });

  } catch (error) {
    console.error('Failed to get joint analysis:', error);
    return NextResponse.json(
      { error: 'Failed to get joint analysis' },
      { status: 500 }
    );
  }
}
