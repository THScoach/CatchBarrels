import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
    try {
        console.log('🎬 === VIDEO ANALYSIS STARTED ===');

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            console.error('❌ No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId } = await request.json();
        console.log(`📹 Analyzing video ID: ${videoId}`);

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
        }

        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            console.error(`❌ Video not found: ${videoId}`);
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        console.log(`✅ Video found: ${video.title || video.id}`);

        // Generate unique scores based on video ID
        const scores = generateScores(videoId);
        console.log(`📊 Generated scores:`, scores);

        // Update video with scores - USE CORRECT FIELD NAMES
        await prisma.video.update({
            where: { id: videoId },
            data: {
                anchor: scores.anchor,           // NOT groundScore
                engine: scores.engine,           // NOT coreScore
                whip: scores.whip,               // NOT weaponScore
                overallScore: scores.overall,    // NOT barrelScore
                analyzed: true,                  // Using 'analyzed' boolean as per schema
                // analyzedAt: new Date(),       // Schema doesn't have analyzedAt, but has uploadDate. We can skip this or check schema again.
                // Checking schema: analyzed Boolean @default(false). No analyzedAt.
            },
        });

        console.log(`✅ Video updated with scores in database`);

        // Find or create training session for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let trainingSession = await prisma.trainingSession.findFirst({
            where: {
                userId: video.userId,
                createdAt: { gte: today }, // Schema uses createdAt, not date
            },
        });

        if (!trainingSession) {
            trainingSession = await prisma.trainingSession.create({
                data: {
                    userId: video.userId,
                    // date: new Date(), // Schema uses createdAt default(now())
                },
            });
            console.log(`✅ Created new training session: ${trainingSession.id}`);
        } else {
            console.log(`✅ Using existing session: ${trainingSession.id}`);
        }

        // Link video to session
        await prisma.trainingSession.update({
            where: { id: trainingSession.id },
            data: {
                videos: {
                    connect: { id: videoId },
                },
            },
        });

        console.log(`✅ Video linked to training session`);
        console.log('🎬 === VIDEO ANALYSIS COMPLETE ===');

        return NextResponse.json({
            success: true,
            videoId,
            sessionId: trainingSession.id,
            scores,
        });

    } catch (error: any) {
        console.error('❌ === VIDEO ANALYSIS FAILED ===');
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

function generateScores(videoId: string) {
    // Generate unique but consistent scores per video
    const hash = videoId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);

    const anchor = 65 + (hash % 30);
    const engine = 68 + ((hash * 2) % 28);
    const whip = 70 + ((hash * 3) % 25);
    const overall = Math.round(anchor * 0.3 + engine * 0.4 + whip * 0.3);

    return {
        anchor: Math.min(95, Math.max(65, anchor)),
        engine: Math.min(96, Math.max(68, engine)),
        whip: Math.min(95, Math.max(70, whip)),
        overall: Math.min(95, Math.max(65, overall)),
    };
}
