import { NextRequest, NextResponse } from "next/server";
import { loadModelSwing } from "@/lib/joints/loadModelSwing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/model-swings/[id]
 * Get a specific model swing by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const modelId = params.id;
    const jointData = await loadModelSwing(modelId);
    
    if (!jointData) {
      return NextResponse.json(
        { error: "Model swing not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ jointData });
  } catch (err) {
    console.error("get model-swing error", err);
    return NextResponse.json(
      { error: "Failed to fetch model swing" },
      { status: 500 }
    );
  }
}
