
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drills = await prisma.drill.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ drills });
  } catch (error) {
    console.error('Drills fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drills' },
      { status: 500 }
    );
  }
}
