import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: {
      OR: [
        { category: 'Strength & Conditioning' },
        { title: { contains: 'Strength' } }
      ]
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              assets: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    console.log('No Strength & Conditioning course found.');
    return;
  }

  console.log('\n💪 Strength & Conditioning Content:\n');
  console.log(`Course: ${course.title}`);
  console.log(`Category: ${course.category}`);
  console.log(`Description: ${course.description?.substring(0, 100)}...\n`);
  
  course.modules.forEach((module, i) => {
    console.log(`Module ${i + 1}: ${module.title} (${module.lessons.length} lessons)`);
    module.lessons.forEach((lesson, j) => {
      console.log(`  Lesson ${j + 1}: ${lesson.title}`);
      if (lesson.assets.length > 0) {
        console.log(`    Assets: ${lesson.assets.length}`);
        lesson.assets.forEach(asset => {
          console.log(`      - ${asset.mimeType}: ${asset.fileUrl?.substring(0, 50)}...`);
        });
      }
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
