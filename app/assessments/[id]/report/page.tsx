import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import ReportClient from './report-client';

export default async function AssessmentReportPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch assessment session with report
  const assessmentSession = await prisma.assessmentSession.findUnique({
    where: { id: params.id },
    include: {
      report: {
        include: {
          metrics: true,
        },
      },
      swings: {
        include: {
          metrics: true,
        },
        orderBy: { swingNumber: 'asc' },
      },
      ballData: {
        orderBy: { createdAt: 'asc' },
      },
      onTheBallHistory: true,
    },
  });

  if (!assessmentSession || assessmentSession.userId !== session.user.id) {
    redirect('/assessments');
  }

  if (!assessmentSession.report) {
    redirect(`/assessments/${params.id}`);
  }

  return (
    <ReportClient
      session={assessmentSession as any}
      report={assessmentSession.report as any}
    />
  );
}
