
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { uploadDate: 'desc' },
    });

    // Calculate personal bests for comparison
    const analyzedVideos = videos.filter(v => v.analyzed && v.overallScore !== null);
    const personalBests = {
      overallScore: analyzedVideos.length > 0 ? Math.max(...analyzedVideos.map(v => v.overallScore || 0)) : null,
      anchor: analyzedVideos.length > 0 ? Math.max(...analyzedVideos.map(v => v.anchor || 0)) : null,
      engine: analyzedVideos.length > 0 ? Math.max(...analyzedVideos.map(v => v.engine || 0)) : null,
      whip: analyzedVideos.length > 0 ? Math.max(...analyzedVideos.map(v => v.whip || 0)) : null,
      exitVelocity: analyzedVideos.length > 0 ? Math.max(...analyzedVideos.map(v => v.exitVelocity || 0)) : null,
    };

    // Attach comparison data to each video
    const videosWithProgress = videos.map((video, index) => {
      // Find the previous analyzed video
      const previousVideo = analyzedVideos.find((v, i) => {
        const currentIndex = analyzedVideos.findIndex(av => av.id === video.id);
        return i === currentIndex + 1;
      });

      return {
        ...video,
        previousScores: previousVideo ? {
          overallScore: previousVideo.overallScore,
          anchor: previousVideo.anchor,
          engine: previousVideo.engine,
          whip: previousVideo.whip,
          exitVelocity: previousVideo.exitVelocity,
        } : null,
        personalBests,
      };
    });

    return NextResponse.json({ videos: videosWithProgress });
  } catch (error) {
    console.error('Videos fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Simulate video upload and analysis
    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        title: body?.title || 'New Swing',
        videoUrl: '/videos/mock-swing.mp4',
        thumbnailUrl: '/images/thumbnails/swing-thumb.jpg',
        analyzed: false,
      },
    });

    // Simulate async processing - in real app would be background job
    setTimeout(async () => {
      // Generate main metric scores
      const anchor = 68 + Math.floor(Math.random() * 25);  // Lower Body
      const engine = 75 + Math.floor(Math.random() * 20);  // Trunk/Core
      const whip = 70 + Math.floor(Math.random() * 25);    // Arms & Bat
      
      const overall = Math.round((anchor + engine + whip) / 3);

      const tier =
        overall >= 85
          ? 'Elite'
          : overall >= 75
          ? 'Advanced'
          : overall >= 65
          ? 'Intermediate'
          : 'Developing';

      // Generate subcategory scores (variations around main scores)
      const generateSubScores = (mainScore: number) => ({
        sub1: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
        sub2: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
        sub3: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
        sub4: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
      });

      const anchorSubs = generateSubScores(anchor);
      const engineSubs = generateSubScores(engine);
      const whipSubs = generateSubScores(whip);

      const strongestMetric = [
        { name: 'anchor', score: anchor },
        { name: 'engine', score: engine },
        { name: 'whip', score: whip }
      ].sort((a, b) => b.score - a.score)[0].name;
      
      const metricNames: Record<string, string> = {
        anchor: 'lower body',
        engine: 'trunk rotation',
        whip: 'arms and bat path'
      };

      await prisma.video.update({
        where: { id: video.id },
        data: {
          anchor,
          engine,
          whip,
          overallScore: overall,
          tier,
          // Anchor subcategories
          anchorStance: anchorSubs.sub1,
          anchorWeightShift: anchorSubs.sub2,
          anchorGroundConnection: anchorSubs.sub3,
          anchorLowerBodyMechanics: anchorSubs.sub4,
          // Engine subcategories
          engineHipRotation: engineSubs.sub1,
          engineSeparation: engineSubs.sub2,
          engineCorePower: engineSubs.sub3,
          engineTorsoMechanics: engineSubs.sub4,
          // Whip subcategories
          whipArmPath: whipSubs.sub1,
          whipBatSpeed: whipSubs.sub2,
          whipBatPath: whipSubs.sub3,
          whipConnection: whipSubs.sub4,
          exitVelocity: 80 + Math.floor(Math.random() * 20),
          analyzed: true,
          coachFeedback: `Nice swing! Your ${metricNames[strongestMetric]} is your strongest component. Keep working on consistency across all three areas.`,
        },
      });
    }, 3000);

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
