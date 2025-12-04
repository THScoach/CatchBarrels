
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting S2 Program import...\n');

  // PDF already copied to public directory during import
  console.log('✅ PDF available in public directory');

  // Create the course
  const course = await prisma.course.create({
    data: {
      title: 'S2 Cognitive Training Program',
      description: 'Complete cognitive training framework for baseball hitters focusing on timing control, trajectory prediction, and pitch selection. Based on S2 Cognition research and proven training methodologies.',
      category: 'BRAIN',
      contentType: 'training',
      visibility: 'athlete',
      published: true,
      featured: true,
      difficulty: 'Intermediate',
      thumbnail: '/knowledge-base/s2-program.pdf',
    },
  });
  console.log(`✅ Created course: ${course.title}`);

  // Create the module
  const module = await prisma.module.create({
    data: {
      title: 'Cognitive Training Foundations',
      description: 'Core cognitive training strategies for improving hitting performance through scientific training methods.',
      courseId: course.id,
      order: 1,
    },
  });
  console.log(`✅ Created module: ${module.title}`);

  // Lesson 1: Timing Control
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Timing Control Training',
      description: 'Train better timing decisions to improve contact and hard contact rates through progressive timing drills.',
      moduleId: module.id,
      order: 1,
      sourceUrl: '/knowledge-base/s2-program.pdf#page=1',
      content: `TIMING CONTROL

Goal: Train better timing decisions to improve contact and hard contact rates.

Background: Timing a reaction to intercept a moving ball relies not only on the physical and mechanical execution of the swing, but importantly on split-second timing systems in the brain. These timing decisions tell the body "when" to swing, and if these decisions are off by even a few tens of milliseconds, the swing can be too early or too late.

S2 has demonstrated that 4-8 weeks of consistent timing drill work in elite youth baseball players leads to statistically significant improvements in contact and hard contact rates.

Key Principles and Strategies:

1. CONSTANT VELOCITY TRAINING
   - Work different velocities in separate rounds
   - Builds memory representations for specific velocities
   - Limitation: Doesn't train pitch-by-pitch adjustments

2. PREDICTABLE TIMING PROGRESSIONS
   - Plate drills: Step closer/backward from pitcher
   - Called speeds: Pitcher announces next velocity
   - Forces timing system to adjust on each pitch
   - Builds adaptability within known parameters

3. UNPREDICTABLE TIMING DRILLS
   - Mix velocities without announcing
   - Vary velocity percentages (75% fast/25% slow)
   - Simulate being fooled with unexpected speeds
   - VEX (Violating Expectancies) drills: Tell one speed, throw another

Training Progression:
- Start with constant velocities
- Progress to predictable changes
- Advance to unpredictable mixing
- Master being fooled scenarios

This systematic approach trains the brain's timing system to make millisecond adjustments that dramatically improve contact quality.`,
    },
  });
  console.log(`✅ Created lesson: ${lesson1.title}`);

  // Lesson 2: Trajectory Prediction
  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Trajectory Prediction Training',
      description: 'Improve accuracy of ball/strike and pitch location decisions through visual prediction training.',
      moduleId: module.id,
      order: 2,
      sourceUrl: '/knowledge-base/s2-program.pdf#page=3',
      content: `TRAJECTORY PREDICTION

Goal: Train better predictions about the trajectory of the pitch to improve the accuracy of ball/strike and pitch location decisions.

Background: Determining pitch location involves a predictive decision. Because the angular velocity of the ball exceeds the smooth pursuit capabilities of the eyes, the hitter must rapidly gather information (spin pattern, velocity, exit trajectory) and use that information to guide a predictive saccade and bat delivery to where the ball is expected to cross the hitting zone.

Key Principles and Strategies:

1. "CALL OUT" DRILLS
   - Predict pitch location BEFORE it crosses the plate
   - Receive immediate feedback on accuracy
   - Start with simple ball/strike calls
   - Progress to 2-4 zone predictions
   - Use action words ("hit"/"take") instead of nouns
   - Builds accurate trajectory prediction models

2. "EYES CLOSED" DRILLS
   - See ball out of hand
   - Read trajectory
   - Close eyes and hit to predicted location
   - Forces trust in prediction system
   - Best done with front toss for safety
   - Simulates real game eye-tracking patterns

3. TRAJECTORY ZONE TRAINING
   - Focus on specific hitting zones
   - Build tighter trajectory recognition
   - Load up approach zones (e.g., low-away)
   - Train automatic recognition of target zones
   - Use call out, eyes closed, and regular BP formats

Important Notes:
- Avoid calling out location AFTER pitch crosses plate (memory vs. prediction)
- Keep zone divisions functional (2-4 zones, not too many)
- Train both linear (fastball) and curvilinear (breaking balls) trajectories
- Use temporal occlusion to develop quick recognition

The goal is building a mental "trajectory map" that allows instantaneous, accurate predictions of where any pitch will cross the hitting zone.`,
    },
  });
  console.log(`✅ Created lesson: ${lesson2.title}`);

  // Lesson 3: Take Decisions
  const lesson3 = await prisma.lesson.create({
    data: {
      title: 'Take Decision Training',
      description: 'Develop better pitch selection and discipline by training the brain to inhibit swings at undesirable pitches.',
      moduleId: module.id,
      order: 3,
      sourceUrl: '/knowledge-base/s2-program.pdf#page=6',
      content: `TAKE DECISIONS

Goal: Train better skill at taking pitches you don't want to swing at.

Background: An important concept when attacking take decisions is understanding that both physiological and cognitive circuitry in the nervous system is designed to elicit action rather than inhibit action. In other words, the neural circuitry that excites action is more powerful than the inhibition control system that stops the action.

Therefore, a critical skill to train is impulse control and inhibitory skill. This is a trainable skill that requires structure, focused practice, and volume of reps.

Key Principles and Strategies:

1. BASIC BALL/STRIKE DISCRIMINATION
   - Hit strikes, lay off balls
   - Vary strike-to-ball percentages:
     * 25% strikes / 75% balls (control mode)
     * 50% strikes / 50% balls (balanced)
     * 75% strikes / 25% balls (swing mode)
   - Tighten difficulty: balls just off black vs strikes on black
   - Incorporate approach zones (specific strikes to hunt)

2. RED DOT TRAINING (4-PHASE SYSTEM)
   
   Phase 1: Building the Association
   - Mark 50% of balls with red dots
   - Never swing at red dot balls (75% of pitches)
   - Red dot balls = targeted take pitch (e.g., high fastballs)
   - High rep volume builds inhibition link
   
   Phase 2: Increasing Swing Mode Pressure
   - Shift to 50-50 red dot/no dot ratio
   - Then 75% hittable / 25% red dot takes
   - Makes inhibition harder under swing mode pressure
   - Trains control when aggressive
   
   Phase 3: Removing the Cue
   - Remove red dots entirely
   - Conscious takes of targeted pitch
   - Reinforces natural inhibition response
   
   Phase 4: Game-Like Integration
   - Mix take pitches into complex drills
   - Combine with timing/trajectory variations
   - Build robust inhibition in all contexts

3. APPROACH ZONE TRAINING
   - Define target zones based on count, situation
   - Practice laying off pitches outside approach
   - May be strikes, but not YOUR strikes
   - Builds disciplined pitch selection

Critical Concepts:
- Inhibition is harder than action (by design)
- High swing mode reduces inhibition control
- Volume of focused reps builds inhibitory strength
- Use progressions to systematically increase difficulty

The goal is developing automatic inhibition responses to undesirable pitches, even under high-pressure swing-mode conditions.`,
    },
  });
  console.log(`✅ Created lesson: ${lesson3.title}`);

  // Create assets for each lesson
  const asset1 = await prisma.contentAsset.create({
    data: {
      title: 'S2 Program - Timing Control Reference',
      description: 'Complete PDF guide for timing control training',
      lessonId: lesson1.id,
      assetType: 'pdf',
      fileUrl: '/knowledge-base/s2-program.pdf',
      mimeType: 'application/pdf',
    },
  });

  const asset2 = await prisma.contentAsset.create({
    data: {
      title: 'S2 Program - Trajectory Prediction Reference',
      description: 'Complete PDF guide for trajectory prediction training',
      lessonId: lesson2.id,
      assetType: 'pdf',
      fileUrl: '/knowledge-base/s2-program.pdf',
      mimeType: 'application/pdf',
    },
  });

  const asset3 = await prisma.contentAsset.create({
    data: {
      title: 'S2 Program - Take Decisions Reference',
      description: 'Complete PDF guide for take decision training',
      lessonId: lesson3.id,
      assetType: 'pdf',
      fileUrl: '/knowledge-base/s2-program.pdf',
      mimeType: 'application/pdf',
    },
  });

  console.log(`✅ Created ${3} assets`);

  console.log('\n📊 Import Summary:');
  console.log('  - 1 course created');
  console.log('  - 1 module created');
  console.log('  - 3 lessons created');
  console.log('  - 3 assets created');
  console.log('  - Category: BRAIN (Cognitive Training)');
  console.log('\n✅ S2 Program import complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
