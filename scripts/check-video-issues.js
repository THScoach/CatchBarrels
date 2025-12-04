const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVideoIssues() {
  try {
    console.log('\n=== Video Loading Issues Diagnostic ===\n');
    
    // Check for videos with PENDING skeleton status
    const pendingVideos = await prisma.video.findMany({
      where: {
        skeletonStatus: 'PENDING'
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        originalUrl: true,
        source: true,
        uploadDate: true,
        skeletonStatus: true,
        fps: true,
        user: {
          select: {
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      },
      take: 5
    });

    console.log('📊 Recent Videos Awaiting Analysis:\n');
    
    if (pendingVideos.length === 0) {
      console.log('No pending videos found.\n');
    } else {
      pendingVideos.forEach((video, index) => {
        console.log(`${index + 1}. Video ID: ${video.id}`);
        console.log(`   Title: ${video.title || 'Untitled'}`);
        console.log(`   User: ${video.user?.email || video.user?.username}`);
        console.log(`   Source: ${video.source}`);
        console.log(`   Upload Date: ${video.uploadDate}`);
        console.log(`   FPS: ${video.fps || 'N/A'}`);
        const urlType = video.videoUrl && video.videoUrl.includes('amazonaws.com') 
          ? 'S3 (uploaded)' 
          : video.originalUrl ? 'External (OnForm link)' : 'Unknown';
        console.log(`   Video URL Type: ${urlType}`);
        const urlPreview = video.videoUrl 
          ? (video.videoUrl.length > 80 ? video.videoUrl.substring(0, 80) + '...' : video.videoUrl) 
          : 'N/A';
        console.log(`   Video URL: ${urlPreview}`);
        console.log(`   Status: ${video.skeletonStatus}`);
        console.log('');
      });
    }

    // Check for failed extractions
    const failedVideos = await prisma.video.findMany({
      where: {
        skeletonStatus: 'FAILED'
      },
      select: {
        id: true,
        title: true,
        skeletonErrorMessage: true,
        uploadDate: true,
        source: true
      },
      orderBy: {
        uploadDate: 'desc'
      },
      take: 5
    });

    console.log('❌ Recent Failed Extractions:\n');
    
    if (failedVideos.length === 0) {
      console.log('No failed extractions found.\n');
    } else {
      failedVideos.forEach((video, index) => {
        console.log(`${index + 1}. Video ID: ${video.id}`);
        console.log(`   Title: ${video.title || 'Untitled'}`);
        console.log(`   Source: ${video.source}`);
        console.log(`   Error: ${video.skeletonErrorMessage || 'No error message'}`);
        console.log(`   Date: ${video.uploadDate}`);
        console.log('');
      });
    }

    // Check for OnForm videos (external links)
    const onformVideos = await prisma.video.findMany({
      where: {
        source: 'onform'
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        originalUrl: true,
        skeletonStatus: true
      },
      take: 3
    });

    console.log('🔗 OnForm Link Imports:\n');
    
    if (onformVideos.length === 0) {
      console.log('No OnForm link imports found.\n');
    } else {
      onformVideos.forEach((video, index) => {
        console.log(`${index + 1}. Video ID: ${video.id}`);
        console.log(`   Title: ${video.title || 'Untitled'}`);
        const isExternal = video.originalUrl ? 'Yes (OnForm)' : 'No (Uploaded file)';
        console.log(`   Is External Link: ${isExternal}`);
        console.log(`   Video URL: ${video.videoUrl ? 'Present' : 'Missing'}`);
        console.log(`   Status: ${video.skeletonStatus}`);
        console.log('');
      });
    }

    // Summary
    const statusCounts = await prisma.video.groupBy({
      by: ['skeletonStatus'],
      _count: true
    });

    console.log('\n📈 Status Summary:\n');
    statusCounts.forEach(status => {
      console.log(`- ${status.skeletonStatus}: ${status._count}`);
    });

    // Check for videos with missing video URLs
    const missingUrls = await prisma.video.count({
      where: {
        videoUrl: null
      }
    });

    console.log(`\n⚠️  Videos Missing Video URL: ${missingUrls}`);
    
    // Check total video count
    const totalVideos = await prisma.video.count();
    console.log(`\n📊 Total Videos in Database: ${totalVideos}`);

  } catch (error) {
    console.error('\n❌ Error checking videos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideoIssues();
