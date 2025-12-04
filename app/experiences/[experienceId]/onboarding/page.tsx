import { verifyWhopToken } from '@/lib/whop-auth';
import { prisma } from '@/lib/db';
import OnboardingPage from '@/app/onboarding/page';

interface Props {
  params: { experienceId: string };
}

export default async function WhopOnboardingPage({ params }: Props) {
  const whopUser = await verifyWhopToken();
  
  if (!whopUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Session expired. Please refresh.</p>
      </div>
    );
  }

  // Render the existing onboarding page
  return <OnboardingPage />;
}
