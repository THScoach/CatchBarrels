/**
 * Per-Player Import API (WO-IMPORT-01)
 * POST /api/players/[id]/imports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { processPerPlayerImport } from '@/lib/import/service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const playerId = params.id;
    const userId = (session.user as any)?.id;

    console.log('[Import API] Per-player import request', { playerId, userId });

    // Parse form data
    const formData = await request.formData();
    const files: File[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(`[Import API] Processing ${files.length} files for player ${playerId}`);

    // Process import
    const summary = await processPerPlayerImport(playerId, userId, files);

    return NextResponse.json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error('[Import API] Error:', error);
    return NextResponse.json(
      {
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
