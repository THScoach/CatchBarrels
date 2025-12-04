# Coach Rick AI Lab — Complete Implementation

**Date:** November 26, 2025  
**Version:** 1.0  
**Status:** ✅ UI Built, System Prompt Ready, API Integration Pending

---

## 🎯 Overview

The **Coach Rick AI Lab** is the data analysis and insights engine for the Coach Command Center. It allows coaches to ask natural language questions about their players' performance data and receive actionable coaching strategies in return.

**Key Principle:** This is a coach-only interface. The AI speaks to the coach as a trusted performance coordinator, not to players or parents.

---

## 📦 What Was Built

### 1. ✅ System Prompt Documentation
**File:** `docs/coach-rick-ai-lab-system-prompt.md`

**Complete DeepAgent system prompt that defines:**
- AI identity (private performance analyst for Coach Rick)
- Input data structure (roster, assessments, trends, coach question)
- 4-part output format (Summary, Data Interpretation, Action Plan, Follow-up Prompts)
- Voice & style guidelines (calm, confident, data-first)
- Guardrails (handle missing data, never fabricate, no third-party mentions)
- Integration notes (API endpoints, payload structure, response format)

**Key Features:**
- Uses only BARRELS terminology (Momentum Transfer, Flow Lanes, etc.)
- Never mentions GOATY, S2, Dr. Kwon, or third-party products
- Teaches the coach what the data means in plain English
- Provides concrete next actions for session design
- Suggests follow-up questions for deeper analysis

### 2. ✅ AI Lab UI Page
**File:** `app/coach/lab/page.tsx`

**Fully functional interface with:**

#### A. Filters Panel
- Program/Team selector (All Programs, 4B Winter, Elite 90, 14U)
- Date range selector (7d, 14d, 30d, 90d)
- Metric focus selector (Momentum Transfer, Flow Lanes, Timing, Ball Data)
- Clean grid layout with icons

#### B. Question Input
- Large textarea for natural language questions
- Placeholder examples ("What should I focus on with my 14U group?")
- Submit button with loading state
- Character limit validation (TODO)

#### C. Results Display (4-Part Structure)
1. **Coach Summary** - Gold-themed card with bullet points
2. **What the Data Is Saying** - Slate card with paragraph interpretation
3. **What You Should Do Next** - Numbered action plan (5 steps)
4. **Follow-up Prompts** - Clickable question buttons (4 suggestions)

#### D. Mock Response Demo
- Functional demo with realistic coaching insights
- Shows complete 4-part response structure
- Demonstrates proper tone and language
- 1.5s loading simulation

**Styling:**
- BARRELS dark theme (black + gold)
- Framer Motion animations
- Responsive layout
- Accessible form controls
- Hover states on all interactive elements

---

## 🔌 Integration Points

### API Endpoint (TODO)
**Create:** `/api/coach/ai-lab/query`

**Request Structure:**
```typescript
{
  question: string;
  filters: {
    programId?: string;
    teamId?: string;
    playerIds?: string[];
    dateRange?: {
      start: string; // ISO date
      end: string;   // ISO date
    };
    metricFocus?: 'momentumTransfer' | 'flowLanes' | 'timing' | 'ballData';
  };
}
```

**Backend Process:**
1. Validate coach authentication
2. Fetch roster data based on filters
3. Aggregate assessment scores (avg, trends, distributions)
4. Calculate team-level metrics (weakest lanes, timing patterns)
5. Build JSON payload for DeepAgent (see system prompt doc)
6. Call DeepAgent API with system prompt + payload
7. Parse 4-part response
8. Return structured JSON to frontend

**Response Structure:**
```typescript
{
  summary: string[];            // 3-5 bullet points
  dataInterpretation: string;   // Paragraph explanation
  actionPlan: string[];         // 3-5 numbered steps
  followUpPrompts: string[];    // 2-4 suggested questions
  timestamp: string;            // ISO date
  queryId?: string;             // For caching/history
}
```

---

## 📊 Example Queries & Responses

### Query 1: Cohort Analysis
**Question:** "What should I focus on with my 14U group over the next 2 weeks?"

**AI Response (Mock):**

**Summary:**
- Your 14U group is improving in timing (avg A:B ratio up 0.2 over last 3 weeks)
- Barrel flow is the weakest lane for 7/12 players in this cohort
- 3 players have timing regression flags - need immediate attention

**Data Interpretation:**
"Based on the last 30 days, your 14U hitters are showing solid progress in timing fundamentals. Average Momentum Transfer score has moved from 68 to 72, which is encouraging. However, barrel flow remains the most common weak lane, suggesting that while energy is getting started on time, it's not being delivered cleanly into the barrel. This is typical for this age group as they develop coordination between lower body power and hand path control."

**Action Plan:**
1. For the next 2 weeks, structure sessions to protect timing first - don't overload with barrel path corrections yet
2. Add simple barrel flow constraints (tee work with target focus) after warmup, once timing is repeating
3. Flag the 3 timing regression players for 1-on-1 video review - likely fatigue or overtraining
4. Track A:B ratio in every session for the flagged players to confirm if timing stabilizes
5. Reassess in 2 weeks - if barrel flow scores don't move up, consider adjusting drill difficulty

**Follow-up Prompts:**
- "Which players have the worst barrel flow in my 14U group?"
- "Compare Jayden's timing pattern to the team average"
- "Show me ground flow trends over the last 6 weeks"
- "Explain the difference between timing and sequence quality"

---

### Query 2: Player Comparison
**Question:** "How does Jayden compare to my other 14U hitters?"

**Expected AI Response:**
- Jayden is below average for timing (A:B 1.4 vs team 1.6) but improving
- His barrel flow (55) is significantly lower than team avg (68)
- Ground flow and power flow are on par with peers
- Recommend focusing on hand path consistency and maintaining timing progress

---

### Query 3: Trend Detection
**Question:** "Are my hitters getting better or worse?"

**Expected AI Response:**
- Team avg momentum transfer +4 pts over last month (74 → 78)
- Timing metrics improving across the board (A:B ratios tightening)
- Stability lagging for 5 players (high head movement/pelvis jerk)
- Suggest maintaining timing focus while adding stability drills for flagged players

---

## 🎨 UI Design Details

### Color System
- **Primary Background:** `bg-slate-900/80` (dark card)
- **Borders:** `border-barrels-gold/20` (subtle gold)
- **Inputs:** `bg-slate-800` with `focus:ring-barrels-gold/30`
- **Button:** `bg-gradient-to-r from-barrels-gold to-barrels-gold-light`
- **Summary Card:** `bg-gradient-to-br from-barrels-gold/10` (gold tint)
- **Action Numbers:** `bg-barrels-gold text-black` (circular badges)

### Layout Structure
```
┌─────────────────────────────────────┐
│ Page Header (Brain icon + title)   │
├─────────────────────────────────────┤
│ Filters Panel (3-column grid)      │
│  - Program  - Date Range  - Metric │
├─────────────────────────────────────┤
│ Question Input (textarea + button) │
├─────────────────────────────────────┤
│ Results (conditional, 4 cards)     │
│  1. Coach Summary (bullets)        │
│  2. Data Interpretation (paragraph)│
│  3. Action Plan (numbered list)    │
│  4. Follow-up Prompts (buttons)    │
└─────────────────────────────────────┘
```

### Animations
- **Page Load:** Staggered entry (0.1s delay per section)
- **Results:** Fade-in from bottom on submit
- **Buttons:** Scale + shadow on hover
- **Loading:** Spinner icon during analysis

---

## 🔧 Configuration

### DeepAgent Settings (Recommended)
```javascript
{
  model: 'gpt-4',
  temperature: 0.3,        // Factual, consistent
  max_tokens: 1500,        // Enough for 4-part response
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.1,
}
```

### Query Limits
- **Max date range:** 90 days (to prevent data overload)
- **Max players per query:** 50 (aggregation performance)
- **Rate limit:** 10 queries/minute per coach (prevent abuse)
- **Cache duration:** 5 minutes (same question → cached response)

---

## 📝 Implementation Checklist

### Phase 1: API Integration (Week 1)
- [ ] Create `/api/coach/ai-lab/query` endpoint
- [ ] Implement data aggregation logic:
  - [ ] Fetch roster based on filters
  - [ ] Calculate team-level statistics
  - [ ] Aggregate assessment trends
  - [ ] Build weakest lane distributions
- [ ] Configure DeepAgent API credentials
- [ ] Test with mock data first
- [ ] Deploy system prompt to DeepAgent

### Phase 2: Response Parsing (Week 2)
- [ ] Parse 4-part response structure
- [ ] Handle edge cases (missing data, errors)
- [ ] Implement response caching
- [ ] Add rate limiting middleware
- [ ] Create error messages for failed queries

### Phase 3: UI Polish (Week 2)
- [ ] Connect frontend to real API
- [ ] Add character limit validation (500 chars)
- [ ] Implement query history (last 10 questions)
- [ ] Add "Share with Coach" button (copy to clipboard)
- [ ] Create example questions dropdown

### Phase 4: Advanced Features (Week 3-4)
- [ ] Chart generation from data (line/bar charts)
- [ ] Export reports as PDF
- [ ] Save/bookmark useful queries
- [ ] Compare two time periods side-by-side
- [ ] Player-specific deep dives

---

## 🎯 Key Success Metrics

### Usage Metrics
- Queries per coach per week
- Most common question types
- Time spent reviewing results
- Follow-up prompt click rate

### Quality Metrics
- Coach satisfaction (thumbs up/down)
- Action plan completion rate
- Improvement in flagged players
- Reduction in coach question time

---

## 🚀 Testing Plan

### Manual Testing
1. **Question Variations:**
   - [ ] Vague ("What are you seeing?")
   - [ ] Specific player ("How is Jayden doing?")
   - [ ] Cohort ("What's up with my 14U group?")
   - [ ] Trend ("Are we getting better?")

2. **Data Scenarios:**
   - [ ] Full dataset (30+ players, 90 days)
   - [ ] Sparse dataset (5 players, 7 days)
   - [ ] No data (new program)
   - [ ] Edge cases (all scores identical, huge variance)

3. **Response Quality:**
   - [ ] Summary bullets are actionable
   - [ ] Data interpretation is clear
   - [ ] Action plan is specific and doable
   - [ ] Follow-up prompts are relevant

### Automated Testing
- [ ] Unit tests for data aggregation
- [ ] Integration tests for API endpoint
- [ ] Load tests (100 concurrent queries)
- [ ] DeepAgent timeout handling

---

## 📚 Related Documentation

- `coach-rick-ai-lab-system-prompt.md` - Complete DeepAgent prompt
- `coach-command-center-complete.md` - Full coach portal overview
- `momentum-transfer-integration-guide.md` - Scoring system details
- `52-pitch-assessment-complete.md` - Assessment data structure

---

## 🔐 Security Considerations

### Authentication
- Coach-only access (verify role in middleware)
- Session validation before each query
- No player data exposed to unauthorized users

### Data Privacy
- Aggregate team stats only (no individual PII in logs)
- Coach can only query their own programs
- Rate limiting per coach account

### API Security
- DeepAgent API key stored in env variables
- Request signing/validation
- Timeout after 30 seconds (prevent hanging)
- Error messages don't expose system details

---

## ✅ Current Status

**Built:**
- ✅ Complete system prompt documentation
- ✅ Fully functional UI with all components
- ✅ Mock response demo showing 4-part structure
- ✅ BARRELS-themed design system applied
- ✅ Filters panel with program/date/metric selectors
- ✅ Question input with submit button
- ✅ Results display with proper formatting

**TODO:**
- 🚧 API endpoint implementation (`/api/coach/ai-lab/query`)
- 🚧 Data aggregation logic (roster, assessments, trends)
- 🚧 DeepAgent integration (API call + response parsing)
- 🚧 Query validation and rate limiting
- 🚧 Response caching for performance
- 🚧 Query history tracking
- 🚧 Chart generation from data
- 🚧 Export functionality

---

## 🎊 Next Steps

1. **Test the UI:**
   - Navigate to `/coach/lab`
   - Try the filters panel
   - Enter a question and click "Ask Coach Rick AI"
   - Review the mock response (all 4 parts)
   - Click follow-up prompts to populate question box

2. **Review System Prompt:**
   - Read `docs/coach-rick-ai-lab-system-prompt.md`
   - Understand input/output structure
   - Note the voice/style guidelines

3. **Plan API Integration:**
   - Design data aggregation queries
   - Set up DeepAgent credentials
   - Create endpoint in `/api/coach/ai-lab/`
   - Test with small dataset first

4. **Deploy System Prompt:**
   - Copy prompt to Abacus.AI DeepAgent configuration
   - Configure temperature/max_tokens settings
   - Test with sample queries
   - Iterate on prompt based on response quality

---

## 🏆 Summary

The Coach Rick AI Lab is **ready for integration**! The UI is fully functional with a complete mock demo, and the system prompt provides comprehensive guidance for DeepAgent behavior.

**What Works:**
- ✅ Complete UI with filters, question input, and results display
- ✅ Realistic mock response demonstrating 4-part structure
- ✅ BARRELS-themed design with animations
- ✅ Clear TODO markers for API integration
- ✅ Comprehensive system prompt documentation

**What's Next:**
- Create API endpoint for query processing
- Implement data aggregation from roster/assessments
- Integrate with DeepAgent using system prompt
- Test with real coach questions and player data

**The foundation is solid. Time to wire up the AI and turn raw data into coaching gold! 🚀⚾🧠**

---

**Status:** ✅ UI Complete, System Prompt Ready  
**Version:** 1.0  
**Last Updated:** November 26, 2025

---

**File Path:** `/coach/lab`  
**System Prompt:** `docs/coach-rick-ai-lab-system-prompt.md`  
**API Endpoint (TODO):** `/api/coach/ai-lab/query`
