
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import PublicShareClient from './public-share-client';

export default async function PublicSharePage({ params }: { params: { link: string } }) {
  const shareableLink = params.link;

  // Fetch video by shareable link
  const video = await prisma.video.findUnique({
    where: {
      shareableLink
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          level: true,
          position: true,
          bats: true,
          height: true,
          weight: true,
          membershipTier: true
        }
      }
    }
  });

  // Video not found or not public
  if (!video) {
    notFound();
  }

  if (!video.isPublic) {
    notFound();
  }

  // Increment view count
  await prisma.video.update({
    where: { id: video.id },
    data: { views: video.views + 1 }
  });

  return <PublicShareClient video={video} />;
}
