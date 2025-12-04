import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getPageHelpConfigById, HelpPageId } from '@/lib/help/pageHelpConfig';

/**
 * POST /api/help/page-help
 * 
 * Context-aware page help powered by Coach Rick AI
 * Provides smart, contextual guidance based on the current page and user data
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        ok: false,
        error: 'Please log in to get help' 
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { pageId, userQuestion, contextData = {} } = body as {
      pageId: HelpPageId;
      userQuestion?: string;
      contextData?: Record<string, any>;
    };

    if (!pageId) {
      return NextResponse.json({
        ok: false,
        error: 'pageId is required'
      }, { status: 400 });
    }

    // Get page configuration
    const pageConfig = getPageHelpConfigById(pageId);
    
    if (!pageConfig) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid pageId'
      }, { status: 400 });
    }

    // Build context for Coach Rick
    const userRole = (session.user as any)?.isCoach ? 'coach' : 'athlete';
    const userName = session.user?.name || 'there';

    // Build system prompt based on audience
    const systemPrompt = buildSystemPrompt({
      pageConfig,
      userRole,
      userName,
      contextData,
    });

    // Build user prompt
    const userPrompt = userQuestion || `Help me understand what I should do on this page.`;

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
        max_tokens: 600,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.status}`);
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices?.[0]?.message?.content || 'I\'m having trouble right now. Please try again.';

    return NextResponse.json({
      ok: true,
      answer,
      pageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Page help error:', error);
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to get help. Please try again.' 
      },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt for Coach Rick based on page context
 */
function buildSystemPrompt(params: {
  pageConfig: any;
  userRole: 'athlete' | 'coach';
  userName: string;
  contextData: Record<string, any>;
}): string {
  const { pageConfig, userRole, userName, contextData } = params;

  // Base context
  let prompt = `You are Coach Rick, helping ${userName} understand the "${pageConfig.title}" page in the CatchBarrels app.

PAGE CONTEXT:
- Route: ${pageConfig.routePattern}
- Description: ${pageConfig.shortDescription}
- Primary audience: ${pageConfig.primaryAudience}
- User role: ${userRole}

KEY THINGS USERS DO ON THIS PAGE:
${pageConfig.keyActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}
`;

  // Add contextData if available
  if (Object.keys(contextData).length > 0) {
    prompt += `\nSESSION DATA:\n`;
    
    if (contextData.momentumTransferScore !== undefined) {
      prompt += `- Momentum Transfer Score: ${contextData.momentumTransferScore}\n`;
    }
    if (contextData.weakestFlowPath) {
      prompt += `- Weakest area: ${contextData.weakestFlowPath}\n`;
    }
    if (contextData.strongestFlowPath) {
      prompt += `- Strongest area: ${contextData.strongestFlowPath}\n`;
    }
    if (contextData.sessionId) {
      prompt += `- Session ID: ${contextData.sessionId}\n`;
    }
    if (contextData.playerName) {
      prompt += `- Player: ${contextData.playerName}\n`;
    }
  }

  // Tone guidance based on audience
  if (userRole === 'athlete' || pageConfig.primaryAudience === 'athlete') {
    prompt += `\nTONE:
- Use kid-friendly, calm, encouraging language
- Break down complex concepts into simple steps
- Focus on "what to do next" and "why it matters"
- Keep it short (3-4 paragraphs max)
- Use analogies if helpful
`;
  } else {
    prompt += `\nTONE:
- Use coach-facing language and strategy talk
- Be technical but concise
- Focus on "what to watch for" and "how to prioritize"
- Keep it tactical (3-4 paragraphs max)
- Assume they understand biomechanics basics
`;
  }

  prompt += `\nYOUR TASK:
Explain what this page does and what they should focus on right now. Be specific, actionable, and encouraging.`;

  return prompt;
}
