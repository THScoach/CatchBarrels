import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import AdminShell from './admin-shell';

export const metadata = {
  title: 'Admin - CatchBarrels',
  description: 'Coach Control Room for managing players, sessions, and reports',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/admin-login?callbackUrl=/admin');
  }

  // Check for admin or coach role
  const userRole = (session.user as any)?.role || 'player';
  const hasAdminAccess = userRole === 'admin' || userRole === 'coach';

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            This area is restricted to coaches and administrators only.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#E8B14E] to-[#F5C76E] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
