import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { analyzeSwing } from '@/lib/swing-analyzer';
import { generateAssessmentReport } from '@/lib/assessment-report-generator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/assessments/sessions/[sessionId]/run
 * Run assessment - process all swings and generate report
 * This is the ONE-CLICK button that coaches use!
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { processingMode = 'sequential' } = await req.json();
  const { sessionId } = params;

  console.log(`[Run Assessment] Starting for session ${sessionId}, mode: ${processingMode}`);

  try {
    // Verify session ownership
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        swings: {
          include: {
            video: {
              select: {
                id: true,
                skeletonData: true,
                impactFrame: true,
                fps: true,
                cameraAngle: true,
              },
            },
          },
        },
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (assessmentSession.swings.length === 0) {
      return NextResponse.json(
        { error: 'No swings attached to session' },
        { status: 400 }
      );
    }

    // Update session status
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'processing',
        processedSwings: 0,
        successfulSwings: 0,
        failedSwings: 0,
      },
    });

    // Process swings in background (no await - fire and forget)
    processSwingsInBackground(sessionId, assessmentSession.swings, processingMode);

    return NextResponse.json({
      status: 'processing',
      totalSwings: assessmentSession.swings.length,
      processedSwings: 0,
      estimatedTimeSeconds: assessmentSession.swings.length * 30, // 30s per swing estimate
    });
  } catch (error: any) {
    console.error('[Run Assessment] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start assessment', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessments/sessions/[sessionId]/run
 * Get assessment progress
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assessmentSession = await prisma.assessmentSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
      select: {
        status: true,
        totalSwings: true,
        processedSwings: true,
        successfulSwings: true,
        failedSwings: true,
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: assessmentSession.status,
      totalSwings: assessmentSession.totalSwings,
      processedSwings: assessmentSession.processedSwings,
      successfulSwings: assessmentSession.successfulSwings,
      failedSwings: assessmentSession.failedSwings,
    });
  } catch (error: any) {
    console.error('[Run Assessment] Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get assessment progress', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Background processing function
 * Processes swings sequentially to avoid system overload
 */
async function processSwingsInBackground(
  sessionId: string,
  swings: any[],
  mode: string
) {
  console.log(`[Background Processing] Starting for ${swings.length} swings`);

  for (const swing of swings) {
    try {
      console.log(`[Background Processing] Analyzing swing ${swing.swingNumber} (${swing.id})`);

      // Update swing status
      await prisma.swingAnalysis.update({
        where: { id: swing.id },
        data: { analysisStatus: 'processing' },
      });

      // Check if video has skeleton data
      if (!swing.video?.skeletonData) {
        throw new Error('No skeleton data available - video must be analyzed first');
      }

      // Analyze swing (extract metrics)
      console.log(`[Background Processing] Running analyzer...`);
      const analysis = await analyzeSwing(swing);

      // Save metrics
      await prisma.swingMetrics.create({
        data: {
          swingId: swing.id,
          ...analysis.metrics,
        },
      });

      // Save joint series if available
      if (analysis.joints) {
        await prisma.swingJointSeries.create({
          data: {
            swingId: swing.id,
            frames: analysis.joints,
            cameraAngle: swing.video?.cameraAngle,
            fps: swing.video?.fps,
            normalizedFps: 60,
            impactFrame: analysis.impactFrame,
            qualityScore: analysis.metrics.confidence,
            framesExtracted: analysis.joints.length,
          },
        });
      }

      // Mark swing as complete
      await prisma.swingAnalysis.update({
        where: { id: swing.id },
        data: {
          analyzed: true,
          analysisStatus: 'completed',
        },
      });

      // Update session progress
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          processedSwings: { increment: 1 },
          successfulSwings: { increment: 1 },
        },
      });

      console.log(`[Background Processing] Swing ${swing.swingNumber} completed successfully`);
    } catch (error: any) {
      console.error(`[Background Processing] Failed to analyze swing ${swing.id}:`, error);

      // Mark swing as failed
      await prisma.swingAnalysis.update({
        where: { id: swing.id },
        data: {
          analysisStatus: 'failed',
          errorMessage: error.message,
        },
      });

      // Update session
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          processedSwings: { increment: 1 },
          failedSwings: { increment: 1 },
        },
      });
    }
  }

  // Generate report after all swings processed
  console.log(`[Background Processing] All swings processed, generating report...`);
  try {
    await generateAssessmentReport(sessionId);

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        processedAt: new Date(),
      },
    });

    console.log(`[Background Processing] Assessment completed successfully`);
  } catch (error: any) {
    console.error(`[Background Processing] Failed to generate report for session ${sessionId}:`, error);

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'error',
      },
    });
  }
}
