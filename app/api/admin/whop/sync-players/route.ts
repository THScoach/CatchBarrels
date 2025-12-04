import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { 
  getAllWhopMemberships, 
  getWhopProductTier, 
  isAssessmentProduct, 
  getAssessmentPurchaseDate 
} from '@/lib/whop-client';
import { calculateVipExpiryDate, isVipActive } from '@/lib/assessment-vip-config';

export async function POST(request: NextRequest) {
  try {
    console.log('[Whop Sync] ========================================');
    console.log('[Whop Sync] Starting FULL player sync from Whop');
    console.log('[Whop Sync] ========================================');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('[Whop Sync] ❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin/coach role
    const userRole = (session.user as any)?.role || 'player';
    console.log(`[Whop Sync] ✓ User ${(session.user as any).email} (role: ${userRole}) initiated sync`);
    
    if (userRole !== 'admin' && userRole !== 'coach') {
      console.error('[Whop Sync] ❌ User lacks admin/coach role');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch ALL memberships from Whop API (not just existing users)
    console.log('[Whop Sync] Fetching ALL memberships from Whop API...');
    const allMemberships = await getAllWhopMemberships();
    
    if (!allMemberships || allMemberships.length === 0) {
      console.warn('[Whop Sync] ⚠️  No memberships found in Whop. Check WHOP_API_KEY configuration.');
      return NextResponse.json({
        success: false,
        error: 'No memberships found in Whop. Please verify your Whop configuration.',
        syncedCount: 0,
        createdCount: 0,
        updatedCount: 0,
      }, { status: 400 });
    }

    console.log(`[Whop Sync] ✓ Found ${allMemberships.length} total memberships in Whop`);

    // Group memberships by Whop user ID
    const membershipsByUser = new Map<string, typeof allMemberships>();
    for (const membership of allMemberships) {
      if (!membership.userId) continue;
      
      const existing = membershipsByUser.get(membership.userId) || [];
      existing.push(membership);
      membershipsByUser.set(membership.userId, existing);
    }

    console.log(`[Whop Sync] ✓ Found ${membershipsByUser.size} unique Whop users with memberships`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each Whop user
    for (const [whopUserId, memberships] of membershipsByUser.entries()) {
      try {
        console.log(`\n[Whop Sync] --- Processing Whop User: ${whopUserId} ---`);
        console.log(`[Whop Sync] Memberships: ${memberships.length} total`);

        // Get user info from first membership
        const firstMembership = memberships[0];
        const userEmail = firstMembership.userEmail;
        const userName = firstMembership.userName;

        if (!userEmail) {
          console.warn(`[Whop Sync] ⚠️  Skipping user ${whopUserId} - no email found`);
          skippedCount++;
          continue;
        }

        console.log(`[Whop Sync] Email: ${userEmail}`);
        console.log(`[Whop Sync] Name: ${userName || 'Not provided'}`);

        // Filter for active memberships
        const activeMemberships = memberships.filter((m) => m.valid);
        console.log(`[Whop Sync] Active memberships: ${activeMemberships.length}/${memberships.length}`);

        // Determine highest tier
        const tierPriority: Record<string, number> = {
          elite: 3,
          pro: 2,
          athlete: 1,
          free: 0,
        };

        let highestTier = 'free';
        let highestMembership = activeMemberships[0] || memberships[0];

        for (const membership of activeMemberships) {
          const tier = getWhopProductTier(membership.productId);
          console.log(`[Whop Sync]   - Product ${membership.productId} → ${tier} tier`);
          if (tierPriority[tier] > tierPriority[highestTier]) {
            highestTier = tier;
            highestMembership = membership;
          }
        }

        console.log(`[Whop Sync] → Determined tier: ${highestTier}`);

        // Check for assessment purchase (VIP offer)
        const assessmentPurchaseDate = getAssessmentPurchaseDate(memberships);
        let vipUpdateData: any = {};
        
        if (assessmentPurchaseDate) {
          const vipExpiryDate = calculateVipExpiryDate(assessmentPurchaseDate);
          const vipActive = isVipActive(vipExpiryDate);
          
          console.log(`[Whop Sync] → VIP offer detected: expires ${vipExpiryDate.toISOString()}, active: ${vipActive}`);
          
          vipUpdateData = {
            assessmentCompletedAt: assessmentPurchaseDate,
            assessmentVipExpiresAt: vipExpiryDate,
            assessmentVipActive: vipActive,
          };
        }

        // Check if user already exists (by email or whopUserId)
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userEmail },
              { whopUserId: whopUserId },
            ],
          },
        });

        const membershipStatus = activeMemberships.length > 0 ? 'active' : 'inactive';
        const userData = {
          whopUserId,
          whopMembershipId: highestMembership.id,
          membershipTier: highestTier,
          membershipStatus,
          membershipExpiresAt: highestMembership.expiresAt
            ? new Date(highestMembership.expiresAt)
            : null,
          lastWhopSync: new Date(),
          ...vipUpdateData,
        };

        if (existingUser) {
          // UPDATE existing user
          console.log(`[Whop Sync] → User exists (${existingUser.id}), updating...`);
          
          await prisma.user.update({
            where: { id: existingUser.id },
            data: userData,
          });

          console.log(`[Whop Sync] ✓ Updated user ${userEmail}`);
          updatedCount++;
        } else {
          // CREATE new user
          console.log(`[Whop Sync] → User does not exist, creating new account...`);
          
          // Generate username from email
          const username = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          const newUser = await prisma.user.create({
            data: {
              email: userEmail,
              username,
              name: userName || userEmail.split('@')[0],
              role: 'player',
              ...userData,
            },
          });

          console.log(`[Whop Sync] ✓ Created new user ${userEmail} (${newUser.id})`);
          createdCount++;
        }
      } catch (error) {
        console.error(`[Whop Sync] ❌ Error processing Whop user ${whopUserId}:`, error);
        errors.push(`Failed to sync user ${whopUserId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const totalProcessed = createdCount + updatedCount;
    console.log('\n[Whop Sync] ========================================');
    console.log(`[Whop Sync] SYNC COMPLETE`);
    console.log(`[Whop Sync] ✓ Created: ${createdCount} new users`);
    console.log(`[Whop Sync] ✓ Updated: ${updatedCount} existing users`);
    console.log(`[Whop Sync] ⚠️  Skipped: ${skippedCount} users (no email)`);
    console.log(`[Whop Sync] ❌ Errors: ${errors.length}`);
    console.log(`[Whop Sync] → Total processed: ${totalProcessed}/${membershipsByUser.size} users`);
    console.log('[Whop Sync] ========================================');
    
    if (errors.length > 0) {
      console.error('[Whop Sync] Error details:', errors);
    }

    return NextResponse.json({
      success: true,
      syncedCount: totalProcessed,
      createdCount,
      updatedCount,
      skippedCount,
      totalWhopUsers: membershipsByUser.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Whop Sync] ❌ FATAL ERROR:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync players from Whop',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
