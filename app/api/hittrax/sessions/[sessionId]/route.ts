/**
 * HitTrax Session Detail API
 * 
 * GET - Fetch a specific HitTrax session with all events and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hittraxSession = await prisma.hitTraxSession.findFirst({
      where: {
        id: params.sessionId,
        userId: session.user.id,
      },
      include: {
        events: {
          orderBy: { rowNumber: 'asc' },
        },
        onTheBallHistory: true,
      },
    });

    if (!hittraxSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: hittraxSession });
  } catch (error: any) {
    console.error('[HitTrax Session Detail Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch session', details: error.message },
      { status: 500 }
    );
  }
}
