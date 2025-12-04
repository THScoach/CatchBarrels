/**
 * BARRELS Metrics Configuration (ANCHOR + ENGINE + WHIP)
 * Kid-friendly language for 8th grade / HS hitters with BARREL pattern guidance
 */

export type MetricGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'Good' | 'OK' | 'Needs Work';

export interface MetricDefinition {
  name: string;
  what_it_is: string;
  why_it_matters: string;
  goat_pattern: string;
  category: 'motion' | 'stability' | 'sequencing';
  weight: number; // percentage contribution to category
}

export interface MetricValue extends MetricDefinition {
  value: number | null;
  grade: MetricGrade;
  color: 'green' | 'yellow' | 'red' | 'gray';
}

/**
 * ENGINE (Hips & Shoulders) - How well your hips and shoulders work together to create power
 */
export const ENGINE_METRICS: Record<string, MetricDefinition> = {
  // MOTION (40%) - How your hips and shoulders move
  hipTurn: {
    name: 'Hip Turn',
    what_it_is: 'How much your hips turn during the swing.',
    why_it_matters: 'Strong hip turn drives power from the ground up.',
    goat_pattern: 'In BARREL swings, the hips get all the way through toward the pitcher by contact, not stuck facing home plate.',
    category: 'motion',
    weight: 40
  },
  
  shoulderTurn: {
    name: 'Shoulder Turn',
    what_it_is: 'How much your shoulders and chest turn.',
    why_it_matters: 'Your shoulders carry power from your hips into your arms and bat.',
    goat_pattern: 'In BARREL swings, the back shoulder really comes through the ball, not just the arms swinging.',
    category: 'motion',
    weight: 30
  },
  
  hipShoulderStretch: {
    name: 'Hip–Shoulder Stretch',
    what_it_is: 'How much your hips start to open while your shoulders stay back—the stretch you feel across your core.',
    why_it_matters: 'That stretch works like a pulled rubber band and helps snap the bat through the zone.',
    goat_pattern: 'In BARREL swings, the hips fire first while the chest stays back for a split second, then the chest launches like a whip.',
    category: 'motion',
    weight: 30
  },
  
  // STABILITY (30%) - How under control your body is
  postureControl: {
    name: 'Posture Control',
    what_it_is: 'Keeping your body in a strong, balanced position throughout the swing.',
    why_it_matters: 'Good posture means better balance and more consistent contact.',
    goat_pattern: 'In BARREL swings, the head stays about the same height while the lower body works underneath.',
    category: 'stability',
    weight: 35
  },
  
  shoulderFinish: {
    name: 'Shoulder Finish',
    what_it_is: 'How your shoulders rotate and finish after hitting the ball.',
    why_it_matters: 'Too little turn kills power; too much turn makes you spin off the ball.',
    goat_pattern: 'In BARREL swings, the shoulders finish turned toward the pitcher but still "on" the ball, not flying open toward the dugout.',
    category: 'stability',
    weight: 35
  },
  
  backLegSupport: {
    name: 'Back Leg Support',
    what_it_is: 'How well your back leg pushes and supports your body\'s rotation.',
    why_it_matters: 'A strong back leg lets you drive the ground and keep your swing stable.',
    goat_pattern: 'In BARREL swings, the back leg stays strong and drives the ground instead of the back knee just collapsing.',
    category: 'stability',
    weight: 30
  },
  
  // SEQUENCING (20%) - Order and timing of hips & shoulders
  hipsFirst: {
    name: 'Hips First',
    what_it_is: 'Starting your swing with your hips before your shoulders.',
    why_it_matters: 'Great swings go hips → shoulders → arms → bat.',
    goat_pattern: 'In BARREL swings, the hips clearly win the race and the shoulders chase a split second later.',
    category: 'sequencing',
    weight: 30
  },
  
  hipsToShouldersTiming: {
    name: 'Hips‑to‑Shoulders Timing',
    what_it_is: 'The smooth, powerful hand-off of energy from your hips to your shoulders.',
    why_it_matters: 'Shows how cleanly you pass power from hips to shoulders.',
    goat_pattern: 'In BARREL swings, it looks like a smooth wave—hips fire, then shoulders catch and go, not everything jerking at once.',
    category: 'sequencing',
    weight: 40
  },
  
  engineSequence: {
    name: 'Engine Sequence',
    what_it_is: 'The overall order and flow of your hips and shoulders working together.',
    why_it_matters: 'Summarizes how well your "engine" is working.',
    goat_pattern: 'BARREL swings almost always show a clean chain: hips → shoulders → bat.',
    category: 'sequencing',
    weight: 30
  }
};

/**
 * ANCHOR (Feet & Ground) - How well you use the ground to stay balanced and create power
 */
export const ANCHOR_METRICS: Record<string, MetricDefinition> = {
  // MOTION (40%) - How your feet and legs move
  loadIntoBackLeg: {
    name: 'Load Into Back Leg',
    what_it_is: 'How well you sink into your back leg before you start the swing.',
    why_it_matters: 'Loading your back leg stores energy like a coiled spring, ready to explode.',
    goat_pattern: 'In BARREL swings, the back knee flexes and the back hip loads down and back, not just shifting weight.',
    category: 'motion',
    weight: 33
  },
  
  strideMove: {
    name: 'Stride Move',
    what_it_is: 'How smooth and controlled your step or stride is toward the pitcher.',
    why_it_matters: 'A controlled stride helps you stay balanced and on-time.',
    goat_pattern: 'In BARREL swings, the stride is smooth and controlled, not too big or rushed, landing soft.',
    category: 'motion',
    weight: 33
  },
  
  weightShift: {
    name: 'Weight Shift',
    what_it_is: 'How well your weight moves from your back leg into your front leg as you swing.',
    why_it_matters: 'Great swings transfer energy from back to front, not staying stuck on the back side.',
    goat_pattern: 'In BARREL swings, the weight flows smoothly forward as the swing happens, driving through the ball.',
    category: 'motion',
    weight: 34
  },
  
  // STABILITY (40%) - How balanced and strong your base is
  headBalance: {
    name: 'Head Balance',
    what_it_is: 'How steady your head stays while your body moves around it.',
    why_it_matters: 'A steady head means better vision and more consistent contact.',
    goat_pattern: 'In BARREL swings, the head stays level and quiet, not dipping or pulling off the ball.',
    category: 'stability',
    weight: 33
  },
  
  baseWidth: {
    name: 'Base Width',
    what_it_is: 'How strong and athletic your stance is—feet not too close, not too wide.',
    why_it_matters: 'A good base lets you generate power and stay balanced through the swing.',
    goat_pattern: 'In BARREL swings, the feet are shoulder-width or slightly wider, giving a strong, athletic foundation.',
    category: 'stability',
    weight: 33
  },
  
  frontSideBrace: {
    name: 'Front Side Brace',
    what_it_is: 'How firm your front leg and front side are at and after contact.',
    why_it_matters: 'A firm front side blocks your forward momentum and lets your body rotate hard.',
    goat_pattern: 'In BARREL swings, the front leg straightens and firms up at contact, not collapsing or soft.',
    category: 'stability',
    weight: 34
  },
  
  // SEQUENCING (20%) - Order and timing of lower body movement
  loadStrideTimingAnchor: {
    name: 'Load → Stride Timing',
    what_it_is: 'How well your load into the back leg flows into your stride toward the pitcher.',
    why_it_matters: 'Shows how smoothly your lower body starts the swing sequence.',
    goat_pattern: 'In BARREL swings, the load and stride feel connected, not jerky or separated.',
    category: 'sequencing',
    weight: 33
  },
  
  groundUpStart: {
    name: 'Ground-Up Start',
    what_it_is: 'Whether your swing starts from the ground and legs instead of just the hands.',
    why_it_matters: 'Power comes from the ground up—legs first, then everything else.',
    goat_pattern: 'In BARREL swings, you can see the legs drive first, then the hips, then the torso and arms.',
    category: 'sequencing',
    weight: 33
  },
  
  anchorSequence: {
    name: 'Anchor Sequence',
    what_it_is: 'The overall order of how your feet, legs, and weight shift work together.',
    why_it_matters: 'Summarizes how well your lower body foundation is working.',
    goat_pattern: 'BARREL swings show a clear pattern: load → stride → drive from the ground.',
    category: 'sequencing',
    weight: 34
  }
};

/**
 * WHIP (Arms & Bat) - How well your arms and bat snap through the zone at the right time
 */
export const WHIP_METRICS: Record<string, MetricDefinition> = {
  // MOTION (40%) - Timing-based arm and bat movement
  handPath: {
    name: 'Hand Path',
    what_it_is: 'The path your hands take from launch to contact—whether they stay on a clean line to the ball or loop around.',
    why_it_matters: 'A clean hand path keeps the barrel in the hitting zone longer and makes it easier to square up different pitch locations.',
    goat_pattern: 'In BARREL swings, the hands stay tight to the body and work straight to the ball—not casting way out early and not chopping straight down.',
    category: 'motion',
    weight: 33
  },
  
  barrelTurn: {
    name: 'Barrel Turn',
    what_it_is: 'How quickly and smoothly the barrel turns behind you and into the zone.',
    why_it_matters: 'Good barrel turn gives you early bat speed and helps you match the pitch plane, so you don\'t have to be perfect with timing to hit the ball hard.',
    goat_pattern: 'In BARREL swings, the barrel starts turning behind the hitter and gets on plane early, not staying straight up and then flipping late at the ball.',
    category: 'motion',
    weight: 33
  },
  
  releaseSpeed: {
    name: 'Release Speed',
    what_it_is: 'How fast the bat is moving through the hitting zone at and just after contact.',
    why_it_matters: 'Release speed is a big part of exit velocity. Even with a good body move, a slow or mistimed release leaves power on the table.',
    goat_pattern: 'In BARREL swings, you can see the bat whip through contact and keep accelerating past the ball—not slam on the brakes or slow down early.',
    category: 'motion',
    weight: 34
  },
  
  // STABILITY (30%) - Control and consistency of barrel path
  contactPoint: {
    name: 'Contact Point',
    what_it_is: 'Where you\'re making contact relative to your body—too deep, too far out front, or in the "strong" zone.',
    why_it_matters: 'Even a good swing shape won\'t work if the ball is always too deep or too far out in front. The best hitters find the strong contact window over and over.',
    goat_pattern: 'In BARREL swings, most balls are hit in front of the front hip, not jammed off the back hip and not way out past the front foot.',
    category: 'stability',
    weight: 33
  },
  
  barrelPlane: {
    name: 'Barrel Plane',
    what_it_is: 'How well the barrel\'s path matches the pitch\'s path (uphill/downhill angle).',
    why_it_matters: 'If your barrel is chopping down or scooping up too much, your "sweet spot time" in the zone is short, and your mishits go way up.',
    goat_pattern: 'In BARREL swings, the barrel matches the pitch plane for a long time—almost riding the ball\'s line, not crossing it sharply.',
    category: 'stability',
    weight: 33
  },
  
  finishControl: {
    name: 'Finish Control',
    what_it_is: 'How under control your arms and bat are after contact—do you finish balanced or fall off and lose the barrel?',
    why_it_matters: 'A wild, out‑of‑control finish usually means you\'re yanking with the arms instead of letting the whole sequence drive the bat.',
    goat_pattern: 'In BARREL swings, the finish looks smooth and balanced; the hitter doesn\'t spin off or lose the bat with a big yank after contact.',
    category: 'stability',
    weight: 34
  },
  
  // SEQUENCING (20%) - Order and timing of arms/bat relative to body
  engineToWhipTiming: {
    name: 'Engine → Whip Timing',
    what_it_is: 'How well the "engine" (hips and shoulders) finishes loading the barrel before the arms and bat fire.',
    why_it_matters: 'If the arms go too early, you lose the stretch and the whip. If they go too late, you\'re late on the ball.',
    goat_pattern: 'In BARREL swings, the body creates stretch first, then the arms and bat fire right after—like cracking a whip after you\'ve snapped it back.',
    category: 'sequencing',
    weight: 33
  },
  
  handBreakLaunch: {
    name: 'Hand Break & Launch',
    what_it_is: 'When and how your hands separate from the stance and start the swing.',
    why_it_matters: 'A clean hand break and launch keeps your swing on time. A late or jumpy hand move makes you late or early on everything.',
    goat_pattern: 'In BARREL swings, the hands come off the shoulder or launch position in sync with the body—not frozen too long and not flying out way too soon.',
    category: 'sequencing',
    weight: 33
  },
  
  whipSequence: {
    name: 'Whip Sequence',
    what_it_is: 'Overall grade for how well your arms and bat follow the right order and timing with the rest of your body.',
    why_it_matters: 'Summarizes how well your "whip" is doing its job: snapping the bat through at the right moment with the speed your body created.',
    goat_pattern: 'BARREL swings almost always show a clean chain: ground → hips → shoulders → arms → bat, with the whip cracking right through the ball.',
    category: 'sequencing',
    weight: 34
  }
};

/**
 * Map existing database fields to WHIP metrics
 * This allows us to use existing data while introducing new UI
 */
export function mapWhipMetricsFromScores(scores: any): MetricValue[] {
  // Extract relevant scores
  const whipMotion = scores?.whipMotion || 0;
  const whipStability = scores?.whipStability || 0;
  const whipSequencing = scores?.whipSequencing || 0;
  const whipBatSpeed = scores?.whipBatSpeed || 0;
  const whipArmPath = scores?.whipArmPath || 0;
  const whipConnection = scores?.whipConnection || 0;
  
  // For now, map existing scores to the 9 metrics
  // In the future, these will be calculated individually in swing-analyzer.ts
  const metrics: MetricValue[] = [
    // MOTION (40%)
    {
      ...WHIP_METRICS.handPath,
      value: whipArmPath,
      ...getGradeFromScore(whipArmPath)
    },
    {
      ...WHIP_METRICS.barrelTurn,
      value: Math.round(whipMotion * 0.5),
      ...getGradeFromScore(Math.round(whipMotion * 0.5))
    },
    {
      ...WHIP_METRICS.releaseSpeed,
      value: whipBatSpeed,
      ...getGradeFromScore(whipBatSpeed)
    },
    
    // STABILITY (30%)
    {
      ...WHIP_METRICS.contactPoint,
      value: Math.round(whipStability * 0.33),
      ...getGradeFromScore(Math.round(whipStability * 0.33))
    },
    {
      ...WHIP_METRICS.barrelPlane,
      value: Math.round(whipStability * 0.33),
      ...getGradeFromScore(Math.round(whipStability * 0.33))
    },
    {
      ...WHIP_METRICS.finishControl,
      value: Math.round(whipStability * 0.34),
      ...getGradeFromScore(Math.round(whipStability * 0.34))
    },
    
    // SEQUENCING (20%)
    {
      ...WHIP_METRICS.engineToWhipTiming,
      value: Math.round(whipSequencing * 0.4),
      ...getGradeFromScore(Math.round(whipSequencing * 0.4))
    },
    {
      ...WHIP_METRICS.handBreakLaunch,
      value: whipConnection,
      ...getGradeFromScore(whipConnection)
    },
    {
      ...WHIP_METRICS.whipSequence,
      value: whipSequencing,
      ...getGradeFromScore(whipSequencing)
    }
  ];
  
  return metrics;
}

/**
 * Calculate grade and color based on score (0-100)
 */
export function getGradeFromScore(score: number | null): { grade: MetricGrade; color: 'green' | 'yellow' | 'red' | 'gray' } {
  if (score === null || score === 0) {
    return { grade: 'Needs Work', color: 'gray' };
  }
  
  if (score >= 90) return { grade: 'A', color: 'green' };
  if (score >= 80) return { grade: 'B', color: 'green' };
  if (score >= 70) return { grade: 'C', color: 'yellow' };
  if (score >= 60) return { grade: 'D', color: 'yellow' };
  return { grade: 'F', color: 'red' };
}

/**
 * Map existing database fields to ENGINE metrics
 * This allows us to use existing data while introducing new UI
 */
export function mapEngineMetricsFromScores(scores: any): MetricValue[] {
  // Extract relevant scores
  const engineMotion = scores?.engineMotion || 0;
  const engineStability = scores?.engineStability || 0;
  const engineSequencing = scores?.engineSequencing || 0;
  const engineHipRotation = scores?.engineHipRotation || 0;
  const engineTorsoMechanics = scores?.engineTorsoMechanics || 0;
  const engineCorePower = scores?.engineCorePower || 0;
  
  // For now, map existing scores to the 9 metrics
  // In the future, these will be calculated individually in swing-analyzer.ts
  const metrics: MetricValue[] = [
    // MOTION (40%)
    {
      ...ENGINE_METRICS.hipTurn,
      value: engineHipRotation,
      ...getGradeFromScore(engineHipRotation)
    },
    {
      ...ENGINE_METRICS.shoulderTurn,
      value: engineTorsoMechanics,
      ...getGradeFromScore(engineTorsoMechanics)
    },
    {
      ...ENGINE_METRICS.hipShoulderStretch,
      value: engineCorePower,
      ...getGradeFromScore(engineCorePower)
    },
    
    // STABILITY (30%)
    {
      ...ENGINE_METRICS.postureControl,
      value: Math.round(engineStability * 0.35),
      ...getGradeFromScore(Math.round(engineStability * 0.35))
    },
    {
      ...ENGINE_METRICS.shoulderFinish,
      value: Math.round(engineStability * 0.35),
      ...getGradeFromScore(Math.round(engineStability * 0.35))
    },
    {
      ...ENGINE_METRICS.backLegSupport,
      value: Math.round(engineStability * 0.30),
      ...getGradeFromScore(Math.round(engineStability * 0.30))
    },
    
    // SEQUENCING (20%)
    {
      ...ENGINE_METRICS.hipsFirst,
      value: Math.round(engineSequencing * 0.30),
      ...getGradeFromScore(Math.round(engineSequencing * 0.30))
    },
    {
      ...ENGINE_METRICS.hipsToShouldersTiming,
      value: Math.round(engineSequencing * 0.40),
      ...getGradeFromScore(Math.round(engineSequencing * 0.40))
    },
    {
      ...ENGINE_METRICS.engineSequence,
      value: engineSequencing,
      ...getGradeFromScore(engineSequencing)
    }
  ];
  
  return metrics;
}

/**
 * Map existing database fields to ANCHOR metrics
 * This allows us to use existing data while introducing new UI
 */
export function mapAnchorMetricsFromScores(scores: any): MetricValue[] {
  // Extract relevant scores
  const anchorMotion = scores?.anchorMotion || 0;
  const anchorStability = scores?.anchorStability || 0;
  const anchorSequencing = scores?.anchorSequencing || 0;
  const anchorStance = scores?.anchorStance || 0;
  const anchorWeightShift = scores?.anchorWeightShift || 0;
  const anchorGroundConnection = scores?.anchorGroundConnection || 0;
  const anchorLowerBodyMechanics = scores?.anchorLowerBodyMechanics || 0;
  
  // For now, map existing scores to the 9 metrics
  // In the future, these will be calculated individually in swing-analyzer.ts
  const metrics: MetricValue[] = [
    // MOTION (40%)
    {
      ...ANCHOR_METRICS.loadIntoBackLeg,
      value: anchorStance,
      ...getGradeFromScore(anchorStance)
    },
    {
      ...ANCHOR_METRICS.strideMove,
      value: Math.round(anchorMotion * 0.5),
      ...getGradeFromScore(Math.round(anchorMotion * 0.5))
    },
    {
      ...ANCHOR_METRICS.weightShift,
      value: anchorWeightShift,
      ...getGradeFromScore(anchorWeightShift)
    },
    
    // STABILITY (40%)
    {
      ...ANCHOR_METRICS.headBalance,
      value: Math.round(anchorStability * 0.35),
      ...getGradeFromScore(Math.round(anchorStability * 0.35))
    },
    {
      ...ANCHOR_METRICS.baseWidth,
      value: Math.round(anchorGroundConnection * 0.5),
      ...getGradeFromScore(Math.round(anchorGroundConnection * 0.5))
    },
    {
      ...ANCHOR_METRICS.frontSideBrace,
      value: Math.round(anchorStability * 0.35),
      ...getGradeFromScore(Math.round(anchorStability * 0.35))
    },
    
    // SEQUENCING (20%)
    {
      ...ANCHOR_METRICS.loadStrideTimingAnchor,
      value: Math.round(anchorSequencing * 0.4),
      ...getGradeFromScore(Math.round(anchorSequencing * 0.4))
    },
    {
      ...ANCHOR_METRICS.groundUpStart,
      value: Math.round(anchorLowerBodyMechanics * 0.6),
      ...getGradeFromScore(Math.round(anchorLowerBodyMechanics * 0.6))
    },
    {
      ...ANCHOR_METRICS.anchorSequence,
      value: anchorSequencing,
      ...getGradeFromScore(anchorSequencing)
    }
  ];
  
  return metrics;
}

/**
 * GOAT target score for gap calculations
 */
export const GOAT_TARGET = 95;

/**
 * Calculate gap to GOAT for a given score
 */
export function calculateGapToGOAT(score: number): number {
  return Math.max(0, GOAT_TARGET - score);
}
