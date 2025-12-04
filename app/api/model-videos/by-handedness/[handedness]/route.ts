
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, getBucketConfig } from '@/lib/aws-config';

export const dynamic = 'force-dynamic';

// GET - Get active model video for a specific handedness
export async function GET(
  request: NextRequest,
  { params }: { params: { handedness: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { handedness } = params;

    if (handedness !== 'right' && handedness !== 'left') {
      return NextResponse.json(
        { error: 'Handedness must be "right" or "left"' },
        { status: 400 }
      );
    }

    // Get all active models for this handedness
    const allModels = await prisma.modelVideo.findMany({
      where: {
        handedness,
        active: true,
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });

    if (allModels.length === 0) {
      return NextResponse.json(
        { error: 'No active model video found for this handedness' },
        { status: 404 }
      );
    }

    // Randomly select one model from available models
    const randomIndex = Math.floor(Math.random() * allModels.length);
    const modelVideo = allModels[randomIndex];

    // Generate signed URL for video playback
    const s3Client = createS3Client();
    const { bucketName } = getBucketConfig();
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: modelVideo.cloudStoragePath,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      modelVideo: {
        ...modelVideo,
        signedUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching model video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model video' },
      { status: 500 }
    );
  }
}
