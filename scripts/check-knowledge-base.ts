
import { prisma } from '../lib/db';

async function main() {
  console.log('Checking knowledge base content...\n');

  // Check for Cooper Scott lesson
  const cooperLessons = await prisma.lesson.findMany({
    where: {
      OR: [
        { title: { contains: 'Cooper', mode: 'insensitive' } },
        { content: { contains: 'Cooper', mode: 'insensitive' } },
      ],
    },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  console.log(`Found ${cooperLessons.length} lessons containing "Cooper"`);
  cooperLessons.forEach((lesson, idx) => {
    console.log(`\n${idx + 1}. Course: "${lesson.module.course.title}"`);
    console.log(`   Lesson: "${lesson.title}"`);
    console.log(`   Content: ${lesson.content?.substring(0, 150)}...`);
  });

  // Check all courses
  const allCourses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  console.log(`\n\nTotal courses: ${allCourses.length}`);
  allCourses.forEach(course => {
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    console.log(`- ${course.title}: ${course.modules.length} modules, ${lessonCount} lessons`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
