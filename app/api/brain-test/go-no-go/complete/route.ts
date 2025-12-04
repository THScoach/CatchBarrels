import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { summarizeGoNoGo } from "@/lib/brain/goNoGoScript";
import type { BrainTestTrialData } from "@/lib/brain/types";

/**
 * POST /api/brain-test/go-no-go/complete
 * Complete a brain test session and calculate summary scores
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId } = body as { sessionId: string };

    // Fetch session with all trials
    const dbSession = await prisma.brainTestSession.findUnique({
      where: { id: sessionId },
      include: { trials: true },
    });

    if (!dbSession || dbSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Transform trials for scoring
    const trials: BrainTestTrialData[] = dbSession.trials.map(t => {
      const stimulus = t.stimulus as any;
      return {
        isCorrect: t.isCorrect,
        reactionMs: t.reactionMs,
        isSwingPitch: stimulus.isSwingPitch,
      };
    });

    // Calculate summary
    const summary = summarizeGoNoGo(trials);

    // Update session with completion time and summary
    await prisma.brainTestSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        summaryJson: summary as any,
      },
    });

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("complete brain test error", err);
    return NextResponse.json(
      { error: "Failed to complete brain test" },
      { status: 500 }
    );
  }
}
