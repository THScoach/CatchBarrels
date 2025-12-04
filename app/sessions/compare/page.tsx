import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import CompareClient from './compare-client';

export const metadata = {
  title: 'Compare Swings | CatchBarrels',
  description: 'Side-by-side swing comparison',
};

interface PageProps {
  searchParams: {
    left?: string;
    right?: string;
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const { left, right } = searchParams;

  if (!left || !right) {
    notFound();
  }

  // Fetch both videos
  const leftVideo = await prisma.video.findUnique({
    where: { id: left },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const rightVideo = await prisma.video.findUnique({
    where: { id: right },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!leftVideo || !rightVideo) {
    notFound();
  }

  // Check authorization
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const isAdminOrCoach = userRole === 'admin' || userRole === 'coach';

  // Players can only compare their own videos
  if (!isAdminOrCoach) {
    if (leftVideo.userId !== userId || rightVideo.userId !== userId) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400">You can only compare your own swings.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <CompareClient
      leftVideo={{
        id: leftVideo.id,
        url: leftVideo.videoUrl,
        title: leftVideo.title || 'Untitled',
        playerName: leftVideo.user.name || 'Unknown',
        uploadDate: leftVideo.uploadDate,
        score: leftVideo.overallScore || undefined,
        tags: {
          tagA: leftVideo.tagA,
          tagB: leftVideo.tagB,
          tagC: leftVideo.tagC,
        },
      }}
      rightVideo={{
        id: rightVideo.id,
        url: rightVideo.videoUrl,
        title: rightVideo.title || 'Untitled',
        playerName: rightVideo.user.name || 'Unknown',
        uploadDate: rightVideo.uploadDate,
        score: rightVideo.overallScore || undefined,
        tags: {
          tagA: rightVideo.tagA,
          tagB: rightVideo.tagB,
          tagC: rightVideo.tagC,
        },
      }}
      role={userRole || 'player'}
    />
  );
}
