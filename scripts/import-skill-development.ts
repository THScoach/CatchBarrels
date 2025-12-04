import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Imports S2 Baseball & Kinetic Chain resources as a supplemental course
 */

async function main() {
  console.log('\n📚 Importing Scientific Resources & Training Guides...\n');

  // Create the resources course
  const course = await prisma.course.create({
    data: {
      title: 'Scientific Resources & Training Guides',
      description: 'Evidence-based research papers, cognitive training guides, and advanced biomechanics resources from S2 Cognition, Kwon3D, and leading hitting research.',
      category: 'Resources',
      thumbnail: '/api/placeholder/400/300',
      visibility: 'athlete',
      modules: {
        create: [
          {
            title: 'S2 Cognition Research',
            description: 'Cognitive training and assessment research from S2 Cognition',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'S2 Baseball White Paper',
                  description: 'Comprehensive research on cognitive training applications for baseball performance, including assessment protocols and training methodologies.',
                  content: `
# S2 Baseball White Paper

## Overview
This white paper presents the scientific foundation for cognitive training in baseball, covering:

- **Cognitive Assessment Protocols**: How to measure and track cognitive performance
- **Training Methodologies**: Evidence-based approaches to cognitive skill development
- **Performance Correlations**: Research linking cognitive skills to on-field success
- **Implementation Guidelines**: Practical applications for players and coaches

## Key Cognitive Skills for Hitters
1. **Visual Processing Speed**: Ability to quickly identify pitch type and location
2. **Impulse Control**: Managing reactive tendencies for better pitch selection
3. **Attention Management**: Maintaining focus through at-bats and games
4. **Pattern Recognition**: Identifying pitcher tendencies and sequences
5. **Reaction Time**: Speed of decision-making at the plate

## Application to Hitting
The research demonstrates measurable improvements in:
- Plate discipline (walk rate, K rate)
- Contact quality (hard hit %, barrel rate)
- Two-strike approach
- Breaking ball recognition
- Velocity adjustment

## Research Findings
Studies show that cognitive training can lead to:
- 12-15% improvement in pitch recognition speed
- 8-10% increase in contact rate on breaking balls
- Reduced chase rate by 15-20%
- Improved two-strike performance

## Training Protocols
Recommended cognitive training schedule:
- **Off-season**: 3-4 sessions per week, 20-30 minutes
- **In-season**: 2 sessions per week, 15-20 minutes
- **Maintenance**: 1-2 sessions per week during season

---

**Source**: S2 Cognition Research Division
**File**: S2_Baseball White Paper.pdf
                  `.trim(),
                  lessonType: 'document',
                  duration: null,
                  order: 1,
                  sourceUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content',
                  assets: {
                    create: [
                      {
                        title: 'S2 Baseball White Paper PDF',
                        assetType: 'document',
                        fileUrl: '/Uploads/S2_Baseball White Paper.pdf',
                        originalUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content'
                      }
                    ]
                  }
                },
                {
                  title: 'The 8 Cognitive Categories for Baseball',
                  description: 'Detailed breakdown of the eight core cognitive skills that impact baseball performance, with assessment criteria and training recommendations.',
                  content: `
# The 8 Cognitive Categories for Baseball

## Overview
S2 Cognition has identified eight core cognitive categories that directly impact baseball performance:

## 1. Visual Clarity
- **Definition**: Ability to see and track the baseball with precision
- **Impact on Hitting**: Pitch recognition, contact quality, barrel accuracy
- **Training Focus**: Eye exercises, tracking drills, depth perception work

## 2. Depth Perception
- **Definition**: Ability to judge distance and ball trajectory
- **Impact on Hitting**: Timing, swing decisions, contact point
- **Training Focus**: Multi-plane tracking, VR training, depth cue recognition

## 3. Contrast Sensitivity
- **Definition**: Ability to distinguish objects from background
- **Impact on Hitting**: Picking up the ball out of the hand, seam recognition
- **Training Focus**: Low-contrast drills, varying backgrounds, lighting conditions

## 4. Target Capture
- **Definition**: Speed of visual acquisition and lock-on
- **Impact on Hitting**: Early pitch identification, quick adjustments
- **Training Focus**: Rapid recognition drills, multiple stimulus work

## 5. Perception Span
- **Definition**: Amount of visual information processed simultaneously
- **Impact on Hitting**: Reading pitcher body language, recognizing sequences
- **Training Focus**: Peripheral awareness drills, multi-focus exercises

## 6. Multiple Object Tracking
- **Definition**: Ability to track several moving objects at once
- **Impact on Hitting**: Baserunning decisions, pitch sequencing awareness
- **Training Focus**: MOT software, multi-ball drills, situational awareness

## 7. Reaction Time
- **Definition**: Speed of physical response to visual stimulus
- **Impact on Hitting**: Swing decisions, adjustment speed, velocity handling
- **Training Focus**: Quick-reaction drills, strobe training, speed gates

## 8. Impulse Control
- **Definition**: Ability to inhibit reactive tendencies
- **Impact on Hitting**: Plate discipline, pitch selection, chase control
- **Training Focus**: Go/No-Go drills, pitch recognition hold drills, two-strike work

## Assessment & Benchmarking
Each category can be measured and benchmarked against:
- MLB averages
- Position-specific norms
- Age-group standards
- Individual baselines

## Training Integration
Combine cognitive training with physical practice:
- **Pre-practice**: 10-15 min cognitive warm-up
- **During practice**: Distraction drills, variable conditions
- **Post-practice**: Recovery and processing exercises

---

**Source**: S2 Cognition - Cognitive Assessment Division
**File**: S2_Cognition__The_8_Cognitive_Categories_for_Baseb.pdf
                  `.trim(),
                  lessonType: 'document',
                  duration: null,
                  order: 2,
                  sourceUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content',
                  assets: {
                    create: [
                      {
                        title: '8 Cognitive Categories PDF',
                        assetType: 'document',
                        fileUrl: '/Uploads/S2_Cognition__The_8_Cognitive_Categories_for_Baseb.pdf',
                        originalUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content'
                      }
                    ]
                  }
                },
                {
                  title: 'S2 Training Program Overview',
                  description: 'Complete S2 Cognition training program structure, including protocols, exercises, and progression guidelines.',
                  content: `
# S2 Training Program Overview

## Program Structure
The S2 training program is designed to systematically develop cognitive skills through progressive, evidence-based exercises.

## Training Phases

### Phase 1: Assessment & Baseline (Weeks 1-2)
- Complete cognitive assessment battery
- Establish individual baselines
- Identify priority training areas
- Set measurable goals

### Phase 2: Foundation Building (Weeks 3-6)
- Focus on core visual skills
- Build reaction time capacity
- Develop impulse control
- Introduce basic tracking exercises

### Phase 3: Skill Integration (Weeks 7-10)
- Combine multiple cognitive skills
- Add sport-specific contexts
- Increase complexity and speed
- Introduce variable conditions

### Phase 4: Performance Application (Weeks 11-14)
- On-field integration
- Game-speed application
- Situational training
- Competition simulation

### Phase 5: Maintenance & Refinement (Ongoing)
- 2-3 sessions per week
- Focus on weak areas
- Periodic re-assessment
- Continuous refinement

## Exercise Categories

### Visual Training
- Smooth pursuit exercises
- Saccadic eye movements
- Accommodation drills
- Visual stamina building

### Reaction Time Development
- Simple reaction drills
- Choice reaction exercises
- Discrimination tasks
- Speed threshold work

### Impulse Control Training
- Go/No-Go tasks
- Stop-signal exercises
- Delayed response drills
- Pitch selection simulation

### Attention Management
- Sustained attention exercises
- Selective attention drills
- Divided attention tasks
- Attention switching work

## Integration with Physical Training
**Monday/Wednesday/Friday**
- 15 min cognitive warm-up
- Physical hitting practice
- 10 min cognitive cooldown

**Tuesday/Thursday**
- 30 min focused cognitive training
- Recovery day for physical systems
- Mental rehearsal exercises

## Progress Tracking
Monitor improvements through:
- Weekly performance metrics
- Monthly re-assessments
- On-field transfer measures
- Subjective feedback logs

## Expected Outcomes
**4-6 Weeks**
- Noticeable improvement in assessment scores
- Better awareness of visual tendencies
- Improved practice focus

**8-12 Weeks**
- Measurable on-field improvements
- Better pitch recognition
- Improved plate discipline
- Enhanced contact quality

**16+ Weeks**
- Sustained performance gains
- Automated cognitive processes
- Consistent high-level execution
- Competitive advantage

---

**Source**: S2 Cognition Training Division
**File**: S2 program.pdf
                  `.trim(),
                  lessonType: 'document',
                  duration: null,
                  order: 3,
                  sourceUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content',
                  assets: {
                    create: [
                      {
                        title: 'S2 Program Overview PDF',
                        assetType: 'document',
                        fileUrl: '/Uploads/S2 program.pdf',
                        originalUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content'
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            title: 'Biomechanics & Kinetic Chain',
            description: 'Advanced biomechanics research and kinetic chain principles',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Hacking The Kinetic Chain for Hitting',
                  description: 'In-depth analysis of kinetic chain principles in the baseball swing, including force generation, energy transfer, and sequential activation patterns.',
                  content: `
# Hacking The Kinetic Chain for Hitting

## Understanding the Kinetic Chain
The kinetic chain in hitting refers to the sequential transfer of energy from the ground through the body to the bat and finally to the baseball.

## The Sequential Chain

### 1. Ground Force Generation (Legs)
**Anchor Phase**
- Weight shift and load
- Back leg drive initiation
- Front leg bracing
- Ground reaction forces

**Key Metrics**:
- Ground force: 1.2-1.5x body weight
- Peak force timing: 0.05-0.08s before contact
- Force direction: Forward and rotational

### 2. Hip Rotation (Engine)
**Separation & Firing**
- Hip-shoulder separation (45-60°)
- Hip rotation speed (600-900°/s)
- Pelvis leads shoulders
- Energy storage and release

**Key Metrics**:
- Hip separation: 45-60° at foot plant
- Hip rotation velocity: Peak at -0.05s before contact
- Hip-to-shoulder timing: 0.02-0.05s gap

### 3. Trunk & Core (Connection)
**Torque Development**
- Thoracic rotation
- Side bend and extension
- Lat engagement
- Core stabilization

**Key Metrics**:
- Trunk rotation: 75-95°
- Side bend: 15-25°
- X-factor stretch: 45-65°

### 4. Arms & Hands (Whip)
**Bat Path & Acceleration**
- Hand path efficiency
- Wrist uncocking
- Forearm rotation
- Barrel acceleration

**Key Metrics**:
- Bat speed: 65-85 mph (varies by level)
- Time to contact: 0.15-0.20s
- Attack angle: 5-20° (situation dependent)

## Energy Transfer Efficiency

### Optimal Sequencing
1. **Legs initiate** (0.00s)
2. **Hips fire** (0.05-0.08s)
3. **Trunk rotates** (0.10-0.12s)
4. **Arms extend** (0.13-0.15s)
5. **Contact** (0.15-0.20s)

### Common Sequence Breaks
**"Spinning"**: Hips and shoulders rotating together
- Results in: Power loss, inconsistent contact
- Fix: Hip-shoulder separation drills

**"Casting"**: Arms extend too early
- Results in: Bat drag, increased swing length
- Fix: Connection drills, back elbow work

**"Lunging"**: Weight shifts without rotation
- Results in: Loss of adjustability, weak contact
- Fix: Rotational drills, front leg stability

**"Early Hip"**: Hips open before stride completion
- Results in: Pull-side only, timing issues
- Fix: Timing drills, load position work

## Leverage Points

### Primary Levers
1. **Hip-Shoulder Separation**: Creates elastic energy
2. **Front Leg Block**: Provides rotation axis
3. **Rear Elbow Slot**: Maintains connection
4. **Wrist Hinge**: Generates final bat acceleration

### Maximizing Each Lever
**Hip-Shoulder Separation**
- Drills: Medicine ball throws, resistance band holds
- Cues: "Show numbers to pitcher"
- Target: 50-60° at foot plant

**Front Leg Block**
- Drills: Firm front side drills, wall drills
- Cues: "Post up" or "Brace"
- Target: Knee flexion 160-175° at contact

**Rear Elbow Connection**
- Drills: Towel drills, rear elbow drops
- Cues: "Elbow to hip" or "Stay connected"
- Target: Elbow within 6" of body

**Wrist Action**
- Drills: Wrist weight work, bat flips
- Cues: "Snap through contact"
- Target: 90° wrist cock to full extension

## Force Multiplication

### Ground Forces
**Vertical Forces**: Stability and power
**Horizontal Forces**: Forward momentum
**Rotational Forces**: Angular acceleration

### Optimal Force Profile
- Back foot: 60-70% during load
- Front foot: 80-90% at contact
- Total GRF: 150-180% body weight

## Practical Application

### Assessment
1. Video analysis of sequence timing
2. Force plate measurements
3. Bat sensor data
4. On-field performance metrics

### Training Priorities
**Beginners**: Establish proper sequence
**Intermediate**: Maximize individual links
**Advanced**: Fine-tune timing and efficiency

### Drill Progression
1. **Isolation drills**: Train individual components
2. **Partial swing drills**: Combine 2-3 elements
3. **Full swing**: Integrate complete sequence
4. **Variable conditions**: Adapt to game situations

---

**Source**: Kwon3D Biomechanics Research / Driveline Baseball
**File**: HackingTheKineticChainHitti.pdf
                  `.trim(),
                  lessonType: 'document',
                  duration: null,
                  order: 1,
                  sourceUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content',
                  assets: {
                    create: [
                      {
                        title: 'Kinetic Chain Research PDF',
                        assetType: 'document',
                        fileUrl: '/Uploads/HackingTheKineticChainHitti.pdf',
                        originalUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content'
                      }
                    ]
                  }
                },
                {
                  title: 'Impulse Control Training Drills',
                  description: 'Practical drills and exercises for developing impulse control and pitch selection discipline.',
                  content: `
# Impulse Control Training Drills

## Overview
Impulse control is the ability to inhibit reactive tendencies and make deliberate decisions at the plate. These drills help develop plate discipline and pitch selection skills.

## Drill Categories

### 1. Visual Recognition Drills

**Pitch Type Recognition Hold**
- **Setup**: Coach shows grip or holds ball to display spin
- **Execution**: Hitter identifies pitch type before committing
- **Progression**: Increase speed, add variables, limit view time
- **Goal**: 90%+ accuracy before advancing

**Color/Number Discrimination**
- **Setup**: Colored baseballs or numbered balls
- **Execution**: Swing only at specific color/number
- **Progression**: Add velocity, multiple colors, moving targets
- **Goal**: Zero swings at "bad" colors

### 2. Zone Discrimination Drills

**Strike Zone Charts**
- **Setup**: Defined strike zone with visual markers
- **Execution**: Take all pitches out of zone, swing at strikes
- **Progression**: Reduce marker size, add borderline calls
- **Goal**: 85%+ correct decisions

**3-Zone Approach**
- **Setup**: Divide zone into: Attack, Protect, Take
- **Execution**: Different approach for each zone
- **Progression**: Shrink attack zone, expand take zone
- **Goal**: Execute correct approach by zone

### 3. Count-Based Drills

**Two-Strike Discipline**
- **Setup**: Start every sequence with 0-2 count
- **Execution**: Expand zone slightly, no chase swings
- **Progression**: Add breaking balls, increase velocity
- **Goal**: Competitive AB despite bad count

**Hitter's Count Aggression**
- **Setup**: Start with 2-0, 3-1 counts
- **Execution**: Hunt specific pitch in specific location
- **Progression**: Add decoy pitches, tighter locations
- **Goal**: Damage when ahead in count

### 4. Reactive Inhibition Drills

**Late Pull/Change Drill**
- **Setup**: Commit to swing, late change signal
- **Execution**: Hold swing on late change
- **Progression**: Reduce reaction time window
- **Goal**: Hold 70%+ of late changes

**Go/No-Go Fastball Drill**
- **Setup**: Random fastball location mix
- **Execution**: Swing only at fastballs in assigned zone
- **Progression**: Add off-speed, reduce zone size
- **Goal**: Perfect execution (0 swings outside zone)

**Distraction Control Setup**
- **Setup**: Add visual/audio distractions during pitch
- **Execution**: Maintain focus on pitch recognition
- **Progression**: Increase distraction intensity
- **Goal**: No performance drop with distractions

### 5. Situational Awareness Drills

**Score/Situation Drill**
- **Setup**: Assign specific game situations
- **Execution**: Adjust approach based on situation
- **Progression**: Vary situations, add pressure
- **Goal**: Appropriate approach in all situations

**Pitcher Pattern Recognition**
- **Setup**: Create pitcher sequence patterns
- **Execution**: Identify pattern, anticipate next pitch
- **Progression**: Add variations, multiple patterns
- **Goal**: Predict sequences 60%+ accuracy

## Training Protocol

### Weekly Schedule (Off-Season)
**Monday**: Zone recognition (20 min)
**Wednesday**: Reactive inhibition (20 min)
**Friday**: Situational work (20 min)

### Weekly Schedule (In-Season)
**Pre-game**: Quick impulse refresh (10 min)
**Off-days**: Focused impulse work (15 min)

## Progress Tracking

### Metrics to Monitor
- Swing decisions (% correct)
- Chase rate on breaking balls
- Zone contact rate
- Two-strike approach effectiveness
- Damage rate in hitter's counts

### Benchmarks
**Beginner**: 70% correct decisions
**Intermediate**: 80% correct decisions
**Advanced**: 85%+ correct decisions
**Elite**: 90%+ correct decisions

## Integration with Hitting

### Practice Structure
1. **Cognitive warm-up**: Impulse control drills (10 min)
2. **Batting practice**: Apply discipline (30 min)
3. **Simulation**: Game-like at-bats (15 min)
4. **Review**: Analyze decisions (5 min)

### In-Game Application
- **Pre-AB**: Review impulse control cues
- **During AB**: Execute count-based approach
- **Post-AB**: Evaluate decisions (regardless of result)

## Common Challenges

**"I'm too passive"**
- Solution: Shrink attack zone, be aggressive there
- Drill: Hitter's count fastball hunting

**"I chase everything"**
- Solution: Visual hold drills, late recognition work
- Drill: Color discrimination with no-swing penalties

**"Two-strike struggles"**
- Solution: Expand zone slightly, focus on contact
- Drill: Two-strike simulation with breaking balls

**"Can't lay off good pitches"**
- Solution: Zone discipline, take-all-balls mentality
- Drill: Strict zone charting with feedback

---

**Source**: S2 Cognition Training / Mental Performance Research
**File**: Impulse Control Training Drills.pdf
                  `.trim(),
                  lessonType: 'document',
                  duration: null,
                  order: 2,
                  sourceUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content',
                  assets: {
                    create: [
                      {
                        title: 'Impulse Control Drills PDF',
                        assetType: 'document',
                        fileUrl: '/Uploads/Impulse Control Training Drills.pdf',
                        originalUrl: 'https://app.membership.io/hubs/MPjv75rRXn/content'
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log(`✅ Created course: ${course.title}`);
  console.log(`   - 2 modules`);
  console.log(`   - 5 resource documents`);
  console.log(`   - Category: ${course.category}`);
  console.log(`\n🎉 Resource library import complete!\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
