
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Load user's calibration settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        modelOverlayScale: true,
        modelOverlayOffsetX: true,
        modelOverlayOffsetY: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      scale: user.modelOverlayScale ?? 1.0,
      offsetX: user.modelOverlayOffsetX ?? 0,
      offsetY: user.modelOverlayOffsetY ?? 0,
    });
  } catch (error) {
    console.error('Error loading calibration:', error);
    return NextResponse.json({ error: 'Failed to load calibration' }, { status: 500 });
  }
}

// POST - Save user's calibration settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scale, offsetX, offsetY } = body;

    // Validate inputs
    if (
      typeof scale !== 'number' ||
      typeof offsetX !== 'number' ||
      typeof offsetY !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid calibration data' }, { status: 400 });
    }

    // Clamp values to reasonable ranges
    const clampedScale = Math.max(0.5, Math.min(1.5, scale));
    const clampedOffsetX = Math.max(-200, Math.min(200, offsetX));
    const clampedOffsetY = Math.max(-200, Math.min(200, offsetY));

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        modelOverlayScale: clampedScale,
        modelOverlayOffsetX: clampedOffsetX,
        modelOverlayOffsetY: clampedOffsetY,
      },
    });

    return NextResponse.json({
      success: true,
      calibration: {
        scale: clampedScale,
        offsetX: clampedOffsetX,
        offsetY: clampedOffsetY,
      },
    });
  } catch (error) {
    console.error('Error saving calibration:', error);
    return NextResponse.json({ error: 'Failed to save calibration' }, { status: 500 });
  }
}
