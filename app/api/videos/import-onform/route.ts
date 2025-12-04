
/**
 * OnForm Video Import API
 * 
 * Accepts OnForm share links and imports videos into BARRELS
 * for 4Bs analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { parseOnFormLink, downloadOnFormVideo, getOnFormVideoMetadata } from '@/lib/onform-import';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shareUrl, videoType, title } = body;

    if (!shareUrl || typeof shareUrl !== 'string') {
      return NextResponse.json(
        { error: 'OnForm share URL is required' },
        { status: 400 }
      );
    }

    // Validate OnForm link
    const videoId = parseOnFormLink(shareUrl);
    if (!videoId) {
      return NextResponse.json(
        { 
          error: 'Invalid OnForm share link. Please check the URL and try again.',
          example: 'https://link.getonform.com/view?id=Yu6gD1kzy3nindx38CiE'
        },
        { status: 400 }
      );
    }

    // Get video metadata (optional, for better UX)
    const metadata = await getOnFormVideoMetadata(shareUrl);
    const videoTitle = title || metadata?.title || 'OnForm Import';

    // Download video from OnForm
    console.log('Downloading video from OnForm:', videoId);
    const { videoBlob } = await downloadOnFormVideo(shareUrl);

    // Convert blob to buffer for S3 upload
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate S3 key
    const timestamp = Date.now();
    const fileName = `onform_${videoId}_${timestamp}.mp4`;
    const s3Key = `uploads/${session.user.id}/${fileName}`;

    // Upload to S3
    console.log('Uploading video to S3:', s3Key);
    const cloudPath = await uploadFile(buffer, s3Key);

    // Create database record
    const video = await prisma.video.create({
      data: {
        userId: session.user.id,
        title: videoTitle,
        videoType: videoType || 'OnForm Import',
        source: 'onform',
        originalUrl: shareUrl,
        videoUrl: cloudPath,
        analyzed: false,
        skeletonExtracted: false,
      },
    });

    console.log('Video imported successfully:', video.id);

    return NextResponse.json({
      success: true,
      videoId: video.id,
      message: 'Video imported from OnForm successfully',
      metadata: {
        source: 'onform',
        originalUrl: shareUrl,
        onformVideoId: videoId,
      },
    });

  } catch (error) {
    console.error('OnForm import error:', error);
    
    // Provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'Import failed';
    
    if (errorMessage.includes('Could not find video URL')) {
      return NextResponse.json(
        { 
          error: 'Unable to access OnForm video. Please ensure:',
          details: [
            '1. The video is shared publicly',
            '2. The share link is correct',
            '3. The video has not been deleted',
          ],
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to OnForm. Please check your internet connection.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to import video from OnForm' },
      { status: 500 }
    );
  }
}
