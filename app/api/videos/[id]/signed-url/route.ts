
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Verify the video belongs to the user
    if (video.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if this is an OnForm link import (external URL)
    if (video.source === 'onform' && (video.videoUrl.startsWith('http://') || video.videoUrl.startsWith('https://'))) {
      // For OnForm link imports, the video is hosted externally
      // Return 200 with a flag (not 400) to avoid console errors
      return NextResponse.json({ 
        isOnFormLink: true,
        onformUrl: video.videoUrl,
        message: 'This video is hosted on OnForm. Please open it in the OnForm app.'
      }, { status: 200 });
    }

    // For S3-stored videos, generate signed URL for video playback
    const signedUrl = await getSignedDownloadUrl(video.videoUrl);

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate video URL' },
      { status: 500 }
    );
  }
}
