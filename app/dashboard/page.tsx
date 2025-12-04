import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { buildDashboardSummaryForUser } from '@/lib/dashboard/buildDashboardSummary';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user?.profileComplete) {
    redirect('/onboarding');
  }

  // Build dashboard summary using new Functional Health-style layout
  const summary = await buildDashboardSummaryForUser((session.user as any).id);

  // Calculate sessions used this week (Monday-Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust to Monday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const sessionsThisWeek = await prisma.video.count({
    where: {
      userId: (session.user as any).id,
      uploadDate: {
        gte: startOfWeek,
      },
    },
  });

  // Extract membership info
  const membershipInfo = {
    tier: user?.membershipTier || 'free',
    status: user?.membershipStatus || 'inactive',
    expiresAt: user?.membershipExpiresAt,
    sessionsThisWeek,
    podCreditsAvailable: user?.podCreditsAvailable || 0,
    podCreditsUsed: user?.podCreditsUsed || 0,
  };

  // Extract VIP offer info (Assessment → VIP Pricing)
  const vipOfferInfo = {
    assessmentCompletedAt: user?.assessmentCompletedAt,
    vipExpiresAt: user?.assessmentVipExpiresAt,
    vipActive: user?.assessmentVipActive || false,
  };

  return (
    <DashboardClient 
      user={user}
      summary={summary}
      membershipInfo={membershipInfo}
      vipOfferInfo={vipOfferInfo}
    />
  );
}
