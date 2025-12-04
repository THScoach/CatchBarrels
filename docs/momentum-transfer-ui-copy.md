# Momentum Transfer — UI Copy Guide

## Purpose

This document provides **drop-in copy** for all Momentum Transfer UI elements in the BARRELS app. Use these exact strings for consistency across the platform.

**Date:** November 26, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

## Card Titles & Subtitles

### Main Card

**Title:**
```
Momentum Transfer Score
```

**Subtitle:**
```
How efficiently your body passes energy from the ground into the barrel.
```

**Alternative Subtitle (Shorter):**
```
Energy flow from ground to barrel.
```

---

## Score Labels

### Overall Momentum Transfer Score

| Score Range | Label | Alternative |
|-------------|-------|-------------|
| 92-100 | `Elite` | `🔥 Elite` |
| 85-91 | `Advanced` | `⚡ Advanced` |
| 75-84 | `Above Average` | `✅ Above Average` |
| 60-74 | `Developing` | `📈 Developing` |
| <60 | `Needs Work` | `🔧 Needs Work` |

### Usage in UI

```tsx
<Badge className={getBadgeColor(score)}>
  {getLabel(score)}
</Badge>
```

---

## Flow Path Section Headers

### Ground Flow

**Header:**
```
Ground Flow
```

**Subheader:**
```
How your lower body loads, supports, and starts the move.
```

**Short Description:**
```
Ground → Hips
```

**Long Description:**
```
Ground Flow measures how well your lower body initiates and supports momentum transfer. 
A strong ground connection creates the foundation for the entire swing.
```

### Power Flow

**Header:**
```
Power Flow
```

**Subheader:**
```
How your hips and torso pass energy into your hands.
```

**Short Description:**
```
Hips → Torso
```

**Long Description:**
```
Power Flow measures how cleanly your core accepts and amplifies energy from the hips. 
Elite hitters create separation and fire in sequence.
```

### Barrel Flow

**Header:**
```
Barrel Flow
```

**Subheader:**
```
How your hands and barrel cash in all that stored energy at contact.
```

**Short Description:**
```
Torso → Barrel
```

**Long Description:**
```
Barrel Flow measures how efficiently your hands deliver the barrel to the ball. 
The best hitters let the barrel snap late and catch the wave of energy.
```

---

## Empty States

### No Analysis Yet

**Headline:**
```
Ready to Analyze Your Swing?
```

**Body:**
```
Upload a video to get your Momentum Transfer Score and see how energy flows through your swing.
```

**CTA Button:**
```
Upload First Video
```

### Analysis In Progress

**Headline:**
```
Analyzing Your Swing...
```

**Body:**
```
Our AI is breaking down your momentum transfer. This usually takes 30-60 seconds.
```

---

## Tooltips & Help Text

### Momentum Transfer Score

**Tooltip:**
```
Your Momentum Transfer Score measures how efficiently energy flows from the ground, 
through your body, into the barrel. Higher scores = better energy transfer.
```

### Ground Flow

**Tooltip:**
```
Ground Flow: How well your lower body loads and initiates the swing. 
Think of the ground like a spring—compress it, then explode.
```

### Power Flow

**Tooltip:**
```
Power Flow: How cleanly your hips and torso fire in sequence. 
Elite hitters create separation and let the core drive the swing.
```

### Barrel Flow

**Tooltip:**
```
Barrel Flow: How efficiently your hands deliver the barrel to contact. 
The best hitters let the barrel snap late and catch the energy.
```

### Submetrics (Advanced)

**Load-to-Launch Timing:**
```
Time from load completion to hip initiation. Ideal: 220-250ms.
```

**Pelvis Accel Pattern:**
```
How smoothly your pelvis accelerates. "Smooth" is ideal; "rushed" or "delayed" indicate timing issues.
```

**Rear Leg Support Quality:**
```
How well your back leg supports the load phase. Elite hitters maintain strong rear leg pressure.
```

**Weight Shift Percent:**
```
How much of your weight transfers forward. Optimal: 75-90%.
```

**Pelvis-to-Torso Delay:**
```
Gap between pelvis and torso peak velocities. Ideal: 35-45ms.
```

**Torso-to-Hands Delay:**
```
Gap between torso and hands peak velocities. Ideal: 35-50ms.
```

**Hand Path Efficiency:**
```
Hand path length ratio. Lower is better. Elite: 1.0-1.1.
```

**Contact Whip Quality:**
```
How explosively the barrel releases at contact. Elite: 0.9-1.0.
```

---

## Call-to-Action Buttons

### Primary CTAs

**View Full Breakdown:**
```
View Full Breakdown
```

**Get Coaching:**
```
Ask Coach Rick
```

**Upload Another Swing:**
```
Analyze Another Swing
```

### Secondary CTAs

**Share Results:**
```
Share
```

**Download Report:**
```
Download PDF
```

**Compare to Previous:**
```
Compare
```

---

## Progress & Comparison

### Score Improvement

**Positive Delta:**
```
▲ {points} pts since last session
```

**Negative Delta:**
```
▼ {points} pts since last session
```

**No Change:**
```
No change since last session
```

### Comparison Labels

**Your Score:**
```
Your Score
```

**Previous Score:**
```
Previous
```

**Average for Level:**
```
Avg ({level})
```

**Target (Elite):**
```
Elite Target
```

---

## Error States

### Low Data Quality

**Headline:**
```
Analysis Completed with Low Confidence
```

**Body:**
```
The camera angle or video quality may have affected this analysis. 
Try recording from a side angle with good lighting for best results.
```

**CTA:**
```
Upload Better Video
```

### Broken Sequence

**Headline:**
```
Sequence Break Detected
```

**Body:**
```
The kinematic sequence shows breaks in the expected order (ground → pelvis → torso → hands → barrel). 
This is costing you significant power.
```

**CTA:**
```
Get Coaching
```

---

## Coach Rick Integration

### Chat Prompt Suggestions

**Explain my Ground Flow:**
```
Explain my Ground Flow score
```

**Why is Power Flow my best area?**
```
Why is Power Flow my best area?
```

**How do I improve Barrel Flow?**
```
How do I improve Barrel Flow?
```

**What's my biggest leak?**
```
What's my biggest leak?
```

**Give me a drill for my weakest area:**
```
Give me a drill for my weakest area
```

---

## Mobile-Specific Copy

### Compact Labels (for mobile cards)

**Momentum Transfer:**
```
MTS: {score}
```

**Ground Flow:**
```
GF: {score}
```

**Power Flow:**
```
PF: {score}
```

**Barrel Flow:**
```
BF: {score}
```

### Shortened Descriptions

**Ground Flow:**
```
Lower body load & support
```

**Power Flow:**
```
Hip/torso sequencing
```

**Barrel Flow:**
```
Hand/barrel delivery
```

---

## Accessibility Labels

### Screen Reader Text

**Momentum Transfer Score:**
```
Your Momentum Transfer Score is {score} out of 100, rated as {label}.
```

**Ground Flow:**
```
Ground Flow score: {score} out of 100, rated as {label}. This measures how well your lower body loads and initiates the swing.
```

**Power Flow:**
```
Power Flow score: {score} out of 100, rated as {label}. This measures how cleanly your hips and torso fire in sequence.
```

**Barrel Flow:**
```
Barrel Flow score: {score} out of 100, rated as {label}. This measures how efficiently your hands deliver the barrel.
```

### Button ARIA Labels

**View Breakdown:**
```
aria-label="View detailed momentum transfer breakdown"
```

**Ask Coach Rick:**
```
aria-label="Ask Coach Rick about your momentum transfer score"
```

**Upload Video:**
```
aria-label="Upload a new swing video for analysis"
```

---

## Implementation Examples

### TypeScript Type for Copy

```typescript
export const MOMENTUM_TRANSFER_COPY = {
  title: "Momentum Transfer Score",
  subtitle: "How efficiently your body passes energy from the ground into the barrel.",
  
  flowPaths: {
    groundFlow: {
      label: "Ground Flow",
      short: "Ground → Hips",
      description: "How your lower body loads, supports, and starts the move.",
    },
    powerFlow: {
      label: "Power Flow",
      short: "Hips → Torso",
      description: "How your hips and torso pass energy into your hands.",
    },
    barrelFlow: {
      label: "Barrel Flow",
      short: "Torso → Barrel",
      description: "How your hands and barrel cash in all that stored energy at contact.",
    },
  },
  
  scoreLabels: {
    elite: "Elite",
    advanced: "Advanced",
    aboveAverage: "Above Average",
    developing: "Developing",
    needsWork: "Needs Work",
  },
  
  tooltips: {
    overall: "Your Momentum Transfer Score measures how efficiently energy flows from the ground, through your body, into the barrel.",
    groundFlow: "Ground Flow: How well your lower body loads and initiates the swing.",
    powerFlow: "Power Flow: How cleanly your hips and torso fire in sequence.",
    barrelFlow: "Barrel Flow: How efficiently your hands deliver the barrel to contact.",
  },
} as const;
```

### React Component Usage

```tsx
import { MOMENTUM_TRANSFER_COPY } from '@/lib/copy/momentum-transfer';

function MomentumTransferCard() {
  return (
    <div>
      <h2>{MOMENTUM_TRANSFER_COPY.title}</h2>
      <p className="text-sm text-gray-400">
        {MOMENTUM_TRANSFER_COPY.subtitle}
      </p>
      
      <div className="space-y-2">
        <div>
          <h3>{MOMENTUM_TRANSFER_COPY.flowPaths.groundFlow.label}</h3>
          <p>{MOMENTUM_TRANSFER_COPY.flowPaths.groundFlow.description}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## Branding Notes

### Terminology Rules

✅ **Always use:**
- "Momentum Transfer Score"
- "Ground Flow"
- "Power Flow"
- "Barrel Flow"
- "BARRELS Flow Path Model™"

❌ **Never use:**
- "GOAT/GOATY"
- "Anchor/Engine/Whip" (in user-facing copy)
- "S2", "Reboot", "Kwon" (competitor references)

### Tone Guidelines

- **Confident**: Use declarative statements
- **Encouraging**: Focus on growth and improvement
- **Clear**: No jargon, 8th-grade reading level
- **Action-oriented**: Always provide next steps

---

## Summary

This copy guide ensures:
- ✅ **Consistent terminology** across all UI elements
- ✅ **Clear explanations** for players and parents
- ✅ **Accessible language** for screen readers
- ✅ **Brandable phrases** unique to BARRELS
- ✅ **Action-oriented messaging** for player development

**Use this as the single source of truth for all Momentum Transfer UI copy.**

---

**Last Updated:** November 26, 2025  
**Version:** 1.0  
**Status:** Production Ready
