import { verifyWhopToken } from '@/lib/whop-auth';
import { prisma } from '@/lib/db';
import { buildDashboardSummaryForUser } from '@/lib/dashboard/buildDashboardSummary';
import DashboardClient from '@/app/dashboard/dashboard-client';

interface Props {
  params: { experienceId: string };
}

export default async function WhopDashboardPage({ params }: Props) {
  const whopUser = await verifyWhopToken();
  
  if (!whopUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-white mb-2">Session Expired</h1>
          <p className="text-gray-400">Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { whopUserId: whopUser.userId },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-white mb-2">User Not Found</h1>
          <p className="text-gray-400">Please contact support.</p>
        </div>
      </div>
    );
  }

  // Build dashboard summary
  const summary = await buildDashboardSummaryForUser(user.id);

  // Calculate sessions used this week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const sessionsThisWeek = await prisma.video.count({
    where: {
      userId: user.id,
      uploadDate: {
        gte: startOfWeek,
      },
    },
  });

  // Extract membership info
  const membershipInfo = {
    tier: user.membershipTier || 'free',
    status: user.membershipStatus || 'inactive',
    expiresAt: user.membershipExpiresAt,
    sessionsThisWeek,
    podCreditsAvailable: user.podCreditsAvailable || 0,
    podCreditsUsed: user.podCreditsUsed || 0,
  };

  // Extract VIP offer info
  const vipOfferInfo = {
    assessmentCompletedAt: user.assessmentCompletedAt,
    vipExpiresAt: user.assessmentVipExpiresAt,
    vipActive: user.assessmentVipActive || false,
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
