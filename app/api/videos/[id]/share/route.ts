
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

/**
 * Video Sharing API
 * Toggles video privacy and generates shareable links
 */

// Generate unique shareable link ID
function generateShareableLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
    const { isPublic } = await request.json();

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

    // Generate shareable link if making public and doesn't have one
    let shareableLink = video.shareableLink;
    if (isPublic && !shareableLink) {
      // Keep trying until we get a unique link
      let attempts = 0;
      while (attempts < 10) {
        shareableLink = generateShareableLink();
        const existing = await prisma.video.findUnique({
          where: { shareableLink }
        });
        if (!existing) break;
        attempts++;
      }
      
      if (attempts >= 10) {
        return NextResponse.json(
          { error: 'Failed to generate unique share link' },
          { status: 500 }
        );
      }
    }

    // Update video privacy
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        isPublic,
        shareableLink: isPublic ? shareableLink : video.shareableLink, // Keep link even if making private
        sharedAt: isPublic && !video.sharedAt ? new Date() : video.sharedAt // Set timestamp only first time
      },
      select: {
        id: true,
        isPublic: true,
        shareableLink: true,
        sharedAt: true,
        views: true
      }
    });

    // Generate full share URL
    const shareUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://catchbarrels.app'}/share/${shareableLink}`;

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      shareUrl: isPublic ? shareUrl : null
    });

  } catch (error) {
    console.error('Error toggling video privacy:', error);
    return NextResponse.json(
      { error: 'Failed to update video privacy' },
      { status: 500 }
    );
  }
}

// Get current privacy status
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

    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      },
      select: {
        id: true,
        isPublic: true,
        shareableLink: true,
        sharedAt: true,
        views: true
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const shareUrl = video.shareableLink 
      ? `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://catchbarrels.app'}/share/${video.shareableLink}`
      : null;

    return NextResponse.json({
      ...video,
      shareUrl
    });

  } catch (error) {
    console.error('Error fetching video privacy status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video privacy status' },
      { status: 500 }
    );
  }
}
