
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, scores } = body;

    // Call LLM API for coaching feedback
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Coach Rick, an expert baseball hitting coach. Provide personalized, actionable feedback based on the 4Bs swing analysis (Body metrics: Anchor, Engine, Whip). Use simple language that athletes can understand. Be encouraging but specific about what to improve.',
          },
          {
            role: 'user',
            content: `Analyze this swing with the following scores: Anchor (Lower Body): ${scores?.anchor || 0}, Engine (Trunk/Core): ${scores?.engine || 0}, Whip (Arms & Bat): ${scores?.whip || 0}. Overall: ${scores?.overallScore || 0}. Exit Velocity: ${scores?.exitVelocity || 0} mph. Provide 2-3 specific coaching points focusing on the weakest area.`,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const feedback = data?.choices?.[0]?.message?.content || 'Great swing! Keep practicing.';

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Coach feedback error:', error);
    return NextResponse.json(
      { feedback: 'Keep working on your mechanics. Practice makes perfect!' },
      { status: 200 }
    );
  }
}
