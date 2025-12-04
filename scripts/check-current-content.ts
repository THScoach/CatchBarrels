import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      _count: {
        select: {
          modules: true
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  console.log('\n📚 Current Knowledge Base Content:\n');
  console.log(`Total Courses: ${courses.length}\n`);
  
  // Group by category
  const byCategory: Record<string, any[]> = {};
  courses.forEach(course => {
    const cat = course.category || 'GENERAL';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(course);
  });
  
  Object.keys(byCategory).sort().forEach(category => {
    console.log(`\n${category} (${byCategory[category].length} courses):`);
    byCategory[category].forEach(course => {
      console.log(`  - ${course.title} (${course._count.modules} modules)`);
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
