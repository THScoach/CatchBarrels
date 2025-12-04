import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

/**
 * POST /api/brain-test/go-no-go/trial
 * Log a single trial result during the test
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
    const {
      sessionId,
      index,
      stimulus,
      response,
      isCorrect,
      reactionMs,
    } = body as {
      sessionId: string;
      index: number;
      stimulus: any;
      response: any;
      isCorrect: boolean;
      reactionMs?: number | null;
    };

    // Verify session belongs to user
    const dbSession = await prisma.brainTestSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!dbSession || dbSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Create trial record
    await prisma.brainTestTrial.create({
      data: {
        sessionId,
        index,
        stimulus,
        response,
        isCorrect,
        reactionMs: reactionMs ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("log brain test trial error", err);
    return NextResponse.json(
      { error: "Failed to log trial" },
      { status: 500 }
    );
  }
}
