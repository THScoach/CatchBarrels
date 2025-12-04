import { NextRequest, NextResponse } from "next/server";
import { getAllModelSwings } from "@/lib/joints/loadModelSwing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/model-swings
 * Get all available model swings
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const modelSwings = await getAllModelSwings();
    
    return NextResponse.json({ modelSwings });
  } catch (err) {
    console.error("get model-swings error", err);
    return NextResponse.json(
      { error: "Failed to fetch model swings" },
      { status: 500 }
    );
  }
}
