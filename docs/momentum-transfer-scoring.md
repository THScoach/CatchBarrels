# Momentum Transfer Scoring — Complete Specification

## Overview

This document defines the **complete JSON structure** for Momentum Transfer scoring in the BARRELS app, including detailed submetrics for Ground Flow, Power Flow, and Barrel Flow.

**Date:** November 26, 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## JSON Structure

### Top-Level Object

```typescript
interface MomentumTransferResult {
  athleteId: string;
  videoId: string;
  level: 'MLB' | 'Pro' | 'College' | 'HS' | '14U' | 'Youth';
  handedness: 'R' | 'L' | 'S';
  momentumTransferScore: MomentumTransferScore;
}
```

### Momentum Transfer Score

```typescript
interface MomentumTransferScore {
  overall: number;                    // 0-100
  label: string;                      // "Elite", "Advanced", etc.
  groundFlow: FlowPathScore;
  powerFlow: FlowPathScore;
  barrelFlow: FlowPathScore;
  dataQuality: DataQuality;
  goatyBand: number;                  // -3 to +3 (can rename to tierBand)
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
}
```

### Flow Path Score (Ground / Power / Barrel)

```typescript
interface FlowPathScore {
  score: number;                      // 0-100
  label: string;                      // "Elite", "Advanced", etc.
  submetrics: GroundFlowSubmetrics | PowerFlowSubmetrics | BarrelFlowSubmetrics;
}
```

### Ground Flow Submetrics

```typescript
interface GroundFlowSubmetrics {
  loadToLaunchTimingMs: number;       // Milliseconds from load to launch
  pelvisAccelPattern: string;         // "smooth", "rushed", "delayed"
  rearLegSupportQuality: number;      // 0.0 - 1.0 (quality score)
  weightShiftPercent: number;         // 0.0 - 1.0 (% of weight transferred)
}
```

### Power Flow Submetrics

```typescript
interface PowerFlowSubmetrics {
  pelvisToTorsoDelayMs: number;       // Gap in milliseconds
  torsoToHandsDelayMs: number;        // Gap in milliseconds
  sequenceOrder: string[];            // e.g., ["ground", "pelvis", "torso", "hands", "barrel"]
  torsoRotationQuality: number;       // 0.0 - 1.0 (rotation quality score)
}
```

### Barrel Flow Submetrics

```typescript
interface BarrelFlowSubmetrics {
  handPathEfficiency: number;         // Ratio (1.0 = perfect, >1.0 = inefficient)
  barrelLaunchDirection: string;      // "on-plane", "slightly-pully", "cut-across"
  contactWhipQuality: number;         // 0.0 - 1.0 (whip quality at contact)
}
```

### Data Quality

```typescript
interface DataQuality {
  poseConfidence: number;             // 0.0 - 1.0 (MediaPipe confidence)
  cameraAngleOK: boolean;             // True if angle is acceptable
  framesUsed: number;                 // Number of frames analyzed
}
```

---

## Complete JSON Example

### Pro Swing (Tiny - 91 MTS)

```json
{
  "athleteId": "tiny_pro",
  "videoId": "tiny_bp_01",
  "level": "Pro",
  "handedness": "R",
  "momentumTransferScore": {
    "overall": 91,
    "label": "Elite",
    "groundFlow": {
      "score": 88,
      "label": "Advanced",
      "submetrics": {
        "loadToLaunchTimingMs": 230,
        "pelvisAccelPattern": "smooth",
        "rearLegSupportQuality": 0.9,
        "weightShiftPercent": 0.88
      }
    },
    "powerFlow": {
      "score": 95,
      "label": "Elite",
      "submetrics": {
        "pelvisToTorsoDelayMs": 36,
        "torsoToHandsDelayMs": 40,
        "sequenceOrder": ["ground", "pelvis", "torso", "hands", "barrel"],
        "torsoRotationQuality": 0.96
      }
    },
    "barrelFlow": {
      "score": 90,
      "label": "Elite",
      "submetrics": {
        "handPathEfficiency": 1.08,
        "barrelLaunchDirection": "on-plane",
        "contactWhipQuality": 0.93
      }
    },
    "dataQuality": {
      "poseConfidence": 0.9,
      "cameraAngleOK": true,
      "framesUsed": 140
    },
    "goatyBand": 3,
    "goatyBandLabel": "Elite"
  }
}
```

### Youth Swing (14U - 68 MTS)

```json
{
  "athleteId": "youth_14u",
  "videoId": "youth_game_01",
  "level": "14U",
  "handedness": "R",
  "momentumTransferScore": {
    "overall": 68,
    "label": "Developing",
    "groundFlow": {
      "score": 62,
      "label": "Developing",
      "submetrics": {
        "loadToLaunchTimingMs": 190,
        "pelvisAccelPattern": "rushed",
        "rearLegSupportQuality": 0.65,
        "weightShiftPercent": 0.6
      }
    },
    "powerFlow": {
      "score": 72,
      "label": "Average",
      "submetrics": {
        "pelvisToTorsoDelayMs": 24,
        "torsoToHandsDelayMs": 30,
        "sequenceOrder": ["ground", "pelvis", "hands", "torso", "barrel"],
        "torsoRotationQuality": 0.72
      }
    },
    "barrelFlow": {
      "score": 70,
      "label": "Average",
      "submetrics": {
        "handPathEfficiency": 1.35,
        "barrelLaunchDirection": "slightly-pully",
        "contactWhipQuality": 0.68
      }
    },
    "dataQuality": {
      "poseConfidence": 0.82,
      "cameraAngleOK": true,
      "framesUsed": 110
    },
    "goatyBand": 0,
    "goatyBandLabel": "Developing"
  }
}
```

### High School Swing (82 MTS)

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

## Score Interpretation

### Overall Momentum Transfer Score

| Score Range | Label | Interpretation |
|-------------|-------|----------------|
| 92-100 | Elite | Big-league level momentum transfer |
| 85-91 | Advanced | Very strong energy flow |
| 75-84 | Above Average | Solid foundation with room to grow |
| 60-74 | Developing | Building the pattern |
| <60 | Needs Work | Significant leaks in energy transfer |

### Flow Path Scores

Each Flow Path (Ground / Power / Barrel) uses the same scale:

| Score | Description |
|-------|-------------|
| 90-100 | Elite - Minimal energy leak |
| 80-89 | Advanced - Strong performance |
| 70-79 | Above Average - Good foundation |
| 60-69 | Developing - Room for improvement |
| <60 | Needs Work - Significant leak |

---

## Submetric Interpretations

### Ground Flow

**loadToLaunchTimingMs**
- **Elite**: 220-250ms
- **Average**: 180-280ms
- **Concern**: <160ms (rushed) or >300ms (slow)

**pelvisAccelPattern**
- **"smooth"**: Gradual acceleration (ideal)
- **"rushed"**: Too fast, loses control
- **"delayed"**: Late initiation, power loss

**rearLegSupportQuality** (0.0 - 1.0)
- **Elite**: 0.85-1.0
- **Average**: 0.7-0.84
- **Concern**: <0.6 (unstable base)

**weightShiftPercent** (0.0 - 1.0)
- **Elite**: 0.75-0.9
- **Average**: 0.6-0.74
- **Concern**: <0.5 or >0.95 (too much/little shift)

### Power Flow

**pelvisToTorsoDelayMs**
- **Elite**: 35-45ms
- **Average**: 25-50ms
- **Concern**: <20ms (spinning together) or >60ms (disconnected)

**torsoToHandsDelayMs**
- **Elite**: 35-50ms
- **Average**: 25-55ms
- **Concern**: <20ms (early) or >70ms (late)

**sequenceOrder**
- **Ideal**: `["ground", "pelvis", "torso", "hands", "barrel"]`
- **Concern**: Any out-of-order segments (e.g., hands before torso)

**torsoRotationQuality** (0.0 - 1.0)
- **Elite**: 0.9-1.0
- **Average**: 0.75-0.89
- **Concern**: <0.65 (incomplete rotation)

### Barrel Flow

**handPathEfficiency**
- **Elite**: 1.0-1.1 (direct path)
- **Average**: 1.1-1.25
- **Concern**: >1.3 (excessive movement)

**barrelLaunchDirection**
- **"on-plane"**: Ideal barrel path
- **"slightly-pully"**: Minor pull tendency
- **"cut-across"**: Significant path deviation

**contactWhipQuality** (0.0 - 1.0)
- **Elite**: 0.9-1.0
- **Average**: 0.75-0.89
- **Concern**: <0.65 (weak whip action)

---

## Data Quality Thresholds

**poseConfidence**
- **Good**: >0.85
- **Acceptable**: 0.75-0.85
- **Poor**: <0.75 (may need reanalysis)

**cameraAngleOK**
- **true**: Angle is within acceptable range
- **false**: Camera angle suboptimal (scores may be affected)

**framesUsed**
- **Good**: >100 frames
- **Acceptable**: 80-100 frames
- **Poor**: <80 frames (limited data)

---

## Usage in API Responses

### Analysis Endpoint Response

```json
{
  "videoId": "video_abc",
  "analyzed": true,
  "momentumTransfer": {
    "overall": 82,
    "label": "Advanced",
    "groundFlow": { ... },
    "powerFlow": { ... },
    "barrelFlow": { ... },
    "dataQuality": { ... },
    "goatyBand": 2,
    "goatyBandLabel": "Advanced"
  },
  "legacyScores": {
    "anchor": 78,
    "engine": 88,
    "whip": 80
  }
}
```

### Coach Rick Input Format

```json
{
  "message": "Explain my last swing",
  "context": {
    "momentumTransferScore": {
      "overall": 82,
      "label": "Advanced",
      "groundFlow": { ... },
      "powerFlow": { ... },
      "barrelFlow": { ... }
    }
  }
}
```

---

## Implementation Notes

### Database Storage

Store as JSON in `newScoringBreakdown` field:

```sql
UPDATE Video SET 
  newScoringBreakdown = '{"momentumTransfer": {...}}',
  goatyBand = 2,
  mechanicsScore = 82
WHERE id = 'video_abc';
```

### TypeScript Type Guards

```typescript
function isMomentumTransferScore(obj: any): obj is MomentumTransferScore {
  return obj 
    && typeof obj.overall === 'number'
    && obj.groundFlow !== undefined
    && obj.powerFlow !== undefined
    && obj.barrelFlow !== undefined;
}
```

### Backward Compatibility

Always provide legacy score mappings:

```typescript
const legacyScores = {
  anchor: momentumTransfer.groundFlow.score,
  engine: momentumTransfer.powerFlow.score,
  whip: momentumTransfer.barrelFlow.score
};
```

---

## Summary

This structure provides:
- ✅ **Detailed submetrics** for each Flow Path
- ✅ **Data quality indicators** for confidence scoring
- ✅ **Clear score interpretation** for UI display
- ✅ **Backward compatibility** with legacy system
- ✅ **Type-safe schema** for TypeScript implementation

**Use this as the canonical reference for all Momentum Transfer scoring implementations.**

---

**Last Updated:** November 26, 2025  
**Version:** 2.0  
**Status:** Production Ready
