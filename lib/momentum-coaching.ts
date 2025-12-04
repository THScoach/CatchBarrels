/**
 * Momentum Transfer Coaching Explanations
 * 
 * BARRELS Flow Path Model™:
 * - Ground Flow (Ground → Hips)
 * - Engine Flow (Hips → Torso)
 * - Barrel Flow (Torso → Barrel)
 * 
 * Generates simple, actionable coaching text based on momentum transfer scores.
 * Logic designed by Coach Rick for the BARRELS app.
 */

export interface MomentumScores {
  momentumTransferScore: number;      // 0-100
  groundFlowScore: number;            // 0-100 (Ground → Hips)
  powerFlowScore: number;             // 0-100 (Hips → Torso)
  barrelFlowScore: number;            // 0-100 (Torso → Barrel)
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
  // Legacy field names for backward compatibility
  anchorScore?: number;
  engineScore?: number;
  whipScore?: number;
}

export interface CoachingExplanation {
  overallLine: string;                // 1-2 sentences about MTS
  leakLine: string;                   // 1-2 sentences about where the leak is
  nextStep: string;                   // 1 sentence with a feel cue
  fullText: string;                   // All 3 combined (max 4 sentences)
}

/**
 * Structured Coach Rick Report (Phase 2)
 * Full analysis with strengths, opportunities, and coach notes
 */
export interface StructuredCoachReport {
  // Main Analysis Paragraphs
  overviewParagraph: string;          // 2-3 sentences: overall momentum transfer assessment
  detailParagraph: string;            // 2-3 sentences: specific breakdown of flow paths
  
  // What You Do Well (3 strengths)
  strengths: string[];                // 3 bullet points highlighting positives
  
  // Biggest Opportunities (3 areas to improve)
  opportunities: string[];            // 3 bullet points for growth areas
  
  // Next Session Focus
  nextSessionFocus: string;           // 1-2 sentences: clear, actionable focus for next session
  
  // Coach-Only Notes (not visible to player)
  coachNotes: {
    technicalObservations: string;    // Technical details for coach reference
    progressionRecommendations: string; // Suggested drill progression
    watchPoints: string;                // Things to monitor in future sessions
  };
  
  // Legacy compatibility
  fullText: string;                   // Combined text for backward compatibility
}

/**
 * Generate coaching explanation based on momentum transfer scores
 */
export function generateMomentumCoaching(scores: MomentumScores): CoachingExplanation {
  const { 
    momentumTransferScore, 
    groundFlowScore, 
    powerFlowScore, 
    barrelFlowScore, 
    goatyBandLabel,
    // Fallback to legacy names if new ones aren't provided
    anchorScore,
    engineScore,
    whipScore
  } = scores;
  
  // Use new field names, with fallback to legacy
  const ground = groundFlowScore ?? anchorScore ?? 0;
  const power = powerFlowScore ?? engineScore ?? 0;
  const barrel = barrelFlowScore ?? whipScore ?? 0;
  
  // Step 1: Overall line based on MTS
  let overallLine = '';
  
  if (momentumTransferScore >= 92) {
    overallLine = `Your momentum transfer is **elite** (${momentumTransferScore}). You're sequencing like a pro and letting the barrel work.`;
  } else if (momentumTransferScore >= 85) {
    overallLine = `Your momentum transfer is **advanced** (${momentumTransferScore}). The pattern is solid – now we're chasing tiny efficiency gains.`;
  } else if (momentumTransferScore >= 75) {
    overallLine = `Your timing pattern is **above average** (${momentumTransferScore}). You create flow; we just need to clean up a small leak or two.`;
  } else if (momentumTransferScore >= 60) {
    overallLine = `You're **creating speed** (${momentumTransferScore}), but you're leaving power on the table as energy moves through the body.`;
  } else {
    overallLine = `Your swing looks like effort, not flow right now (${momentumTransferScore}). The energy isn't traveling smoothly through your body yet.`;
  }
  
  // Step 2: Identify where the main leak is
  const leaks: Array<{ zone: 'groundFlow' | 'powerFlow' | 'barrelFlow'; score: number; gap: number }> = [
    { zone: 'groundFlow', score: ground, gap: momentumTransferScore - ground },
    { zone: 'powerFlow', score: power, gap: momentumTransferScore - power },
    { zone: 'barrelFlow', score: barrel, gap: momentumTransferScore - barrel },
  ];
  
  // Sort by largest gap (biggest leak)
  leaks.sort((a, b) => b.gap - a.gap);
  
  let leakLine = '';
  let nextStep = '';
  
  // Only mention leak if gap is >= 10 points
  const mainLeak = leaks[0];
  if (mainLeak.gap >= 10) {
    switch (mainLeak.zone) {
      case 'groundFlow':
        leakLine = "Your ground flow is inconsistent—the lower body isn't holding or loading long enough for clean hip initiation.";
        nextStep = "Next step: Learn to **load into the ground and hold it** so your hips can fire at the right time.";
        break;
        
      case 'powerFlow':
        leakLine = "Your engine flow has a leak—the core isn't fully accepting what the hips started. You're either dumping early or spinning flat.";
        nextStep = "Next step: Learn to **let the hips start and the torso follow**, instead of everything spinning together.";
        break;
        
      case 'barrelFlow':
        leakLine = "Your barrel flow is mistimed—the hands and bat aren't catching the wave of energy from the core.";
        nextStep = "Next step: Learn to **let the barrel snap late**, so it catches the energy instead of forcing it.";
        break;
    }
  } else {
    // No major leak - everything is balanced
    leakLine = "Your energy flow through Ground Flow → Engine Flow → Barrel Flow is balanced.";
    nextStep = "Next step: Focus on **consistency** and let the pattern settle in with reps.";
  }
  
  // Step 3: Combine into full text (max 4 sentences)
  const fullText = `${overallLine} ${leakLine} ${nextStep}`;
  
  return {
    overallLine,
    leakLine,
    nextStep,
    fullText,
  };
}

/**
 * Generate a full structured Coach Rick report
 * Includes paragraphs, strengths, opportunities, next focus, and coach notes
 */
export function generateStructuredCoachReport(scores: MomentumScores): StructuredCoachReport {
  const { 
    momentumTransferScore, 
    groundFlowScore, 
    powerFlowScore, 
    barrelFlowScore, 
    goatyBandLabel,
    anchorScore,
    engineScore,
    whipScore
  } = scores;
  
  // Use new field names, with fallback to legacy
  const ground = groundFlowScore ?? anchorScore ?? 0;
  const power = powerFlowScore ?? engineScore ?? 0;
  const barrel = barrelFlowScore ?? whipScore ?? 0;
  
  // Identify main and secondary leaks
  const leaks: Array<{ zone: 'groundFlow' | 'powerFlow' | 'barrelFlow'; score: number; gap: number }> = [
    { zone: 'groundFlow', score: ground, gap: momentumTransferScore - ground },
    { zone: 'powerFlow', score: power, gap: momentumTransferScore - power },
    { zone: 'barrelFlow', score: barrel, gap: momentumTransferScore - barrel },
  ];
  leaks.sort((a, b) => b.gap - a.gap);
  
  const mainLeak = leaks[0];
  const secondaryLeak = leaks[1];
  const hasMainLeak = mainLeak.gap >= 10;
  const hasSecondaryLeak = secondaryLeak.gap >= 10;
  
  // Find strengths (scores >= 80 or within 5 points of MTS)
  const strongZones = leaks.filter(l => l.score >= 80 || l.gap < 5);
  
  // === OVERVIEW PARAGRAPH ===
  let overviewParagraph = '';
  if (momentumTransferScore >= 92) {
    overviewParagraph = `Your Momentum Transfer Score of ${momentumTransferScore} puts you in elite territory. The way energy flows through your body is efficient, sequenced, and powerful—this is the pattern we see in high-level hitters. You're not forcing anything; you're letting the barrel work for you.`;
  } else if (momentumTransferScore >= 85) {
    overviewParagraph = `Your Momentum Transfer Score of ${momentumTransferScore} shows an advanced pattern. You're creating consistent flow from the ground through the barrel. The foundation is solid; now we're refining small inefficiencies to unlock the next level of bat speed and power.`;
  } else if (momentumTransferScore >= 75) {
    overviewParagraph = `Your Momentum Transfer Score of ${momentumTransferScore} indicates you're creating good flow, but there's energy being left on the table. The pattern is there, but one or two segments aren't accepting the energy cleanly. Small adjustments will make a big difference.`;
  } else if (momentumTransferScore >= 60) {
    overviewParagraph = `Your Momentum Transfer Score of ${momentumTransferScore} shows you're generating speed, but the energy isn't traveling smoothly through your body. You're working hard, but the sequencing is breaking down somewhere. Let's identify the leak and rebuild the pattern.`;
  } else {
    overviewParagraph = `Your Momentum Transfer Score of ${momentumTransferScore} tells us the energy flow isn't connected yet. Your swing looks like effort instead of flow. This is common—we just need to build the pattern step by step, starting from the ground up.`;
  }
  
  // === DETAIL PARAGRAPH ===
  let detailParagraph = '';
  if (!hasMainLeak) {
    detailParagraph = `Your Ground Flow (${ground}), Engine Flow (${power}), and Barrel Flow (${barrel}) are all balanced. No major leaks detected—energy is moving smoothly through each segment. This consistency is your foundation; now we focus on polishing the pattern and building confidence in the timing.`;
  } else if (hasSecondaryLeak) {
    const mainZoneName = mainLeak.zone === 'groundFlow' ? 'Ground Flow' : mainLeak.zone === 'powerFlow' ? 'Engine Flow' : 'Barrel Flow';
    const secondaryZoneName = secondaryLeak.zone === 'groundFlow' ? 'Ground Flow' : secondaryLeak.zone === 'powerFlow' ? 'Engine Flow' : 'Barrel Flow';
    detailParagraph = `We're seeing two leaks: ${mainZoneName} (${mainLeak.score}) and ${secondaryZoneName} (${secondaryLeak.score}). This suggests a breakdown in sequencing—segments are either firing too early or not accepting energy from the previous link. We'll address the primary leak first, which will often help the secondary one fall into place.`;
  } else {
    const mainZoneName = mainLeak.zone === 'groundFlow' ? 'Ground Flow' : mainLeak.zone === 'powerFlow' ? 'Engine Flow' : 'Barrel Flow';
    detailParagraph = `The main leak is in your ${mainZoneName} (${mainLeak.score}). ${
      mainLeak.zone === 'groundFlow' 
        ? "Your lower body isn't loading and holding long enough to set up clean hip initiation. You're likely starting your swing too early or not loading into the ground properly."
        : mainLeak.zone === 'powerFlow'
        ? "Your core isn't fully accepting what the hips started. You're either dumping the barrel early or the torso is spinning flat instead of tilting to meet the pitch plane."
        : "Your hands and bat aren't catching the wave of energy from the core. The barrel is either dragging or being forced instead of snapping late as a reaction to the body's rotation."
    } Fix this link and the rest of your pattern will tighten up significantly.`;
  }
  
  // === STRENGTHS (3 bullets) ===
  const strengths: string[] = [];
  
  if (momentumTransferScore >= 85) {
    strengths.push("Your overall sequencing is clean—you're creating flow, not forcing the swing.");
  } else if (momentumTransferScore >= 75) {
    strengths.push("You're generating good bat speed—the foundation of your pattern is solid.");
  } else {
    strengths.push("You're committed to learning the pattern—your awareness is the first step to improvement.");
  }
  
  if (ground >= 80) {
    strengths.push("Your Ground Flow is strong—you're loading into the ground and holding it well.");
  } else if (power >= 80) {
    strengths.push("Your Engine Flow is strong—your hips and torso are creating good separation and rotation.");
  } else if (barrel >= 80) {
    strengths.push("Your Barrel Flow is strong—your hands and bat are catching the energy cleanly.");
  } else if (strongZones.length > 0) {
    const strongZone = strongZones[0].zone === 'groundFlow' ? 'Ground Flow' : strongZones[0].zone === 'powerFlow' ? 'Engine Flow' : 'Barrel Flow';
    strengths.push(`Your ${strongZone} is consistent—this is a reliable part of your pattern.`);
  } else {
    strengths.push("You have the physical tools—we just need to connect the timing and sequencing.");
  }
  
  if (momentumTransferScore >= 75) {
    strengths.push("Your swing has a repeatable pattern—with refinement, you'll see big gains in consistency.");
  } else {
    strengths.push("You're building awareness of how your body moves—that's the foundation for all future growth.");
  }
  
  // === OPPORTUNITIES (3 bullets) ===
  const opportunities: string[] = [];
  
  if (hasMainLeak) {
    if (mainLeak.zone === 'groundFlow') {
      opportunities.push("Learn to load into the ground and hold it longer—this sets up everything else in the swing.");
      opportunities.push("Work on delaying your hip fire—let the lower body load fully before initiating rotation.");
    } else if (mainLeak.zone === 'powerFlow') {
      opportunities.push("Let the hips start the swing, and let the torso follow—don't spin everything together.");
      opportunities.push("Focus on creating separation between your hips and shoulders during the load phase.");
    } else if (mainLeak.zone === 'barrelFlow') {
      opportunities.push("Let the barrel snap late—it should feel like a reaction to your body, not something you're forcing.");
      opportunities.push("Work on keeping your hands inside and letting the bat path be short to the ball.");
    }
  } else {
    opportunities.push("Focus on consistency—reps will help solidify this balanced pattern.");
    opportunities.push("Challenge yourself with higher velocities or different pitch types to test the pattern.");
  }
  
  if (hasSecondaryLeak) {
    if (secondaryLeak.zone === 'groundFlow') {
      opportunities.push("Once the primary leak is fixed, revisit your ground connection and weight shift.");
    } else if (secondaryLeak.zone === 'powerFlow') {
      opportunities.push("Once the primary leak is fixed, work on refining your core rotation and separation.");
    } else {
      opportunities.push("Once the primary leak is fixed, fine-tune your barrel path and hand timing.");
    }
  } else {
    opportunities.push("Start tracking your swing metrics over time to measure progress and identify trends.");
  }
  
  // === NEXT SESSION FOCUS ===
  let nextSessionFocus = '';
  if (hasMainLeak) {
    if (mainLeak.zone === 'groundFlow') {
      nextSessionFocus = "Next session, focus on loading into the ground and holding it. Feel the pressure build in your back leg before you start your swing. This one adjustment will unlock the rest of your pattern.";
    } else if (mainLeak.zone === 'powerFlow') {
      nextSessionFocus = "Next session, focus on letting your hips start the swing and letting your torso follow. Don't rush the rotation—let the segments fire in sequence. This will clean up your power transfer immediately.";
    } else {
      nextSessionFocus = "Next session, focus on letting the barrel snap late. Don't force it—let it be a reaction to your body's rotation. This will help you stay short to the ball and create more whip.";
    }
  } else {
    nextSessionFocus = "Next session, focus on consistency. Your pattern is balanced, so now it's about reps and building confidence in the timing. Trust the pattern and let it settle in.";
  }
  
  // === COACH NOTES (Admin-only) ===
  const coachNotes = {
    technicalObservations: hasMainLeak 
      ? `Primary leak: ${mainLeak.zone} (${mainLeak.score}/${momentumTransferScore}). ${hasSecondaryLeak ? `Secondary leak: ${secondaryLeak.zone} (${secondaryLeak.score}/${momentumTransferScore}).` : 'Other segments balanced.'} Sequencing breakdown suggests ${mainLeak.zone === 'groundFlow' ? 'premature hip initiation or insufficient load duration' : mainLeak.zone === 'powerFlow' ? 'flat rotation or early torso commitment' : 'early bat commitment or dragging barrel'}.`
      : `All flow paths balanced (Ground: ${ground}, Power: ${power}, Barrel: ${barrel}). Pattern is clean; focus on consistency and challenging with variable pitch types/velocities.`,
    
    progressionRecommendations: hasMainLeak
      ? `Start with ${mainLeak.zone === 'groundFlow' ? 'load-hold drills (pause at max load, then fire)' : mainLeak.zone === 'powerFlow' ? 'separation drills (hip-lead rotation, feel torso lag)' : 'barrel lag drills (hands inside, late turn)'}, then progress to ${hasSecondaryLeak ? `addressing ${secondaryLeak.zone} with targeted drills` : 'live BP with emphasis on feel cues'}. Aim for 50-75 swings per session with quality reps.`
      : `Pattern is solid. Progress to variable timing drills (offspeed mix), higher velocities, or game-like scenarios. Track exit velo trends to measure power gains.`,
    
    watchPoints: hasMainLeak
      ? `Monitor ${mainLeak.zone} score in next 2-3 sessions. If no improvement (+5 pts), consider video review to check if athlete is executing cues correctly. ${hasSecondaryLeak ? `Also watch ${secondaryLeak.zone}—if it improves without direct work, confirms primary leak was root cause.` : ''}`
      : `Watch for score regression under pressure (high velo, game situations). If pattern holds, athlete is ready for advanced timing/pitch recognition work.`
  };
  
  // === FULL TEXT (Legacy compatibility) ===
  const fullText = `${overviewParagraph} ${detailParagraph} ${nextSessionFocus}`;
  
  return {
    overviewParagraph,
    detailParagraph,
    strengths,
    opportunities,
    nextSessionFocus,
    coachNotes,
    fullText
  };
}

/**
 * Get short header text for momentum transfer card
 */
export function getMomentumHeaderText(score: number): string {
  if (score >= 92) {
    return "Your energy flows through your body like a clean whip. This is big-league level sequencing.";
  } else if (score >= 85) {
    return "Your timing pattern is strong. There are small leaks we can clean up.";
  } else if (score >= 75) {
    return "You create speed, but you're leaking energy between body segments.";
  } else if (score >= 60) {
    return "Your swing has effort, but the energy isn't traveling cleanly through your body yet.";
  } else {
    return "The energy isn't flowing smoothly through your body. Let's build the pattern from the ground up.";
  }
}

/**
 * Get interpretation for sub-score (Anchor/Engine/Whip)
 */
export function getSubScoreInterpretation(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Solid';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
}
