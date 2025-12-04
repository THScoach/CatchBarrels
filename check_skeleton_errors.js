const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkErrors() {
  try {
    const failedVideos = await prisma.video.findMany({
      where: {
        skeletonStatus: 'FAILED'
      },
      select: {
        id: true,
        title: true,
        skeletonStatus: true,
        skeletonErrorMessage: true,
        uploadDate: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      },
      take: 10
    });

    console.log('\n=== Failed Skeleton Extractions ===\n');
    
    if (failedVideos.length === 0) {
      console.log('No failed extractions found.');
    } else {
      failedVideos.forEach((video, index) => {
        console.log(`${index + 1}. Video ID: ${video.id}`);
        console.log(`   Title: ${video.title || 'Untitled'}`);
        console.log(`   User: ${video.user?.email || video.user?.username}`);
        console.log(`   Upload Date: ${video.uploadDate}`);
        console.log(`   Error: ${video.skeletonErrorMessage || 'No error message'}`);
        console.log('');
      });
    }

    // Also check pending/running
    const pendingCount = await prisma.video.count({
      where: { skeletonStatus: 'PENDING' }
    });
    const runningCount = await prisma.video.count({
      where: { skeletonStatus: 'RUNNING' }
    });

    console.log(`\nStatus Summary:`);
    console.log(`- PENDING: ${pendingCount}`);
    console.log(`- RUNNING: ${runningCount}`);
    console.log(`- FAILED: ${failedVideos.length}`);

  } catch (error) {
    console.error('Error checking skeleton status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkErrors();
