import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📚 Checking current lesson library...\n');

  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true
        }
      }
    },
    orderBy: { title: 'asc' }
  });

  console.log(`Total Courses: ${courses.length}\n`);

  for (const course of courses) {
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    console.log(`📖 ${course.title}`);
    console.log(`   Category: ${course.category || 'General'}`);
    console.log(`   Modules: ${course.modules.length}`);
    console.log(`   Lessons: ${lessonCount}`);
    
    // Show first few lesson titles
    const allLessons = course.modules.flatMap(m => m.lessons);
    if (allLessons.length > 0) {
      console.log(`   Sample lessons:`);
      allLessons.slice(0, 3).forEach(l => {
        console.log(`     - ${l.title}`);
      });
    }
    console.log('');
  }

  // Summary
  const totalModules = courses.reduce((sum, c) => sum + c.modules.length, 0);
  const totalLessons = courses.reduce((sum, c) => 
    sum + c.modules.reduce((mSum, m) => mSum + m.lessons.length, 0), 0
  );

  console.log(`\n📊 Summary:`);
  console.log(`   ${courses.length} courses`);
  console.log(`   ${totalModules} modules`);
  console.log(`   ${totalLessons} lessons`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
