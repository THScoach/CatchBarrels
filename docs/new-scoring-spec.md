# BARRELS New Scoring Engine: Kwon/THSS Aligned Specification

**Version:** 1.0  
**Date:** November 26, 2025  
**Status:** Design Specification (Pre-Implementation)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Inputs & Phase Detection](#inputs--phase-detection)
4. [Features (Mechanics)](#features-mechanics)
5. [Feature Scoring (Math)](#feature-scoring-math)
6. [Weighting & Composite](#weighting--composite)
7. [Calibration & Levels](#calibration--levels)
8. [Output Scales](#output-scales)
9. [Implementation Notes](#implementation-notes)

---

## Executive Summary

This specification defines a **movement-quality based** scoring system for baseball hitting mechanics using single-camera pose estimation. The system is aligned with Dr. Young-Hoo Kwon's kinematic sequencing research and The Hitting School Science (THSS) principles.

### Key Design Goals
1. **Fix calibration issue**: MLB-level movers should consistently score higher than average amateurs
2. **Movement over position**: Reward proper sequencing and timing, not just static "pretty positions"
3. **Single-camera practical**: Use only pose/joint data available from MediaPipe/similar systems
4. **Tunable & transparent**: All weights and thresholds exposed in config for easy adjustment
5. **GOATY band output**: Map to –3 to +3 scale for leaderboard/comparison use

### Core Principle
> "Elite movers have **proper sequence** (pelvis→torso→hands→bat), **good timing** (A→B→C durations), and **controlled efficiency** (minimal wasted movement). We grade by deviation from this biomechanical ideal, not by comparison to 'average'."

---

## Design Philosophy

### Kwon/THSS Principles

#### 1. **Kinematic Sequencing (Dr. Kwon)**
- **Proximal-to-distal** energy transfer: Pelvis → Torso → Arms → Bat
- **Timing gaps**: Each segment should peak 30-50ms apart
- **Order matters**: Incorrect sequence (e.g., arms before hips) is a critical flaw

#### 2. **A-B-C Phases (THSS)**
- **Phase A (Load/Trigger)**: Stance → Load position (weight shift, gather)
- **Phase B (Launch/Foot Plant)**: Load → Front foot plant (initiation of rotation)
- **Phase C (Swing/Contact)**: Foot plant → Ball contact (full rotation & extension)

#### 3. **Movement Quality Over Static Positions**
- A hitter with perfect "book" positions but poor timing/sequence scores lower
- A hitter with unique style but correct sequence/timing scores higher
- We measure **transitions** and **flow**, not just snapshots

### Why Current System Fails

**Problem**: MLB players sometimes score lower than amateurs because:
1. **Position-based grading**: Checks angles at snapshots (spine tilt, knee bend) without context
2. **No sequence weighting**: Missing sequence is treated the same as slightly poor posture
3. **Absolute thresholds**: 45° hip-shoulder sep is "good" regardless of level or timing
4. **Averaging artifacts**: A pro with unique mechanics (e.g., leg kick, open stance) gets penalized on individual position checks, even if sequence/tempo is elite

**Fix**: Weight sequence and timing heavily, use MLB mechanics as the biomechanical "ideal" reference, and allow wider variance in static positions.

---

## Inputs & Phase Detection

### Required Inputs
```typescript
interface ScoringInputs {
  // Joint data from video analysis
  jointData: JointFrame[];           // Array of frames with joint coordinates
  
  // Optional metadata
  playerHeight?: number;              // inches
  fps?: number;                       // frames per second (default 60)
  playerLevel?: string;               // "youth" | "hs" | "college" | "pro" (optional, for display only)
  
  // Optional user-marked frames (overrides auto-detection)
  manualImpactFrame?: number;
  manualLoadFrame?: number;
  manualLaunchFrame?: number;
}

interface JointFrame {
  frameIndex: number;
  timestamp: number;                  // milliseconds
  joints: Joint[];
}

interface Joint {
  name: string;                       // "left_hip", "right_wrist", etc.
  x: number;                          // normalized 0-1
  y: number;                          // normalized 0-1
  z?: number;                         // depth (often unreliable)
  confidence: number;                 // 0-1
}
```

### Phase Detection (A-B-C)

#### **Phase A: Load Frame Detection**
**Method**: Find frame where COM (center of mass proxy) is lowest and most rearward.

```typescript
function detectLoadFrame(frames: JointFrame[]): number {
  let minScore = Infinity;
  let loadFrame = 0;
  
  for (let i = 5; i < frames.length - 10; i++) {
    const frame = frames[i];
    const pelvisMid = getMidpoint(frame, 'left_hip', 'right_hip');
    
    // Score = Y position (lower is better) + slight bonus for rearward X
    // Lower Y = more loaded/gathered
    const score = pelvisMid.y * 100 - (pelvisMid.x - 0.5) * 10;
    
    if (score < minScore) {
      minScore = score;
      loadFrame = i;
    }
  }
  
  return loadFrame;
}
```

**Rationale**: The load position is where the hitter is most gathered/coiled before initiating the swing. Pelvis Y-position is the best single-camera proxy for this moment.

#### **Phase B: Launch Frame Detection**
**Method**: Find frame where pelvis rotation velocity crosses threshold after load.

```typescript
function detectLaunchFrame(frames: JointFrame[], loadFrame: number, fps: number): number {
  // Calculate pelvis rotation velocities after load
  const velocities = calculatePelvisAngularVelocity(frames, fps);
  
  // Find first frame after load where velocity > 200 deg/s (empirical threshold)
  for (let i = loadFrame + 1; i < frames.length - 5; i++) {
    if (velocities[i] > 200) {
      return i;
    }
  }
  
  // Fallback: Load + 10 frames
  return Math.min(loadFrame + 10, frames.length - 5);
}
```

**Rationale**: Launch is defined by the pelvis "firing" (initiation of rotation). This is more robust than foot-plant detection from single camera.

#### **Phase C: Impact Frame Detection**
**Method**: User-specified preferred; fallback to max hand velocity.

```typescript
function detectImpactFrame(frames: JointFrame[], launchFrame: number, fps: number, manual?: number): number {
  if (manual !== undefined) return manual;
  
  // Find frame with maximum lead-hand velocity after launch
  const handVelocities = calculateHandVelocity(frames, fps, 'lead');
  
  let maxVel = 0;
  let impactFrame = launchFrame + 10;
  
  for (let i = launchFrame + 5; i < frames.length; i++) {
    if (handVelocities[i] > maxVel) {
      maxVel = handVelocities[i];
      impactFrame = i;
    }
  }
  
  return impactFrame;
}
```

**Rationale**: Impact is the moment of maximum bat/hand speed. User specification is preferred for accuracy.

---

## Features (Mechanics)

We score 5 **primary feature categories**, each with sub-features. Total: **15 features**.

### Category 1: **TEMPO / RHYTHM** (25% of total score)
Movement timing and pace.

#### 1.1 **Load Duration (A→B Time)**
- **What**: Time from stance to launch initiation (ms)
- **Joints used**: Pelvis position & rotation velocity
- **Ideal range (MLB)**: 180-280ms
- **Why**: Too fast = rushed, no gather. Too slow = late timing, loss of momentum.

#### 1.2 **Swing Duration (B→C Time)**
- **What**: Time from launch to impact (ms)
- **Joints used**: Hand velocity peak timing
- **Ideal range (MLB)**: 140-180ms
- **Why**: Too fast = casting/disconnected. Too slow = late/pushing.

#### 1.3 **A:B Ratio**
- **What**: `(A→B time) / (B→C time)`
- **Ideal range (MLB)**: 1.2-1.8 (load slightly longer than swing)
- **Why**: Shows proper rhythm and "separation" of gather vs. swing phases.

---

### Category 2: **SEQUENCE / KINEMATICS** (35% of total score)
Order and timing of energy transfer (Kwon principles).

#### 2.1 **Sequence Order**
- **What**: Is the sequence pelvis→torso→hands→bat?
- **Joints used**: Angular velocity peaks for pelvis, torso, arm
- **Score**: Binary bonus if correct order. Critical feature.

#### 2.2 **Pelvis-Torso Gap**
- **What**: Time between pelvis peak and torso peak (ms)
- **Ideal range (MLB)**: 30-50ms
- **Why**: Too small = simultaneous (loss of separation). Too large = disconnect.

#### 2.3 **Torso-Hands Gap**
- **What**: Time between torso peak and hands peak (ms)
- **Ideal range (MLB)**: 35-55ms
- **Why**: Smooth hand-off of energy from trunk to arms.

#### 2.4 **Hands-Bat Gap**
- **What**: Time between hands peak and bat peak (ms)
- **Ideal range (MLB)**: 20-40ms (hands lead, bat follows)
- **Why**: Lag creates whip. No lag = push/drag.

---

### Category 3: **COM / BALANCE** (15% of total score)
Center-of-mass control and stability.

#### 3.1 **Pelvis Trajectory Control**
- **What**: Smoothness of pelvis path from A→B→C (variance in acceleration)
- **Joints used**: Pelvis midpoint position over time
- **Ideal**: Low jerk (3rd derivative of position)
- **Why**: Smooth COM path = efficient, controlled movement. Erratic path = loss of balance/power.

#### 3.2 **Head Stability**
- **What**: Head displacement from stance to impact (cm)
- **Joints used**: Nose or mid-eye landmark
- **Ideal range (MLB)**: < 8cm
- **Why**: Stable head = better vision, more consistent contact.

#### 3.3 **Weight Transfer Completion**
- **What**: % of weight shifted from rear to front by impact
- **Joints used**: Pelvis X-position: `(impactX - stanceX) / (launchX - stanceX)`
- **Ideal range (MLB)**: 70-100% (full shift)
- **Why**: Incomplete weight shift leaves power "on the back side".

---

### Category 4: **HAND PATH / BARREL DELIVERY** (15% of total score)
Efficiency of bat/barrel delivery to contact zone.

#### 4.1 **Hand Path Efficiency**
- **What**: Arc length of lead hand path / straight-line distance (A→C)
- **Joints used**: Lead wrist position tracking
- **Ideal range (MLB)**: 1.1-1.3 (slight arc, not loop or chop)
- **Why**: Efficient path keeps barrel in zone longer.

#### 4.2 **Barrel Direction at Impact**
- **What**: Angle of bat path relative to pitch plane
- **Joints used**: Lead wrist & rear wrist vectors
- **Ideal range (MLB)**: Within 15° of level (accounting for pitch height)
- **Why**: Matching pitch plane maximizes contact quality.

#### 4.3 **Connection Score**
- **What**: Proximity of rear elbow to torso during B→C phase (cm)
- **Joints used**: Rear elbow to mid-torso distance
- **Ideal range (MLB)**: < 20cm separation
- **Why**: Connected arms = power transfer. Disconnected = casting/weak contact.

---

### Category 5: **POSTURE / SPINE** (10% of total score)
Dynamic posture maintenance through swing.

#### 5.1 **Spine Angle Maintenance**
- **What**: Change in spine tilt from B to C (degrees)
- **Joints used**: Hip-shoulder midpoint angle from vertical
- **Ideal range (MLB)**: < 15° change (stable posture)
- **Why**: Big changes = loss of posture, weak contact.

#### 5.2 **Shoulder Tilt at Impact**
- **What**: Shoulder line angle from horizontal (degrees)
- **Joints used**: Left-right shoulder line
- **Ideal range (MLB)**: 8-20° (rear shoulder slightly lower)
- **Why**: Maintains swing plane and bat angle through zone.

---

## Feature Scoring (Math)

### General Principle
Each feature produces a **subscore** on 0-100 scale:
- **100** = Elite/MLB-optimal
- **75-90** = Solid/above-average
- **50-75** = Developing/room for improvement
- **< 50** = Significant flaw

### Scoring Function Types

#### Type 1: **Tolerance Band (Soft Boundaries)**
Use for features with an ideal range (e.g., timing gaps).

```typescript
function scoreToleranceBand(
  value: number,
  idealMin: number,
  idealMax: number,
  softMin: number,
  softMax: number
): number {
  // Inside ideal band → 100
  if (value >= idealMin && value <= idealMax) {
    return 100;
  }
  
  // Inside soft band → linear decay
  if (value >= softMin && value < idealMin) {
    return 75 + (value - softMin) / (idealMin - softMin) * 25;
  }
  if (value > idealMax && value <= softMax) {
    return 75 + (softMax - value) / (softMax - idealMax) * 25;
  }
  
  // Outside soft band → steep penalty
  if (value < softMin) {
    return Math.max(0, 50 - (softMin - value) * 2);
  }
  return Math.max(0, 50 - (value - softMax) * 2);
}
```

**Example** (Pelvis-Torso Gap):
- Ideal: 30-50ms → score 100
- Soft: 20-60ms → score 75-100 (linear)
- Outside: < 20ms or > 60ms → score 0-50 (steep penalty)

---

#### Type 2: **Directional (Less is Better or More is Better)**
Use for features with one-sided ideals.

```typescript
function scoreLessIsBetter(
  value: number,
  optimal: number,
  acceptable: number,
  poor: number
): number {
  if (value <= optimal) return 100;
  if (value <= acceptable) {
    return 75 + (acceptable - value) / (acceptable - optimal) * 25;
  }
  if (value <= poor) {
    return 50 + (poor - value) / (poor - acceptable) * 25;
  }
  return Math.max(0, 50 - (value - poor));
}
```

**Example** (Head Displacement):
- ≤ 5cm → score 100
- 5-10cm → score 75-100
- 10-15cm → score 50-75
- > 15cm → score 0-50

---

#### Type 3: **Binary + Bonus (Sequence Order)**
Critical features that are pass/fail with gradations.

```typescript
function scoreSequenceOrder(order: string[]): number {
  const correctOrder = ['pelvis', 'torso', 'hands', 'bat'];
  
  // Perfect order → 100
  if (arraysEqual(order, correctOrder)) return 100;
  
  // Count correct positions
  let correctPositions = 0;
  for (let i = 0; i < 4; i++) {
    if (order[i] === correctOrder[i]) correctPositions++;
  }
  
  // Partial credit:
  // 3/4 correct → 70
  // 2/4 correct → 40
  // 1/4 correct → 20
  // 0/4 correct → 0
  return correctPositions * 25;
}
```

---

### Feature-Specific Scoring Details

| Feature | MLB Ideal | MLB Acceptable | Type | Weight in Category |
|---------|-----------|----------------|------|-------------------|
| **TEMPO** | | | | |
| Load Duration (A→B) | 180-280ms | 150-320ms | Tolerance Band | 35% |
| Swing Duration (B→C) | 140-180ms | 120-200ms | Tolerance Band | 35% |
| A:B Ratio | 1.2-1.8 | 1.0-2.2 | Tolerance Band | 30% |
| **SEQUENCE** | | | | |
| Sequence Order | Perfect | 3/4 correct | Binary + Bonus | 40% |
| Pelvis-Torso Gap | 30-50ms | 20-60ms | Tolerance Band | 20% |
| Torso-Hands Gap | 35-55ms | 25-65ms | Tolerance Band | 20% |
| Hands-Bat Gap | 20-40ms | 15-50ms | Tolerance Band | 20% |
| **COM / BALANCE** | | | | |
| Pelvis Trajectory Control | Low jerk | Medium jerk | Less is Better | 40% |
| Head Stability | < 5cm | < 10cm | Less is Better | 30% |
| Weight Transfer | 80-100% | 60-100% | More is Better | 30% |
| **HAND PATH** | | | | |
| Hand Path Efficiency | 1.1-1.3 | 1.0-1.5 | Tolerance Band | 40% |
| Barrel Direction | ±5° | ±15° | Less is Better | 35% |
| Connection Score | < 15cm | < 25cm | Less is Better | 25% |
| **POSTURE** | | | | |
| Spine Angle Change | < 10° | < 18° | Less is Better | 55% |
| Shoulder Tilt Impact | 8-20° | 5-25° | Tolerance Band | 45% |

---

## Weighting & Composite

### Category Weights (Total = 100%)
```typescript
const CATEGORY_WEIGHTS = {
  tempo: 0.25,        // 25% - Rhythm and timing
  sequence: 0.35,     // 35% - Kinematic chain (MOST IMPORTANT)
  comBalance: 0.15,   // 15% - Stability and control
  handPath: 0.15,     // 15% - Barrel delivery efficiency
  posture: 0.10,      // 10% - Dynamic posture
};
```

### Composite Formula

```typescript
function calculateCompositeScore(categoryScores: CategoryScores): number {
  const composite = 
    categoryScores.tempo * CATEGORY_WEIGHTS.tempo +
    categoryScores.sequence * CATEGORY_WEIGHTS.sequence +
    categoryScores.comBalance * CATEGORY_WEIGHTS.comBalance +
    categoryScores.handPath * CATEGORY_WEIGHTS.handPath +
    categoryScores.posture * CATEGORY_WEIGHTS.posture;
  
  return Math.round(composite); // 0-100 integer
}
```

### Critical Feature Penalty
If **Sequence Order** score < 40 (less than 2/4 correct), apply penalty:

```typescript
if (sequenceOrderScore < 40) {
  // Cap final score at 70, regardless of other features
  finalScore = Math.min(70, finalScore);
}
```

**Rationale**: You cannot have elite mechanics with broken sequence, even if other metrics look good.

---

## Calibration & Levels

### Reference Standard: MLB Biomechanical "Ideal"

**Philosophy**: We grade by deviation from MLB-level *movement quality*, not by comparison to average population.

- **MLB hitters** who execute proper sequence/tempo should score 85-95+
- **Elite amateurs** (D1 commits, top travel ball) with good mechanics: 75-85
- **Solid HS/club players** with developing mechanics: 60-75
- **Beginners** or players with significant flaws: 40-60
- **Poor mechanics** (broken sequence, major timing issues): < 40

### Why This Works

1. **No circular logic**: We don't define "good" as "whatever MLB players do on average". Instead, we define good as "biomechanically efficient sequence/tempo", which MLB players *usually* exhibit.

2. **Handles outliers**: An MLB player with unique mechanics (e.g., Jeff Bagwell's crouch) still scores high if sequence/tempo are sound. A poor-moving amateur scores low even if stance "looks pretty".

3. **Rewards fundamentals**: Even if a youth player can't generate MLB bat speed (strength issue), they can still score well on sequence/timing (movement quality).

### Level Tags (Optional, for Display Only)

```typescript
const LEVEL_TAGS = {
  youth: "Youth (8-12)",
  hs: "High School (13-18)",
  college: "College (18-22)",
  pro: "Professional"
};
```

**Important**: Level tags are **NOT** used to adjust scores. All players are graded on the same biomechanical standard. Level tags only affect:
- UI display context (e.g., "Great for HS level!")
- Optional filters/leaderboards (compare within age group)

---

## Output Scales

### Primary Output: **BARRELS Mechanics Score** (0-100)

```typescript
interface ScoringOutput {
  // Final composite score
  mechanicsScore: number;           // 0-100 integer
  
  // GOATY band
  goatyBand: number;                // -3 to +3
  
  // Category breakdowns
  categoryScores: {
    tempo: number;                  // 0-100
    sequence: number;               // 0-100
    comBalance: number;             // 0-100
    handPath: number;               // 0-100
    posture: number;                // 0-100
  };
  
  // Feature-level details (for debug/coaching)
  featureScores: FeatureScore[];
  
  // Quality indicators
  confidence: number;               // 0-1 (based on joint visibility)
  dataQuality: 'high' | 'medium' | 'low';
}
```

### GOATY Band Mapping (-3 to +3)

**Formula**:
```typescript
function mapToGoatyBand(mechanicsScore: number): number {
  if (mechanicsScore >= 92) return 3;   // Elite
  if (mechanicsScore >= 85) return 2;   // Advanced
  if (mechanicsScore >= 75) return 1;   // Above Average
  if (mechanicsScore >= 60) return 0;   // Average
  if (mechanicsScore >= 50) return -1;  // Below Average
  if (mechanicsScore >= 40) return -2;  // Poor
  return -3;                             // Very Poor
}
```

**Band Descriptions**:
- **+3**: Elite mechanics - MLB-caliber sequence/tempo
- **+2**: Advanced mechanics - High-level amateur, solid fundamentals
- **+1**: Above average - Good sequence, minor issues
- **0**: Average - Developing mechanics, some flaws
- **-1**: Below average - Timing/sequence issues present
- **-2**: Poor - Major flaws in sequence or tempo
- **-3**: Very poor - Broken mechanics, needs fundamental work

### Anchor/Engine/Whip Mapping (For UI Continuity)

To maintain existing UI (Anchor/Engine/Whip), map categories:

```typescript
const LEGACY_MAPPING = {
  anchor: ['comBalance', 'posture'],          // Lower body stability
  engine: ['sequence', 'tempo'],              // Core/rotation quality
  whip: ['handPath'],                         // Arms/bat delivery
};

function mapToLegacyScores(categoryScores: CategoryScores): LegacyScores {
  return {
    anchor: Math.round((categoryScores.comBalance * 0.6 + categoryScores.posture * 0.4)),
    engine: Math.round((categoryScores.sequence * 0.7 + categoryScores.tempo * 0.3)),
    whip: categoryScores.handPath,
  };
}
```

---

## Implementation Notes

### Config File Structure

```typescript
// lib/scoring/config.ts
export const NEW_SCORING_ENGINE_ENABLED = false; // Feature flag

export const SCORING_CONFIG = {
  // Category weights
  weights: {
    tempo: 0.25,
    sequence: 0.35,
    comBalance: 0.15,
    handPath: 0.15,
    posture: 0.10,
  },
  
  // Feature-level weights (within categories)
  featureWeights: {
    tempo: {
      loadDuration: 0.35,
      swingDuration: 0.35,
      abRatio: 0.30,
    },
    sequence: {
      sequenceOrder: 0.40,
      pelvisTorsoGap: 0.20,
      torsoHandsGap: 0.20,
      handsBatGap: 0.20,
    },
    // ... etc
  },
  
  // Thresholds (MLB ideals)
  thresholds: {
    loadDuration: { ideal: [180, 280], soft: [150, 320] },
    swingDuration: { ideal: [140, 180], soft: [120, 200] },
    pelvisTorsoGap: { ideal: [30, 50], soft: [20, 60] },
    torsoHandsGap: { ideal: [35, 55], soft: [25, 65] },
    handsBatGap: { ideal: [20, 40], soft: [15, 50] },
    headDisplacement: { optimal: 5, acceptable: 10, poor: 15 },
    // ... etc
  },
  
  // GOATY band thresholds
  goatyBands: [
    { min: 92, band: 3 },
    { min: 85, band: 2 },
    { min: 75, band: 1 },
    { min: 60, band: 0 },
    { min: 50, band: -1 },
    { min: 40, band: -2 },
    { min: 0, band: -3 },
  ],
  
  // Penalties
  criticalFeaturePenalty: {
    enabled: true,
    sequenceOrderThreshold: 40,
    capScore: 70,
  },
};
```

### Engine Module Structure

```typescript
// lib/scoring/newScoringEngine.ts

export interface ScoringResult {
  mechanicsScore: number;
  goatyBand: number;
  categoryScores: CategoryScores;
  featureScores: FeatureScore[];
  debugBreakdown: DebugBreakdown;
  confidence: number;
  dataQuality: 'high' | 'medium' | 'low';
}

export async function scoreSwing(inputs: ScoringInputs): Promise<ScoringResult> {
  // 1. Detect phases
  const phases = detectPhases(inputs.jointData, inputs.fps);
  
  // 2. Extract all features
  const features = extractFeatures(inputs.jointData, phases, inputs.fps);
  
  // 3. Score each feature
  const featureScores = scoreFeatures(features);
  
  // 4. Aggregate into category scores
  const categoryScores = aggregateCategoryScores(featureScores);
  
  // 5. Calculate composite
  let mechanicsScore = calculateComposite(categoryScores);
  
  // 6. Apply penalties
  mechanicsScore = applyPenalties(mechanicsScore, featureScores);
  
  // 7. Map to GOATY band
  const goatyBand = mapToGoatyBand(mechanicsScore);
  
  // 8. Calculate confidence
  const confidence = calculateConfidence(inputs.jointData);
  const dataQuality = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
  
  return {
    mechanicsScore,
    goatyBand,
    categoryScores,
    featureScores,
    debugBreakdown: buildDebugOutput(features, featureScores, categoryScores),
    confidence,
    dataQuality,
  };
}
```

### Feature Flag Integration

```typescript
// app/api/videos/[id]/analyze/route.ts (updated)

import { NEW_SCORING_ENGINE_ENABLED, scoreSwing } from '@/lib/scoring/newScoringEngine';

// Inside POST handler:
if (NEW_SCORING_ENGINE_ENABLED) {
  const newScoring = await scoreSwing({
    jointData: video.skeletonData,
    fps: video.fps,
    playerHeight: video.user?.height,
  });
  
  // Store new scores
  await prisma.video.update({
    where: { id: videoId },
    data: {
      overallScore: newScoring.mechanicsScore,
      anchor: newScoring.legacyScores.anchor,
      engine: newScoring.legacyScores.engine,
      whip: newScoring.legacyScores.whip,
      // Store full breakdown in JSON field for debug
      scoringBreakdown: newScoring.debugBreakdown,
    },
  });
} else {
  // Use old scoring (existing code)
  const analysis = await analyzeSwing(swing);
  // ... existing logic
}
```

---

## Summary

This specification defines a **robust, transparent, and tunable** scoring system that:

1. ✅ **Fixes MLB calibration**: Grades by deviation from biomechanical ideal, not population average
2. ✅ **Rewards movement quality**: Heavy weight on sequence (35%) and tempo (25%)
3. ✅ **Practical for single-camera**: Uses only pose/joint data, no force plates
4. ✅ **Fully configurable**: All weights, thresholds, and penalties in config file
5. ✅ **Debug-friendly**: Returns full breakdown for every swing
6. ✅ **Backward compatible**: Maps to existing Anchor/Engine/Whip for UI continuity

**Next Step**: Proceed to PHASE 3 implementation using this spec as the blueprint.

---

**End of Specification**
