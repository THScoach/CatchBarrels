/**
 * Tier-based Access Control
 * 
 * Provides utilities for checking user membership tier access
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { prisma } from './db';

export type MembershipTier = 'free' | 'athlete' | 'pro' | 'elite';

export interface TierAccess {
  tier: MembershipTier;
  hasAccess: boolean;
  requiresUpgrade: boolean;
  upgradeMessage?: string;
}

// Tier hierarchy (higher number = higher tier)
const TIER_HIERARCHY: Record<MembershipTier, number> = {
  free: 0,
  athlete: 1,
  pro: 2,
  elite: 3,
};

// Feature access requirements by tier
export const FEATURE_ACCESS: Record<string, MembershipTier> = {
  // Free tier (default)
  'basic_analysis': 'free',
  'view_dashboard': 'free',
  'upload_video': 'free',
  
  // Athlete tier ($49/mo)
  'unlimited_uploads': 'athlete',
  'basic_drills': 'athlete',
  'progress_tracking': 'athlete',
  'coach_rick_basic': 'athlete',
  
  // Pro tier ($99/mo)
  'advanced_biomechanics': 'pro',
  'kinematic_sequence': 'pro',
  'model_comparison': 'pro',
  'coach_rick_advanced': 'pro',
  '52_pitch_assessment': 'pro',
  
  // Elite tier ($199/mo)
  'unlimited_assessments': 'elite',
  'priority_support': 'elite',
  'custom_training_plans': 'elite',
  'live_coaching_access': 'elite',
  '90_day_transformation': 'elite',
};

/**
 * Check if a user has access to a specific tier
 */
export function hasTierAccess(
  userTier: MembershipTier,
  requiredTier: MembershipTier
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
  userTier: MembershipTier,
  feature: string
): boolean {
  const requiredTier = FEATURE_ACCESS[feature] || 'free';
  return hasTierAccess(userTier, requiredTier);
}

/**
 * Get upgrade message for a specific tier
 */
export function getUpgradeMessage(requiredTier: MembershipTier): string {
  const messages: Record<MembershipTier, string> = {
    free: '',
    athlete: 'Upgrade to BARRELS Athlete ($49/mo) to unlock this feature',
    pro: 'Upgrade to BARRELS Pro ($99/mo) to access advanced analytics',
    elite: 'Upgrade to BARRELS Elite ($199/mo) for unlimited access',
  };
  return messages[requiredTier];
}

/**
 * Server-side function to check user's tier access
 */
export async function checkTierAccess(
  requiredTier: MembershipTier = 'free'
): Promise<TierAccess> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return {
        tier: 'free',
        hasAccess: false,
        requiresUpgrade: true,
        upgradeMessage: 'Please sign in to access this feature',
      };
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipTier: true,
        membershipStatus: true,
      },
    });

    if (!user) {
      return {
        tier: 'free',
        hasAccess: false,
        requiresUpgrade: true,
        upgradeMessage: 'User not found',
      };
    }

    const userTier = (user.membershipTier as MembershipTier) || 'free';
    const hasAccess = hasTierAccess(userTier, requiredTier);

    return {
      tier: userTier,
      hasAccess,
      requiresUpgrade: !hasAccess,
      upgradeMessage: hasAccess ? undefined : getUpgradeMessage(requiredTier),
    };
  } catch (error) {
    console.error('Error checking tier access:', error);
    return {
      tier: 'free',
      hasAccess: false,
      requiresUpgrade: true,
      upgradeMessage: 'Error checking access',
    };
  }
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: MembershipTier): {
  name: string;
  color: string;
  icon: string;
} {
  const info: Record<MembershipTier, { name: string; color: string; icon: string }> = {
    free: {
      name: 'Free',
      color: 'text-gray-400',
      icon: '⭐',
    },
    athlete: {
      name: 'BARRELS Athlete',
      color: 'text-blue-400',
      icon: '🏏',
    },
    pro: {
      name: 'BARRELS Pro',
      color: 'text-barrels-gold',
      icon: '💪',
    },
    elite: {
      name: 'BARRELS Elite',
      color: 'text-purple-400',
      icon: '⚡',
    },
  };
  return info[tier];
}
