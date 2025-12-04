import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

// POST /api/lessons/[id]/complete - Mark lesson as completed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the lesson with all videos
    const lesson = await prisma.playerLesson.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        videos: {
          select: {
            overallScore: true,
            anchor: true,
            engine: true,
            whip: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Calculate averages from videos
    const videos = lesson.videos.filter(
      (v: any) => v.overallScore !== null && v.anchor !== null && v.engine !== null && v.whip !== null
    );

    let lessonBarrelScore = null;
    let lessonAnchorScore = null;
    let lessonEngineScore = null;
    let lessonWhipScore = null;

    if (videos.length > 0) {
      lessonBarrelScore =
        videos.reduce((sum: number, v: any) => sum + (v.overallScore || 0), 0) / videos.length;
      lessonAnchorScore =
        videos.reduce((sum: number, v: any) => sum + (v.anchor || 0), 0) / videos.length;
      lessonEngineScore =
        videos.reduce((sum: number, v: any) => sum + (v.engine || 0), 0) / videos.length;
      lessonWhipScore =
        videos.reduce((sum: number, v: any) => sum + (v.whip || 0), 0) / videos.length;
    }

    // Generate coaching recommendation based on lowest score
    let coachRecommendation = null;
    if (lessonAnchorScore !== null && lessonEngineScore !== null && lessonWhipScore !== null) {
      const lowestScore = Math.min(lessonAnchorScore, lessonEngineScore, lessonWhipScore);
      if (lowestScore === lessonAnchorScore) {
        coachRecommendation =
          "Your Anchor is your biggest limiter right now. Focus on keeping your head and trail leg stable longer before you rotate. Work on maintaining balance and connection to the ground.";
      } else if (lowestScore === lessonEngineScore) {
        coachRecommendation =
          "Your Engine needs attention. Focus on your hip and shoulder sequencing - hips should lead, shoulders follow. Work on creating separation and maintaining connection through your core.";
      } else {
        coachRecommendation =
          "Your Whip needs work. Focus on barrel direction and late hand acceleration. Work on keeping your hands inside the ball and creating proper bat path through the zone.";
      }
    }

    // Update lesson with calculated averages and mark as complete
    const updatedLesson = await prisma.playerLesson.update({
      where: {
        id: params.id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        lessonBarrelScore,
        lessonAnchorScore,
        lessonEngineScore,
        lessonWhipScore,
        coachRecommendation,
        swingCount: lesson.videos.length,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
