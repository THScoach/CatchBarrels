import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function testSearch() {
  const keywords = ['launch', 'angle', 'ladder', 'drill'];
  
  const searchConditions = keywords.flatMap((keyword: string) => [
    { title: { contains: keyword, mode: 'insensitive' as const } },
    { 
      AND: [
        { content: { not: null } },
        { content: { contains: keyword, mode: 'insensitive' as const } }
      ]
    },
    { description: { contains: keyword, mode: 'insensitive' as const } },
  ]);

  const lessons = await prisma.lesson.findMany({
    where: {
      AND: [
        {
          OR: searchConditions,
        },
        {
          module: {
            course: {
              visibility: 'athlete',
              published: true,
            },
          },
        },
      ],
    },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
    take: 10,
  });

  console.log(`Found ${lessons.length} lessons:`);
  lessons.forEach((l, i) => {
    console.log(`${i + 1}. "${l.title}" from "${l.module.course.title}"`);
  });
  
  await prisma.$disconnect();
}

testSearch().catch(console.error);
