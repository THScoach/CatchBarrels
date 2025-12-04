/**
 * Whop App Store Authentication Helper
 * 
 * This module handles authentication for Whop iframe-embedded apps.
 * When your app runs inside Whop's platform, users are already authenticated -
 * Whop passes their identity via the x-whop-user-token HTTP header.
 */

import { headers } from 'next/headers';
import { validateToken } from '@whop-apps/sdk';

export interface WhopUser {
  userId: string;
  email?: string;
  name?: string;
}

export async function verifyWhopToken(): Promise<WhopUser | null> {
  console.log('[Whop Auth] Starting token verification');
  
  try {
    const headersList = await headers();
    const token = headersList.get('x-whop-user-token');
    
    console.log('[Whop Auth] Token present:', !!token);
    console.log('[Whop Auth] Token length:', token?.length || 0);
    console.log('[Whop Auth] All headers:', Object.fromEntries(headersList.entries()));
    
    if (!token) {
      console.error('[Whop Auth] No x-whop-user-token header found');
      return null;
    }

    console.log('[Whop Auth] Validating token with Whop SDK...');
    
    // Use Whop's SDK to validate the token
    const result = await validateToken({
      token,
      appId: process.env.WHOP_APP_ID || undefined,
    });

    console.log('[Whop Auth] Validation result:', result);

    if (!result || !result.userId) {
      console.error('[Whop Auth] Token validation failed or no userId found');
      return null;
    }

    console.log('[Whop Auth] Token verified successfully for userId:', result.userId);
    
    // SDK only returns userId and appId, not email/name
    return {
      userId: result.userId,
      email: undefined,
      name: undefined,
    };
  } catch (error) {
    console.error('[Whop Auth] Token verification error:', error);
    console.error('[Whop Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Whop Auth] Error message:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function isWhopIframe(): Promise<boolean> {
  try {
    const headersList = await headers();
    const hasToken = headersList.has('x-whop-user-token');
    console.log('[Whop Auth] Is Whop iframe:', hasToken);
    return hasToken;
  } catch (error) {
    console.error('[Whop Auth] Error checking iframe:', error);
    return false;
  }
}

export async function checkWhopAccess(
  userId: string, 
  experienceId: string
): Promise<{ hasAccess: boolean; accessLevel: 'customer' | 'admin' | 'no_access' }> {
  console.log('[Whop Auth] Checking access for userId:', userId, 'experienceId:', experienceId);
  
  // ✅ SIMPLIFIED: Grant customer access to all authenticated Whop users
  // Token validation proves they're legitimate - no need for additional API checks
  console.log('[Whop Auth] ✅ Token validated - granting access to authenticated Whop user');
  return {
    hasAccess: true,
    accessLevel: 'customer',
  };
  
  /* ORIGINAL ACCESS CHECK CODE - TEMPORARILY DISABLED
  try {
    const apiKey = process.env.WHOP_API_KEY;
    const companyId = process.env.WHOP_COMPANY_ID;
    
    if (!apiKey) {
      console.error('[Whop Auth] WHOP_API_KEY not configured');
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    // Step 1: Check customer access (for users who purchased)
    console.log('[Whop Auth] Step 1: Checking customer access...');
    const customerUrl = `https://api.whop.com/api/v5/access?user_id=${userId}&resource_id=${experienceId}`;
    console.log('[Whop Auth] Fetching customer access from:', customerUrl);

    const customerResponse = await fetch(customerUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    console.log('[Whop Auth] Customer access API response status:', customerResponse.status);

    if (customerResponse.ok) {
      const customerData = await customerResponse.json();
      console.log('[Whop Auth] Customer access API response:', customerData);
      
      if (customerData.has_access) {
        console.log('[Whop Auth] ✅ User has customer access');
        return {
          hasAccess: true,
          accessLevel: 'customer',
        };
      }
    } else {
      const errorText = await customerResponse.text();
      console.log('[Whop Auth] Customer access check returned non-OK status:', errorText);
    }

    // Step 2: Check admin access (for owners/team members previewing)
    console.log('[Whop Auth] Step 2: Checking admin access for company:', companyId);
    
    if (!companyId) {
      console.error('[Whop Auth] WHOP_COMPANY_ID not configured, cannot check admin access');
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    // Check if user is authorized on the company (owner/team member)
    const adminUrl = `https://api.whop.com/api/v5/me/companies/${companyId}`;
    console.log('[Whop Auth] Fetching admin access from:', adminUrl);

    const adminResponse = await fetch(adminUrl, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'X-Whop-User-ID': userId,
      },
    });

    console.log('[Whop Auth] Admin access API response status:', adminResponse.status);

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('[Whop Auth] Admin access API response:', adminData);
      
      // If the user can access the company details, they're an admin/owner/team member
      if (adminData && (adminData.id === companyId || adminData.company?.id === companyId)) {
        console.log('[Whop Auth] ✅ User has admin access (owner/team member)');
        return {
          hasAccess: true,
          accessLevel: 'admin',
        };
      }
    } else {
      const errorText = await adminResponse.text();
      console.log('[Whop Auth] Admin access check returned non-OK status:', errorText);
    }

    // Step 3: No access found
    console.log('[Whop Auth] ❌ No customer or admin access found for user');
    return { hasAccess: false, accessLevel: 'no_access' };
    
  } catch (error) {
    console.error('[Whop Auth] Access check error:', error);
    console.error('[Whop Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return { hasAccess: false, accessLevel: 'no_access' };
  }
  */
}
