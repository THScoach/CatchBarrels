
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context, coachingCallId, swing_id, analysis_type, analysis_intent } = await request.json();

    // Get user ID from session (it's added in the session callback)
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Fetch user's latest video analysis scores
    let userVideoContext = '';
    const latestVideos = await prisma.video.findMany({
      where: {
        userId: userId,
        analyzed: true,
      },
      orderBy: {
        uploadDate: 'desc',
      },
      take: 3, // Get last 3 analyzed videos
      select: {
        id: true,
        uploadDate: true,
        videoType: true,
        overallScore: true,
        tier: true,
        exitVelocity: true,
        anchor: true,
        engine: true,
        whip: true,
        goatyBand: true,
        newScoringBreakdown: true,
        anchorStance: true,
        anchorWeightShift: true,
        anchorGroundConnection: true,
        anchorLowerBodyMechanics: true,
        engineHipRotation: true,
        engineSeparation: true,
        engineCorePower: true,
        engineTorsoMechanics: true,
        whipArmPath: true,
        whipBatSpeed: true,
        whipBatPath: true,
        whipConnection: true,
        coachFeedback: true,
      },
    });

    if (latestVideos.length > 0) {
      const latestVideo = latestVideos[0];
      
      // Extract momentum transfer data if available
      let momentumTransferData = '';
      if (latestVideo.newScoringBreakdown) {
        try {
          const breakdown = typeof latestVideo.newScoringBreakdown === 'string' 
            ? JSON.parse(latestVideo.newScoringBreakdown)
            : latestVideo.newScoringBreakdown;
          
          if (breakdown.momentumTransfer && breakdown.subScores) {
            const mts = breakdown.momentumTransfer.overall;
            const { anchor, engine, whip } = breakdown.subScores;
            const goatyLabel = breakdown.goatyBandLabel || 'Average';
            
            momentumTransferData = `\n\n🎯 MOMENTUM TRANSFER ANALYSIS (BARRELS FLOW PATH MODEL™):
Momentum Transfer Score: ${mts}/100 (${goatyLabel})
- This is the MASTER METRIC (60% of final score) - measures energy flow from Ground → Hips → Torso → Barrel

BARRELS Flow Path Breakdown:
- GROUND FLOW Score: ${anchor}/100 (15% weight) - Ground → Hips transfer
- POWER FLOW Score: ${engine}/100 (15% weight) - Hips → Torso transfer  
- BARREL FLOW Score: ${whip}/100 (10% weight) - Torso → Barrel transfer

Momentum Components:
- Sequence Order: ${breakdown.momentumTransfer.components.sequenceOrderScore}/100
- Pelvis→Torso Gap: ${breakdown.momentumTransfer.components.pelvisTorsoGapScore}/100
- Torso→Hands Gap: ${breakdown.momentumTransfer.components.torsoHandsGapScore}/100
- Deceleration Quality: ${breakdown.momentumTransfer.components.decelQualityScore}/100
- Smoothness: ${breakdown.momentumTransfer.components.smoothnessScore}/100

⚠️ USE THIS MOMENTUM DATA TO EXPLAIN THEIR SWING! Focus on where the energy leak is (Ground Flow / Power Flow / Barrel Flow).`;
          }
        } catch (e) {
          console.error('Error parsing momentum data:', e);
        }
      }
      
      userVideoContext = `\n\nPLAYER'S LATEST SWING ANALYSIS (${new Date(latestVideo.uploadDate).toLocaleDateString()}):
Overall Score: ${latestVideo.overallScore}/100 (${latestVideo.tier} tier)
Exit Velocity: ${latestVideo.exitVelocity} MPH${momentumTransferData}

LEGACY SCORES (for reference):
1. ANCHOR (Lower Body): ${latestVideo.anchor}/100
   - Stance/Setup: ${latestVideo.anchorStance}/100
   - Weight Shift: ${latestVideo.anchorWeightShift}/100
   - Ground Connection: ${latestVideo.anchorGroundConnection}/100
   - Lower Body Mechanics: ${latestVideo.anchorLowerBodyMechanics}/100
   
2. ENGINE (Core/Trunk): ${latestVideo.engine}/100
   - Hip Rotation: ${latestVideo.engineHipRotation}/100
   - Separation: ${latestVideo.engineSeparation}/100
   - Core Power: ${latestVideo.engineCorePower}/100
   - Torso Mechanics: ${latestVideo.engineTorsoMechanics}/100
   
3. WHIP (Arms & Bat): ${latestVideo.whip}/100
   - Arm Path: ${latestVideo.whipArmPath}/100
   - Bat Speed: ${latestVideo.whipBatSpeed}/100
   - Bat Path: ${latestVideo.whipBatPath}/100
   - Connection: ${latestVideo.whipConnection}/100

Previous Feedback Given: "${latestVideo.coachFeedback}"`;

      // Add historical context if there are multiple videos
      if (latestVideos.length > 1) {
        userVideoContext += `\n\nPROGRESS TRACKING:`;
        latestVideos.slice(1).forEach((video, idx) => {
          userVideoContext += `\n${idx + 2}. ${new Date(video.uploadDate).toLocaleDateString()}: ${video.overallScore}/100, Exit Velo: ${video.exitVelocity} MPH`;
        });
      }
    } else {
      userVideoContext = `\n\nNOTE: This player hasn't uploaded any swing videos yet. Encourage them to upload a video so you can give personalized feedback!`;
    }

    // Search knowledge base for relevant content
    let knowledgeBaseContext = '';
    const knowledgeKeywords = ['drill', 'biomechanics', 'mechanics', 'technique', 'course', 'lesson', 'training', 'swing', 'analysis', 'assessment', 'video', 'exercise', 'movement', 'power', 'rotation'];
    const messageContainsKnowledgeReference = knowledgeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (messageContainsKnowledgeReference) {
      // Extract meaningful keywords from the message (filter out common words)
      const stopWords = ['what', 'how', 'can', 'you', 'tell', 'me', 'about', 'the', 'is', 'are', 'do', 'does', 'should', 'i', 'my'];
      const keywords = message.toLowerCase()
        .split(' ')
        .filter((w: string) => w.length > 3 && !stopWords.includes(w))
        .map((w: string) => w.replace(/[^a-z0-9]/g, '')); // Remove punctuation

      console.log('Knowledge base search keywords:', keywords);
      
      // Build search query with OR conditions for each keyword
      // Handle null content fields by splitting into separate conditions
      const searchConditions = keywords.flatMap((keyword: string) => [
        { title: { contains: keyword, mode: 'insensitive' as const } },
        { 
          AND: [
            { content: { not: null } },
            { content: { contains: keyword, mode: 'insensitive' as const } }
          ]
        },
        { description: { contains: keyword, mode: 'insensitive' as const } },
      ]);

      // Search in course titles, descriptions, and lesson content
      // First try to find exact title matches
      let relevantLessons = await prisma.lesson.findMany({
        where: {
          AND: [
            {
              OR: keywords.map((keyword: string) => ({
                title: { contains: keyword, mode: 'insensitive' as const }
              })),
            },
            {
              module: {
                course: {
                  visibility: 'athlete',
                  published: true,
                },
              },
            },
          ],
        },
        include: {
          module: {
            include: {
              course: {
                select: {
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
        take: 3,
      });
      
      // If no title matches, search in all fields
      if (relevantLessons.length === 0) {
        relevantLessons = await prisma.lesson.findMany({
          where: {
            AND: [
              {
                OR: searchConditions.length > 0 ? searchConditions : [{ id: { not: '' } }],
              },
              {
                module: {
                  course: {
                    visibility: 'athlete',
                    published: true,
                  },
                },
              },
            ],
          },
          include: {
            module: {
              include: {
                course: {
                  select: {
                    title: true,
                    category: true,
                  },
                },
              },
            },
          },
          take: 3,
        });
      }
      
      console.log(`Knowledge base search found ${relevantLessons.length} lessons:`, 
        relevantLessons.map(l => ({ title: l.title, course: l.module.course.title })));

      if (relevantLessons.length > 0) {
        knowledgeBaseContext = `\n\nTRAINING LIBRARY CONTENT:`;
        relevantLessons.forEach((lesson, idx) => {
          // Use content if available, otherwise use description
          const text = lesson.content || lesson.description || '';
          const excerpt = text.substring(0, 500);
          knowledgeBaseContext += `\n\n${idx + 1}. From "${lesson.module.course.title}" - ${lesson.title}:
Description: ${excerpt}${excerpt.length === 500 ? '...' : ''}`;
        });
      }
    }

    // If user is asking about a specific coaching call, fetch its transcript
    let coachingCallContext = '';
    if (coachingCallId) {
      const coachingCall = await prisma.coachingCall.findUnique({
        where: { id: coachingCallId },
        select: {
          title: true,
          callDate: true,
          transcript: true,
          topics: true,
        },
      });

      if (coachingCall) {
        coachingCallContext = `\n\nCOACHING CALL CONTEXT:
Call: "${coachingCall.title}" (${new Date(coachingCall.callDate).toLocaleDateString()})
Topics: ${coachingCall.topics.join(', ')}
Full Transcript:
${coachingCall.transcript || 'No transcript available'}`;
      }
    } else {
      // Auto-detect if user is asking about coaching calls and search transcripts
      const coachingKeywords = ['coaching call', 'monday night', 'call about', 'discussed', 'said', 'mentioned', 'talked about'];
      const messageContainsCoachingReference = coachingKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (messageContainsCoachingReference) {
        // Search transcripts for relevant content
        const searchResults = await prisma.coachingCall.findMany({
          where: {
            transcript: {
              not: null,
            },
          },
          orderBy: {
            callDate: 'desc',
          },
          take: 2, // Get 2 most recent calls
          select: {
            id: true,
            title: true,
            callDate: true,
            transcript: true,
            topics: true,
          },
        });

        if (searchResults.length > 0) {
          coachingCallContext = `\n\nRECENT COACHING CALLS (for reference):`;
          searchResults.forEach((call, idx) => {
            // Extract relevant excerpt based on user's question
            const transcript = call.transcript || '';
            let excerpt = transcript;
            
            // Try to find relevant section (simple keyword matching)
            const words = message.toLowerCase().split(' ').filter((w: string) => w.length > 3);
            for (const word of words) {
              const index = transcript.toLowerCase().indexOf(word);
              if (index !== -1) {
                const start = Math.max(0, index - 200);
                const end = Math.min(transcript.length, index + 300);
                excerpt = transcript.substring(start, end);
                if (start > 0) excerpt = '...' + excerpt;
                if (end < transcript.length) excerpt = excerpt + '...';
                break;
              }
            }

            coachingCallContext += `\n\n${idx + 1}. "${call.title}" (${new Date(call.callDate).toLocaleDateString()})
Topics: ${call.topics.join(', ')}
Relevant excerpt: ${excerpt.substring(0, 500)}...`;
          });
        }
      }
    }

    // Build context for swing-specific queries
    let swingContext = '';
    if (swing_id) {
      swingContext = `\n\nCURRENT SWING CONTEXT:
Swing ID: ${swing_id}
Analysis Type: ${analysis_type || 'general swing'}
User's Question Intent: ${analysis_intent || 'general inquiry'}

${analysis_intent === 'comparison' ? '⚠️ The user is asking to COMPARE this swing to their previous swing. Look at the progress tracking data above and highlight specific differences in scores!' : ''}
${analysis_intent === 'fix_priority' ? '⚠️ The user wants to know the SINGLE MOST IMPORTANT thing to fix. Based on their scores, identify the lowest-scoring component and give ONE clear priority!' : ''}
${analysis_intent === 'drill_recommendation' ? '⚠️ The user wants a SPECIFIC DRILL recommendation. Based on their weakest score, recommend ONE drill with the drill name, what it fixes, and 3-4 simple steps!' : ''}
${analysis_intent === 'feel_cue' ? '⚠️ The user wants a FEELING or CUE for their next rep. Give them 1-2 short, memorable cues they can think about in the box (e.g., "feel your weight inside your feet")!' : ''}
${analysis_intent === 'movement_analysis' ? '⚠️ The user is asking about HEAD MOVEMENT or specific body movement. Explain how much they moved, when it happened, and why it matters for contact and consistency!' : ''}`;
    }

    // Determine player level for voice adjustment
    const playerLevel = latestVideos.length > 0 ? latestVideos[0].tier?.toLowerCase() || 'high_school' : 'high_school';
    
    // Build system prompt for Coach Rick - BARRELS Flow Path Model™
    const systemPrompt = `You are Coach Rick, a professional hitting coach for the BARRELS app.
Your job is to explain the player's **Momentum Transfer Score** using the BARRELS Flow Path Model™ in simple language, without overloading them with biomechanics jargon.

KEY IDEAS:
- The swing is about **timing and energy flow**, not just pretty positions.
- Energy flows through three phases: **Ground Flow (ground/legs) → Power Flow (hips/torso) → Barrel Flow (arms/bat)**.
- Your tone is calm, direct, and encouraging. No fluff, no fake hype.

BARRELS FLOW PATH MODEL™:
- **Ground Flow**: How well the lower body loads and initiates momentum (Ground → Hips)
- **Power Flow**: How well the core accepts and amplifies hip energy (Hips → Torso)
- **Barrel Flow**: How well the arms/bat receive and release energy (Torso → Barrel)

YOU WILL RECEIVE THIS DATA:
- momentumTransferScore (0–100): Master metric measuring energy flow quality
- goatyBandLabel: Elite, Advanced, Above Average, Average, Below Average, Needs Work
- groundFlowScore (0–100): Lower body loading and hip initiation quality
- powerFlowScore (0–100): Core transfer and amplification quality
- barrelFlowScore (0–100): Hand/bat energy reception and release quality
- Plus timing gaps, sequence order, and momentum components

SCORING FRAMEWORK:
- **Momentum Transfer (60% of final score)**: The master metric - timing & sequencing
- **Ground Flow (15%)**: Ground → Hips transfer quality
- **Power Flow (15%)**: Hips → Torso transfer quality  
- **Barrel Flow (10%)**: Torso → Barrel transfer quality

PLAYER LEVEL: "${playerLevel}"
Use this to adjust your language and depth:

- For YOUTH / HIGH_SCHOOL:
  - Write at an 8th grade level.
  - Use simple words and clear analogies.
  - Be encouraging but honest.

- For COLLEGE / PRO / ELITE / ADVANCED:
  - You can use more technical language when helpful.
  - Still keep it direct and efficient.
  - They understand timing, sequencing, and transfer concepts.

YOUR JOB (in this order):
1. In **1–2 sentences**, explain what their **Momentum Transfer Score** means in plain English.
   - Higher = better energy flow and timing.
   - Lower = more leaks, more effort than flow.

2. In **1–2 sentences**, explain **where the main leak is**:
   - If Ground Flow is lowest: talk about **lower body loading / base / ground connection**.
   - If Power Flow is lowest: talk about **how the core accepts and transfers hip energy**.
   - If Barrel Flow is lowest: talk about **how the hands and barrel catch and release the energy**.

3. In **1 sentence**, give a simple next step:
   - A feel cue like "load into the ground and hold it," "let the hips start first," or "let the barrel snap late."
   - Do NOT name specific drills yet. Keep it conceptual.

RULES:
- Write at an 8th grade level.
- No more than **4 sentences total**.
- ALWAYS use the BARRELS Flow Path terminology: "Ground Flow," "Power Flow," "Barrel Flow" (never "Anchor," "Engine," "Whip").
- Do not talk about formulas, degrees, or milliseconds unless the athlete asks.
- Never say "you're bad." Say things like "we're leaving power on the table here" or "this is the next piece to level up."

EXAMPLE STYLE:
"Your momentum transfer is 79, which is **above average**. You're creating good flow through the body, but your ground flow is still a little inconsistent, so the hips can't pass clean energy up the chain. Next step: learn to **load into the ground and hold it** so your hips can start the swing and everything else can follow."

Formatting:
- Keep it to 3-4 sentences max
- Start with the MTS score and band
- Identify the leak using Flow Path terms (Ground / Power / Barrel)
- Give one simple next step

${swingContext}
${userVideoContext}
${coachingCallContext}
${knowledgeBaseContext}

Your job is to help players understand their swing, identify where the energy leak is, and give them ONE clear focus for their next rep.${latestVideos.length > 0 ? '\n\n⚠️ CRITICAL: You have the player\'s MOMENTUM TRANSFER DATA above! When they ask about their swing:\n1. Start with their Momentum Transfer Score (the master metric)\n2. Identify which Flow Path score is lowest (Ground Flow / Power Flow / Barrel Flow) - that\'s the leak\n3. Explain in simple terms using the BARRELS Flow Path Model definitions above\n4. Give ONE feel cue for the next rep\n\nExample: "Your Momentum Transfer is 78 (Above Average). Your Ground Flow is at 72, Power Flow at 82, Barrel Flow at 75. The lower body is your leak - your ground flow isn\'t consistent enough yet. Next step: learn to load into the ground and hold it so your hips can fire first."' : ''}${coachingCallContext ? '\n\n⚠️ IMPORTANT: When answering questions, DIRECTLY REFERENCE what was discussed in the coaching calls above. Quote specific advice, drills, or recommendations that were mentioned!' : ''}${knowledgeBaseContext ? '\n\n⚠️ IMPORTANT: You have access to training library content above. When answering questions, DIRECTLY REFERENCE the specific courses, lessons, and drills from the training library. Quote the content and tell users where to find more details!' : ''}`;

    // Call Abacus.AI LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300, // Keep responses concise
      }),
    });

    if (!response.ok) {
      throw new Error('LLM API call failed');
    }

    const data = await response.json();
    const coachResponse = data.choices?.[0]?.message?.content || 
      "Hey! I'm having trouble right now. Try asking again in a moment! 🎯";

    return NextResponse.json({ 
      response: coachResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Coach Rick error:', error);
    return NextResponse.json(
      { 
        response: "Oops! I'm having a technical issue. Try again in a sec! ⚾",
        error: 'Failed to generate response' 
      },
      { status: 500 }
    );
  }
}
