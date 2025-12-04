
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { deleteFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// DELETE - Delete a model video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const modelVideo = await prisma.modelVideo.findUnique({
      where: { id },
    });

    if (!modelVideo) {
      return NextResponse.json(
        { error: 'Model video not found' },
        { status: 404 }
      );
    }

    // Delete from S3
    await deleteFile(modelVideo.cloudStoragePath);

    // Delete from database
    await prisma.modelVideo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting model video:', error);
    return NextResponse.json(
      { error: 'Failed to delete model video' },
      { status: 500 }
    );
  }
}

// PATCH - Update model video (e.g., activate/deactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const modelVideo = await prisma.modelVideo.update({
      where: { id },
      data: {
        active: body.active ?? undefined,
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        playerName: body.playerName ?? undefined,
        playerLevel: body.playerLevel ?? undefined,
      },
    });

    return NextResponse.json({ modelVideo });
  } catch (error) {
    console.error('Error updating model video:', error);
    return NextResponse.json(
      { error: 'Failed to update model video' },
      { status: 500 }
    );
  }
}
