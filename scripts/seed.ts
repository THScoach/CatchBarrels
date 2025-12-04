
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create test user (john@doe.com / johndoe123)
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { username: 'john@doe.com' },
    update: {},
    create: {
      username: 'john@doe.com',
      password: hashedPassword,
      email: 'john@doe.com',
      name: 'John Doe',
      height: 70, // 5'10"
      weight: 175,
      bats: 'Right',
      throws: 'Right',
      position: 'Center Field',
      level: 'High School (13-18)',
      batLength: 33,
      batWeight: 30,
      batType: 'BBCOR',
      struggles: ['Getting jammed on inside pitches', 'Rolling over for ground balls'],
      goals: ['Hit for more power', 'More consistent contact'],
      mentalApproach: 'Balanced',
      confidenceLevel: 7,
      profileComplete: true,
    },
  });

  console.log('Test user created:', testUser.username);

  // Create drills
  // ============ COMPREHENSIVE DRILL LIBRARY ============
  // Organized by 4Bs categories: Anchor (Lower Body), Engine (Trunk/Core), Whip (Arms & Bat), Tempo (Rhythm), and General
  const drills = [
    // ============ ANCHOR DRILLS (Lower Body) ============
    {
      name: 'Step Back Drill',
      source: 'Driveline Baseball',
      category: 'Anchor',
      primaryPurpose: 'Loading into the back hip and glute. Coiling the pelvis and torso during the load. Staying back during the stride and not overstriding.',
      setup: 'Start with feet closer together, about a foot closer to pitcher than normal',
      execution: 'Step (not hop) backward to normal back foot position, load into back hip, begin stride phase. Recruit posterior chain muscles (glutes/hamstrings). Control forward momentum. Maintain loaded position.',
      keyPoints: ['Step not hop', 'Engage glutes and hamstrings', 'Control center of mass', 'Maintain loaded position'],
      commonMistakes: ['Hopping instead of stepping', 'Not loading into back hip properly', 'Overstriding forward', 'Poor weight distribution'],
      equipment: ['Tee or soft toss setup', 'Bat', 'Balls'],
      targetSkills: ['Loading technique', 'Posterior chain activation', 'Weight distribution', 'Stride control'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/step-back.mp4',
      thumbnailUrl: '/images/drills/step-back.jpg',
    },
    {
      name: 'Kershaw Drill',
      source: 'Driveline Baseball',
      category: 'Anchor',
      primaryPurpose: 'Proper loading technique into the back hip. Loading into the posterior chain. Train balance and stability during the stride.',
      setup: 'Specific setup for balance and stability training during load phase',
      execution: 'Focus on proper loading mechanics into posterior chain with balance component. Emphasize glutes and hamstrings engagement.',
      keyPoints: ['Posterior chain engagement', 'Balance and stability', 'Proper loading technique', 'Control during stride'],
      commonMistakes: ['Being overly quad-dominant when loading', 'Loss of balance during stride', 'Poor posterior chain activation', 'Not controlling forward move'],
      equipment: ['Tee or soft toss setup', 'Bat', 'Balls'],
      targetSkills: ['Loading technique', 'Posterior chain activation', 'Balance', 'Stability'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/kershaw.mp4',
      thumbnailUrl: '/images/drills/kershaw.jpg',
    },
    {
      name: 'Stride Box Drill',
      source: 'Driveline Baseball',
      category: 'Anchor',
      primaryPurpose: 'Control stride length and direction for consistent contact',
      setup: 'Mark a box on ground (6-8 inches) where front foot should land. Use tape or chalk.',
      execution: 'Take swings off tee, focusing on landing front foot inside box every time. Should be soft, balanced landing.',
      keyPoints: ['Consistent stride length', 'Directional stride', 'Soft landing', 'Weight stays back'],
      commonMistakes: ['Striding too far', 'Lunging', 'Landing heavy', 'Inconsistent direction'],
      equipment: ['Tape or chalk', 'Tee', 'Bat', 'Balls'],
      targetSkills: ['Stride control', 'Balance', 'Consistency', 'Lower body mechanics'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/stride-box.mp4',
      thumbnailUrl: '/images/drills/stride-box.jpg',
    },
    {
      name: 'Separation Drill',
      source: 'Driveline Baseball',
      category: 'Anchor',
      primaryPurpose: 'Create proper separation between hips and shoulders for power',
      setup: 'Start with hands at shoulder, back elbow up. Partner holds bat barrel, creating resistance.',
      execution: 'Begin hip rotation while partner holds barrel. Feel stretch between hips and shoulders. Release and complete swing. Repeat 10 times.',
      keyPoints: ['Hips start first', 'Maintain posture', 'Feel the stretch', 'Explosive release'],
      commonMistakes: ['Rotating everything together', 'Collapsing back side', 'Losing balance', 'Not maintaining resistance'],
      equipment: ['Bat', 'Partner'],
      targetSkills: ['Hip-shoulder separation', 'Power generation', 'Sequencing', 'Ground connection'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/separation.mp4',
      thumbnailUrl: '/images/drills/separation.jpg',
    },

    // ============ ENGINE DRILLS (Trunk/Core) ============
    {
      name: 'Offset Open',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Improve swing depth and direction. Teaches athletes how to hit the ball the other way productively. Coiling into the back hip and maintaining posture.',
      setup: 'Set up 25-35° open, as if pitcher is throwing from shortstop (RH) or second base (LH)',
      execution: 'Perform without striding. Point pelvis and torso toward shortstop (RH) or second base (LH). Focus on opposite field hitting. Allows more range of motion for coil. Adds knee/hip flexion.',
      keyPoints: ['Maintain coil and posture', 'Focus on opposite field', 'Use full range of motion', 'Proper extension and rotation'],
      commonMistakes: ['Downward swing path', 'Losing the barrel', 'Poor barrel direction', 'Rolling over', 'Weak opposite-field contact'],
      equipment: ['Tee', 'Short bat or Overload bat for corrections', 'Balls'],
      targetSkills: ['Swing depth', 'Direction', 'Opposite field hitting', 'Posture maintenance'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/offset-open.mp4',
      thumbnailUrl: '/images/drills/offset-open.jpg',
    },
    {
      name: 'Offset Closed',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Learning how to pull the ball effectively. Getting to the inside pitch. Torso rotation and upper body connection.',
      setup: 'Set up 25-35° closed. Face first base dugout (RH) or third base dugout (LH)',
      execution: 'Aggressively rotate upper half to deliver barrel while staying connected. Focus on pull side hitting. Emphasizes torso rotation.',
      keyPoints: ['Aggressive rotation', 'Stay connected', 'Pull side focus', 'Proper sequencing'],
      commonMistakes: ['Rollovers from unhinging wrists early', 'Opposite field ball flight from under-rotation', 'Push pattern where hands rotate before torso'],
      equipment: ['Tee', 'Handle-loaded bat or Short bat for corrections', 'Balls'],
      targetSkills: ['Pull side hitting', 'Torso rotation', 'Upper body connection', 'Core power'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/offset-closed.mp4',
      thumbnailUrl: '/images/drills/offset-closed.jpg',
    },
    {
      name: 'Offset Rotation',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Blends Offset Open and Offset Closed with game swing to work on adjustability. Training pure ball flight to all fields. Emphasizes proper sequencing of body segments.',
      setup: 'Cycle through three positions: Offset Open (25-35° open), Neutral, Offset Closed (25-35° closed)',
      execution: 'Hit line drives up the middle from each position without striding. Cycle 3-4 times through sequence. Use back edges of plate as reference. Angle 10-20° less than plate edge.',
      keyPoints: ['Precise ball flight to middle', 'Proper sequencing', 'Adjustability', 'Torso rotation variability'],
      commonMistakes: ['Hitting to opposite field in all positions', 'Under/over-rotating in setup', 'Striding back to neutral', 'Poor sequencing'],
      equipment: ['Tee or soft toss setup', 'Bat', 'Balls'],
      targetSkills: ['Adjustability', 'All-field hitting', 'Torso rotation variability', 'Sequencing'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/offset-rotation.mp4',
      thumbnailUrl: '/images/drills/offset-rotation.jpg',
    },
    {
      name: 'Hook Em Drill',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Getting an even coil of the pelvis and torso in the load phase. Controlling the stride with a forward move. Hip-to-shoulder separation timing.',
      setup: 'Specific positioning for hip-shoulder separation training',
      execution: 'Focus on proper sequencing of hip and shoulder rotation. Work on even coil and separation timing. Blend movement phases smoothly.',
      keyPoints: ['Even coil of pelvis and torso', 'Hip-shoulder separation timing', 'Controlled forward move', 'Proper sequencing'],
      commonMistakes: ['Poor timing of separation', 'Uneven coil', 'Early extension during forward move', 'Disconnected phases'],
      equipment: ['Tee or soft toss setup', 'Bat', 'Balls'],
      targetSkills: ['Hip-shoulder separation', 'Load phase mechanics', 'Stride control', 'Coil timing'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/hook-em.mp4',
      thumbnailUrl: '/images/drills/hook-em.jpg',
    },
    {
      name: 'Hip Rotation Drill',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Develop powerful, efficient hip rotation',
      setup: 'No bat needed. Start in batting stance. Place hands on hips.',
      execution: 'Practice rotating hips forcefully while keeping upper body quiet. Back knee should drive forward. Feel weight transfer to firm front side.',
      keyPoints: ['Hips lead rotation', 'Back knee drives', 'Front side firms up', 'Upper body stays back'],
      commonMistakes: ['Spinning', 'Weight stays back', 'Weak front side', 'Early shoulder rotation'],
      equipment: ['None required'],
      targetSkills: ['Hip rotation', 'Power generation', 'Weight transfer', 'Core engagement'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/hip-rotation.mp4',
      thumbnailUrl: '/images/drills/hip-rotation.jpg',
    },
    {
      name: 'Soft Toss',
      source: 'Driveline Baseball',
      category: 'Engine',
      primaryPurpose: 'Develop timing and hand-eye coordination with moving ball',
      setup: 'Partner kneels to the side (front foot area) about 10-12 feet away. Hitter sets up in batting stance.',
      execution: 'Partner tosses ball underhand into hitting zone. Hitter focuses on driving ball to opposite field. Start slow, increase speed as comfort improves.',
      keyPoints: ['Wait for the ball', 'Smooth hip rotation', 'Hands stay inside ball', 'Drive through contact'],
      commonMistakes: ['Swinging too early', 'Pulling off the ball', 'Casting hands', 'Poor balance'],
      equipment: ['Baseballs', 'Bat', 'Partner/Coach', 'Net or field space'],
      targetSkills: ['Timing', 'Rotation', 'Hand path', 'Torso mechanics'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/soft-toss.mp4',
      thumbnailUrl: '/images/drills/soft-toss.jpg',
    },

    // ============ WHIP DRILLS (Arms & Bat) ============
    {
      name: 'High Tee Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Train high pitch posture. Works a flatter bat path. Helps train upper body connection.',
      setup: 'Tee positioned at high strike zone height',
      execution: 'Focus on maintaining posture and flatter bat path for high pitches. Work on upper body connection. Drive through high pitch.',
      keyPoints: ['High pitch posture', 'Flatter bat path', 'Upper body connection', 'Strike zone coverage'],
      commonMistakes: ['Loss of posture', 'Too steep of bat path', 'Poor high pitch approach', 'Push pattern when rotating'],
      equipment: ['Tee', 'Baseballs', 'Bat'],
      targetSkills: ['High pitch hitting', 'Bat path', 'Posture', 'Upper body connection'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/high-tee.mp4',
      thumbnailUrl: '/images/drills/high-tee.jpg',
    },
    {
      name: 'Low Tee Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Learn how to elevate the low pitch. Add side bend while rotating. Maintaining posture.',
      setup: 'Tee positioned at low strike zone height',
      execution: 'Focus on side bend and posture maintenance while hitting low pitches. Work on elevation. Rotate with proper side bend.',
      keyPoints: ['Side bend mechanics', 'Posture maintenance', 'Low pitch elevation', 'Rotation with side bend'],
      commonMistakes: ['Loss of posture', 'Poor side bend', 'Chopping down on low pitches', 'Early extension'],
      equipment: ['Tee', 'Baseballs', 'Bat'],
      targetSkills: ['Side bend', 'Posture', 'Low pitch hitting', 'Elevation'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/low-tee.mp4',
      thumbnailUrl: '/images/drills/low-tee.jpg',
    },
    {
      name: 'High, Middle, Low Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Accomplishing pure ball flight at different pitch heights. Using posture to adjust to different pitch heights. Developing swing adjustability.',
      setup: 'Three different tee heights or pitch locations (high, middle, low)',
      execution: 'Hit line drives from high, middle, and low positions with consistent ball flight and posture adjustments. Focus on barrel awareness.',
      keyPoints: ['Strike zone coverage', 'Consistent ball flight', 'Posture adjustments', 'Swing adjustability'],
      commonMistakes: ['Inconsistent ball flight', 'Poor posture adjustments', 'Wrong launch angles', 'Hand manipulation'],
      equipment: ['Tee (adjustable height)', 'Baseballs', 'Bat'],
      targetSkills: ['Strike zone coverage', 'Posture adjustment', 'Ball flight consistency', 'Adaptability'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/high-middle-low.mp4',
      thumbnailUrl: '/images/drills/high-middle-low.jpg',
    },
    {
      name: 'Launch Angle Ladder',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Hitting the ball pure at different launch angles. Develop barrel awareness and adjustability. Get a feel for what different launch angles look like.',
      setup: 'Progressive setup for different launch angle targets',
      execution: 'Work through different launch angle intentions progressively, focusing on barrel awareness. Track results and adjust.',
      keyPoints: ['Launch angle awareness', 'Ball flight intentions', 'Progressive difficulty', 'Barrel awareness'],
      commonMistakes: ['Inconsistent launch angles', 'Poor ball flight intentions', 'Poor barrel awareness', 'Wrong contact point'],
      equipment: ['Tee or soft toss setup', 'Bat', 'Balls'],
      targetSkills: ['Launch angle control', 'Barrel awareness', 'Ball flight control', 'Contact point consistency'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/launch-angle-ladder.mp4',
      thumbnailUrl: '/images/drills/launch-angle-ladder.jpg',
    },
    {
      name: 'Keep it Fair Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Rotating and clearing space. Hitting the inside pitch with pure ball flight. Increase rotational velocities of pelvis and torso.',
      setup: 'Setup with focus on fair territory targets and inside pitch work',
      execution: 'Hit balls with intention of keeping them in fair territory. Focus on rotation and clearing space. Drive inside pitches to fair territory.',
      keyPoints: ['Ball direction control', 'Fair territory awareness', 'Rotational velocity', 'Space clearing'],
      commonMistakes: ['Foul balls', 'Poor direction control', 'Inconsistent barrel delivery', 'Poor rotation'],
      equipment: ['Tee or soft toss setup', 'Fair/foul markers', 'Bat', 'Balls'],
      targetSkills: ['Inside pitch hitting', 'Rotation', 'Ball direction', 'Space clearing'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/keep-it-fair.mp4',
      thumbnailUrl: '/images/drills/keep-it-fair.jpg',
    },
    {
      name: 'Underload/Overload Training',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Increase bat speed and power through varied resistance',
      setup: 'Use bats of different weights: lighter than game bat (-3oz), game weight, heavier than game bat (+3oz to +5oz). Perform same drill with each weight.',
      execution: 'Take 5 swings with light bat, 5 with game bat, 5 with heavy bat. Focus on maximum intent and speed with each swing. Rest between sets.',
      keyPoints: ['Maximum effort on every swing', 'Maintain proper mechanics', 'Full recovery between sets', 'Track bat speed if possible'],
      commonMistakes: ['Going through motions', 'Losing mechanics with heavy bat', 'Insufficient rest', 'Not progressing gradually'],
      equipment: ['Underload bat', 'Game bat', 'Overload bat', 'Optional: Bat speed sensor'],
      targetSkills: ['Bat speed', 'Power', 'Strength', 'Arm path'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/underload-overload.mp4',
      thumbnailUrl: '/images/drills/underload-overload.jpg',
    },
    {
      name: 'One-Handed Swings',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Develop individual hand strength and proper swing path',
      setup: 'Use light bat or training stick. Perform swings off tee with top hand only, then bottom hand only.',
      execution: 'Take 5 swings top hand only (back hand for righties), focusing on driving through ball. Then 5 swings bottom hand only, focusing on path and extension.',
      keyPoints: ['Maintain balance', 'Proper grip pressure', 'Full extension', 'Smooth acceleration'],
      commonMistakes: ['Gripping too tight', 'Chopping motion', 'Poor balance', 'Incomplete swing'],
      equipment: ['Light bat or training stick', 'Batting tee', 'Balls'],
      targetSkills: ['Hand path', 'Extension', 'Strength', 'Bat control'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/one-handed.mp4',
      thumbnailUrl: '/images/drills/one-handed.jpg',
    },
    {
      name: 'Connection Drill (Towel)',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Keep hands and body connected through swing',
      setup: 'Place towel under both armpits. Set up at tee.',
      execution: 'Take smooth swings while keeping towel in place. If towel falls, connection is lost. Focus on rotating body, not casting hands.',
      keyPoints: ['Body rotation drives hands', 'Towel stays in place', 'Smooth path', 'Connected throughout'],
      commonMistakes: ['Casting hands', 'Disconnecting too early', 'Barring lead arm', 'Over-rotating shoulders'],
      equipment: ['Towel', 'Tee', 'Bat', 'Balls'],
      targetSkills: ['Connection', 'Swing path', 'Body control', 'Arm path'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/connection.mp4',
      thumbnailUrl: '/images/drills/connection.jpg',
    },
    {
      name: 'Inside Pitch Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Handle inside pitches without getting jammed',
      setup: 'Set tee on inside corner, slightly out in front. Can also use front toss.',
      execution: 'Work on quick hands and keeping barrel in zone longer. Pull hands in tight to body. Should drive ball to pull side.',
      keyPoints: ['Quick hands', 'Tight to body', 'Barrel stays in zone', 'Turn on the ball'],
      commonMistakes: ['Getting jammed', 'Rolling over', 'Slow hands', 'Wrong barrel path'],
      equipment: ['Tee', 'Bat', 'Balls'],
      targetSkills: ['Inside pitch', 'Hand speed', 'Barrel control', 'Bat speed'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/inside-pitch.mp4',
      thumbnailUrl: '/images/drills/inside-pitch.jpg',
    },

    // ============ TEMPO DRILLS (Kwon System) ============
    {
      name: 'Two-Step Swing - Stage 1',
      source: 'Kwon Biomechanics',
      category: 'Tempo',
      primaryPurpose: 'Develop stepping-like rhythm fundamental to good ground reaction force patterns. Create active backswing with trail leg push and lead leg push.',
      setup: 'Start with both feet together in neutral position. Have enough space to take two steps.',
      execution: 'Perform trigger motion by throwing club toward target. Take away step first (trail leg), then toward step (lead leg). Execute swing with both steps, maintaining rhythm throughout.',
      keyPoints: ['Trigger motion activates lead leg', 'Away step promotes trail leg push', 'Toward step creates lead leg push', 'Maintain consistent rhythm'],
      commonMistakes: ['Poor trigger motion', 'Inconsistent rhythm between steps', 'Not pushing ground with each step', 'Rushing second step'],
      equipment: ['Bat', 'Open space', 'Optional: Metronome for rhythm'],
      targetSkills: ['Rhythm', 'Timing', 'Ground reaction force', 'Stepping pattern'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/two-step-stage1.mp4',
      thumbnailUrl: '/images/drills/two-step-stage1.jpg',
    },
    {
      name: 'Two-Step Swing - Stage 2',
      source: 'Kwon Biomechanics',
      category: 'Tempo',
      primaryPurpose: 'Eliminate first step while maintaining rhythm. Focus on toward step timing and trail leg push.',
      setup: 'Start with slightly narrow stance, keeping room for the toward step. Narrow enough to allow proper step.',
      execution: 'Perform trigger motion. Skip away step, only take toward step (lead leg). Execute swing maintaining same rhythm as Stage 1.',
      keyPoints: ['Maintain Stage 1 rhythm without away step', 'Proper timing of toward step', 'Trail leg push during backswing', 'Lead leg push in downswing'],
      commonMistakes: ['Step too early or too late', 'Losing rhythm from Stage 1', 'Not enough trail side push in backswing', 'Over-shifting away'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls'],
      targetSkills: ['Rhythm', 'Timing', 'Transition', 'Ground force patterns'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/two-step-stage2.mp4',
      thumbnailUrl: '/images/drills/two-step-stage2.jpg',
    },
    {
      name: 'Two-Step Swing - Stage 3',
      source: 'Kwon Biomechanics',
      category: 'Tempo',
      primaryPurpose: 'Eliminate all steps while maintaining rhythmic pattern. Use trigger motion only to initiate active backswing.',
      setup: 'Normal batting stance with proper width. No steps will be taken.',
      execution: 'Perform trigger motion to activate lead leg. Execute swing from static position while maintaining internal rhythm from previous stages.',
      keyPoints: ['Trigger motion creates active backswing', 'Maintain internal rhythm', 'Lead leg push at trigger', 'Trail leg push in backswing'],
      commonMistakes: ['Losing rhythmic pattern', 'Static, inactive backswing', 'Poor timing without physical steps', 'Not using trigger effectively'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls'],
      targetSkills: ['Rhythm', 'Timing', 'Active backswing', 'Internal tempo'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/two-step-stage3.mp4',
      thumbnailUrl: '/images/drills/two-step-stage3.jpg',
    },
    {
      name: 'Two-Step Swing - Stage X',
      source: 'Kwon Biomechanics',
      category: 'Tempo',
      primaryPurpose: 'Advanced rhythm development with multiple trigger motions. Customize number of triggers to establish personal rhythm.',
      setup: 'Normal batting stance. Can perform multiple trigger motions before swing.',
      execution: 'Perform multiple trigger motions (e.g., "one, two, three, wind up, swing"). Each trigger should activate ground push. Execute swing maintaining established rhythm.',
      keyPoints: ['Multiple triggers allowed', 'Each trigger creates ground push', 'Establish personal rhythm', 'Maintain consistent timing'],
      commonMistakes: ['Triggers without purpose', 'Losing rhythm with multiple triggers', 'Not pushing ground with each trigger', 'Inconsistent trigger patterns'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls', 'Optional: Metronome'],
      targetSkills: ['Rhythm', 'Timing', 'Personalization', 'Advanced tempo control'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/two-step-stagex.mp4',
      thumbnailUrl: '/images/drills/two-step-stagex.jpg',
    },
    {
      name: 'Walk Through Drill',
      source: 'Driveline Baseball',
      category: 'Tempo',
      primaryPurpose: 'Creating rhythm in the swing. Adding linear momentum. Increasing intent to swing fast.',
      setup: 'Setup allowing for walking motion into swing. Ensure adequate space.',
      execution: 'Walk through the swing motion to create rhythm and momentum. Focus on fluid movement. Build speed progressively.',
      keyPoints: ['Rhythm development', 'Linear momentum', 'Intent building', 'Fluid movement patterns'],
      commonMistakes: ['Poor timing', 'Loss of balance', 'Inconsistent rhythm', 'Being too rigid'],
      equipment: ['Open space', 'Tee or soft toss', 'Bat', 'Balls'],
      targetSkills: ['Rhythm', 'Timing', 'Linear momentum', 'Intent'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/walk-through.mp4',
      thumbnailUrl: '/images/drills/walk-through.jpg',
    },
    {
      name: 'Continuous Swings (Hepburn Drill)',
      source: 'Kwon Biomechanics',
      category: 'Tempo',
      primaryPurpose: 'Develop rhythmic motion through repetition. Practice maintaining tempo across multiple swings. Build muscle memory for proper timing.',
      setup: 'Set up multiple balls on tees or have partner ready for rapid soft toss. Ensure proper spacing.',
      execution: 'Hit multiple balls in succession, maintaining consistent rhythm between each swing. Focus on tempo and flow rather than maximum power.',
      keyPoints: ['Consistent rhythm between swings', 'Maintain tempo throughout', 'Focus on flow', 'Build rhythmic awareness'],
      commonMistakes: ['Rushing between swings', 'Losing tempo', 'Sacrificing mechanics for speed', 'Inconsistent timing'],
      equipment: ['Multiple tees or partner', 'Multiple balls', 'Bat'],
      targetSkills: ['Rhythm', 'Tempo', 'Consistency', 'Flow'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/continuous-swings.mp4',
      thumbnailUrl: '/images/drills/continuous-swings.jpg',
    },

    // ============ ADDITIONAL WHIP DRILLS ============
    {
      name: 'Big Papi Hitting Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Advanced drill technique focusing on powerful bat path and extension like David Ortiz',
      setup: 'Specific setup for advanced hitters focusing on power generation',
      execution: 'Advanced execution pattern based on Big Papi\'s approach. Focus on full extension through contact zone with aggressive rotation.',
      keyPoints: ['Full extension', 'Aggressive barrel delivery', 'Power through contact', 'Professional approach'],
      commonMistakes: ['Incomplete extension', 'Rolling over too early', 'Losing balance', 'Poor timing'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls'],
      targetSkills: ['Power', 'Extension', 'Barrel control', 'Advanced technique'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/big-papi.mp4',
      thumbnailUrl: '/images/drills/big-papi.jpg',
    },
    {
      name: 'Hitting Pivot Pick',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Focus on pivot mechanics in the swing. Improve body positioning and barrel delivery timing.',
      setup: 'Setup for pivot training with specific body positioning',
      execution: 'Focus on proper pivot mechanics and timing throughout the swing. Emphasize smooth barrel delivery through pivot point.',
      keyPoints: ['Pivot timing', 'Body positioning', 'Barrel path', 'Rotational efficiency'],
      commonMistakes: ['Poor pivot timing', 'Mechanical breakdown', 'Body positioning errors', 'Early/late barrel'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls'],
      targetSkills: ['Pivot mechanics', 'Body control', 'Rotational timing', 'Barrel delivery'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/pivot-pick.mp4',
      thumbnailUrl: '/images/drills/pivot-pick.jpg',
    },
    {
      name: 'No Stride Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Work on swing mechanics without stride component. Focus on rotation and balance from static position.',
      setup: 'Static setup without stride, focus on balance and stability',
      execution: 'Focus on swing mechanics from static position, emphasizing rotation and balance. Remove timing variable of stride.',
      keyPoints: ['Static balance', 'Pure rotation', 'Timing without stride', 'Upper body mechanics'],
      commonMistakes: ['Loss of balance', 'Poor rotation', 'Timing issues', 'Over-reliance on stride'],
      equipment: ['Tee or soft toss', 'Bat', 'Balls'],
      targetSkills: ['Balance', 'Rotation', 'Timing', 'Upper body control'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/no-stride.mp4',
      thumbnailUrl: '/images/drills/no-stride.jpg',
    },
    {
      name: 'Flow Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Work on swing flow and rhythm. Develop smooth, connected movement patterns throughout the swing.',
      setup: 'Setup for flow training with emphasis on smooth transitions',
      execution: 'Focus on smooth, flowing swing motion with connected movement patterns. Eliminate choppy or disconnected movements.',
      keyPoints: ['Smooth flow', 'Connected movements', 'Rhythm', 'Transition quality'],
      commonMistakes: ['Choppy motion', 'Poor rhythm', 'Disconnected movements', 'Tension'],
      equipment: ['Bat', 'Tee or soft toss', 'Balls'],
      targetSkills: ['Flow', 'Rhythm', 'Smooth mechanics', 'Connection'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/flow.mp4',
      thumbnailUrl: '/images/drills/flow.jpg',
    },
    {
      name: 'Pull Side Angle Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Work on pull side hitting mechanics. Improve angle work and directional barrel control.',
      setup: 'Angled setup for pull side hitting with specific positioning',
      execution: 'Focus on pull side mechanics and ball flight with proper angle work. Drive balls to pull field with intent.',
      keyPoints: ['Pull side mechanics', 'Angle work', 'Direction control', 'Barrel delivery'],
      commonMistakes: ['Poor angle', 'Wrong ball flight', 'Mechanical breakdown', 'Direction problems'],
      equipment: ['Angled tee or L-screen', 'Bat', 'Balls'],
      targetSkills: ['Pull side hitting', 'Direction control', 'Angle awareness', 'Barrel path'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/pull-side-angle.mp4',
      thumbnailUrl: '/images/drills/pull-side-angle.jpg',
    },
    {
      name: 'Oppo Side Angle Drill',
      source: 'Driveline Baseball',
      category: 'Whip',
      primaryPurpose: 'Work on opposite field hitting mechanics. Improve angle work and directional barrel control to opposite field.',
      setup: 'Angled setup for opposite field hitting with specific positioning',
      execution: 'Focus on opposite field mechanics and ball flight with proper angle work. Drive balls to opposite field with proper extension.',
      keyPoints: ['Opposite field mechanics', 'Angle work', 'Direction control', 'Extension'],
      commonMistakes: ['Pulling off', 'Wrong angle', 'Poor extension', 'Weak contact'],
      equipment: ['Angled tee or L-screen', 'Bat', 'Balls'],
      targetSkills: ['Opposite field hitting', 'Direction control', 'Angle awareness', 'Extension'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/oppo-side-angle.mp4',
      thumbnailUrl: '/images/drills/oppo-side-angle.jpg',
    },

    // ============ ADDITIONAL TEMPO DRILLS (Kwon-Inspired) ============
    {
      name: 'Bat Path Rope Drill',
      source: 'Kwon Biomechanics (Adapted)',
      category: 'Tempo',
      primaryPurpose: 'Develop feel for proper bat path and swing plane using rope visualization. Improve timing and rhythm awareness.',
      setup: 'Use rope or towel to simulate bat path. Practice swinging along intended plane.',
      execution: 'Swing rope/towel to feel proper swing plane and path. Focus on rhythm and timing of the swing. Gradually increase speed while maintaining path.',
      keyPoints: ['Proper swing plane', 'Path awareness', 'Rhythm development', 'Timing feel'],
      commonMistakes: ['Inconsistent plane', 'Poor rhythm', 'Rushing motion', 'Wrong path'],
      equipment: ['Rope or towel', 'Open space'],
      targetSkills: ['Bat path awareness', 'Swing plane', 'Rhythm', 'Timing'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/rope-swing.mp4',
      thumbnailUrl: '/images/drills/rope-swing.jpg',
    },
    {
      name: 'Woosh Stick Speed Drill',
      source: 'Kwon Biomechanics (Adapted)',
      category: 'Tempo',
      primaryPurpose: 'Develop bat speed and proper sequencing through auditory feedback. Focus on maximum speed at contact zone.',
      setup: 'Use light training bat or woosh stick. Find open space for full swings.',
      execution: 'Take full speed swings focusing on maximum speed at intended contact point. Listen for "woosh" sound to confirm speed location. Adjust timing if sound is too early or late.',
      keyPoints: ['Maximum speed at contact', 'Auditory feedback', 'Proper sequencing', 'Speed development'],
      commonMistakes: ['Peak speed too early', 'Peak speed too late', 'Poor sequencing', 'Inconsistent tempo'],
      equipment: ['Woosh stick or light training bat', 'Open space'],
      targetSkills: ['Bat speed', 'Sequencing', 'Timing', 'Speed awareness'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/woosh-stick.mp4',
      thumbnailUrl: '/images/drills/woosh-stick.jpg',
    },
    {
      name: 'Shift-Turn Rhythm Drill',
      source: 'Kwon Biomechanics (Adapted)',
      category: 'Tempo',
      primaryPurpose: 'Coordinate weight shift and rotational turn in proper sequence. Develop "Shurn" rhythm for power generation.',
      setup: 'Normal batting stance. Focus on feeling weight shift before rotation.',
      execution: 'Practice coordinated shift-turn motion. Feel weight shift into back leg, then explosive shift-turn to front side. Emphasize smooth blend of linear and rotational movements.',
      keyPoints: ['Shift before turn', 'Coordinated motion', 'Smooth transition', 'Power generation'],
      commonMistakes: ['Rotating without shifting', 'Shifting without rotating', 'Poor coordination', 'Choppy motion'],
      equipment: ['Bat', 'Optional: Tee for feedback'],
      targetSkills: ['Weight shift', 'Rotation timing', 'Coordination', 'Rhythm'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/shift-turn.mp4',
      thumbnailUrl: '/images/drills/shift-turn.jpg',
    },

    // ============ GENERAL DRILLS ============
    {
      name: 'Tee Work - Basic',
      source: 'Driveline Baseball',
      category: 'General',
      primaryPurpose: 'Develop consistent contact and proper swing mechanics',
      setup: 'Set up tee at various heights and locations. Start at belt height, middle of plate.',
      execution: 'Focus on balanced setup, smooth load, and controlled swing. Aim for line drives up the middle. Take 10 swings per location before adjusting tee position.',
      keyPoints: ['Maintain balance throughout swing', 'Keep head still', 'Follow through completely', 'Focus on quality over quantity'],
      commonMistakes: ['Rushing the swing', 'Lunging forward', 'Dropping back shoulder', 'Not following through'],
      equipment: ['Batting tee', 'Baseball/Softball', 'Bat', 'Batting gloves'],
      targetSkills: ['Balance', 'Contact', 'Swing Path', 'Consistency'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/tee-work.mp4',
      thumbnailUrl: '/images/drills/tee-work.jpg',
    },
    {
      name: 'Front Toss',
      source: 'Driveline Baseball',
      category: 'General',
      primaryPurpose: 'Practice hitting against live arm angle and timing',
      setup: 'Thrower stands behind L-screen about 30-40 feet away. Hitter in batting stance.',
      execution: 'Thrower delivers easy tosses from behind screen. Hitter works on timing and driving ball to all fields. Increase velocity gradually.',
      keyPoints: ['Track ball early', 'Proper load timing', 'Controlled aggression', 'Adjust to different locations'],
      commonMistakes: ['Bailing out', 'Overswinging', 'Poor pitch recognition', 'Inconsistent timing'],
      equipment: ['L-screen', 'Baseballs', 'Bat', 'Net or field', 'Thrower'],
      targetSkills: ['Timing', 'Pitch recognition', 'Sequencing', 'Adjustability'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/front-toss.mp4',
      thumbnailUrl: '/images/drills/front-toss.jpg',
    },
    {
      name: 'Vision Training',
      source: 'Driveline Baseball',
      category: 'General',
      primaryPurpose: 'Improve pitch recognition and tracking',
      setup: 'Use colored balls or numbered balls. Front toss from behind screen.',
      execution: 'Thrower calls out color or number as ball is released. Hitter must identify and decide to swing or take. Increases reaction time and decision making.',
      keyPoints: ['Quick visual pickup', 'Decisive action', 'Maintain mechanics under pressure', 'Track ball all the way'],
      commonMistakes: ['Guessing instead of seeing', 'Late recognition', 'Indecision', 'Poor swing decisions'],
      equipment: ['Colored balls', 'L-screen', 'Thrower', 'Bat'],
      targetSkills: ['Pitch recognition', 'Reaction time', 'Decision making', 'Visual tracking'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/vision-training.mp4',
      thumbnailUrl: '/images/drills/vision-training.jpg',
    },
  ];

  for (const drill of drills) {
    await prisma.drill.upsert({
      where: { name: drill.name },
      update: {},
      create: drill,
    });
  }

  console.log(`Created ${drills.length} drills`);

  // Create mock videos for test user
  const mockVideos = [
    {
      title: 'Batting Practice #1',
      analyzed: true,
      anchor: 76,    // Lower Body
      engine: 82,    // Trunk/Core
      whip: 75,      // Arms & Bat
      overallScore: 77,
      tier: 'Advanced',
      // Anchor Subcategories
      anchorStance: 78,
      anchorWeightShift: 75,
      anchorGroundConnection: 74,
      anchorLowerBodyMechanics: 77,
      // Engine Subcategories
      engineHipRotation: 85,
      engineSeparation: 81,
      engineCorePower: 83,
      engineTorsoMechanics: 79,
      // Whip Subcategories
      whipArmPath: 72,
      whipBatSpeed: 78,
      whipBatPath: 76,
      whipConnection: 74,
      exitVelocity: 89,
      coachFeedback: 'Great hip rotation! Your trunk is generating good power. Focus on keeping your hands inside the ball on inside pitches to avoid getting jammed. Try the Inside Pitch Drill to improve your hand path.',
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      title: 'Cage Work - Front Toss',
      analyzed: true,
      anchor: 79,    // Lower Body
      engine: 85,    // Trunk/Core
      whip: 78,      // Arms & Bat
      overallScore: 80,
      tier: 'Advanced',
      // Anchor Subcategories
      anchorStance: 81,
      anchorWeightShift: 78,
      anchorGroundConnection: 77,
      anchorLowerBodyMechanics: 80,
      // Engine Subcategories
      engineHipRotation: 88,
      engineSeparation: 84,
      engineCorePower: 86,
      engineTorsoMechanics: 82,
      // Whip Subcategories
      whipArmPath: 76,
      whipBatSpeed: 81,
      whipBatPath: 79,
      whipConnection: 76,
      exitVelocity: 92,
      coachFeedback: 'Excellent improvement! Your lower body has gotten much better and it shows in your exit velocity. Keep working on connection through the zone with your arms and bat.',
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Live BP Session',
      analyzed: true,
      anchor: 74,    // Lower Body
      engine: 79,    // Trunk/Core
      whip: 72,      // Arms & Bat
      overallScore: 74,
      tier: 'Intermediate',
      // Anchor Subcategories
      anchorStance: 76,
      anchorWeightShift: 73,
      anchorGroundConnection: 72,
      anchorLowerBodyMechanics: 75,
      // Engine Subcategories
      engineHipRotation: 81,
      engineSeparation: 78,
      engineCorePower: 79,
      engineTorsoMechanics: 78,
      // Whip Subcategories
      whipArmPath: 70,
      whipBatSpeed: 74,
      whipBatPath: 73,
      whipConnection: 71,
      exitVelocity: 86,
      coachFeedback: 'You rushed a few swings today. Remember to let the ball travel and stay balanced through contact. The Connection Drill will help you maintain better body control.',
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      title: 'Game Swing Analysis',
      analyzed: true,
      anchor: 82,    // Lower Body
      engine: 88,    // Trunk/Core
      whip: 81,      // Arms & Bat
      overallScore: 84,
      tier: 'Elite',
      // Anchor Subcategories
      anchorStance: 84,
      anchorWeightShift: 81,
      anchorGroundConnection: 80,
      anchorLowerBodyMechanics: 83,
      // Engine Subcategories
      engineHipRotation: 91,
      engineSeparation: 87,
      engineCorePower: 89,
      engineTorsoMechanics: 85,
      // Whip Subcategories
      whipArmPath: 79,
      whipBatSpeed: 84,
      whipBatPath: 82,
      whipConnection: 79,
      exitVelocity: 94,
      coachFeedback: 'This is your best swing yet! Everything is clicking - great sequence from lower body to trunk to arms. Your exit velo shows the power you\'re generating. Keep this feel!',
      uploadDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      title: 'Tee Work - High Pitch',
      analyzed: true,
      anchor: 71,    // Lower Body
      engine: 76,    // Trunk/Core
      whip: 70,      // Arms & Bat
      overallScore: 72,
      tier: 'Intermediate',
      // Anchor Subcategories
      anchorStance: 73,
      anchorWeightShift: 70,
      anchorGroundConnection: 69,
      anchorLowerBodyMechanics: 72,
      // Engine Subcategories
      engineHipRotation: 78,
      engineSeparation: 75,
      engineCorePower: 77,
      engineTorsoMechanics: 74,
      // Whip Subcategories
      whipArmPath: 68,
      whipBatSpeed: 72,
      whipBatPath: 71,
      whipConnection: 69,
      exitVelocity: 84,
      coachFeedback: 'High pitches are challenging your lower body stability. Work on staying tall through contact and not dropping your back shoulder. The Stride Box Drill will help maintain consistent mechanics.',
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ];

  for (const video of mockVideos) {
    await prisma.video.create({
      data: {
        ...video,
        videoUrl: '/videos/mock-swing.mp4',
        thumbnailUrl: '/images/thumbnails/swing-thumb.jpg',
        userId: testUser.id,
      },
    });
  }

  console.log(`Created ${mockVideos.length} mock videos`);

  // Create progress entries for charts - 4Bs Body Metrics
  const progressEntries = [];
  const today = new Date();
  
  for (let i = 8; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7)); // Weekly entries
    
    const avgAnchor = 68 + Math.floor(Math.random() * 15);
    const avgEngine = 75 + Math.floor(Math.random() * 15);
    const avgWhip = 70 + Math.floor(Math.random() * 15);
    
    progressEntries.push({
      userId: testUser.id,
      date,
      avgAnchor,  // Lower Body
      avgEngine,  // Trunk/Core
      avgWhip,    // Arms & Bat
      avgOverall: Math.floor((avgAnchor + avgEngine + avgWhip) / 3),
      // Anchor Subcategories
      avgAnchorStance: avgAnchor + Math.floor(Math.random() * 5) - 2,
      avgAnchorWeightShift: avgAnchor + Math.floor(Math.random() * 5) - 2,
      avgAnchorGroundConnection: avgAnchor + Math.floor(Math.random() * 5) - 2,
      avgAnchorLowerBodyMechanics: avgAnchor + Math.floor(Math.random() * 5) - 2,
      // Engine Subcategories
      avgEngineHipRotation: avgEngine + Math.floor(Math.random() * 5) - 2,
      avgEngineSeparation: avgEngine + Math.floor(Math.random() * 5) - 2,
      avgEngineCorePower: avgEngine + Math.floor(Math.random() * 5) - 2,
      avgEngineTorsoMechanics: avgEngine + Math.floor(Math.random() * 5) - 2,
      // Whip Subcategories
      avgWhipArmPath: avgWhip + Math.floor(Math.random() * 5) - 2,
      avgWhipBatSpeed: avgWhip + Math.floor(Math.random() * 5) - 2,
      avgWhipBatPath: avgWhip + Math.floor(Math.random() * 5) - 2,
      avgWhipConnection: avgWhip + Math.floor(Math.random() * 5) - 2,
    });
  }

  await prisma.progressEntry.createMany({
    data: progressEntries,
  });

  console.log(`Created ${progressEntries.length} progress entries`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });