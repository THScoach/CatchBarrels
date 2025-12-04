import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { generateGoNoGoScript } from "@/lib/brain/goNoGoScript";

/**
 * POST /api/brain-test/go-no-go/start
 * Start a new Go/No-Go brain test session
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

    // Generate test script with 40 trials
    const script = generateGoNoGoScript(40);

    // Create database session
    const dbSession = await prisma.brainTestSession.create({
      data: {
        userId: session.user.id,
        type: "GO_NO_GO",
      },
    });

    return NextResponse.json({
      sessionId: dbSession.id,
      script,
    });
  } catch (err) {
    console.error("start brain test error", err);
    return NextResponse.json(
      { error: "Failed to start brain test" },
      { status: 500 }
    );
  }
}
