
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

/**
 * Community Feed API
 * Returns public swing videos from the BARRELS community
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Optional: Require authentication to view community feed
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const tierFilter = searchParams.get('tier'); // "Elite", "Advanced", etc.

    // Build query filters
    const where: any = {
      isPublic: true,
      analyzed: true // Only show analyzed videos with scores
    };

    if (tierFilter) {
      where.tier = tierFilter;
    }

    // Fetch public videos
    const videos = await prisma.video.findMany({
      where,
      select: {
        id: true,
        title: true,
        videoType: true,
        shareableLink: true,
        views: true,
        sharedAt: true,
        uploadDate: true,
        
        // 4Bs Scores
        anchor: true,
        engine: true,
        whip: true,
        overallScore: true,
        tier: true,
        exitVelocity: true,
        
        // User info (limited for privacy)
        user: {
          select: {
            name: true,
            username: true,
            level: true,
            position: true,
            bats: true,
            membershipTier: true
          }
        }
      },
      orderBy: {
        sharedAt: 'desc'
      },
      take: limit,
      skip
    });

    // Get total count for pagination
    const totalCount = await prisma.video.count({
      where
    });

    return NextResponse.json({
      videos,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching community feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community feed' },
      { status: 500 }
    );
  }
}
