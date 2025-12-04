import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VideoUploadClient } from './video-upload-client';
import type { MembershipTier } from '@/lib/membership-tiers';

export default async function VideoUploadPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch user's membership tier for upgrade modal integration
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      membershipTier: true,
    },
  });

  const membershipTier = (user?.membershipTier || 'free') as MembershipTier;

  return <VideoUploadClient membershipTier={membershipTier} />;
}
