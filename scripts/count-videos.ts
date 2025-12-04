import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videoCount = await prisma.video.count();
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      title: true,
      uploadDate: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      uploadDate: 'desc'
    }
  });

  console.log(`\n📊 Total Videos: ${videoCount}\n`);
  
  if (videos.length > 0) {
    console.log('Videos in database:');
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} - Uploaded by ${video.user.name || video.user.email} on ${video.uploadDate.toLocaleDateString()}`);
    });
  } else {
    console.log('No videos uploaded yet.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
