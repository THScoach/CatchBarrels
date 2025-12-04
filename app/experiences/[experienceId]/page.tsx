import { verifyWhopToken, checkWhopAccess } from '@/lib/whop-auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getWhopUserMemberships, getWhopProductTier } from '@/lib/whop-client';

interface Props {
  params: { experienceId: string };
}

export default async function WhopExperiencePage({ params }: Props) {
  console.log('[Whop Experience] Route accessed with experienceId:', params.experienceId);
  
  try {
    const { experienceId } = params;
    
    console.log('[Whop Experience] Step 1: Verifying Whop token...');
    const whopUser = await verifyWhopToken();
    
    if (!whopUser) {
      console.error('[Whop Experience] Token verification failed');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center p-8 max-w-md">
            <div className="text-[#F5A623] text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-gray-400 mb-4">Unable to verify your Whop session.</p>
            <p className="text-gray-500 text-sm mb-4">
              This app must be accessed through the Whop platform. If you're seeing this from within Whop, please try refreshing the page.
            </p>
            <p className="text-gray-600 text-xs">Experience ID: {experienceId}</p>
          </div>
        </div>
      );
    }

    console.log('[Whop Experience] Step 2: Checking access for userId:', whopUser.userId);
    const accessCheck = await checkWhopAccess(whopUser.userId, experienceId);
    
    console.log('[Whop Experience] Access check result:', accessCheck);
    
    if (!accessCheck.hasAccess) {
      console.error('[Whop Experience] Access denied for userId:', whopUser.userId);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center p-8 max-w-md">
            <div className="text-[#F5A623] text-6xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-white mb-2">Access Required</h1>
            <p className="text-gray-400 mb-4">Please purchase a membership to access CatchBarrels.</p>
            <p className="text-gray-600 text-xs">
              User ID: {whopUser.userId}<br/>
              Experience ID: {experienceId}<br/>
              Access Level: {accessCheck.accessLevel}
            </p>
          </div>
        </div>
      );
    }

    console.log('[Whop Experience] Step 3: Finding or creating user...');
    
    // All Whop users are assigned 'player' role
    const userRole = 'player';
    console.log('[Whop Experience] Assigning role:', userRole);
    
    let user = await prisma.user.findUnique({
      where: { whopUserId: whopUser.userId },
    });

    if (!user) {
      console.log('[Whop Experience] User not found, creating new user with role:', userRole);
      user = await prisma.user.create({
        data: {
          username: whopUser.email || `whop_${whopUser.userId}`,
          email: whopUser.email || null,
          name: whopUser.name || null,
          whopUserId: whopUser.userId,
          membershipTier: 'free',
          membershipStatus: 'inactive',
          profileComplete: false,
          role: userRole,
        },
      });
      console.log('[Whop Experience] New user created with ID:', user.id, 'and role:', user.role);
    } else {
      console.log('[Whop Experience] Existing user found with ID:', user.id);
    }

    // Sync memberships
    console.log('[Whop Experience] Step 4: Syncing memberships...');
    try {
      const memberships = await getWhopUserMemberships(whopUser.userId);
      console.log('[Whop Experience] Found', memberships.length, 'memberships');
      
      const activeMemberships = memberships.filter((m) => m.valid);
      console.log('[Whop Experience] Found', activeMemberships.length, 'active memberships');

      if (activeMemberships.length > 0) {
        const tierPriority: Record<string, number> = { elite: 3, pro: 2, athlete: 1, free: 0 };
        let highestTier = 'free';
        let highestMembership = activeMemberships[0];

        for (const membership of activeMemberships) {
          const tier = getWhopProductTier(membership.productId);
          console.log('[Whop Experience] Membership', membership.id, 'has tier:', tier);
          if (tierPriority[tier] > tierPriority[highestTier]) {
            highestTier = tier;
            highestMembership = membership;
          }
        }

        console.log('[Whop Experience] Updating user to tier:', highestTier);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            whopMembershipId: highestMembership.id,
            membershipTier: highestTier,
            membershipStatus: 'active',
            membershipExpiresAt: highestMembership.expiresAt ? new Date(highestMembership.expiresAt) : null,
            lastWhopSync: new Date(),
          },
        });
        console.log('[Whop Experience] Membership sync complete');
      } else {
        console.log('[Whop Experience] No active memberships to sync');
      }
    } catch (error) {
      console.error('[Whop Experience] Error syncing membership:', error);
      console.error('[Whop Experience] Error stack:', error instanceof Error ? error.stack : 'No stack');
    }

    console.log('[Whop Experience] Step 5: Determining redirect...');
    console.log('[Whop Experience] User role:', user.role);
    console.log('[Whop Experience] Profile complete:', user.profileComplete);
    
    // Check profile completion
    if (!user.profileComplete) {
      console.log('[Whop Experience] Profile incomplete, redirecting to onboarding');
      redirect(`/experiences/${experienceId}/onboarding`);
    }

    console.log('[Whop Experience] Profile complete, redirecting to dashboard');
    redirect(`/experiences/${experienceId}/dashboard`);
    
  } catch (error) {
    console.error('[Whop Experience] Critical error:', error);
    console.error('[Whop Experience] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Whop Experience] Error message:', error instanceof Error ? error.message : String(error));
    
    // Always render an error page instead of blank page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-400 mb-4">
            An unexpected error occurred while loading the app.
          </p>
          <details className="text-left">
            <summary className="text-gray-500 text-sm cursor-pointer hover:text-gray-400 mb-2">
              Error Details
            </summary>
            <div className="bg-gray-900 p-4 rounded text-gray-300 text-xs font-mono overflow-auto max-h-48">
              <p className="text-red-400 mb-2">Error:</p>
              <p className="mb-4">{error instanceof Error ? error.message : String(error)}</p>
              {error instanceof Error && error.stack && (
                <>
                  <p className="text-red-400 mb-2">Stack:</p>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </>
              )}
            </div>
          </details>
          <p className="text-gray-600 text-xs mt-4">
            Experience ID: {params.experienceId}
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Please try refreshing the page or contact support if this persists.
          </p>
        </div>
      </div>
    );
  }
}
