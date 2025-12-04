
/**
 * Membership.io Content Scraper
 * Extracts courses, modules, and lessons from membership.io platform
 */

import { prisma } from './db';

export interface ScrapedCourse {
  title: string;
  description?: string;
  category?: string;
  modules: ScrapedModule[];
  sourceUrl?: string;
  thumbnail?: string;
}

export interface ScrapedModule {
  title: string;
  description?: string;
  order: number;
  lessons: ScrapedLesson[];
}

export interface ScrapedLesson {
  title: string;
  description?: string;
  content?: string;
  lessonType: 'text' | 'video' | 'pdf' | 'mixed';
  order: number;
  sourceUrl?: string;
  assets: ScrapedAsset[];
}

export interface ScrapedAsset {
  title: string;
  assetType: 'video' | 'pdf' | 'image' | 'document' | 'link';
  fileUrl?: string;
  originalUrl?: string;
  extractedText?: string;
}

/**
 * Import scraped content into the database
 */
export async function importScrapedContent(
  courses: ScrapedCourse[],
  options: {
    visibility?: 'athlete' | 'admin' | 'hidden';
    contentType?: 'training' | 'marketing' | 'operations' | 'other';
  } = {}
) {
  const { visibility = 'athlete', contentType = 'training' } = options;
  
  const importResults = {
    coursesImported: 0,
    modulesImported: 0,
    lessonsImported: 0,
    assetsImported: 0,
    errors: [] as string[],
  };

  for (const courseData of courses) {
    try {
      // Create course
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          sourceUrl: courseData.sourceUrl,
          visibility,
          contentType,
          category: courseData.category,
          importedAt: new Date(),
        },
      });
      
      importResults.coursesImported++;

      // Create modules
      for (const moduleData of courseData.modules) {
        const module = await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            description: moduleData.description,
            order: moduleData.order,
          },
        });
        
        importResults.modulesImported++;

        // Create lessons
        for (const lessonData of moduleData.lessons) {
          const lesson = await prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: lessonData.title,
              description: lessonData.description,
              content: lessonData.content,
              lessonType: lessonData.lessonType,
              order: lessonData.order,
              sourceUrl: lessonData.sourceUrl,
            },
          });
          
          importResults.lessonsImported++;

          // Create assets
          for (const assetData of lessonData.assets) {
            await prisma.contentAsset.create({
              data: {
                lessonId: lesson.id,
                title: assetData.title,
                assetType: assetData.assetType,
                fileUrl: assetData.fileUrl,
                originalUrl: assetData.originalUrl,
                extractedText: assetData.extractedText,
              },
            });
            
            importResults.assetsImported++;
          }
        }
      }
    } catch (error) {
      console.error(`Error importing course "${courseData.title}":`, error);
      importResults.errors.push(
        `Failed to import course "${courseData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return importResults;
}

/**
 * Auto-classify content based on title/description keywords
 */
export function classifyContent(title: string, description?: string): {
  contentType: 'training' | 'marketing' | 'operations' | 'other';
  visibility: 'athlete' | 'admin';
} {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Marketing keywords
  const marketingKeywords = [
    'marketing', 'sales', 'promotion', 'advertising', 'funnel',
    'lead', 'conversion', 'campaign', 'email sequence', 'onboarding sequence',
  ];
  
  // Operations keywords
  const operationsKeywords = [
    'operations', 'admin', 'business', 'finance', 'accounting',
    'legal', 'contract', 'payment', 'billing',
  ];
  
  // Training keywords (athlete-facing)
  const trainingKeywords = [
    'hitting', 'drill', 'swing', 'mechanics', 'technique',
    'training', 'practice', 'exercise', 'workout', 'biomechanics',
    'bat path', 'rotation', 'weight shift', 'mental game',
    'approach', 'strategy', 'pitch recognition',
  ];
  
  // Check for marketing
  if (marketingKeywords.some(keyword => text.includes(keyword))) {
    return { contentType: 'marketing', visibility: 'admin' };
  }
  
  // Check for operations
  if (operationsKeywords.some(keyword => text.includes(keyword))) {
    return { contentType: 'operations', visibility: 'admin' };
  }
  
  // Check for training (athlete-facing)
  if (trainingKeywords.some(keyword => text.includes(keyword))) {
    return { contentType: 'training', visibility: 'athlete' };
  }
  
  // Default to admin-only for safety
  return { contentType: 'other', visibility: 'admin' };
}
