// app/api/assessments/52-pitch/[sessionId]/swing/route.ts
// Log a swing in a 52 Pitch Flow Assessment
// Version: 1.0
// Date: November 26, 2025

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const body = await req.json();
    const { index } = body as { index: number };

    if (!sessionId || !index) {
      return NextResponse.json(
        { error: 'Session ID and swing index are required' },
        { status: 400 }
      );
    }

    // TODO: Verify that the session exists and belongs to the user
    // const assessmentSession = await prisma.timingAssessmentSession.findUnique({
    //   where: { id: sessionId },
    // });
    // if (!assessmentSession) {
    //   return NextResponse.json(
    //     { error: 'Assessment session not found' },
    //     { status: 404 }
    //   );
    // }

    // TODO: Log the swing
    // This could be:
    // 1. Updating a counter in the assessment session
    // 2. Creating a new SwingRecord entry
    // 3. Triggering video analysis if video is uploaded
    // For now, we'll just acknowledge the swing

    console.log(`Logged swing ${index} for session ${sessionId}`);

    return NextResponse.json({
      sessionId,
      swingIndex: index,
      logged: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging swing:', error);
    return NextResponse.json(
      { error: 'Failed to log swing' },
      { status: 500 }
    );
  }
}
