import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

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
      select: {
        id: true,
        analyzed: true,
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
        userId: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Verify ownership
    if (video.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Return status
    if (video.analyzed) {
      return NextResponse.json({
        state: 'completed',
        videoId: video.id,
        scores: {
          overall: video.overallScore,
          anchor: video.anchor,
          engine: video.engine,
          whip: video.whip,
        },
      });
    } else {
      return NextResponse.json({
        state: 'processing',
        videoId: video.id,
      });
    }
  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Failed to check video status', state: 'failed' },
      { status: 500 }
    );
  }
}
