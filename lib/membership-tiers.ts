/**
 * CatchBarrels Membership Tiers Configuration
 * 
 * Single source of truth for all membership tier details, pricing, and limits.
 * Work Order 13: Membership tiers + POD credits + swing limits.
 */

export type MembershipTier = 'free' | 'starter' | 'performance' | 'hybrid' | 'pro';

export interface TierConfig {
  id: MembershipTier;
  slug: string;
  displayName: string;
  price: number | null; // null for free tier
  billingCycle: 'month' | 'year' | null;
  sessionsPerWeek: number | 'unlimited';
  sessionsPerMonth: string; // Estimated for display (e.g., "4 per month")
  swingsPerSession: number; // Max swings allowed per session
  podCreditsPerMonth?: number; // POD credits for in-person sessions (Hybrid tier only)
  whopProductIds: string[]; // Whop product IDs that grant this tier
  features: string[];
  upgradeMessage: string;
  color: string; // Tailwind color class
  icon: string; // Emoji or icon
}

/**
 * Membership Tiers Configuration
 * 
 * NOTE: "Lesson" = 1 analyzed video upload session
 * Each lesson has a maximum number of swings that can be analyzed
 */
export const MEMBERSHIP_TIERS: Record<MembershipTier, TierConfig> = {
  free: {
    id: 'free',
    slug: 'free',
    displayName: 'Free',
    price: null,
    billingCycle: null,
    sessionsPerWeek: 0,
    sessionsPerMonth: '0',
    swingsPerSession: 0,
    whopProductIds: [],
    features: [
      'View dashboard',
      'Browse drills library',
      'Basic profile',
    ],
    upgradeMessage: 'Upgrade to start uploading swing analysis videos!',
    color: 'text-gray-400',
    icon: '⭐',
  },

  starter: {
    id: 'starter',
    slug: 'starter',
    displayName: 'Starter',
    price: 49,
    billingCycle: 'month',
    sessionsPerWeek: 1,
    sessionsPerMonth: '4 per month',
    swingsPerSession: 15,
    whopProductIds: ['prod_kNyobCww4tc2p'], // TODO: Update with real Whop product ID
    features: [
      '1 remote lesson per week',
      'Up to 15 swings per lesson',
      'BARREL Score & 4B breakdown',
      'Basic Coach Rick insights',
      'Progress tracking',
    ],
    upgradeMessage: 'Upgrade to Starter for 1 lesson/week at $49/month',
    color: 'text-blue-400',
    icon: '🏏',
  },

  performance: {
    id: 'performance',
    slug: 'performance',
    displayName: 'Performance',
    price: 99,
    billingCycle: 'month',
    sessionsPerWeek: 2,
    sessionsPerMonth: '8 per month',
    swingsPerSession: 15,
    whopProductIds: ['prod_O4CB6y0IzNJLe'], // TODO: Update with real Whop product ID
    features: [
      '2 remote lessons per week',
      'Up to 15 swings per lesson',
      'Advanced biomechanics',
      'Kinematic sequence analysis',
      'Full Coach Rick reports',
      '52-pitch assessment access',
    ],
    upgradeMessage: 'Upgrade to Performance for 2 lessons/week at $99/month',
    color: 'text-barrels-gold',
    icon: '💪',
  },

  hybrid: {
    id: 'hybrid',
    slug: 'hybrid',
    displayName: 'Hybrid',
    price: 199,
    billingCycle: 'month',
    sessionsPerWeek: 1,
    sessionsPerMonth: '4 remote + 1 in-person',
    swingsPerSession: 15,
    podCreditsPerMonth: 1,
    whopProductIds: ['prod_HYBRID_199'], // TODO: Update with real Whop product ID
    features: [
      '1 remote lesson per week',
      '1 in-person POD session per month',
      'Up to 15 swings per lesson',
      'Advanced biomechanics',
      'Priority POD booking',
      'Full Coach Rick reports',
      'In-person coaching',
    ],
    upgradeMessage: 'Upgrade to Hybrid for remote + in-person training at $199/month',
    color: 'text-purple-400',
    icon: '🔥',
  },

  pro: {
    id: 'pro',
    slug: 'pro',
    displayName: 'Pro',
    price: 997,
    billingCycle: 'month',
    sessionsPerWeek: 'unlimited',
    sessionsPerMonth: 'Unlimited',
    swingsPerSession: 25,
    whopProductIds: [
      'prod_PRO_997', // TODO: Update with real Whop product ID
      'prod_zH1wnZs0JKKfd', // The 90-Day Transformation (if still applicable)
    ],
    features: [
      'Unlimited remote lessons',
      'Up to 25 swings per lesson',
      'Unlimited assessments',
      'Priority support',
      'Custom training plans',
      'Live coaching access',
      'All features included',
    ],
    upgradeMessage: 'Upgrade to Pro for unlimited lessons at $997/month',
    color: 'text-emerald-400',
    icon: '⚡',
  },
};

/**
 * Assessment Product Configuration
 * 
 * One-time purchase products that grant 30-day app access.
 * After 30 days, user must subscribe to a membership tier to continue.
 */
export interface AssessmentConfig {
  productId: string;
  displayName: string;
  price: number;
  accessDays: number; // Days of app access
  sessionsAllowed: number; // Sessions available during access window
  features: string[];
}

export const ASSESSMENT_PRODUCTS: AssessmentConfig[] = [
  {
    productId: 'prod_assessment_standard_299', // PLACEHOLDER - update with real Whop ID
    displayName: 'Standard Assessment',
    price: 299,
    accessDays: 30,
    sessionsAllowed: 2,
    features: [
      '30-day app access',
      '2 analyzed sessions',
      'Full assessment report',
      'Personalized recommendations',
    ],
  },
  {
    productId: 'prod_assessment_pro_399', // PLACEHOLDER - update with real Whop ID
    displayName: 'Pro Assessment + S2 Cognition',
    price: 399,
    accessDays: 30,
    sessionsAllowed: 2,
    features: [
      '30-day app access',
      '2 analyzed sessions',
      'Full assessment report',
      'S2 Cognition testing',
      'Advanced brain metrics',
    ],
  },
];

/**
 * Helper Functions
 */

/**
 * Get tier config by tier ID
 */
export function getTierConfig(tier: MembershipTier): TierConfig {
  return MEMBERSHIP_TIERS[tier];
}

/**
 * Get tier from Whop product ID
 */
export function getTierFromProductId(productId: string): MembershipTier {
  for (const [tierKey, config] of Object.entries(MEMBERSHIP_TIERS)) {
    if (config.whopProductIds.includes(productId)) {
      return tierKey as MembershipTier;
    }
  }
  return 'free';
}

/**
 * Check if product ID is an assessment
 */
export function isAssessmentProductId(productId: string): boolean {
  return ASSESSMENT_PRODUCTS.some(a => a.productId === productId);
}

/**
 * Get assessment config by product ID
 */
export function getAssessmentConfig(productId: string): AssessmentConfig | null {
  return ASSESSMENT_PRODUCTS.find(a => a.productId === productId) || null;
}

/**
 * Check if user can start a new session
 * 
 * @param tier - User's membership tier
 * @param sessionsThisWeek - Number of sessions already used this week
 * @returns Object with allowed status and optional reason message
 */
export function canStartNewSession(
  tier: MembershipTier,
  sessionsThisWeek: number
): { allowed: boolean; reason?: string } {
  const config = getTierConfig(tier);
  const limit = config.sessionsPerWeek;

  if (limit === 'unlimited') {
    return { allowed: true };
  }

  if (limit === 0) {
    return {
      allowed: false,
      reason: `You need an active BARRELS membership to upload swing analysis. Upgrade to ${MEMBERSHIP_TIERS.starter.displayName} ($${MEMBERSHIP_TIERS.starter.price}/month) to start training!`,
    };
  }

  if (sessionsThisWeek >= limit) {
    const nextTier = getNextTier(tier);
    const nextTierName = nextTier ? MEMBERSHIP_TIERS[nextTier].displayName : 'a higher plan';
    const nextTierPrice = nextTier ? `$${MEMBERSHIP_TIERS[nextTier].price}/month` : '';

    return {
      allowed: false,
      reason: `You've used all ${limit} session${limit > 1 ? 's' : ''} for this week on the ${config.displayName} plan. Your next session unlocks on Monday. Want more reps now? Upgrade to ${nextTierName} ${nextTierPrice ? `(${nextTierPrice})` : ''} for more weekly sessions!`,
    };
  }

  return { allowed: true };
}

/**
 * Get next higher tier (for upgrade suggestions)
 */
function getNextTier(currentTier: MembershipTier): MembershipTier | null {
  const hierarchy: MembershipTier[] = ['free', 'starter', 'performance', 'hybrid', 'pro'];
  const currentIndex = hierarchy.indexOf(currentTier);
  return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : null;
}

/**
 * Check if user has access to a specific tier
 */
export function hasTierAccess(
  userTier: MembershipTier,
  requiredTier: MembershipTier
): boolean {
  const hierarchy: Record<MembershipTier, number> = {
    free: 0,
    starter: 1,
    performance: 2,
    hybrid: 3,
    pro: 4,
  };
  return hierarchy[userTier] >= hierarchy[requiredTier];
}

/**
 * Calculate assessment expiry date
 */
export function calculateAssessmentExpiry(purchaseDate: Date, accessDays: number): Date {
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + accessDays);
  return expiryDate;
}

/**
 * Check if assessment access is still valid
 */
export function isAssessmentAccessValid(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() < new Date(expiryDate);
}

/**
 * Get days remaining in assessment access
 */
export function getAssessmentDaysRemaining(expiryDate: Date | null): number {
  if (!expiryDate) return 0;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const msRemaining = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}
