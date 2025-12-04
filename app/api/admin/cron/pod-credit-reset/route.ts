/**
 * POD Credit Reset Cron Endpoint (WO16)
 * 
 * Automatically resets POD credits for Hybrid tier members on a monthly basis.
 * This endpoint should be triggered once per day by an external scheduler.
 * 
 * Protected by CRON_SECRET environment variable for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTierConfig } from '@/lib/membership-tiers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('[POD Credit Reset] Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[POD Credit Reset] Starting monthly credit reset job');

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Find all users who need credit reset
    const usersNeedingReset = await prisma.user.findMany({
      where: {
        OR: [
          {
            // Users who have never had a reset
            podCreditsLastReset: null,
            membershipTier: 'hybrid',
          },
          {
            // Users whose last reset was in a different month
            podCreditsLastReset: {
              lt: new Date(now.getFullYear(), now.getMonth(), 1), // Before start of current month
            },
            membershipTier: 'hybrid',
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        membershipTier: true,
        podCreditsAvailable: true,
        podCreditsLastReset: true,
      },
    });

    console.log(`[POD Credit Reset] Found ${usersNeedingReset.length} users needing reset`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    // Process each user
    for (const user of usersNeedingReset) {
      try {
        const tierConfig = getTierConfig(user.membershipTier as any);
        const newCredits = tierConfig?.podCreditsPerMonth || 0;

        if (newCredits > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              podCreditsAvailable: newCredits,
              podCreditsUsed: 0,
              podCreditsLastReset: now,
            },
          });

          console.log(`[POD Credit Reset] Reset credits for ${user.email}:`, {
            userId: user.id,
            oldCredits: user.podCreditsAvailable,
            newCredits,
            lastReset: user.podCreditsLastReset,
          });

          successCount++;
        }
      } catch (error) {
        console.error(`[POD Credit Reset] Error resetting user ${user.id}:`, error);
        errorCount++;
        errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Also downgrade non-Hybrid users who somehow have credits
    try {
      const nonHybridWithCredits = await prisma.user.updateMany({
        where: {
          NOT: {
            membershipTier: 'hybrid',
          },
          OR: [
            { podCreditsAvailable: { gt: 0 } },
            { podCreditsUsed: { gt: 0 } },
          ],
        },
        data: {
          podCreditsAvailable: 0,
          podCreditsUsed: 0,
        },
      });

      if (nonHybridWithCredits.count > 0) {
        console.log(`[POD Credit Reset] Cleared credits for ${nonHybridWithCredits.count} non-Hybrid users`);
      }
    } catch (error) {
      console.error('[POD Credit Reset] Error clearing non-Hybrid credits:', error);
    }

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      yearMonth: currentYearMonth,
      totalProcessed: usersNeedingReset.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('[POD Credit Reset] Job completed:', summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[POD Credit Reset] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
