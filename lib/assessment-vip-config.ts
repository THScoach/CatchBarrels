/**
 * Assessment → VIP Pricing Configuration
 * 
 * Controls the VIP offer window for users who purchase assessments.
 * 
 * Business Logic:
 * - When a user purchases a CatchBarrels Assessment ($299 or $399)
 * - They unlock VIP access to BARRELS Pro at $99/month
 * - VIP offer lasts for ASSESSMENT_VIP_DAYS from purchase date
 * - After expiry, standard pricing applies
 */

// Duration of VIP offer window (in days)
export const ASSESSMENT_VIP_DAYS = 60;

// Assessment product IDs from Whop (these grant VIP access)
export const ASSESSMENT_PRODUCT_IDS = [
  'prod_assessment_standard_299',  // Standard In-Person Assessment - $299 (PLACEHOLDER - update with real Whop product ID)
  'prod_assessment_pro_399',       // Pro Assessment + S2 Cognition - $399 (PLACEHOLDER - update with real Whop product ID)
];

// BARRELS Pro product ID (the VIP offer product)
export const BARRELS_PRO_PRODUCT_ID = 'prod_O4CB6y0IzNJLe';

// VIP pricing
export const VIP_PRO_PRICE_MONTHLY = 99;
export const STANDARD_PRO_PRICE_MONTHLY = 99; // Currently same, but kept separate for future flexibility

// Session limits per tier (per week)
export const TIER_SESSION_LIMITS: Record<string, number | 'unlimited'> = {
  free: 0,
  athlete: 1,    // BARRELS Athlete ($49/mo) - 1 session per week
  pro: 2,        // BARRELS Pro ($99/mo) - 2 sessions per week
  elite: 'unlimited', // BARRELS Elite ($199/mo) - unlimited sessions
};

/**
 * Calculate VIP expiry date from assessment purchase date
 */
export function calculateVipExpiryDate(purchaseDate: Date): Date {
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + ASSESSMENT_VIP_DAYS);
  return expiryDate;
}

/**
 * Check if VIP offer is still active
 */
export function isVipActive(vipExpiresAt: Date | null): boolean {
  if (!vipExpiresAt) return false;
  return new Date() < new Date(vipExpiresAt);
}

/**
 * Get days remaining in VIP offer
 */
export function getVipDaysRemaining(vipExpiresAt: Date | null): number {
  if (!vipExpiresAt) return 0;
  
  const now = new Date();
  const expiry = new Date(vipExpiresAt);
  const msRemaining = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}

/**
 * Check if user can start a new session based on their tier
 */
export function canStartNewSession(
  userTier: string,
  sessionsThisWeek: number
): { allowed: boolean; reason?: string } {
  const limit = TIER_SESSION_LIMITS[userTier] || 0;
  
  if (limit === 'unlimited') {
    return { allowed: true };
  }
  
  if (limit === 0) {
    return {
      allowed: false,
      reason: 'You need an active BARRELS membership to upload swings. Upgrade to start training!',
    };
  }
  
  if (sessionsThisWeek >= limit) {
    return {
      allowed: false,
      reason: `You've used all ${limit} session${limit > 1 ? 's' : ''} for this week on your ${userTier.toUpperCase()} plan. Your next session unlocks on Monday. Want more reps now? Upgrade your plan!`,
    };
  }
  
  return { allowed: true };
}
