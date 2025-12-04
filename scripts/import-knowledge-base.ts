
import { PrismaClient } from '@prisma/client';
import { importScrapedContent, classifyContent } from '../lib/membership-scraper';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), '..', '..', 'barrels_knowledge_base_sample.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const courses = JSON.parse(jsonData);

    console.log(`📚 Importing ${courses.length} courses...`);

    // Auto-classify content
    for (const course of courses) {
      const classification = classifyContent(course.title, course.description);
      course.visibility = classification.visibility;
      course.contentType = classification.contentType;
      console.log(`  - ${course.title}: ${classification.visibility} (${classification.contentType})`);
    }

    // Import the content
    const results = await importScrapedContent(courses, {
      visibility: courses[0]?.visibility || 'athlete',
      contentType: courses[0]?.contentType || 'training',
    });

    console.log('\n✅ Import completed successfully!');
    console.log(`   - Courses imported: ${results.coursesImported}`);
    console.log(`   - Modules imported: ${results.modulesImported}`);
    console.log(`   - Lessons imported: ${results.lessonsImported}`);
    console.log(`   - Assets imported: ${results.assetsImported}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors during import:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
