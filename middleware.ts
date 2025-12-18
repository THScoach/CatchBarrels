import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

// Create Prisma client for middleware
const prisma = new PrismaClient();

/**
 * Global Middleware for Authentication, Product Gating & Assessment Enforcement
 * 
 * Rules:
 * 1. If authenticated + has product + has assessment → allow access
 * 2. If authenticated + has product + no assessment → redirect to assessment-required
 * 3. If authenticated + no product → redirect to purchase
 * 4. If not authenticated + public path → allow
 * 5. If not authenticated + protected path → save target and redirect to login
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Log all requests for debugging OAuth flow
  console.log('[Middleware] Request:', { pathname, search, method: request.method });
  
  // ============================================
  // WHOP APP STORE: Allow experience routes through
  // These routes handle their own auth via x-whop-user-token header
  // ============================================
  if (pathname.startsWith('/experiences/')) {
    console.log('[Middleware] Whop experience route - allowing through');
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/admin-login',
    '/auth/whop-redirect',
    '/auth/error', // CRITICAL: Allow error page to display
    '/api/auth', // Allow all NextAuth API routes including callbacks
    '/api/dev', // Allow dev endpoints for seeding/testing
    '/api/signup', // Allow signup endpoint
    '/api/webhooks', // Allow webhook endpoints
    '/api/admin/cron', // Allow cron endpoints (protected by CRON_SECRET)
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Allow public paths and static assets
  if (
    isPublicPath ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.includes('.')
  ) {
    console.log('[Middleware] Allowing public path:', pathname);
    return NextResponse.next();
  }

  // Get user session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('[Middleware] Authentication check:', { 
    pathname, 
    hasToken: !!token,
    tokenId: token?.id,
    role: (token as any)?.role
  });

  // If not authenticated, redirect to login
  if (!token) {
    console.log('[Middleware] No token found, redirecting to login');
    // Save the target URL for post-login redirect
    const loginUrl = new URL('/auth/login', request.url);
    
    // For deep links, save the target in the URL
    if (isDeepLink(pathname)) {
      loginUrl.searchParams.set('callbackUrl', pathname + search);
    }
    
    console.log('[Middleware] Redirect target:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  console.log('[Middleware] User authenticated, role:', (token as any).role);

  // Check if user is admin/coach (they get full access to everything)
  const userRole = (token as any).role || 'player';
  const isAdmin = userRole === 'admin' || userRole === 'coach';
  
  // Admin/Coach access control
  if (pathname.startsWith('/admin') || pathname.startsWith('/coach')) {
    if (!isAdmin) {
      // Not authorized for admin/coach area - redirect to dashboard with error message
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Has admin/coach role - allow access to admin/coach routes
    return NextResponse.next();
  }

  // Admins/coaches bypass product gating - they have full access
  if (isAdmin) {
    return NextResponse.next();
  }

  // Regular user - check product ownership for player routes
  const membershipTier = (token as any).membershipTier || 'free';
  const membershipStatus = (token as any).membershipStatus || 'inactive';
  
  // Check if user has an active paid membership
  const hasProduct = 
    membershipStatus === 'active' &&
    membershipTier !== 'free';

  // If no product, redirect to purchase page (except for onboarding/profile/purchase-required)
  if (!hasProduct) {
    const exemptPaths = [
      '/onboarding',
      '/profile',
      '/welcome',
      '/purchase-required', // CRITICAL: Don't redirect purchase-required to itself!
      '/assessment-required', // Allow access to assessment required page
    ];
    
    const isExempt = exemptPaths.some(path => pathname.startsWith(path));
    
    if (!isExempt && pathname !== '/') {
      const purchaseUrl = new URL('/purchase-required', request.url);
      purchaseUrl.searchParams.set('return', pathname + search);
      return NextResponse.redirect(purchaseUrl);
    }
  }

  // ============================================
  // ASSESSMENT ENFORCEMENT (Players only)
  // Check if player has completed assessment before accessing protected routes
  // ============================================
  if (!isAdmin && hasProduct) {
    // Paths that don't require assessment
    const assessmentExemptPaths = [
      '/onboarding',
      '/profile',
      '/welcome',
      '/purchase-required',
      '/assessment-required', // CRITICAL: Don't redirect assessment-required to itself!
    ];
    
    const isAssessmentExempt = assessmentExemptPaths.some(path => pathname.startsWith(path));
    
    // Only check assessment for protected routes
    if (!isAssessmentExempt && pathname !== '/') {
      try {
        // Check if user has a completed assessment
        const assessment = await prisma.playerAssessment.findFirst({
          where: {
            athleteId: (token as any).id,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            status: true,
          },
        });

        const isCompleted = assessment && (
          assessment.status === 'coach_verified' || 
          assessment.status === 'reboot_verified'
        );

        if (!isCompleted) {
          console.log('[Middleware] No completed assessment - redirecting to assessment-required');
          const assessmentUrl = new URL('/assessment-required', request.url);
          assessmentUrl.searchParams.set('return', pathname + search);
          return NextResponse.redirect(assessmentUrl);
        }

        console.log('[Middleware] Assessment verified - allowing access');
      } catch (error) {
        console.error('[Middleware] Error checking assessment:', error);
        // On error, allow access to prevent blocking users
        // This is a fail-open approach for reliability
      }
    }
  }

  // User has access - proceed
  return NextResponse.next();
}

/**
 * Check if path is a deep link (content page)
 */
function isDeepLink(pathname: string): boolean {
  const deepLinkPatterns = [
    /^\/video\/[^/]+$/,
    /^\/session\/[^/]+$/,
    /^\/sessions\/[^/]+$/,
    /^\/analysis\/[^/]+$/,
    /^\/lesson\/[^/]+$/,
    /^\/drills\/[^/]+$/,
  ];

  return deepLinkPatterns.some(pattern => pattern.test(pathname));
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, manifest.json (metadata)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)).*)',
  ],
};
