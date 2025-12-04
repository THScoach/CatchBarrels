import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Check if a user has admin or coach role
 * @param sessionOrToken - NextAuth session or JWT token
 * @returns true if user is admin or coach
 */
export function isAdmin(sessionOrToken: Session | JWT | null): boolean {
  if (!sessionOrToken) return false;
  
  // Check if it's a session object
  if ('user' in sessionOrToken) {
    const user = sessionOrToken.user as any;
    return user?.role === 'admin' || user?.role === 'coach' || user?.isCoach === true;
  }
  
  // Check if it's a token object
  const token = sessionOrToken as any;
  return token?.role === 'admin' || token?.role === 'coach' || token?.isCoach === true;
}

/**
 * Get the appropriate redirect URL based on user role
 * @param sessionOrToken - NextAuth session or JWT token
 * @param fallback - Fallback URL if no role-based redirect
 * @returns Redirect URL
 */
export function getRoleBasedRedirect(sessionOrToken: Session | JWT | null, fallback: string = '/dashboard'): string {
  if (isAdmin(sessionOrToken)) {
    return '/coach';  // Coaches/admins are redirected to /coach (which then goes to /admin)
  }
  return fallback;  // Players go to /dashboard
}
