import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VideoListClient } from './video-list-client';

export default async function VideoListPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const videos = await prisma.video.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { uploadDate: 'desc' },
  });

  return <VideoListClient videos={videos} />;
}
