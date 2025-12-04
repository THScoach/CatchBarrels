# Momentum Transfer Card — UI Specification
## BARRELS Flow Path Model™

---

## Overview

The **Momentum Transfer Card** is the primary visual representation of swing quality in the BARRELS app. It displays:

1. **Momentum Transfer Score** (0-100) — the master metric
2. **Flow Path Breakdown** — Ground Flow, Power Flow, Barrel Flow
3. **Leak Indicators** — visual severity markers for energy leaks
4. **Coaching Summary** — AI-generated explanation from Coach Rick

This document defines the exact layout, microcopy, JSON-to-UI mapping, and integration instructions.

---

## BARRELS Flow Path Model™

The BARRELS system measures energy transfer through three phases:

### **Ground Flow** (Ground → Hips)
- How well the lower body loads and initiates momentum
- Weight: 15% of final score
- Visual Color: Electric Gold

### **Power Flow** (Hips → Torso)
- How well the core accepts and amplifies hip energy
- Weight: 15% of final score
- Visual Color: Electric Blue

### **Barrel Flow** (Torso → Barrel)
- How well the arms/bat receive and release energy
- Weight: 10% of final score
- Visual Color: Green

### **Momentum Transfer Score**
- Master metric combining all three flows
- Weight: 60% of final score
- Measures timing, sequencing, and overall energy flow quality

---

## Card Layout

```
┌─────────────────────────────────────────────┐
│  ⚡ MOMENTUM TRANSFER         [Elite]       │  ← Header + Badge
│                                             │
│     94                                      │  ← Main Score (huge)
│     How cleanly your swing passes energy    │  ← Subtitle
│     Ground → Hips → Torso → Barrel          │
│                                             │
│  Ground Flow  ████████████████  92          │  ← Sub-score bar
│  Power Flow   ████████████████  96          │
│  Barrel Flow  ████████████████  93          │
│                                             │
│  "Your momentum transfer is elite. Energy   │  ← Coach Rick summary
│   flows cleanly from ground contact through │
│   power generation into barrel release."    │
└─────────────────────────────────────────────┘
```

---

## 1. Header Section

### Title
- **Text:** "Momentum Transfer"
- **Icon:** ⚡ Zap (lucide-react)
- **Style:** 
  - Font: `text-lg font-bold uppercase tracking-wide`
  - Color: `text-white`

### Band Badge (Right Side)
- **Position:** Top-right of card
- **Style:** 
  - `px-3 py-1 rounded-full`
  - `bg-gradient-to-r {bandColor}`
  - `text-white text-sm font-bold shadow-lg`

#### Band Colors (based on goatyBand -3 to +3)
- **Elite** (≥3): `from-green-500 to-emerald-600`
- **Advanced** (≥2): `from-barrels-gold to-barrels-gold-light`
- **Above Average** (≥1): `from-blue-500 to-blue-600`
- **Average** (≥0): `from-gray-400 to-gray-500`
- **Below Average** (≥-1): `from-orange-500 to-orange-600`
- **Poor/Needs Work** (<-1): `from-red-500 to-red-600`

---

## 2. Main Score Display

### Score Number
- **Value:** `momentumTransfer.score` (0-100)
- **Style:** 
  - Font: `text-7xl font-black`
  - Color: `text-white`
  - Animation: Scale in from 0.8 to 1.0 (0.6s delay)

### Subtitle
- **Text:** "How cleanly your swing passes energy Ground → Hips → Torso → Barrel"
- **Style:**
  - Font: `text-sm`
  - Color: `text-gray-400`

---

## 3. Flow Path Sub-Scores

Each sub-score includes:
- Label + description
- Leak severity indicator (🔥)
- Score value
- Progress bar

### Ground Flow
```
Ground Flow    (Ground → Hips)    🔥🔥    72
████████░░░░░░░░░░░░░░░░░░░░░░
```

- **Label:** "Ground Flow"
- **Description:** "(Ground → Hips)"
- **Leak Indicator:** Flame icons based on severity
  - `none`: No flames
  - `mild`: 🔥 (yellow)
  - `moderate`: 🔥🔥 (orange)
  - `severe`: 🔥🔥🔥 (red)
- **Score:** `groundFlow.score` (right-aligned, bold)
- **Bar Color:**
  - Default: `from-barrels-gold to-barrels-gold-light`
  - If main leak: Red/orange/yellow gradient based on severity

### Power Flow
```
Power Flow     (Hips → Torso)              90
████████████████████████████████░░░░░░
```

- **Label:** "Power Flow"
- **Description:** "(Hips → Torso)"
- **Bar Color:**
  - Default: `from-barrels-blue to-blue-500`
  - If main leak: Red/orange/yellow gradient

### Barrel Flow
```
Barrel Flow    (Torso → Barrel)   🔥       85
████████████████████████████░░░░░░░░
```

- **Label:** "Barrel Flow"
- **Description:** "(Torso → Barrel)"
- **Bar Color:**
  - Default: `from-green-500 to-green-600`
  - If main leak: Red/orange/yellow gradient

### Main Leak Highlight
- If `flags.mainLeak === 'groundFlow' | 'powerFlow' | 'barrelFlow'`:
  - Container background: `bg-red-950/20`
  - Border: `border border-red-500/30`

---

## 4. Coaching Summary

Displayed only if `showCoaching={true}` (default: true)

### Layout
- **Container:** 
  - `bg-barrels-black-light/50 rounded-lg p-4`
  - `border border-barrels-gold/10`
- **Content:**
  - 3 text lines (overall, leak, nextStep)
  - `text-sm text-gray-300`
  - Next step in `text-barrels-gold font-semibold`

### Example
```
Your momentum transfer is 68, which is average. You're creating 
speed, but there's still power left on the table as energy moves 
through your body.

The biggest leak is in your ground flow. Your base doesn't hold 
long enough for the hips to start the chain, so the upper body 
has to help too much.

Next step: Learn to load into the ground and hold it so the hips 
can fire first and everything else can follow.
```

---

## 5. JSON to UI Mapping

### Input Data Structure
```typescript
interface MomentumTransferAnalysis {
  videoId: string;
  athlete: AthleteInfo;
  scores: {
    momentumTransfer: {
      score: number;              // 0-100 → Main score display
      goatyBand: number;          // -3 to +3 → Badge color
      goatyLabel: string;         // → Badge text
      confidence: number;         // 0.0-1.0
    };
    groundFlow: {
      score: number;              // 0-100 → Sub-score value
      label: string;              // "Ground Flow"
      leakSeverity: LeakSeverity; // → 🔥 indicator
    };
    powerFlow: {
      score: number;
      label: string;              // "Power Flow"
      leakSeverity: LeakSeverity;
    };
    barrelFlow: {
      score: number;
      label: string;              // "Barrel Flow"
      leakSeverity: LeakSeverity;
    };
  };
  timing: TimingData;             // Optional, for timing tab
  flags: {
    mainLeak: 'groundFlow' | 'powerFlow' | 'barrelFlow' | 'none';
    secondaryLeak: 'groundFlow' | 'powerFlow' | 'barrelFlow' | null;
    sequenceBroken: boolean;
  };
  coachSummary: {
    overall: string;              // → First paragraph
    leak: string;                 // → Second paragraph
    nextStep: string;             // → Final sentence (gold)
  };
}
```

### UI Mapping Rules

1. **Main Score:** `momentumTransfer.score` → Display as integer
2. **Badge:**
   - Text: `momentumTransfer.goatyLabel`
   - Color: Use `goatyBand` to determine gradient
3. **Ground Flow:**
   - Score: `groundFlow.score`
   - Bar width: `${groundFlow.score}%`
   - Leak indicator: `groundFlow.leakSeverity` → 0-3 flames
   - Highlight: If `flags.mainLeak === 'groundFlow'`
4. **Power Flow:** Same mapping as Ground Flow
5. **Barrel Flow:** Same mapping as Ground Flow
6. **Coaching Summary:**
   - Line 1: `coachSummary.overall`
   - Line 2: `coachSummary.leak`
   - Line 3 (gold): `coachSummary.nextStep`

---

## 6. Visual Examples

### Elite MLB Swing (Ohtani - 94)
```
┌─────────────────────────────────────────────┐
│  ⚡ MOMENTUM TRANSFER           [Elite] 🟢  │
│                                             │
│     94                                      │
│     How cleanly energy flows Ground→Barrel  │
│                                             │
│  Ground Flow  ████████████████  92          │
│  Power Flow   ████████████████  96          │
│  Barrel Flow  ████████████████  93          │
│                                             │
│  "Your momentum transfer is elite. Energy   │
│   flows cleanly from ground contact through │
│   power generation into barrel release."    │
└─────────────────────────────────────────────┘
```

### Youth Swing with Ground Flow Leak (Jalen - 68)
```
┌─────────────────────────────────────────────┐
│  ⚡ MOMENTUM TRANSFER         [Average] ⚪   │
│                                             │
│     68                                      │
│     How cleanly energy flows Ground→Barrel  │
│                                             │
│  🔴 Ground Flow  ████████░░  61  🔥🔥  ← LEAK
│  Power Flow   ████████████░  73  🔥         │
│  Barrel Flow  ████████████░  71             │
│                                             │
│  "Your momentum transfer is 68 (average).   │
│   The biggest leak is in ground flow—your   │
│   base doesn't hold long enough for clean   │
│   power flow. Next step: Load into the      │
│   ground and hold it."                      │
└─────────────────────────────────────────────┘
```

---

## 7. Integration Instructions

### Installation
```bash
cd /home/ubuntu/barrels_pwa/nextjs_space
yarn add framer-motion lucide-react
```

### Import Component
```typescript
import { MomentumTransferCard } from '@/components/momentum-transfer-card';
import type { MomentumTransferAnalysis } from '@/lib/scoring/analysis-output-types';
```

### Usage
```tsx
const analysis: MomentumTransferAnalysis = {
  videoId: "video_123",
  athlete: {
    name: "Jalen",
    level: "Youth",
    age: 14,
    bats: "R",
    throws: "R"
  },
  scores: {
    momentumTransfer: {
      score: 68,
      goatyBand: 0,
      goatyLabel: "Average",
      confidence: 0.86
    },
    groundFlow: {
      score: 61,
      label: "Ground Flow",
      leakSeverity: "moderate"
    },
    powerFlow: {
      score: 73,
      label: "Power Flow",
      leakSeverity: "mild"
    },
    barrelFlow: {
      score: 71,
      label: "Barrel Flow",
      leakSeverity: "mild"
    }
  },
  timing: { /* ... */ },
  flags: {
    mainLeak: "groundFlow",
    secondaryLeak: "powerFlow",
    sequenceBroken: false
  },
  coachSummary: {
    overall: "Your momentum transfer is 68, which is average.",
    leak: "The biggest leak is in your ground flow.",
    nextStep: "Next step: Load into the ground and hold it."
  }
};

// Render
<MomentumTransferCard 
  analysis={analysis}
  showCoaching={true}
  showTimingDetails={false}
/>
```

---

## 8. Props API

```typescript
interface MomentumTransferCardProps {
  analysis: MomentumTransferAnalysis;  // Required: Full analysis data
  showCoaching?: boolean;              // Optional: Show coaching text (default: true)
  showTimingDetails?: boolean;         // Optional: Show expandable timing tab (default: false)
}
```

---

## 9. Backward Compatibility

The system supports legacy field names for a transition period:

### Legacy Mapping
- `anchor` → `groundFlow`
- `engine` → `powerFlow`
- `whip` → `barrelFlow`

### Component Logic
```typescript
const ground = groundFlow || anchor;  // Use new, fallback to legacy
const power = powerFlow || engine;
const barrel = barrelFlow || whip;
```

Both old and new field names work, but new implementations should use **Ground Flow / Power Flow / Barrel Flow** terminology.

---

## 10. Color Palette Reference

### BARRELS Theme Colors
- **Electric Gold:** `#E8B14E` (`barrels-gold`)
- **Gold Light:** `#F2C26B` (`barrels-gold-light`)
- **Electric Blue:** `#3B9FE8` (`barrels-blue`)
- **Pure Black:** `#000000` (`barrels-black`)
- **Black Light:** `#2A2A2A` (`barrels-black-light`)

### Status Colors
- **Success/Elite:** Green (`from-green-500 to-emerald-600`)
- **Warning/Leak:** Orange → Yellow → Red (based on severity)
- **Neutral:** Gray (`from-gray-400 to-gray-500`)

---

## 11. Animations

All animations use `framer-motion`:

1. **Card Entry:** Fade in + slide up (0.5s)
2. **Main Score:** Scale from 0.8 to 1.0 (0.6s, 0.2s delay)
3. **Sub-score Bars:** Width from 0% to actual% (0.8s, staggered 0.3-0.5s)
4. **Coaching Summary:** Fade in (0.8s delay)

---

## 12. Accessibility

- Minimum contrast ratios meet WCAG AA standards
- Flame icons paired with numerical scores for colorblind users
- Progress bars include aria-labels with current percentage
- All interactive elements keyboard-accessible

---

## Summary

This UI spec defines the **Momentum Transfer Card** for the BARRELS app using the proprietary **Flow Path Model™**:

- **Ground Flow** (lower body initiation)
- **Power Flow** (core transfer)
- **Barrel Flow** (hands/bat release)

The card provides:
- Clear visual hierarchy (score → sub-scores → coaching)
- Leak severity indicators (🔥)
- AI-generated coaching explanations
- Backward compatibility with legacy terms

**Result:** A unique, brandable system that no other swing analysis platform uses. 🎯⚾
