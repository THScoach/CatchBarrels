
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Search coaching call transcripts for relevant content
 * Returns matching sessions with highlighted excerpts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit = 3 } = await request.json();

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        results: [],
        message: 'Query must be at least 3 characters' 
      });
    }

    // Search for coaching calls with transcripts containing the query
    const coachingCalls = await prisma.coachingCall.findMany({
      where: {
        transcript: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        callDate: 'desc',
      },
      take: limit,
    });

    // Extract relevant excerpts from transcripts
    const results = coachingCalls.map((call) => {
      const transcript = call.transcript || '';
      const queryLower = query.toLowerCase();
      const transcriptLower = transcript.toLowerCase();
      
      // Find all occurrences
      const matches: Array<{ excerpt: string; position: number }> = [];
      let index = transcriptLower.indexOf(queryLower);
      
      while (index !== -1 && matches.length < 3) {
        // Extract context around the match (150 chars before and after)
        const start = Math.max(0, index - 150);
        const end = Math.min(transcript.length, index + query.length + 150);
        
        let excerpt = transcript.substring(start, end);
        
        // Add ellipsis if not at start/end
        if (start > 0) excerpt = '...' + excerpt;
        if (end < transcript.length) excerpt = excerpt + '...';
        
        matches.push({ excerpt, position: index });
        
        // Find next occurrence
        index = transcriptLower.indexOf(queryLower, index + 1);
      }
      
      return {
        id: call.id,
        title: call.title,
        callDate: call.callDate,
        zoomLink: call.zoomLink,
        topics: call.topics,
        excerpts: matches.map(m => m.excerpt),
        matchCount: matches.length,
      };
    });

    return NextResponse.json({
      results,
      totalMatches: results.reduce((sum, r) => sum + r.matchCount, 0),
      query,
    });

  } catch (error) {
    console.error('Transcript search error:', error);
    return NextResponse.json(
      { error: 'Failed to search transcripts' },
      { status: 500 }
    );
  }
}
