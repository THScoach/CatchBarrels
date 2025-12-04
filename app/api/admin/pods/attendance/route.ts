import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getPlayerSessions, getSessionSwings } from '@/lib/dk-api';
import { computePodMetrics } from '@/lib/pod-metrics';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status !== 'attended' && status !== 'no_show') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update attendance status
    const booking = await prisma.podBooking.update({
      where: { id: bookingId },
      data: {
        status,
        attendedAt: status === 'attended' ? new Date() : null,
        markedBy: (session?.user as any)?.id,
      },
      include: {
        user: true,
        podSlot: true,
      },
    });

    // If marked as attended, attempt DK sync (non-blocking)
    if (status === 'attended') {
      syncDkDataForBooking(booking).catch(error => {
        console.error('[DK Sync] Background sync failed for booking', bookingId, error);
        // Intentionally not throwing - DK sync should not block attendance update
      });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[Admin POD Attendance] Error:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

/**
 * Syncs DK swing data for a POD booking (non-blocking background task)
 */
async function syncDkDataForBooking(booking: any): Promise<void> {
  console.log('[DK Sync] Starting sync for booking', booking.id);

  // Check if user has a DK player ID
  if (!booking.user?.dkPlayerId) {
    console.log('[DK Sync] User has no dkPlayerId, skipping sync', {
      userId: booking.userId,
      bookingId: booking.id,
    });
    return;
  }

  try {
    // Calculate time window: 30 min before, 45 min after POD start
    const podStartTime = new Date(booking.podSlot.startTime);
    const fromTime = new Date(podStartTime.getTime() - 30 * 60 * 1000); // -30 min
    const toTime = new Date(podStartTime.getTime() + 45 * 60 * 1000); // +45 min

    console.log('[DK Sync] Fetching sessions for time window', {
      dkPlayerId: booking.user.dkPlayerId,
      from: fromTime.toISOString(),
      to: toTime.toISOString(),
    });

    // Fetch DK sessions for this player in the time window
    const dkSessions = await getPlayerSessions(
      booking.user.dkPlayerId,
      fromTime,
      toTime
    );

    if (dkSessions.length === 0) {
      console.log('[DK Sync] No DK sessions found in time window', {
        bookingId: booking.id,
        dkPlayerId: booking.user.dkPlayerId,
      });
      
      // Update booking to indicate we tried but found no data
      await prisma.podBooking.update({
        where: { id: booking.id },
        data: {
          swingsCaptured: 0,
          dkSyncedAt: new Date(),
        },
      });
      
      return;
    }

    console.log('[DK Sync] Found DK sessions', {
      count: dkSessions.length,
      sessionIds: dkSessions.map(s => s.id),
    });

    // Pick the most relevant session (closest to POD start time)
    const relevantSession = dkSessions.reduce((closest, session) => {
      const sessionStart = new Date(session.startedAt);
      const closestStart = new Date(closest.startedAt);
      
      const sessionDelta = Math.abs(sessionStart.getTime() - podStartTime.getTime());
      const closestDelta = Math.abs(closestStart.getTime() - podStartTime.getTime());
      
      return sessionDelta < closestDelta ? session : closest;
    });

    console.log('[DK Sync] Selected session', {
      sessionId: relevantSession.id,
      startedAt: relevantSession.startedAt,
    });

    // Fetch swings for the selected session
    const dkSwings = await getSessionSwings(relevantSession.id);

    console.log('[DK Sync] Fetched swings', {
      swingCount: dkSwings.length,
    });

    // Compute metrics
    const metrics = computePodMetrics(dkSwings);

    console.log('[DK Sync] Computed metrics', metrics);

    // Update booking with metrics
    await prisma.podBooking.update({
      where: { id: booking.id },
      data: {
        swingsCaptured: metrics.swingsCaptured,
        avgBarrelSpeed: metrics.avgBarrelSpeed,
        avgImpactMomentum: metrics.avgImpactMomentum,
        avgAttackAngle: metrics.avgAttackAngle,
        avgHandSpeed: metrics.avgHandSpeed,
        avgTimeToContact: metrics.avgTimeToContact,
        dkSessionId: relevantSession.id,
        barrelsScore: metrics.barrelsScore,
        sequenceGrade: metrics.sequenceGrade,
        dkSyncedAt: new Date(),
      },
    });

    console.log('[DK Sync] Successfully synced DK data for booking', booking.id);

  } catch (error) {
    console.error('[DK Sync] Error syncing DK data', {
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Intentionally not re-throwing - DK sync failures should not affect attendance marking
  }
}
