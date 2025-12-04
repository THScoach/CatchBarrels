/**
 * HitTrax Sessions API
 * 
 * GET - List all HitTrax sessions for the authenticated user
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.hitTraxSession.findMany({
      where: { userId: session.user.id },
      include: {
        onTheBallHistory: true,
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('[HitTrax Sessions Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
}
