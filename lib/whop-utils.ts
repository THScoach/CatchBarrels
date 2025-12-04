/**
 * Whop Environment Detection & Product Verification
 */

import { prisma } from './db';

/**
 * Detect if app is running inside Whop App Shell (iframe)
 */
export function isWhopEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if we're in an iframe
    if (window.self !== window.top) {
      // Check for Whop-specific indicators
      const referrer = document.referrer;
      const isWhopReferrer = referrer.includes('whop.com') || referrer.includes('whop.io');
      
      // Check for Whop parent messages
      const hasWhopParent = window.parent !== window.self;
      
      return isWhopReferrer || hasWhopParent;
    }
    
    // Check URL params for Whop indicators
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('whop') || urlParams.has('whop_user_id');
  } catch (error) {
    // If we can't access parent, we're likely in a cross-origin iframe
    return true;
  }
}

/**
 * Get Whop user ID from various sources
 */
export function getWhopUserIdFromEnv(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const whopUserId = urlParams.get('whop_user_id');
    if (whopUserId) return whopUserId;
    
    // Check session storage
    const stored = sessionStorage.getItem('whop_user_id');
    if (stored) return stored;
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Save redirect target before authentication
 */
export function saveRedirectTarget(path: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('post_auth_redirect', path);
  } catch (error) {
    console.error('Failed to save redirect target:', error);
  }
}

/**
 * Get and clear saved redirect target
 */
export function getAndClearRedirectTarget(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const target = sessionStorage.getItem('post_auth_redirect');
    if (target) {
      sessionStorage.removeItem('post_auth_redirect');
      return target;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user owns any CatchBarrels product
 */
export async function userOwnsProduct(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipStatus: true,
        membershipTier: true,
        whopMembershipId: true,
      },
    });

    if (!user) return false;

    // Check if user has active membership
    const hasActiveMembership = 
      user.membershipStatus === 'active' &&
      user.membershipTier !== 'free' &&
      user.whopMembershipId !== null;

    return hasActiveMembership;
  } catch (error) {
    console.error('Error checking product ownership:', error);
    return false;
  }
}

/**
 * Get Whop purchase URL for CatchBarrels
 */
export function getWhopPurchaseUrl(): string {
  return 'https://whop.com/the-hitting-skool/';
}

/**
 * Check if path requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const publicPaths = [
    '/auth/login',
    '/auth/whop-redirect',
    '/api/auth',
    '/_next',
    '/favicon',
    '/manifest',
    '/robots',
  ];

  return !publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if path is a deep link (content page)
 */
export function isDeepLink(pathname: string): boolean {
  const deepLinkPatterns = [
    /^\/video\/[^/]+$/,
    /^\/session\/[^/]+$/,
    /^\/analysis\/[^/]+$/,
    /^\/lesson\/[^/]+$/,
    /^\/drills\/[^/]+$/,
  ];

  return deepLinkPatterns.some(pattern => pattern.test(pathname));
}
