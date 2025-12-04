import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courseUpdates = [
    {
      title: "Problem-Solving & Adjustments",
      thumbnail: "https://i.ytimg.com/vi/1xpWZdVjhD0/maxresdefault.jpg"
    },
    {
      title: "Power Development & Exit Velocity",
      thumbnail: "https://i.ytimg.com/vi/wjrMFcukpKA/maxresdefault.jpg"
    },
    {
      title: "Pitch Recognition & Approach",
      thumbnail: "https://i.ytimg.com/vi/uaVJAPxoQko/maxresdefault.jpg"
    },
    {
      title: "Advanced Swing Sequencing",
      thumbnail: "https://i.ytimg.com/vi/6jfzS-Z4i_g/maxresdefault.jpg"
    },
    {
      title: "Upper Body & Bat Path Development",
      thumbnail: "https://i.ytimg.com/vi/Fu1pV_uIJMI/maxresdefault.jpg"
    },
    {
      title: "Lower Body Power & Stability",
      thumbnail: "https://i.ytimg.com/vi/2PWC0vdbEh8/maxresdefault.jpg"
    },
    {
      title: "Swing Foundations & Mechanics",
      thumbnail: "https://i.ytimg.com/vi/PupHGjhpm3s/maxresdefault.jpg"
    }
  ];

  let updated = 0;

  for (const update of courseUpdates) {
    await prisma.course.updateMany({
      where: { title: update.title },
      data: { thumbnail: update.thumbnail }
    });
    updated++;
    console.log(`✅ Updated: ${update.title}`);
  }

  console.log(`\n🎉 Updated ${updated} course thumbnails!`);
}

main()
  .catch((e) => {
    console.error('Error during update:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
