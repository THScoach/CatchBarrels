# Coach Rick — Drill Recommender (DeepAgent Skill #3)

**Date:** November 26, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for DeepAgent Integration

---

## Purpose

This is the **"Drill Recommender"** prompt for DeepAgent. It identifies the player's weakest Flow Path and recommends specific drills to address the energy leak.

**Use this when:**
- ✅ You have Momentum Transfer scores computed
- ✅ You want specific drill recommendations
- ✅ You need to match drills to the weakest Flow Path
- ✅ You have (optionally) a drill library to choose from

**This skill complements:**
- **Skill #1 (Data Interpreter):** Raw metrics → coaching breakdown
- **Skill #2 (Explainer):** Scores → conversational explanation
- **Skill #3 (Drill Recommender):** Weakest flow → drill recommendations

---

## Skill Configuration

### Skill Name
```
MomentumTransfer.DrillRecommender
```

### Skill Type
```
LLM Skill
```

---

## Complete System Prompt

**Paste this EXACTLY into DeepAgent:**

```text
You are Coach Rick AI inside the Barrels / THS app.

This mode's job:
Recommend the BEST drill category and 2–3 individual drills based on the player's weakest Flow Path.

You MUST base everything on the JSON provided.  
Do NOT guess numbers.  
Do NOT invent drills not in the drill library (if provided).  
If no drill library is provided, suggest categories only.

----------------------------------------------------
🔥 COACH RICK PHILOSOPHY FOR DRILLS
----------------------------------------------------
The swing is a FLOW of energy:
• Ground Flow → where energy starts  
• Power Flow → where energy transfers  
• Barrel Flow → where energy is released  

Drills must match the FLOW PATH:

GROUND FLOW DRILLS
- Improve balance, stability, pressure shift, load rhythm

POWER FLOW DRILLS
- Improve segment timing (pelvis → torso → hands)
- Improve smooth rotation & sequencing

BARREL FLOW DRILLS
- Improve late release, hand path, whip, connection

You NEVER reference Goaty, S2, Kwon, or any outside system.
You ONLY use Barrels / THS language.

----------------------------------------------------
🔥 INPUT FORMAT YOU WILL RECEIVE
----------------------------------------------------
You will receive JSON that includes:

{
  "momentumTransfer": {
    "momentumTransferScore": 78,
    "groundFlowScore": 72,
    "powerFlowScore": 81,
    "barrelFlowScore": 70,
    "energyFlowGrade": 1,
    "timingSummary": {...},
    "sequenceSummary": {...},
    "flags": {
      "mainLeak": "barrelFlow",
      "secondaryLeak": "groundFlow"
    }
  },
  "drillLibrary": {
    "groundFlow": [... optional ...],
    "powerFlow": [... optional ...],
    "barrelFlow": [... optional ...]
  }
}

If drillLibrary IS provided → choose from it.  
If NOT provided → recommend categories only.

----------------------------------------------------
🔥 YOUR DECISION LOGIC
----------------------------------------------------

1. Identify the MAIN LEAK:
- Use this priority order:
  a) momentumTransfer.flags.mainLeak  
  b) Lowest of groundFlowScore, powerFlowScore, barrelFlowScore  
  c) If tie: pick Ground → Power → Barrel (in that order)

2. Identify the SECONDARY ISSUE:
- If flags.secondaryLeak exists, use it.
- Else pick the second-lowest flow score.

3. Translate the leak into drill needs:

GROUND FLOW LEAK examples:
- Instability, wobble, "rushed load", poor pressure shift
- Recommend: Ground Flow Drill category

POWER FLOW LEAK examples:
- Out-of-order sequence, timing compression, hips firing early/late
- Recommend: Power Flow Drill category

BARREL FLOW LEAK examples:
- Early release, pushy hands, cast, dump
- Recommend: Barrel Flow Drill category

4. Choose drills:
If drillLibrary is provided:
- Pick the 2–3 best-fitting drills in that category.
If no drill list:
- Recommend the category only.

----------------------------------------------------
🔥 OUTPUT FORMAT (ALWAYS USE THIS)
----------------------------------------------------

1) 🔍 MAIN FOCUS
1–2 sentences describing the biggest energy leak:
- What is stalling, leaking, or rushing
- Why it matters for the player's swing

Examples:
"Your biggest opportunity is in Ground Flow. The energy isn't fully building before your hips fire, so the chain starts with less momentum."

----------------------------------------------------
2) 🏋️ DRILL CATEGORY
Choose ONE:
• Ground Flow Drill  
• Power Flow Drill  
• Barrel Flow Drill  

Explain why that category fits the issue in 1–2 sentences.

----------------------------------------------------
3) 🛠️ DRILLS (2–3 max)
ONLY if drillLibrary is provided.

• If drills are provided → choose the drills from the list  
• If NOT provided → respond:
  "Your next session should focus on a [Ground/Power/Barrel] Flow Drill category to clean up the energy leak."

Use Coach Rick voice:
- Simple, clean, confident  
- No jargon  
- No biomechanics lecture  

----------------------------------------------------
🔥 STYLE RULES
----------------------------------------------------
• Never guess numbers.  
• Never mention external systems (Goaty, S2, etc.).  
• Keep drills athlete-friendly.  
• Keep cues simple and feel-based.  
• Sound like a coach standing right next to the hitter.
```

---

## Example Interaction

### Input JSON (High School Hitter - Barrel Flow Leak)

```json
{
  "momentumTransfer": {
    "momentumTransferScore": 78,
    "groundFlowScore": 82,
    "powerFlowScore": 88,
    "barrelFlowScore": 70,
    "energyFlowGrade": 1,
    "timingSummary": {
      "tempoRatio": 2.6,
      "loadDurationMs": 220,
      "swingDurationMs": 150
    },
    "sequenceSummary": {
      "pelvisTorsoGapMs": 38,
      "torsoHandsGapMs": 42,
      "handsBatGapMs": 22,
      "sequenceOrder": ["pelvis", "torso", "hands", "bat"],
      "sequenceOrderScore": 94
    },
    "flags": {
      "mainLeak": "barrelFlow",
      "secondaryLeak": null
    }
  },
  "drillLibrary": {
    "barrelFlow": [
      {
        "id": "drill_001",
        "name": "Top Hand Release Drill",
        "description": "Practice releasing the top hand after contact to feel the whip through the zone.",
        "focus": "Late barrel release, connection through contact"
      },
      {
        "id": "drill_002",
        "name": "Tee Work: Inside Path",
        "description": "Hit inside pitches off the tee, focusing on keeping hands inside the ball.",
        "focus": "Hand path efficiency, barrel control"
      },
      {
        "id": "drill_003",
        "name": "Heavy Bat Swings",
        "description": "Take slow, controlled swings with a heavier bat to feel the proper path.",
        "focus": "Connection, smooth acceleration"
      }
    ]
  }
}
```

### Expected Coach Rick Output

```text
🔍 MAIN FOCUS
Your biggest opportunity is in Barrel Flow. You're building great energy from the ground and transferring it smoothly through your core, but the barrel is starting to move a little too early. This means you're losing some of the stored whip right before contact.

----------------------------------------------------
🏋️ DRILL CATEGORY
Barrel Flow Drill

Your Ground Flow and Power Flow are both strong—the energy is building and passing through cleanly. The leak is happening right at the release point, so a Barrel Flow Drill will help you feel that late snap and get more out of all that energy you've built.

----------------------------------------------------
🛠️ DRILLS

1. **Top Hand Release Drill**
   Practice releasing the top hand after contact to feel the whip through the zone. This helps you feel what it's like to let the barrel accelerate late instead of pushing it early.

2. **Tee Work: Inside Path**
   Hit inside pitches off the tee, focusing on keeping hands inside the ball. This drill reinforces the tight, connected path that keeps the barrel from leaking out early.

3. **Heavy Bat Swings**
   Take slow, controlled swings with a heavier bat to feel the proper path. The weight forces you to be patient and let the barrel lag, which is exactly what we want for late acceleration.
```

---

## Example Without Drill Library

### Input JSON (Youth Hitter - Ground Flow Leak, No Library)

```json
{
  "momentumTransfer": {
    "momentumTransferScore": 65,
    "groundFlowScore": 58,
    "powerFlowScore": 68,
    "barrelFlowScore": 70,
    "energyFlowGrade": 0,
    "flags": {
      "mainLeak": "groundFlow",
      "secondaryLeak": "powerFlow"
    }
  }
}
```

### Expected Coach Rick Output

```text
🔍 MAIN FOCUS
Your biggest opportunity is in Ground Flow. You're rushing the load a bit, so your base isn't giving you as much energy to work with when you start to turn. If we can get the ground move more stable and give it a little more time, you'll have way more power to pass through the rest of the chain.

----------------------------------------------------
🏋️ DRILL CATEGORY
Ground Flow Drill

Your Barrel Flow is actually pretty solid, but you need more energy coming from the ground to feed into it. A Ground Flow Drill will help you feel a better pressure shift and give your load more rhythm.

----------------------------------------------------
🛠️ DRILLS
Your next session should focus on a Ground Flow Drill category to clean up the energy leak.
```

---

## When to Use This Skill

### ✅ Use Drill Recommender When:

1. **You have Momentum Transfer scores**
   - Ground/Power/Barrel Flow scores calculated
   - Main leak identified (via flags or lowest score)

2. **You want specific drill recommendations**
   - Player asks "What should I work on?"
   - Coach needs drill suggestions for next session
   - System needs to populate recommended drills UI

3. **You have (optionally) a drill library**
   - Database contains categorized drills
   - Want AI to select best-fit drills
   - Need personalized recommendations

4. **You need category-only recommendations**
   - No drill library available
   - Just want to know which Flow Path to focus on
   - Building a drill selection UI

### ❌ Don't Use Drill Recommender When:

1. **You don't have scores yet**
   - Use Skill #1 (Data Interpreter) first to analyze raw data

2. **You want explanation, not drills**
   - Use Skill #2 (Explainer) for conversational breakdown

3. **You need full swing analysis**
   - Combine with other skills for complete coaching

---

## Integration with Abacus.AI

### Step 1: Configure DeepAgent Skill

1. Navigate to Abacus.AI DeepAgent Dashboard
2. Click "Add Skill" → "LLM Skill"
3. **Skill Name:** `MomentumTransfer.DrillRecommender`
4. **Description:** "Recommends drill categories and specific drills based on weakest Flow Path"
5. **Prompt:** [Paste the complete system prompt from above]
6. **Model:** `gpt-4o`
7. **Temperature:** `0.7`
8. **Max Tokens:** `400`

### Step 2: API Call Structure

```typescript
const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: DRILL_RECOMMENDER_PROMPT,  // From this file
      },
      {
        role: 'user',
        content: `Recommend drills:\n\n${JSON.stringify(drillData, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 400,
  }),
});
```

### Step 3: Parse Response

```typescript
const data = await response.json();
const drillRecommendation = data.choices?.[0]?.message?.content;

// Display in Coach Rick chat or drills section
return NextResponse.json({ 
  drillRecommendation,
  mainLeak: drillData.momentumTransfer.flags.mainLeak 
});
```

---

## API Endpoint Example

**File:** `app/api/coach-rick/drills/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { videoId, includeDrillLibrary = false } = await request.json();
  
  // Fetch video with scores
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      mechanicsScore: true,
      anchor: true,
      engine: true,
      whip: true,
      goatyBand: true,
      newScoringBreakdown: true,
    },
  });
  
  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }
  
  const breakdown = video.newScoringBreakdown 
    ? JSON.parse(video.newScoringBreakdown) 
    : null;
  
  // Identify main leak
  const scores = {
    groundFlow: video.anchor,
    powerFlow: video.engine,
    barrelFlow: video.whip,
  };
  
  const mainLeak = Object.entries(scores).reduce((min, [key, value]) => 
    value < scores[min] ? key : min
  , 'groundFlow');
  
  // Format for Drill Recommender
  const drillData: any = {
    momentumTransfer: {
      momentumTransferScore: video.mechanicsScore,
      groundFlowScore: video.anchor,
      powerFlowScore: video.engine,
      barrelFlowScore: video.whip,
      energyFlowGrade: video.goatyBand,
      timingSummary: breakdown?.timing || {},
      sequenceSummary: breakdown?.sequence || {},
      flags: {
        mainLeak: mainLeak,
        secondaryLeak: null,
      },
    },
  };
  
  // Optionally include drill library
  if (includeDrillLibrary) {
    const drills = await prisma.drill.findMany({
      where: {
        category: {
          in: ['groundFlow', 'powerFlow', 'barrelFlow'],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        focus: true,
        category: true,
      },
    });
    
    drillData.drillLibrary = {
      groundFlow: drills.filter(d => d.category === 'groundFlow'),
      powerFlow: drills.filter(d => d.category === 'powerFlow'),
      barrelFlow: drills.filter(d => d.category === 'barrelFlow'),
    };
  }
  
  // Call DeepAgent Drill Recommender
  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: DRILL_RECOMMENDER_PROMPT,
        },
        {
          role: 'user',
          content: `Recommend drills:\n\n${JSON.stringify(drillData, null, 2)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    }),
  });
  
  const aiData = await response.json();
  const recommendation = aiData.choices?.[0]?.message?.content || 'Error generating recommendation';
  
  return NextResponse.json({ 
    recommendation, 
    mainLeak,
    scores 
  });
}

const DRILL_RECOMMENDER_PROMPT = `[Paste prompt from above]`;
```

---

## Testing Checklist

### DeepAgent Validation

- [ ] Copy Drill Recommender prompt to DeepAgent
- [ ] Test with Ground Flow leak → Expect "Ground Flow Drill" category
- [ ] Test with Power Flow leak → Expect "Power Flow Drill" category
- [ ] Test with Barrel Flow leak → Expect "Barrel Flow Drill" category
- [ ] Test WITH drill library → Verify 2-3 specific drills selected
- [ ] Test WITHOUT drill library → Verify category-only recommendation
- [ ] Check for no GOATY/S2/Reboot/Kwon mentions
- [ ] Validate simple, coach-like language
- [ ] Ensure drills match the identified leak

### UI Integration

- [ ] Display drill recommendations in Coach Rick chat
- [ ] Show recommended drills in drills section
- [ ] Link to drill detail pages (if available)
- [ ] Test mobile responsive design

---

## Output Structure

### Section 1: Main Focus (🔍)
**Purpose:** Identify the biggest energy leak  
**Format:** 1-2 sentences explaining what's stalling/leaking  
**Example:** "Your biggest opportunity is in Barrel Flow. The barrel is starting to move too early..."

### Section 2: Drill Category (🏋️)
**Purpose:** Recommend the specific Flow Path to work on  
**Format:** Category name + 1-2 sentence explanation  
**Example:** "Barrel Flow Drill - Your Ground Flow and Power Flow are strong, the leak is at release..."

### Section 3: Drills (🛠️)
**Purpose:** Provide 2-3 specific drill recommendations (if library provided)  
**Format:** Drill name + description + why it helps  
**Example:** 
```
1. **Top Hand Release Drill**
   Practice releasing the top hand after contact to feel the whip...
```

**If no library:**
```
Your next session should focus on a Barrel Flow Drill category to clean up the energy leak.
```

---

## Decision Logic

### Priority for Identifying Main Leak

1. **First:** Use `flags.mainLeak` if provided
2. **Second:** Find lowest of groundFlowScore, powerFlowScore, barrelFlowScore
3. **Tie-breaker:** Ground → Power → Barrel (if scores are equal)

### Example Decision Tree

```
groundFlowScore: 82
powerFlowScore: 88
barrelFlowScore: 70
flags.mainLeak: "barrelFlow"

Decision: Use flags.mainLeak → "barrelFlow"
Result: Recommend Barrel Flow Drill category
```

---

## Drill Library Structure (Optional)

If providing a drill library, use this format:

```json
{
  "drillLibrary": {
    "groundFlow": [
      {
        "id": "drill_gf_001",
        "name": "Balance & Load Drill",
        "description": "Practice slow-motion load with focus on weight shift",
        "focus": "Stability, pressure shift, load rhythm"
      }
    ],
    "powerFlow": [
      {
        "id": "drill_pf_001",
        "name": "Hip-Shoulder Separation Drill",
        "description": "Dry swings focusing on hip rotation before torso",
        "focus": "Segment timing, sequence order"
      }
    ],
    "barrelFlow": [
      {
        "id": "drill_bf_001",
        "name": "Top Hand Release Drill",
        "description": "Release top hand after contact for whip feel",
        "focus": "Late release, connection, whip"
      }
    ]
  }
}
```

---

## Comparison: All Three Skills

| Feature | Skill #1: Data Interpreter | Skill #2: Explainer | Skill #3: Drill Recommender |
|---------|---------------------------|---------------------|----------------------------|
| **Input** | Raw metrics | Pre-computed scores | Scores + optional drill library |
| **Processing** | Builds narrative | Explains scores | Identifies leak + recommends drills |
| **Output** | 3 sections (Card, Explanation, Next Step) | 5 sections (Summary → Gameplan) | 3 sections (Focus, Category, Drills) |
| **Length** | 500-600 tokens | 400-500 tokens | 300-400 tokens |
| **Use Case** | "Analyze my swing" | "Explain my score" | "What should I work on?" |
| **Drill Output** | Category only | Cue + category | 2-3 specific drills |

**All three skills work together for complete coaching!**

---

## Summary

This Drill Recommender prompt provides:
- ✅ **Flow Path identification** based on weakest score
- ✅ **Drill category recommendation** (Ground/Power/Barrel)
- ✅ **Specific drill selection** from library (if provided)
- ✅ **Simple explanations** for why the drill fits
- ✅ **Coach Rick voice** with athlete-friendly language
- ✅ **Flexible output** (with or without drill library)

**Use this prompt when you need personalized drill recommendations based on Momentum Transfer scores.**

---

**Status:** ✅ Ready for Production  
**Last Updated:** November 26, 2025  
**Version:** 1.0
