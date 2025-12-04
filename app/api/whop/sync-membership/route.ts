
/**
 * Whop Membership Sync API
 * 
 * Manually sync a user's Whop membership status
 * Used on login and for debugging
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import {
  verifyWhopMembership,
  getWhopUserMemberships,
} from "@/lib/whop-client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has Whop user ID
    if (!user.whopUserId) {
      return NextResponse.json(
        {
          success: true,
          message: "No Whop account linked",
          tier: "free",
          status: "inactive",
        },
        { status: 200 }
      );
    }

    // Fetch all memberships for the user from Whop
    const memberships = await getWhopUserMemberships(user.whopUserId);

    if (!memberships || memberships.length === 0) {
      // No active memberships
      await prisma.user.update({
        where: { id: user.id },
        data: {
          membershipStatus: "inactive",
          membershipTier: "free",
          lastWhopSync: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "No active memberships found",
        tier: "free",
        status: "inactive",
      });
    }

    // Find the highest tier active membership
    const activeMemberships = memberships.filter((m) => m.valid);

    if (activeMemberships.length === 0) {
      // All memberships are invalid
      await prisma.user.update({
        where: { id: user.id },
        data: {
          membershipStatus: "expired",
          membershipTier: "free",
          lastWhopSync: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "All memberships expired",
        tier: "free",
        status: "expired",
      });
    }

    // Get the highest tier membership
    const tierPriority: Record<string, number> = {
      elite: 3,
      pro: 2,
      athlete: 1,
      free: 0,
    };

    let highestTier = "free";
    let highestMembership = activeMemberships[0];

    for (const membership of activeMemberships) {
      const productId = membership.productId;

      // Check database mapping
      const product = await prisma.whopProduct.findUnique({
        where: { whopProductId: productId },
      });

      let tier = "free";
      if (product && product.membershipTier) {
        tier = product.membershipTier;
      } else {
        // Fallback to name-based detection
        if (productId.toLowerCase().includes("elite")) tier = "elite";
        else if (productId.toLowerCase().includes("pro"))
          tier = "pro";
        else if (productId.toLowerCase().includes("athlete"))
          tier = "athlete";
      }

      if (tierPriority[tier] > tierPriority[highestTier]) {
        highestTier = tier;
        highestMembership = membership;
      }
    }

    // Update user with highest tier membership
    await prisma.user.update({
      where: { id: user.id },
      data: {
        whopMembershipId: highestMembership.id,
        membershipTier: highestTier,
        membershipStatus: "active",
        membershipExpiresAt: highestMembership.expiresAt
          ? new Date(highestMembership.expiresAt)
          : null,
        lastWhopSync: new Date(),
      },
    });

    console.log(
      `✅ Synced membership for user ${user.id}: ${highestTier}`
    );

    return NextResponse.json({
      success: true,
      message: "Membership synced successfully",
      tier: highestTier,
      status: "active",
      expiresAt: highestMembership.expiresAt,
    });
  } catch (error) {
    console.error("Error syncing membership:", error);
    return NextResponse.json(
      { error: "Failed to sync membership" },
      { status: 500 }
    );
  }
}

// GET endpoint to check current membership status
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipTier: true,
        membershipStatus: true,
        membershipExpiresAt: true,
        lastWhopSync: true,
        whopUserId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tier: user.membershipTier,
      status: user.membershipStatus,
      expiresAt: user.membershipExpiresAt,
      lastSync: user.lastWhopSync,
      hasWhopAccount: !!user.whopUserId,
    });
  } catch (error) {
    console.error("Error fetching membership status:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership status" },
      { status: 500 }
    );
  }
}
