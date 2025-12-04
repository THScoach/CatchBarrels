// app/api/assessments/52-pitch/start/route.ts
// Start a new 52 Pitch Flow Assessment
// Version: 1.0
// Date: November 26, 2025

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import type { DeviceFlags } from '@/types/assessment';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { playerId, devices } = body as {
      playerId: string;
      devices: DeviceFlags;
    };

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // TODO: Verify that playerId exists in your database
    // const player = await prisma.user.findUnique({ where: { id: playerId } });
    // if (!player) {
    //   return NextResponse.json(
    //     { error: 'Player not found' },
    //     { status: 404 }
    //   );
    // }

    // TODO: Create a new assessment session
    // You need to add the AssessmentSession model to your Prisma schema first
    // See docs/52-pitch-assessment-complete.md for schema definition
    //
    // const assessmentSession = await prisma.assessmentSession.create({
    //   data: {
    //     userId: playerId,
    //     sessionType: 'assessment',
    //     assessmentKind: '52_pitch_flow',
    //     swingsPlanned: 52,
    //     swingsCompleted: 0,
    //     useKinetrax: devices.useKinetrax,
    //     useHitTrax: devices.useHitTrax,
    //     useSensor: devices.useSensor,
    //     useNeuralTest: devices.useNeuralTest,
    //   },
    // });
    //
    // For now, return a mock session ID
    const assessmentSession = {
      id: `sess_${Date.now()}_${playerId}`,
    };

    // Return the session ID
    return NextResponse.json({
      sessionId: assessmentSession.id,
      playerId,
      devices,
      swingsPlanned: 52,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to start assessment' },
      { status: 500 }
    );
  }
}
