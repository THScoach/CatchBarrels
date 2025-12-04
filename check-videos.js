const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVideos() {
  try {
    const videos = await prisma.video.findMany({
      where: { analyzed: true },
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        title: true,
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
        analyzed: true,
        uploadDate: true
      }
    });
    
    console.log(`Total analyzed videos: ${videos.length}`);
    console.log('\nVideo details:');
    videos.forEach((v, i) => {
      console.log(`${i+1}. ${v.title} - Score: ${v.overallScore} (${v.analyzed ? 'Analyzed' : 'Pending'})`);
    });
    
    if (videos.length < 2) {
      console.log('\n⚠️  You need at least 2 analyzed videos to see progress arrows!');
    } else {
      console.log('\n✅ You have enough videos - arrows should be visible');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideos();
