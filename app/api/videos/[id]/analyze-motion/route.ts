import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeVideoWithPose } from "@/lib/joints/analyzeVideo";
import type { JointDataPayload } from "@/lib/joints/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(
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

    const videoId = params.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Verify user owns this video
    if (video.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Call native pose pipeline (currently returns mock data)
    const jointData: JointDataPayload = await analyzeVideoWithPose(video.videoUrl);

    // Update video with joint data
    await prisma.video.update({
      where: { id: videoId },
      data: {
        jointData: jointData as any, // Cast to satisfy Prisma Json type
        jointAnalyzed: true,
        jointAnalysisDate: new Date(),
        jointAnalysisSource: "mediapipe", // or "native" for now
      },
    });

    return NextResponse.json({ success: true, jointData });
  } catch (err) {
    console.error("analyze-motion error", err);
    return NextResponse.json(
      { error: "Failed to analyze motion" },
      { status: 500 }
    );
  }
}
