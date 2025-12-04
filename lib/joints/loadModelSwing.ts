import { prisma } from "@/lib/db";
import type { JointDataPayload } from "@/lib/joints/types";

/**
 * Load model swing joint data from database
 * @param modelId - The ID of the model swing to load
 * @returns Joint data payload or null if not found
 */
export async function loadModelSwing(modelId: string): Promise<JointDataPayload | null> {
  const model = await prisma.modelSwing.findUnique({
    where: { id: modelId },
  });
  
  if (!model) return null;
  
  return model.jointData as any as JointDataPayload;
}

/**
 * Get all available model swings
 * @returns Array of model swings with basic info
 */
export async function getAllModelSwings() {
  return await prisma.modelSwing.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      hitterName: true,
      handedness: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
