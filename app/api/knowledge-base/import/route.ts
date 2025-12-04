
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { importScrapedContent, classifyContent, type ScrapedCourse } from '@/lib/membership-scraper';

export const dynamic = 'force-dynamic';

/**
 * Import scraped content from membership.io
 * POST /api/knowledge-base/import
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check
    // For now, any authenticated user can import (you'll want to add role checking)

    const { courses, autoClassify = true } = await request.json();

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { error: 'Invalid request: courses array required' },
        { status: 400 }
      );
    }

    // Auto-classify content if requested
    if (autoClassify) {
      for (const course of courses) {
        const classification = classifyContent(
          course.title,
          course.description
        );
        course.visibility = classification.visibility;
        course.contentType = classification.contentType;
      }
    }

    // Import the content
    const results = await importScrapedContent(courses, {
      visibility: courses[0]?.visibility || 'athlete',
      contentType: courses[0]?.contentType || 'training',
    });

    return NextResponse.json({
      success: true,
      results,
      message: `Imported ${results.coursesImported} courses, ${results.modulesImported} modules, ${results.lessonsImported} lessons, ${results.assetsImported} assets`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Failed to import content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
