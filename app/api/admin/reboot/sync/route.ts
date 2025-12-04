/**
 * Reboot Motion Sync API
 * 
 * POST /api/admin/reboot/sync
 * 
 * Fetches all swing data from Reboot Motion API and stores it in the database.
 * This endpoint is admin/coach-only and does not affect player-facing features.
 * 
 * Returns:
 * - inserted: Number of new sessions added
 * - updated: Number of existing sessions updated
 * - total: Total sessions in Reboot database after sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { fetchRebootSessions, RebootSessionPayload, mapSessionTypeFromReboot } from '@/lib/reboot/reboot-client';
import { REBOOT_SYNC_ENABLED } from '@/lib/config/reboot-flags';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Check feature flag
    if (!REBOOT_SYNC_ENABLED) {
      return NextResponse.json(
        { error: 'Reboot sync is not enabled' },
        { status: 403 }
      );
    }

    // 2. Verify admin/coach role
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

    console.log('[Reboot Sync] Starting sync...');
    console.log(`[Reboot Sync] Initiated by: ${session.user.email} (${userRole})`);

    // 3. Fetch sessions from Reboot API
    let rebootSessions: RebootSessionPayload[];
    try {
      rebootSessions = await fetchRebootSessions();
      console.log(`[Reboot Sync] Fetched ${rebootSessions.length} sessions from Reboot API`);
    } catch (error: any) {
      console.error('[Reboot Sync] API fetch failed:', error.message);
      return NextResponse.json(
        {
          error: 'Failed to fetch from Reboot API',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 4. Upsert each session into database
    let inserted = 0;
    let updated = 0;

    for (const session of rebootSessions) {
      try {
        // Check if session already exists
        const existing = await prisma.rebootSession.findUnique({
          where: { rebootSessionId: session.sessionId },
        });

        // Map Reboot payload to our schema
        const sessionType = session.sessionType || mapSessionTypeFromReboot(session.metrics);
        
        const data = {
          rebootSessionId: session.sessionId,
          rebootAthleteId: session.athleteId || null,
          athleteName: session.athleteName || null,
          athleteEmail: session.athleteEmail || null,
          level: session.level || null,
          sessionType,  // "HITTING", "PITCHING", or "OTHER"
          teamTag: session.team || null,
          swingDate: session.captureDate ? new Date(session.captureDate) : null,
          metrics: session.metrics, // Store full payload as JSON
        };

        if (existing) {
          // Update existing session
          await prisma.rebootSession.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        } else {
          // Insert new session
          await prisma.rebootSession.create({ data });
          inserted++;
        }
      } catch (error: any) {
        console.error(
          `[Reboot Sync] Failed to process session ${session.sessionId}:`,
          error.message
        );
        // Continue with next session instead of failing entire sync
      }
    }

    // 5. Get total count
    const total = await prisma.rebootSession.count();

    console.log('[Reboot Sync] Complete:');
    console.log(`  - Inserted: ${inserted}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Total in DB: ${total}`);

    return NextResponse.json({
      status: 'ok',
      inserted,
      updated,
      total,
      message: `Successfully synced ${inserted + updated} sessions from Reboot Motion`,
    });
  } catch (error: any) {
    console.error('[Reboot Sync] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
