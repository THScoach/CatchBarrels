
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import AssessmentDetailClient from './assessment-detail-client';

export const dynamic = 'force-dynamic';

export default async function AssessmentDetailPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session?.user?.username || session.user.username !== 'admin') {
    redirect('/dashboard');
  }

  const assessmentId = params.id;

  // Fetch assessment with full details
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          dateOfBirth: true,
          level: true,
          bats: true,
          height: true,
          weight: true,
          trialUsed: true,
          trialTier: true,
          trialStartDate: true,
          trialEndDate: true,
          trialConvertedToPaid: true,
          membershipTier: true,
          membershipStatus: true
        }
      },
      video: {
        select: {
          id: true,
          title: true,
          uploadDate: true,
          analyzed: true,
          anchor: true,
          engine: true,
          whip: true
        }
      }
    }
  });

  if (!assessment) {
    redirect('/admin/assessments');
  }

  return <AssessmentDetailClient assessment={assessment} />;
}
