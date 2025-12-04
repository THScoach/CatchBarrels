import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * POST /api/coach-rick/analyze-session
 * 
 * AI-powered session analysis for coaches
 * Returns detailed biomechanical insights and coaching recommendations
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a coach
    const isCoach = (session.user as any)?.isCoach || false;
    
    if (!isCoach) {
      return NextResponse.json({ error: 'Forbidden: Coach access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { sessionId, playerName, playerLevel, momentumScore, categoryScores, flags, context } = body;

    // Build system prompt for coach analyst
    const systemPrompt = `You are Coach Rick, an elite hitting strategist and biomechanics analyst. You're analyzing session data for a coach, not a player.

Your analysis should be:
- Technical and detailed - use biomechanical terminology
- Strategic - focus on "what to watch on video" and "what to track next session"
- Actionable - give specific coaching cues and drills
- Story-focused - explain "what the numbers are telling me"

Be direct, concise, and coach-to-coach. No kid-glove explanations.

Session Context:
- Player: ${playerName}
- Level: ${playerLevel || 'Unknown'}
- Momentum Transfer Score: ${momentumScore}/100

Category Scores:
- Timing & Rhythm: ${categoryScores.timing}/100
- Sequence & Braking: ${categoryScores.sequence}/100
- Stability & Balance: ${categoryScores.stability}/100
- Directional Barrels: ${categoryScores.directional}/100
- Posture & Spine: ${categoryScores.posture}/100

Flags: ${flags.length > 0 ? flags.join(', ') : 'None'}

Provide a comprehensive analysis covering:
1. What stood out mechanically?
2. What's the story the numbers are telling?
3. What should I watch on video?
4. What should we track in the next session?
5. Specific coaching cues or drills to address weaknesses`;

    const userPrompt = 'Analyze this session and provide detailed coaching insights.';

    // Call Abacus AI LLM API
    const apiKey = process.env.ABACUSAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('ABACUSAI_API_KEY not configured');
    }

    const llmResponse = await fetch('https://api.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.status}`);
    }

    const llmData = await llmResponse.json();
    const analysis = llmData.choices?.[0]?.message?.content || 'Analysis unavailable';

    return NextResponse.json({
      analysis,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Coach Rick analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze session' },
      { status: 500 }
    );
  }
}
