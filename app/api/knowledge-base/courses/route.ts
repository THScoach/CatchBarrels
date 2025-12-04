
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Get all courses
 * GET /api/knowledge-base/courses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility'); // 'athlete', 'admin', or null for all
    const category = searchParams.get('category');
    const includeModules = searchParams.get('includeModules') === 'true';

    const where: any = {
      published: true,
    };

    // Filter by visibility
    if (visibility) {
      where.visibility = visibility;
    }
    // If no visibility filter is provided, show all courses
    // This allows the admin panel to see everything

    // Filter by category
    if (category) {
      where.category = category;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        modules: includeModules
          ? {
              include: {
                lessons: {
                  include: {
                    assets: true,
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            }
          : false,
        tags: true,
      },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
