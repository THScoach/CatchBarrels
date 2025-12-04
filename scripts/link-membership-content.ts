import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates lessons with actual membership.io links
 * This creates a bridge between BARRELS lessons and membership.io videos
 */

async function main() {
  console.log('\n🔗 Linking BARRELS lessons to membership.io content...\n');

  // Get the base URL for The Hitting Skool membership
  const membershipBaseUrl = 'https://app.membership.io/hubs/MPjv75rRXn/content';

  // Update all lessons to include proper instructions and links
  const lessons = await prisma.lesson.findMany({
    include: {
      module: {
        include: {
          course: true
        }
      },
      assets: true
    }
  });

  let updated = 0;

  for (const lesson of lessons) {
    // Create enhanced content with viewing instructions
    const enhancedContent = `
${lesson.content || ''}

---

### 📺 Watch This Lesson

This lesson is part of The Hitting Skool premium content library on membership.io.

**To watch the video:**
1. Log in to your membership.io account at: ${membershipBaseUrl}
2. Navigate to the "${lesson.module.course.title}" course
3. Find the "${lesson.title}" lesson
4. Watch the full video content with all demonstrations and explanations

**What You'll Learn:**
${lesson.description || 'Comprehensive training on this fundamental skill.'}

**Course Category:** ${lesson.module.course.category || 'General'}

---

### 💡 Quick Reference

Use the chat with Coach Rick below to ask questions about this lesson content!
    `.trim();

    // Update the lesson with enhanced content
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        content: enhancedContent,
        sourceUrl: membershipBaseUrl
      }
    });

    // Update associated assets with membership.io link
    for (const asset of lesson.assets) {
      await prisma.contentAsset.update({
        where: { id: asset.id },
        data: {
          originalUrl: membershipBaseUrl,
          fileUrl: membershipBaseUrl
        }
      });
    }

    updated++;
    console.log(`✅ Linked: ${lesson.title}`);
  }

  console.log(`\n🎉 Successfully linked ${updated} lessons to membership.io!\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
