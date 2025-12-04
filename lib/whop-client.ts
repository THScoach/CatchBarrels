
/**
 * Whop API Client
 * 
 * Provides utilities for Whop membership verification and management
 */

import Whop from "@whop/sdk";

// Initialize Whop SDK client
const getWhopClient = () => {
  const apiKey = process.env.WHOP_API_KEY;
  const appId = process.env.WHOP_APP_ID;

  if (!apiKey) {
    console.warn("WHOP_API_KEY not configured");
    return null;
  }

  return new Whop({
    apiKey,
    appID: appId || undefined,
  });
};

export interface WhopMembership {
  id: string;
  userId: string;
  productId: string;
  planId?: string;
  status: string;
  valid: boolean;
  cancelAtPeriodEnd: boolean;
  expiresAt?: string;
  licenseKey?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Verify a Whop membership by membership ID or license key
 */
export async function verifyWhopMembership(
  membershipIdOrLicenseKey: string
): Promise<WhopMembership | null> {
  try {
    const client = getWhopClient();
    if (!client) {
      console.error("Whop client not initialized");
      return null;
    }

    // Fetch membership from Whop API
    const membership = await client.memberships.retrieve(
      membershipIdOrLicenseKey
    );

    if (!membership) {
      return null;
    }

    const membershipData = membership as any;

    return {
      id: membershipData.id || "",
      userId: membershipData.user?.id || "",
      productId: membershipData.product?.id || "",
      planId: membershipData.plan?.id,
      status: membershipData.status || "unknown",
      valid: membershipData.valid || false,
      cancelAtPeriodEnd: membershipData.cancel_at_period_end || false,
      expiresAt: membershipData.expires_at || undefined,
      licenseKey: membershipData.license_key,
    };
  } catch (error) {
    console.error("Error verifying Whop membership:", error);
    return null;
  }
}

/**
 * Get all memberships for a specific Whop user
 */
export async function getWhopUserMemberships(
  whopUserId: string
): Promise<WhopMembership[]> {
  try {
    const client = getWhopClient();
    if (!client) {
      console.error("Whop client not initialized");
      return [];
    }

    // List memberships (filter by user_ids parameter - note the plural)
    const memberships = await client.memberships.list({
      user_ids: [whopUserId],
    } as any);

    const data = (memberships as any).data || [];

    return data.map((m: any) => ({
      id: m.id || "",
      userId: m.user?.id || "",
      productId: m.product?.id || "",
      planId: m.plan?.id,
      status: m.status || "unknown",
      valid: m.valid || false,
      cancelAtPeriodEnd: m.cancel_at_period_end || false,
      expiresAt: m.expires_at || undefined,
      licenseKey: m.license_key,
      userEmail: m.user?.email,
      userName: m.user?.name || m.user?.username,
    }));
  } catch (error) {
    console.error("Error fetching Whop user memberships:", error);
    return [];
  }
}

/**
 * Get ALL memberships from Whop (for admin sync)
 * This fetches all customers who have purchased products, regardless of whether
 * they already have an account in CatchBarrels
 */
export async function getAllWhopMemberships(): Promise<WhopMembership[]> {
  try {
    console.log('[Whop Client] Initializing Whop client...');
    const client = getWhopClient();
    if (!client) {
      console.error('[Whop Client] ❌ Failed to initialize Whop client - check WHOP_API_KEY');
      return [];
    }

    const companyId = process.env.WHOP_COMPANY_ID;
    if (!companyId) {
      console.error('[Whop Client] ❌ WHOP_COMPANY_ID not configured');
      return [];
    }

    console.log('[Whop Client] ✓ Client initialized, fetching all memberships...');
    console.log('[Whop Client] Using company ID:', companyId);
    
    // Fetch ALL memberships with required company_id parameter
    // This will return all customers who have purchased any of your products
    const response = await client.memberships.list({
      company_id: companyId,
      per_page: 100, // Fetch 100 at a time (max allowed by Whop)
    } as any);

    const data = (response as any).data || [];
    console.log(`[Whop Client] ✓ Fetched ${data.length} memberships from first page`);

    // Check if there are more pages
    const pagination = (response as any).pagination;
    let allMemberships = [...data];
    
    if (pagination && pagination.next_cursor) {
      console.log('[Whop Client] → Multiple pages detected, fetching all pages...');
      let cursor = pagination.next_cursor;
      let pageCount = 1;
      
      while (cursor) {
        try {
          const nextPage = await client.memberships.list({
            company_id: companyId,
            per_page: 100,
            starting_after: cursor,
          } as any);
          
          const nextData = (nextPage as any).data || [];
          allMemberships.push(...nextData);
          pageCount++;
          console.log(`[Whop Client] ✓ Fetched page ${pageCount}: ${nextData.length} memberships (total: ${allMemberships.length})`);
          
          cursor = (nextPage as any).pagination?.next_cursor;
        } catch (error) {
          console.error('[Whop Client] ❌ Error fetching next page:', error);
          break;
        }
      }
    }

    console.log(`[Whop Client] ✓ Total memberships fetched: ${allMemberships.length}`);

    // Map to our interface
    const mappedMemberships = allMemberships.map((m: any) => ({
      id: m.id || "",
      userId: m.user?.id || "",
      productId: m.product?.id || "",
      planId: m.plan?.id,
      status: m.status || "unknown",
      valid: m.valid || false,
      cancelAtPeriodEnd: m.cancel_at_period_end || false,
      expiresAt: m.expires_at || undefined,
      licenseKey: m.license_key,
      userEmail: m.user?.email,
      userName: m.user?.name || m.user?.username,
    }));

    console.log(`[Whop Client] ✓ Mapped ${mappedMemberships.length} memberships`);
    
    // Log a sample for debugging
    if (mappedMemberships.length > 0) {
      console.log('[Whop Client] Sample membership:', {
        userId: mappedMemberships[0].userId,
        email: mappedMemberships[0].userEmail,
        productId: mappedMemberships[0].productId,
        valid: mappedMemberships[0].valid,
      });
    }

    return mappedMemberships;
  } catch (error) {
    console.error('[Whop Client] ❌ Error fetching all Whop memberships:', error);
    if (error instanceof Error) {
      console.error('[Whop Client] Error message:', error.message);
      console.error('[Whop Client] Error stack:', error.stack);
    }
    return [];
  }
}

/**
 * Map Whop product ID to BARRELS membership tier
 * Uses centralized tier configuration from membership-tiers.ts
 */
export function getWhopProductTier(productId: string): string {
  // Import from centralized config
  const { getTierFromProductId } = require('./membership-tiers');
  return getTierFromProductId(productId);
}

/**
 * Check if a Whop product is an assessment product
 * Uses centralized configuration from membership-tiers.ts
 */
export function isAssessmentProduct(productId: string): boolean {
  const { isAssessmentProductId } = require('./membership-tiers');
  return isAssessmentProductId(productId);
}

/**
 * Get assessment purchase date from memberships
 * Returns the earliest assessment purchase date
 */
export function getAssessmentPurchaseDate(memberships: WhopMembership[]): Date | null {
  const assessmentMemberships = memberships.filter(m => isAssessmentProduct(m.productId));
  
  if (assessmentMemberships.length === 0) return null;
  
  // If memberships have a created_at or similar field, use that
  // For now, we'll use the current date as a fallback
  // TODO: Update this when we have access to actual purchase dates from Whop API
  return new Date();
}

/**
 * Check if a membership grants access to a specific tier
 */
export function hasTierAccess(
  userTier: string,
  requiredTier: string
): boolean {
  const tierHierarchy = ["free", "athlete", "pro", "elite"];
  const userLevel = tierHierarchy.indexOf(userTier);
  const requiredLevel = tierHierarchy.indexOf(requiredTier);

  return userLevel >= requiredLevel;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  const displayNames: Record<string, string> = {
    free: "Free",
    athlete: "BARRELS Athlete",
    pro: "BARRELS Pro",
    elite: "BARRELS Elite",
  };

  return displayNames[tier] || "Free";
}
