# Momentum Transfer System — Complete Package ✅

**Date:** November 26, 2025  
**Version:** 5.0 (Final)  
**Status:** 🎯 Production Ready

---

## 📦 What This Package Includes

This is the **complete Momentum Transfer scoring and coaching system** for the BARRELS app, ready for production deployment and DeepAgent integration.

### Core Components

1. **JSON Schema & Types** — Complete data structure specification
2. **Mock Data** — 5 realistic swing examples for testing
3. **DeepAgent Skills** — Five complementary AI skills for complete coaching
4. **UI Copy** — All text strings for consistent branding
5. **Integration Guide** — Step-by-step implementation roadmap

---

## 📚 Documentation Files

### 1. Momentum Transfer Scoring Specification
**File:** `momentum-transfer-scoring.md`  
**Size:** Comprehensive (15+ pages)

**Contents:**
- Complete TypeScript interfaces
- Detailed submetrics for Ground/Power/Barrel Flow
- Score interpretation tables
- Data quality thresholds
- 3 complete JSON examples (Pro, Youth, HS)
- API response formats
- Backward compatibility notes

**Use this for:** Schema reference, type definitions, score interpretation

---

### 2. Skill #1: Coach Rick Data Interpreter ⭐
**File:** `coach-rick-data-interpreter-prompt.md`  
**Skill Name:** `MomentumTransfer.DataInterpreter`  
**Size:** Large (~12 pages)

**Contents:**
- DeepAgent system prompt for raw swing data
- Input format specification (timing, sequence, stability, barrel path)
- How to think about numbers (Ground/Power/Barrel Flow framework)
- Structured 3-section output format
- Style rules and edge case handling
- Example interaction with full input/output
- API endpoint implementation example

**Use this for:** Converting raw swing metrics into coaching breakdowns

**When to use:**
- ✅ You have raw timing metrics (pelvisTorsoGapMs, etc.)
- ✅ You have sequence data (order, flags)
- ✅ You have stability metrics (headMove, pelvisJerk)
- ✅ You want AI to interpret raw data and build the narrative

---

### 3. Skill #2: Coach Rick Momentum Transfer Explainer ⭐
**File:** `coach-rick-momentum-transfer-explainer-v2.md`  
**Skill Name:** `MomentumTransfer.Explainer`  
**Size:** Large (~12 pages)

**Contents:**
- DeepAgent system prompt for pre-computed scores
- Interpretation rules for Flow Path scores
- 5-section output format (Summary, Snapshot, Edge, Opportunity, Gameplan)
- Worked examples (Elite Pro, Developing Youth)
- UI integration examples
- API endpoint implementation
- Testing checklist

**Use this for:** Explaining already-computed Momentum Transfer scores to players

**When to use:**
- ✅ You have `momentumTransferScore` object computed
- ✅ You want conversational explanation
- ✅ You need "Edge" and "Opportunity" analysis
- ✅ You want actionable gameplan with cue + drill category

---

### 4. Skill #3: Coach Rick Drill Recommender ⭐
**File:** `coach-rick-drill-recommender-prompt.md`  
**Skill Name:** `MomentumTransfer.DrillRecommender`  
**Size:** Large (~12 pages)

**Contents:**
- DeepAgent system prompt for drill recommendations
- Decision logic for identifying weakest Flow Path
- 3-section output format (Focus, Category, Drills)
- Worked examples (with and without drill library)
- Drill library structure specification
- API endpoint implementation
- Testing checklist

**Use this for:** Recommending specific drills based on weakest Flow Path

**When to use:**
- ✅ You have Momentum Transfer scores
- ✅ You want drill recommendations
- ✅ You need to know which Flow Path to work on
- ✅ You have (optionally) a drill library to choose from

---

### 5. Skill #4: Coach Rick Model Comparison ⭐
**File:** `coach-rick-model-comparison-prompt.md`  
**Skill Name:** `MomentumTransfer.ModelComparison`  
**Size:** Large (~8 pages)

**Contents:**
- DeepAgent system prompt for athlete vs model comparison
- Side-by-side Flow Path analysis (Ground/Power/Barrel)
- 4-section output format (Summary, Flow Comparison, Timing, Focus)
- Worked examples (youth vs pro, college vs pro)
- Gap analysis logic for identifying primary leak
- API endpoint implementation
- Testing checklist

**Use this for:** Comparing athlete swings to professional model swings

**When to use:**
- ✅ You have both athlete and model swing data
- ✅ You want side-by-side flow comparison
- ✅ You need to show where model is smoother
- ✅ You want feedback based on model differences

---

### 6. Skill #5: Coach Rick Weekly Training Plan ⭐ NEW
**File:** `coach-rick-weekly-plan-prompt.md`  
**Skill Name:** `MomentumTransfer.WeeklyPlan`  
**Size:** Medium (~6 pages)

**Contents:**
- DeepAgent system prompt for weekly training plan generation
- 7-day structured plan format with daily sessions
- Primary theme identification from recent swing data
- 4-section output format (Week Summary, Themes, 7-Day Plan, Check-In Questions)
- Worked examples (youth hitter, high school player)
- Realistic session structure (20-40 minutes, basic equipment)
- Game day and recovery day accommodation
- Testing checklist

**Use this for:** Creating actionable weekly training plans from recent swing data

**When to use:**
- ✅ You have recent swing data (2-3+ swings analyzed)
- ✅ You want structured weekly training plan
- ✅ You need daily session structure (20-40 minutes)
- ✅ You want to focus on primary energy leak

---

### 7. Mock Data for Testing
**File:** `momentum-transfer-mock-data.json`  
**Size:** Medium (~5 pages JSON)

**Contents:**
- 5 complete swing examples:
  - Tiny (Pro): 91 MTS - Elite momentum transfer
  - 14-Year-Old (Youth): 68 MTS - Ground Flow leak
  - High School: 82 MTS - Advanced with strong Power Flow
  - College: 79 MTS - Barrel Flow leak
  - MLB All-Star: 96 MTS - Elite across all systems
- Test scenarios with expected coaching outcomes
- Usage instructions for development/testing

**Use this for:** Copy-paste examples for testing, dev endpoints, UI mockups

---

### 8. UI Copy Guide
**File:** `momentum-transfer-ui-copy.md`  
**Size:** Large (~10 pages)

**Contents:**
- Card titles & subtitles
- Score labels (Elite, Advanced, etc.)
- Flow Path section headers with descriptions
- Tooltips & help text for all metrics
- CTA buttons and progress indicators
- Error states and empty states
- Mobile-specific copy
- Accessibility labels
- TypeScript implementation examples

**Use this for:** Single source of truth for all UI text

---

### 9. Integration Guide
**File:** `momentum-transfer-integration-guide.md`  
**Size:** Comprehensive (~20 pages)

**Contents:**
- Architecture overview diagram
- Step-by-step integration instructions
- Database schema updates
- API endpoint creation
- DeepAgent configuration
- UI component updates
- Testing with mock data
- Deployment checklist
- Monitoring metrics
- Troubleshooting guide
- Phase-by-phase roadmap

**Use this for:** Complete implementation roadmap

---

## 🎯 Quick Start Guide

### For Developers

1. **Read the Integration Guide First**
   ```
   docs/momentum-transfer-integration-guide.md
   ```

2. **Review the JSON Schema**
   ```
   docs/momentum-transfer-scoring.md
   ```

3. **Test with Mock Data**
   ```
   docs/momentum-transfer-mock-data.json
   ```

4. **Configure All Five DeepAgent Skills**
   - **Skill #1 (Data Interpreter):** `coach-rick-data-interpreter-prompt.md`
     - For raw swing data → coaching breakdown
   - **Skill #2 (Explainer):** `coach-rick-momentum-transfer-explainer-v2.md`
     - For pre-computed scores → conversational explanation
   - **Skill #3 (Drill Recommender):** `coach-rick-drill-recommender-prompt.md`
     - For drill recommendations based on weakest flow
   - **Skill #4 (Model Comparison):** `coach-rick-model-comparison-prompt.md`
     - For athlete vs professional model comparison
   - **Skill #5 (Weekly Plan):** `coach-rick-weekly-plan-prompt.md`
     - For 7-day training plan generation from recent data

5. **Get UI Copy**
   ```
   docs/momentum-transfer-ui-copy.md
   ```

### Quick Decision: Which Skill to Use?

```
What do you need?
│
├─ Raw swing data analysis
│   → Skill #1 (Data Interpreter)
│     Input: timing/sequence/stability metrics
│     Output: 3-section coaching breakdown
│
├─ Explain pre-computed scores
│   → Skill #2 (Explainer)
│     Input: momentumTransferScore object
│     Output: 5-section conversational explanation
│
├─ Drill recommendations
│   → Skill #3 (Drill Recommender)
│     Input: scores + optional drill library
│     Output: Focus + category + specific drills
│
├─ Compare to professional model
│   → Skill #4 (Model Comparison)
│     Input: athlete + model swing data
│     Output: Summary + Flow Comparison + Timing + Focus
│
└─ Create weekly training plan
    → Skill #5 (Weekly Plan)
      Input: athlete profile + recent swing data + trend
      Output: Week Summary + Themes + 7-Day Plan + Check-In Questions
```

---

### For DeepAgent Integration

#### Skill #1: Data Interpreter (Raw Metrics → Coaching)

**Skill Name:** `MomentumTransfer.DataInterpreter`  
**When to use:** Raw swing data analysis  
**Output:** 3-section coaching breakdown

```typescript
// When you have raw swing data
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
        content: DATA_INTERPRETER_PROMPT,  // From coach-rick-data-interpreter-prompt.md
      },
      {
        role: 'user',
        content: `Analyze this swing:\n\n${JSON.stringify(swingData, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 600,
  }),
});
```

**Output Sections:**
1. 🔢 Momentum Transfer Card
2. 🎥 Simple Coaching Explanation (Ground/Power/Barrel)
3. 🧠 Next Step Guidance

---

#### Skill #2: Explainer (Pre-computed Scores → Explanation)

**Skill Name:** `MomentumTransfer.Explainer`  
**When to use:** Explaining existing scores  
**Output:** 5-section conversational explanation

```typescript
// When you already have momentumTransferScore computed
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
        content: EXPLAINER_PROMPT,  // From coach-rick-momentum-transfer-explainer-v2.md
      },
      {
        role: 'user',
        content: `Explain my swing:\n\n${JSON.stringify(momentumTransferScore, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  }),
});
```

**Output Sections:**
1. 🧾 Summary
2. 🔍 Snapshot
3. 💪 Your Edge
4. 🎯 Your Opportunity
5. 🧠 Gameplan

---

#### Skill #3: Drill Recommender (Scores → Drill Recommendations)

**Skill Name:** `MomentumTransfer.DrillRecommender`  
**When to use:** Drill recommendations  
**Output:** 3-section breakdown (Focus, Category, Drills)

```typescript
// When you need drill recommendations
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
        content: DRILL_RECOMMENDER_PROMPT,  // From coach-rick-drill-recommender-prompt.md
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

**Output Sections:**
1. 🔍 Main Focus (energy leak explanation)
2. 🏋️ Drill Category (Ground/Power/Barrel Flow)
3. 🛠️ Drills (2-3 specific recommendations OR category-only)

---

#### Skill #4: Model Comparison (Athlete vs Model → Comparison)

**Skill Name:** `MomentumTransfer.ModelComparison`  
**When to use:** Compare to professional model  
**Output:** 4-section breakdown (Summary, Flow Comparison, Timing, Focus)

```typescript
// When you need model comparison
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
        content: MODEL_COMPARISON_PROMPT,  // From coach-rick-model-comparison-prompt.md
      },
      {
        role: 'user',
        content: `Compare swings:\n\n${JSON.stringify({
          athleteSwing: athleteData,
          modelSwing: modelData
        }, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 700,
  }),
});
```

**Output Sections:**
1. 🧾 Overall Summary (score difference + energy flow story)
2. 🔍 Flow Path Comparison (Ground/Power/Barrel side-by-side)
3. ⏱️ Timing & Sequence Differences
4. 🧠 Next Session Focus (1 cue + 1 drill category)

---

#### Skill #5: Weekly Plan (Recent Data → 7-Day Training Plan)

**Skill Name:** `MomentumTransfer.WeeklyPlan`  
**When to use:** Create weekly training plan  
**Output:** 4-section breakdown (Week Summary, Themes, 7-Day Plan, Check-In Questions)

```typescript
// When you need weekly training plan
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
        content: WEEKLY_PLAN_PROMPT,  // From coach-rick-weekly-plan-prompt.md
      },
      {
        role: 'user',
        content: `Create weekly plan:\n\n${JSON.stringify(weeklyData, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  }),
});
```

**Output Sections:**
1. 🧾 Week Summary (2-4 sentences on primary focus)
2. 🎯 Main Themes (1-2 themes tied to Flow Paths)
3. 📅 7-Day Plan (daily sessions with drill categories)
4. 🧠 Check-In Questions (3-5 reflection prompts)

---

## 🔑 Key Concepts

### The Flow Path Model

**Ground Flow** → How the lower body loads and initiates momentum  
**Power Flow** → How the core amplifies and passes energy  
**Barrel Flow** → How the hands deliver energy to the ball

### Momentum Transfer Score (MTS)

- **0-100 scale** measuring energy flow efficiency
- **Energy Flow Grade** (-3 to +3) for categorical banding
- **Submetrics** for detailed biomechanical analysis

### Score Interpretation

| Score Range | Label | Grade |
|-------------|-------|-------|
| 92-100 | Elite | +3 |
| 85-91 | Advanced | +2 |
| 75-84 | Above Average | +1 |
| 60-74 | Developing | 0 |
| <60 | Needs Work | -1 to -3 |

---

## 📊 JSON Structure (Quick Reference)

```json
{
  "athleteId": "athlete_123",
  "videoId": "video_abc",
  "level": "HS",
  "handedness": "R",
  "momentumTransferScore": {
    "overall": 82,
    "label": "Advanced",
    "groundFlow": {
      "score": 78,
      "label": "Above Average",
      "submetrics": {
        "loadToLaunchTimingMs": 220,
        "pelvisAccelPattern": "smooth",
        "rearLegSupportQuality": 0.82,
        "weightShiftPercent": 0.76
      }
    },
    "powerFlow": {
      "score": 88,
      "label": "Advanced",
      "submetrics": {
        "pelvisToTorsoDelayMs": 38,
        "torsoToHandsDelayMs": 42,
        "sequenceOrder": ["ground", "pelvis", "torso", "hands", "barrel"],
        "torsoRotationQuality": 0.9
      }
    },
    "barrelFlow": {
      "score": 80,
      "label": "Above Average",
      "submetrics": {
        "handPathEfficiency": 1.15,
        "barrelLaunchDirection": "on-plane",
        "contactWhipQuality": 0.84
      }
    },
    "dataQuality": {
      "poseConfidence": 0.86,
      "cameraAngleOK": true,
      "framesUsed": 120
    },
    "goatyBand": 2,
    "goatyBandLabel": "Advanced"
  }
}
```

---

## 🧪 Testing

### Test Scenarios

1. **Elite Pro Swing (Tiny - 91 MTS)**
   - Expected: All systems Elite, minor refinement suggestions
   - Mock data: `mockData.examples[0]`

2. **Developing Youth (14U - 68 MTS)**
   - Expected: Ground Flow leak identified, encouraging language
   - Mock data: `mockData.examples[1]`

3. **Advanced HS (82 MTS)**
   - Expected: Power Flow strength highlighted, Ground Flow opportunity
   - Mock data: `mockData.examples[2]`

### Test Endpoints

```bash
# Create test endpoint (optional)
curl http://localhost:3000/api/dev/momentum-transfer/test

# Test Coach Rick Explainer
curl -X POST http://localhost:3000/api/coach-rick/momentum-transfer \
  -H "Content-Type: application/json" \
  -d '{"videoId": "video_abc", "message": "Explain my swing"}'

# Test Data Interpreter
curl -X POST http://localhost:3000/api/coach-rick/interpret \
  -H "Content-Type: application/json" \
  -d '{"videoId": "video_abc"}'
```

---

## 🎨 UI Components

### Momentum Transfer Card

```tsx
import { MomentumTransferCard } from '@/components/momentum-transfer-card';

<MomentumTransferCard 
  momentumTransferScore={video.momentumTransferScore}
/>
```

### Copy Strings

```tsx
import { MOMENTUM_TRANSFER_COPY } from '@/lib/copy/momentum-transfer';

<h2>{MOMENTUM_TRANSFER_COPY.title}</h2>
<p>{MOMENTUM_TRANSFER_COPY.subtitle}</p>
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All TypeScript types match schema
- [ ] Scoring engine returns new JSON format
- [ ] Database stores `newScoringBreakdown`
- [ ] API endpoints configured
- [ ] DeepAgent prompts tested
- [ ] UI components render correctly
- [ ] Mock data tests pass
- [ ] Build completes without errors

### Post-Deployment

- [ ] Monitor analysis success rate
- [ ] Track average scores by level
- [ ] Identify most common leaks
- [ ] Collect user feedback on AI responses
- [ ] Tune prompts based on feedback

---

## 📈 Monitoring

### Key Metrics

```sql
-- Analysis Success Rate
SELECT 
  COUNT(*) FILTER (WHERE analyzed = true) * 100.0 / COUNT(*) as success_rate
FROM Video
WHERE "uploadDate" > NOW() - INTERVAL '7 days';

-- Average MTS by Level
SELECT 
  tier as level,
  AVG("mechanicsScore") as avg_momentum_transfer
FROM Video
WHERE analyzed = true
GROUP BY tier;

-- Most Common Leaks
SELECT 
  CASE 
    WHEN anchor < engine AND anchor < whip THEN 'Ground Flow'
    WHEN engine < anchor AND engine < whip THEN 'Power Flow'
    ELSE 'Barrel Flow'
  END as weakest_flow,
  COUNT(*) as count
FROM Video
WHERE analyzed = true
GROUP BY weakest_flow;
```

---

## 🔧 Troubleshooting

### Issue: JSON Structure Mismatch

**Solution:**
1. Check `newScoringBreakdown` in database
2. Validate against schema in `momentum-transfer-scoring.md`
3. Re-run analysis if outdated

### Issue: Coach Rick Returns Generic Response

**Solution:**
1. Verify system prompt includes Flow Path terminology
2. Check JSON is passed correctly
3. Try test with mock data

### Issue: Submetrics Empty

**Solution:**
1. Implement helper functions in scoring engine
2. Use placeholder values for MVP
3. Add TODO comments for future refinement

---

## 📞 Support

**Documentation Issues:** Reference the 6 core files listed above  
**Integration Questions:** See `momentum-transfer-integration-guide.md`  
**DeepAgent Help:** Review both prompt files for your use case

---

## 🎊 Summary

### What You Have

✅ **Complete JSON schema** with detailed submetrics  
✅ **5 realistic mock examples** across all levels  
✅ **5 DeepAgent skills** for complete coaching:
  - Skill #1: Data Interpreter (raw metrics → coaching)
  - Skill #2: Explainer (scores → explanation)
  - Skill #3: Drill Recommender (scores → drill recommendations)
  - Skill #4: Model Comparison (athlete vs model → comparison)
  - Skill #5: Weekly Plan (recent data → 7-day training plan)  
✅ **All UI copy** for cards, tooltips, and CTAs  
✅ **Step-by-step integration guide**  
✅ **Flow Path Model™ branding** fully integrated  
✅ **TypeScript type-safe** interfaces  
✅ **Backward compatible** with legacy system  
✅ **Production-ready documentation**

### What's Next

1. **Week 1:** Core integration (API endpoints, database updates)
2. **Week 2:** UI enhancement (dashboard cards, Coach Rick chat)
3. **Week 3-4:** Refinement (submetric calculations, progress tracking)

### File Manifest

```
docs/
├── momentum-transfer-scoring.md                         # JSON schema & types
├── coach-rick-data-interpreter-prompt.md               # Skill #1: Data Interpreter ⭐
├── coach-rick-momentum-transfer-explainer-v2.md        # Skill #2: Explainer ⭐
├── coach-rick-drill-recommender-prompt.md              # Skill #3: Drill Recommender ⭐
├── coach-rick-model-comparison-prompt.md               # Skill #4: Model Comparison ⭐
├── coach-rick-weekly-plan-prompt.md                    # Skill #5: Weekly Plan ⭐ NEW
├── momentum-transfer-mock-data.json                     # Test examples
├── momentum-transfer-ui-copy.md                         # UI text strings
├── momentum-transfer-integration-guide.md               # Implementation roadmap
└── MOMENTUM_TRANSFER_COMPLETE.md                        # This file
```

---

**Status:** ✅ Complete Documentation Package  
**Build:** ✅ Passing  
**Checkpoint:** ✅ Saved  
**Ready For:** DeepAgent integration, UI implementation, production deployment

**Last Updated:** November 26, 2025  
**Version:** 5.0 (Final - All 5 Skills)

---

**🎯 You're ready to integrate Momentum Transfer into DeepAgent and the BARRELS app!**
