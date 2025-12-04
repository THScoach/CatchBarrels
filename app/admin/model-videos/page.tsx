
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { ModelVideosAdminClient } from './model-videos-admin-client';

export default async function ModelVideosAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch existing model videos
  const modelVideos = await prisma.modelVideo.findMany({
    orderBy: [
      { handedness: 'asc' },
      { uploadDate: 'desc' }
    ]
  });

  return <ModelVideosAdminClient initialModelVideos={modelVideos} />;
}
