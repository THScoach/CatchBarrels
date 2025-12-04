
/**
 * Whop Webhook Handler
 * 
 * Handles Whop webhook events for membership management:
 * - payment.succeeded: Create/update user membership
 * - payment.failed: Handle failed payment
 * - membership.went_valid: Activate membership
 * - membership.went_invalid: Deactivate membership
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Webhook } from "standardwebhooks";

export const dynamic = "force-dynamic";

// Verify webhook signature
function verifyWebhookSignature(
  request: NextRequest,
  body: string
): boolean {
  try {
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("WHOP_WEBHOOK_SECRET not configured, skipping verification");
      return true; // Allow in dev mode without secret
    }

    const wh = new Webhook(webhookSecret);
    const signature = request.headers.get("whop-signature");
    const timestamp = request.headers.get("whop-timestamp");

    if (!signature || !timestamp) {
      return false;
    }

    wh.verify(body, {
      "whop-signature": signature,
      "whop-timestamp": timestamp,
    });

    return true;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

// Map Whop product ID to membership tier
async function getMembershipTierFromProduct(
  productId: string
): Promise<string> {
  try {
    // Product IDs from Whop dashboard (configured Nov 2024)
    const productMapping: Record<string, string> = {
      // BARRELS Athlete - $49/mo or $417/yr
      "prod_kNyobCww4tc2p": "athlete",
      
      // BARRELS Pro - $99/mo or $839/yr
      "prod_O4CB6y0IzNJLe": "pro",
      
      // BARRELS Elite (The Inner Circle) - $199/mo or $1,699/yr
      "prod_vCV6UQH3K18QZ": "elite",
      
      // The 90-Day Transformation - $997 one-time
      "prod_zH1wnZs0JKKfd": "elite", // Transformation grants elite access
    };

    // Check hardcoded mapping first
    if (productMapping[productId]) {
      return productMapping[productId];
    }

    // Check if product is mapped in database (for future use)
    const product = await prisma.whopProduct.findUnique({
      where: { whopProductId: productId },
    });

    if (product && product.membershipTier) {
      return product.membershipTier;
    }

    return "free";
  } catch (error) {
    console.error("Error mapping product to tier:", error);
    return "free";
  }
}

// Handle payment.succeeded event
async function handlePaymentSucceeded(data: any) {
  try {
    const { user, product, membership } = data;

    if (!user?.id || !product?.id) {
      console.error("Missing required data in payment.succeeded event");
      return;
    }

    // Check if this is an assessment purchase
    const isAssessment =
      product.name?.includes("Assessment") ||
      product.name?.includes("Neuro") ||
      product.name?.includes("S2");

    if (isAssessment) {
      // Handle assessment purchase
      await handleAssessmentPurchase(data);
      return;
    }

    // Handle subscription/membership purchase
    const tier = await getMembershipTierFromProduct(product.id);

    // Find or create user
    let user_record = await prisma.user.findUnique({
      where: { whopUserId: user.id },
    });

    if (!user_record) {
      // Create new user if doesn't exist
      user_record = await prisma.user.create({
        data: {
          username: user.username || user.email || `whop_${user.id}`,
          email: user.email,
          name: user.name,
          whopUserId: user.id,
          whopMembershipId: membership?.id,
          membershipTier: tier,
          membershipStatus: "active",
          membershipExpiresAt: membership?.expires_at
            ? new Date(membership.expires_at)
            : null,
          lastWhopSync: new Date(),
          profileComplete: false,
        },
      });
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user_record.id },
        data: {
          whopMembershipId: membership?.id,
          membershipTier: tier,
          membershipStatus: "active",
          membershipExpiresAt: membership?.expires_at
            ? new Date(membership.expires_at)
            : null,
          lastWhopSync: new Date(),
        },
      });
    }

    console.log(
      `✅ Payment succeeded for user ${user.id}, tier: ${tier}`
    );
  } catch (error) {
    console.error("Error handling payment.succeeded:", error);
  }
}

// Handle assessment purchase
async function handleAssessmentPurchase(data: any) {
  try {
    const { user, product, payment } = data;

    // Determine assessment type
    let assessmentType = "neuro_swing"; // Default
    if (product.name?.includes("S2")) {
      assessmentType = "s2_cognition";
    }

    // Find user
    const user_record = await prisma.user.findUnique({
      where: { whopUserId: user.id },
    });

    if (!user_record) {
      console.error(
        `User not found for assessment purchase: ${user.id}`
      );
      return;
    }

    // Create assessment record
    await prisma.assessment.create({
      data: {
        userId: user_record.id,
        assessmentType,
        status: "pending",
        whopPaymentId: payment?.id,
        amountPaid: product.price || 0,
        purchaseDate: new Date(),
      },
    });

    console.log(
      `✅ Assessment purchase recorded: ${assessmentType} for user ${user.id}`
    );
  } catch (error) {
    console.error("Error handling assessment purchase:", error);
  }
}

// Handle membership.went_valid event
async function handleMembershipValid(data: any) {
  try {
    const { user, product, membership } = data;

    if (!user?.id) {
      console.error("Missing user ID in membership.went_valid event");
      return;
    }

    const tier = await getMembershipTierFromProduct(product.id);

    await prisma.user.updateMany({
      where: { whopUserId: user.id },
      data: {
        whopMembershipId: membership.id,
        membershipTier: tier,
        membershipStatus: "active",
        membershipExpiresAt: membership.expires_at
          ? new Date(membership.expires_at)
          : null,
        lastWhopSync: new Date(),
      },
    });

    console.log(`✅ Membership activated for user ${user.id}`);
  } catch (error) {
    console.error("Error handling membership.went_valid:", error);
  }
}

// Handle membership.went_invalid event
async function handleMembershipInvalid(data: any) {
  try {
    const { user } = data;

    if (!user?.id) {
      console.error(
        "Missing user ID in membership.went_invalid event"
      );
      return;
    }

    await prisma.user.updateMany({
      where: { whopUserId: user.id },
      data: {
        membershipStatus: "expired",
        membershipTier: "free",
        lastWhopSync: new Date(),
      },
    });

    console.log(`⚠️ Membership expired for user ${user.id}`);
  } catch (error) {
    console.error("Error handling membership.went_invalid:", error);
  }
}

// Handle payment.failed event
async function handlePaymentFailed(data: any) {
  try {
    const { user } = data;

    if (!user?.id) {
      console.error("Missing user ID in payment.failed event");
      return;
    }

    await prisma.user.updateMany({
      where: { whopUserId: user.id },
      data: {
        membershipStatus: "inactive",
        lastWhopSync: new Date(),
      },
    });

    console.log(`⚠️ Payment failed for user ${user.id}`);
  } catch (error) {
    console.error("Error handling payment.failed:", error);
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(request, body)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { action, data } = event;

    console.log(`📩 Received Whop webhook: ${action}`);

    // Handle different webhook events
    switch (action) {
      case "payment.succeeded":
        await handlePaymentSucceeded(data);
        break;

      case "membership.went_valid":
        await handleMembershipValid(data);
        break;

      case "membership.went_invalid":
        await handleMembershipInvalid(data);
        break;

      case "payment.failed":
        await handlePaymentFailed(data);
        break;

      default:
        console.log(`Unhandled webhook action: ${action}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
