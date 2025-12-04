import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function testSearch() {
  const lessons = await prisma.lesson.findMany({
    where: {
      OR: [
        { title: { contains: 'launch', mode: 'insensitive' } },
        { description: { contains: 'launch', mode: 'insensitive' } },
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

  console.log(`Found ${lessons.length} lessons with "launch":`);
  lessons.forEach((l, i) => {
    console.log(`${i + 1}. "${l.title}" from "${l.module.course.title}"`);
    console.log(`   Visibility: ${l.module.course.visibility}, Published: ${l.module.course.published}`);
  });
  
  await prisma.$disconnect();
}

testSearch().catch(console.error);
