/**
 * On-The-Ball History API
 * 
 * GET - Fetch player's On-The-Ball history (from both assessments and HitTrax)
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

    const history = await prisma.playerOnTheBallHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { sessionDate: 'desc' },
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('[On-The-Ball History Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', details: error.message },
      { status: 500 }
    );
  }
}
