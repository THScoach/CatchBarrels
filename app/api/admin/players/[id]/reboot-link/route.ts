/**
 * Reboot Athlete Link API
 * 
 * PATCH /api/admin/players/[id]/reboot-link - Link user to Reboot athlete
 * DELETE /api/admin/players/[id]/reboot-link - Unlink user from Reboot athlete
 * 
 * Admin/coach-only endpoint for linking CatchBarrels users to Reboot Motion athlete profiles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { REBOOT_SYNC_ENABLED } from '@/lib/config/reboot-flags';

export const dynamic = 'force-dynamic';

/**
 * Link user to Reboot athlete
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Feature flag check
    if (!REBOOT_SYNC_ENABLED) {
      return NextResponse.json(
        { error: 'Reboot integration not enabled' },
        { status: 403 }
      );
    }

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json(
        { error: 'Admin or coach role required' },
        { status: 403 }
      );
    }

    // Parse request body
    const { rebootAthleteId } = await request.json();

    if (!rebootAthleteId || typeof rebootAthleteId !== 'string') {
      return NextResponse.json(
        { error: 'rebootAthleteId is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with Reboot athlete ID
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { rebootAthleteId },
    });

    console.log(
      `[Reboot Link] User ${updatedUser.email} linked to Reboot athlete ${rebootAthleteId}`
    );

    return NextResponse.json({
      success: true,
      rebootAthleteId: updatedUser.rebootAthleteId,
    });
  } catch (error: any) {
    console.error('[Reboot Link] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Unlink user from Reboot athlete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Feature flag check
    if (!REBOOT_SYNC_ENABLED) {
      return NextResponse.json(
        { error: 'Reboot integration not enabled' },
        { status: 403 }
      );
    }

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json(
        { error: 'Admin or coach role required' },
        { status: 403 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove Reboot athlete ID
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { rebootAthleteId: null },
    });

    console.log(
      `[Reboot Unlink] User ${updatedUser.email} unlinked from Reboot athlete`
    );

    return NextResponse.json({
      success: true,
      message: 'Reboot athlete unlinked',
    });
  } catch (error: any) {
    console.error('[Reboot Unlink] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
