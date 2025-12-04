import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tagA, tagB, tagC, tagSource } = body;

    // Fetch video to check ownership
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check authorization: owner or admin/coach
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const isOwner = video.userId === userId;
    const isAdminOrCoach = userRole === 'admin' || userRole === 'coach';

    if (!isOwner && !isAdminOrCoach) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update tags
    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        tagA: tagA !== null && tagA !== undefined ? tagA : null,
        tagB: tagB !== null && tagB !== undefined ? tagB : null,
        tagC: tagC !== null && tagC !== undefined ? tagC : null,
        tagSource: tagSource || (isAdminOrCoach ? 'coach' : 'player'),
        tagsUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      tags: {
        tagA: updatedVideo.tagA,
        tagB: updatedVideo.tagB,
        tagC: updatedVideo.tagC,
        tagSource: updatedVideo.tagSource,
      },
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    return NextResponse.json(
      { error: 'Failed to update tags' },
      { status: 500 }
    );
  }
}
