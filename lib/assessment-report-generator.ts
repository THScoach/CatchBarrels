/**
 * Assessment Report Generator
 * Aggregates swing metrics and generates comprehensive assessment reports
 */

import { prisma } from './db';
import { compareAssessments, formatComparisonForGamma, type ComparisonSummary } from './assessment-comparison';
import { computeOnTheBallMetrics, type OnTheBallMetrics } from './on-the-ball-engine';
import { Decimal } from '@prisma/client/runtime/library';

export async function generateAssessmentReport(
  sessionId: string
): Promise<void> {
  console.log(`[Report Generator] Starting report generation for session ${sessionId}`);

  // 1. Fetch session with all data
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      swings: {
        include: {
          metrics: true,
          joints: true,
          ballData: true,
        },
      },
      ballData: true,
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // 2. Calculate aggregated metrics
  const metrics = calculateAggregatedMetrics(session.swings);

  // 3. Calculate ball data summary
  const ballDataSummary = calculateBallDataSummary(session.ballData);

  // 3.5. Compute On-The-Ball metrics (contact quality & consistency)
  let onTheBallMetrics: OnTheBallMetrics | null = null;
  if (session.ballData && session.ballData.length > 0) {
    // Get user level for barrel calculation
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const userLevel = user?.level?.toLowerCase().includes('youth') ? 'youth' :
                      user?.level?.toLowerCase().includes('college') ? 'college' :
                      user?.level?.toLowerCase().includes('pro') ? 'pro' : 'hs';

    // Convert ball data to batted ball events
    const battedBallEvents = session.ballData.map((ball) => ({
      velo: ball.exitVelocity || 0,
      la: ball.launchAngle || 0,
      isFair: ball.result?.toLowerCase() !== 'foul' && (ball.exitVelocity || 0) > 0,
      isFoul: ball.result?.toLowerCase() === 'foul',
      isMiss: (ball.exitVelocity || 0) === 0,
      inZone: undefined, // Not available from assessment ball data
      level: userLevel,
    }));

    // Compute metrics
    onTheBallMetrics = computeOnTheBallMetrics(battedBallEvents, userLevel);

    // Save to player history
    try {
      await prisma.playerOnTheBallHistory.create({
        data: {
          userId: session.userId,
          sourceType: 'assessment',
          sourceId: sessionId,
          assessmentSessionId: sessionId,
          sessionDate: session.sessionDate,
          barrelRate: onTheBallMetrics.barrelRate ? new Decimal(onTheBallMetrics.barrelRate) : null,
          avgEv: onTheBallMetrics.avgEv ? new Decimal(onTheBallMetrics.avgEv) : null,
          avgLa: onTheBallMetrics.avgLa ? new Decimal(onTheBallMetrics.avgLa) : null,
          sdLa: onTheBallMetrics.sdLa ? new Decimal(onTheBallMetrics.sdLa) : null,
          sdEv: onTheBallMetrics.sdEv ? new Decimal(onTheBallMetrics.sdEv) : null,
          inzoneBarrelRate: null, // Not available from assessment data
          inzoneSdLa: null,
          inzoneSdEv: null,
          foulPct: onTheBallMetrics.foulPct ? new Decimal(onTheBallMetrics.foulPct) : null,
          missPct: onTheBallMetrics.missPct ? new Decimal(onTheBallMetrics.missPct) : null,
          fairPct: onTheBallMetrics.fairPct ? new Decimal(onTheBallMetrics.fairPct) : null,
          level: userLevel,
          contextJson: {
            totalEvents: onTheBallMetrics.totalEvents,
            barrels: onTheBallMetrics.barrels,
            fairBalls: onTheBallMetrics.fairBalls,
            assessmentName: session.sessionName,
          },
        },
      });
      console.log(`[Report Generator] On-The-Ball metrics saved: Barrel Rate ${(onTheBallMetrics.barrelRate! * 100).toFixed(1)}%, LA SD ${onTheBallMetrics.sdLa?.toFixed(1)}°`);
    } catch (error) {
      console.error('[Report Generator] Error saving On-The-Ball metrics:', error);
    }
  }

  // 4. Generate overall score
  const overallScore = calculateOverallScore(metrics, ballDataSummary);

  // 5. Generate summary text
  const summary = generateSummaryText(metrics, ballDataSummary, overallScore, session.swings.length);

  // 6. Identify strengths and weaknesses
  const strengths = identifyStrengths(metrics, ballDataSummary);
  const weaknesses = identifyWeaknesses(metrics, ballDataSummary);

  console.log(`[Report Generator] Overall score: ${overallScore.toFixed(1)}`);

  // 7. Compare with previous assessment (if exists)
  let comparison: ComparisonSummary | null = null;
  let previousAssessmentId: string | null = null;
  try {
    comparison = await compareAssessments(session.userId, sessionId);
    if (comparison) {
      previousAssessmentId = comparison.metrics.previousAssessmentDate ? sessionId : null;
      console.log(`[Report Generator] Comparison with previous assessment complete. Trend: ${comparison.overallTrend}`);
    } else {
      console.log(`[Report Generator] No previous assessment found for comparison`);
    }
  } catch (error) {
    console.error('[Report Generator] Error comparing assessments:', error);
  }

  // 8. Generate Gamma-specific summaries
  const gammaFields = generateGammaSummaries(metrics, ballDataSummary, overallScore, strengths, weaknesses, comparison);

  // 9. Create or update report
  const report = await prisma.assessmentReport.upsert({
    where: { sessionId },
    update: {
      summary,
      overallScore,
      scoreExplanation: generateScoreExplanation(overallScore),
      ballDataSummary: ballDataSummary || undefined,
      strengths,
      weaknesses,
      // Gamma summaries
      executiveSummary: gammaFields.executiveSummary,
      motionSummary: gammaFields.motionSummary,
      stabilitySummary: gammaFields.stabilitySummary,
      sequencingSummary: gammaFields.sequencingSummary,
      neuroNotes: gammaFields.neuroNotes,
      bodyPlan: gammaFields.bodyPlan,
      // Comparison data
      previousAssessmentId,
      comparisonData: comparison ? (comparison as any) : undefined,
      generatedAt: new Date(),
    },
    create: {
      sessionId,
      summary,
      overallScore,
      scoreExplanation: generateScoreExplanation(overallScore),
      ballDataSummary: ballDataSummary || undefined,
      strengths,
      weaknesses,
      // Gamma summaries
      executiveSummary: gammaFields.executiveSummary,
      motionSummary: gammaFields.motionSummary,
      stabilitySummary: gammaFields.stabilitySummary,
      sequencingSummary: gammaFields.sequencingSummary,
      neuroNotes: gammaFields.neuroNotes,
      bodyPlan: gammaFields.bodyPlan,
      // Comparison data
      previousAssessmentId,
      comparisonData: comparison ? (comparison as any) : undefined,
      generatedAt: new Date(),
    },
  });

  // 8. Create metrics summary
  await prisma.assessmentMetricsSummary.upsert({
    where: { reportId: report.id },
    update: metrics,
    create: {
      reportId: report.id,
      ...metrics,
    },
  });

  console.log(`[Report Generator] Report generated successfully for session ${sessionId}`);
}

function calculateAggregatedMetrics(swings: any[]) {
  const validSwings = swings.filter((s) => s.metrics);

  if (validSwings.length === 0) {
    console.warn('[Report Generator] No valid swings with metrics found');
    return {};
  }

  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  const max = (values: number[]) =>
    values.length > 0 ? Math.max(...values) : 0;

  const stdDev = (values: number[]) => {
    if (values.length === 0) return 0;
    const mean = avg(values);
    const squareDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(avg(squareDiffs));
  };

  const consistencyScore = (values: number[]) => {
    // Lower std dev = higher consistency (0-100)
    return Math.max(0, 100 - stdDev(values) * 2);
  };

  // ===== MOTION METRICS =====
  const avgBatSpeeds = validSwings.map((s) => s.metrics.avgBatSpeedMph).filter((v): v is number => v !== null && v !== undefined);
  const maxBatSpeeds = validSwings.map((s) => s.metrics.maxBatSpeedMph).filter((v): v is number => v !== null && v !== undefined);
  const avgHandSpeeds = validSwings.map((s) => s.metrics.avgHandSpeedMph).filter((v): v is number => v !== null && v !== undefined);
  const maxHandSpeeds = validSwings.map((s) => s.metrics.maxHandSpeedMph).filter((v): v is number => v !== null && v !== undefined);
  const loadToLaunches = validSwings.map((s) => s.metrics.loadToLaunchMs).filter((v): v is number => v !== null && v !== undefined);
  const launchToImpacts = validSwings.map((s) => s.metrics.launchToImpactMs).filter((v): v is number => v !== null && v !== undefined);
  const swingDurations = validSwings.map((s) => s.metrics.swingDurationMs).filter((v): v is number => v !== null && v !== undefined);
  const pelvisVelocities = validSwings.map((s) => s.metrics.pelvisMaxAngularVelocity).filter((v): v is number => v !== null && v !== undefined);
  const torsoVelocities = validSwings.map((s) => s.metrics.torsoMaxAngularVelocity).filter((v): v is number => v !== null && v !== undefined);
  const armVelocities = validSwings.map((s) => s.metrics.armMaxAngularVelocity).filter((v): v is number => v !== null && v !== undefined);
  const batVelocities = validSwings.map((s) => s.metrics.batMaxAngularVelocity).filter((v): v is number => v !== null && v !== undefined);

  // ===== STABILITY METRICS =====
  const spineTiltsAtLaunch = validSwings.map((s) => s.metrics.spineTiltAtLaunchDeg).filter((v): v is number => v !== null && v !== undefined);
  const pelvisAnglesAtLaunch = validSwings.map((s) => s.metrics.pelvisAngleAtLaunchDeg).filter((v): v is number => v !== null && v !== undefined);
  const shoulderTiltsAtLaunch = validSwings.map((s) => s.metrics.shoulderTiltAtLaunchDeg).filter((v): v is number => v !== null && v !== undefined);
  const spineTiltsAtImpact = validSwings.map((s) => s.metrics.spineTiltAtImpactDeg).filter((v): v is number => v !== null && v !== undefined);
  const pelvisAnglesAtImpact = validSwings.map((s) => s.metrics.pelvisAngleAtImpactDeg).filter((v): v is number => v !== null && v !== undefined);
  const shoulderTiltsAtImpact = validSwings.map((s) => s.metrics.shoulderTiltAtImpactDeg).filter((v): v is number => v !== null && v !== undefined);
  const frontKneeAngles = validSwings.map((s) => s.metrics.frontKneeFlexionAtImpactDeg).filter((v): v is number => v !== null && v !== undefined);
  const xFactors = validSwings.map((s) => s.metrics.hipShoulderSeparation).filter((v): v is number => v !== null && v !== undefined);
  const headDisplacements = validSwings.map((s) => s.metrics.headDisplacementFromStanceCm).filter((v): v is number => v !== null && v !== undefined);
  const strideLengthFactors = validSwings.map((s) => s.metrics.strideLengthFactor).filter((v): v is number => v !== null && v !== undefined);

  // ===== SEQUENCING METRICS =====
  const pelvisPeakTimings = validSwings.map((s) => s.metrics.pelvisPeakTimingMs).filter((v): v is number => v !== null && v !== undefined);
  const torsoPeakTimings = validSwings.map((s) => s.metrics.torsoPeakTimingMs).filter((v): v is number => v !== null && v !== undefined);
  const armPeakTimings = validSwings.map((s) => s.metrics.armPeakTimingMs).filter((v): v is number => v !== null && v !== undefined);
  const batPeakTimings = validSwings.map((s) => s.metrics.batPeakTimingMs).filter((v): v is number => v !== null && v !== undefined);
  const pelvisToTorsoGaps = validSwings.map((s) => s.metrics.pelvisToTorsoGapMs).filter((v): v is number => v !== null && v !== undefined);
  const torsoToArmGaps = validSwings.map((s) => s.metrics.torsoToArmGapMs).filter((v): v is number => v !== null && v !== undefined);
  const armToBatGaps = validSwings.map((s) => s.metrics.armToBatGapMs).filter((v): v is number => v !== null && v !== undefined);
  const sequenceOrderScores = validSwings.map((s) => s.metrics.sequenceOrderScore).filter((v): v is number => v !== null && v !== undefined);
  const sequenceTimingScores = validSwings.map((s) => s.metrics.sequenceTimingScore).filter((v): v is number => v !== null && v !== undefined);
  const sequenceScores = validSwings.map((s) => s.metrics.sequenceScore).filter((v): v is number => v !== null && v !== undefined);

  // ===== CALCULATE ANCHOR/ENGINE/WHIP SCORES (3 SEPARATE) =====
  // MOTION = TIMING (not velocity) per user request
  
  // 1. ANCHOR SCORE (Lower Body Foundation)
  // Motion (40%): TIMING ONLY - Load-to-launch duration, pelvis initiation timing, stride timing
  const anchorMotion = avg([
    // Load-to-launch duration (broad band around 150-220ms)
    Math.max(0, 100 - Math.abs(avg(loadToLaunches) - 185) / 1.5), // Ideal ~150-220ms, center at 185ms
    // Pelvis initiation timing (is it starting the motion at the right time?)
    // NOTE: pelvisPeakTimings are POSITIVE values (ms before impact), so ideal is 100-120ms
    Math.max(0, 100 - Math.abs(avg(pelvisPeakTimings) - 110) / 2), // Pelvis peaks ~100-120ms before impact, center at 110ms
    // Stride timing consistency (foot plant timing)
    consistencyScore(loadToLaunches), // Consistent load-to-launch timing
  ].filter(v => !isNaN(v) && v > 0));
  
  // Stability (40%): Knee angles, head displacement, stride consistency
  const backKneeAngles = validSwings.map((s) => s.metrics.backKneeFlexionAtLaunchDeg).filter((v): v is number => v !== null && v !== undefined);
  const anchorStability = avg([
    consistencyScore(backKneeAngles), // Back knee consistency at launch
    consistencyScore(frontKneeAngles), // Front knee consistency at impact
    consistencyScore(headDisplacements), // Head stability
    Math.max(0, 100 - stdDev(strideLengthFactors) * 200), // Stride length consistency
  ].filter(v => !isNaN(v) && v > 0));
  
  // Sequencing (20%): Pelvis is first in sequence order
  const anchorSequencing = avg([
    avg(sequenceOrderScores) * 1.2, // Pelvis should be first
    Math.max(0, 100 - Math.abs(avg(pelvisPeakTimings) - 110) / 2), // Pelvis peaks ~100-120ms before impact, center at 110ms
  ].filter(v => !isNaN(v) && v > 0));
  
  const anchorScore = (
    anchorMotion * 0.4 +
    anchorStability * 0.4 +
    anchorSequencing * 0.2
  );

  // 2. ENGINE SCORE (Core Rotational Power)
  // Motion (40%): TIMING ONLY - Pelvis-to-torso gap, torso peak timing, rotation initiation
  const engineMotion = avg([
    // Pelvis-to-torso gap timing (ideal 30-50ms)
    Math.max(0, 100 - Math.abs(avg(pelvisToTorsoGaps) - 40) / 1.5), // Ideal ~30-50ms gap, center at 40ms
    // Torso peak timing relative to impact (should be ~60-80ms before impact)
    // NOTE: torsoPeakTimings are POSITIVE values (ms before impact)
    Math.max(0, 100 - Math.abs(avg(torsoPeakTimings) - 70) / 2), // Ideal ~60-80ms before impact, center at 70ms
    // Rotation initiation timing (pelvis timing consistency)
    consistencyScore(pelvisPeakTimings), // Consistent pelvis initiation
  ].filter(v => !isNaN(v) && v > 0));
  
  // Stability (40%): Spine tilt, pelvis angle, X-factor
  const engineStability = avg([
    consistencyScore(spineTiltsAtLaunch),
    consistencyScore(spineTiltsAtImpact),
    consistencyScore(pelvisAnglesAtLaunch),
    consistencyScore(pelvisAnglesAtImpact),
    Math.max(0, 100 - Math.abs(avg(xFactors) - 50) * 2), // Ideal X-Factor ~50 degrees
  ].filter(v => !isNaN(v) && v > 0));
  
  // Sequencing (20%): Pelvis → Torso order + gap quality
  const engineSequencing = avg([
    avg(sequenceOrderScores),
    avg(sequenceTimingScores),
    Math.max(0, 100 - Math.abs(avg(pelvisToTorsoGaps) - 40) * 2), // Ideal ~30-50ms gap
  ].filter(v => !isNaN(v) && v > 0));
  
  const engineScore = (
    engineMotion * 0.4 +
    engineStability * 0.4 +
    engineSequencing * 0.2
  );

  // 3. WHIP SCORE (Upper Body / Bat)
  // Motion (40%): TIMING ONLY - Torso-to-arm gap, arm-to-bat gap, bat peak timing at impact
  const whipMotion = avg([
    // Torso-to-arm gap timing (ideal 30-50ms)
    Math.max(0, 100 - Math.abs(avg(torsoToArmGaps) - 40) / 1.5), // Ideal ~30-50ms, center at 40ms
    // Arm-to-bat gap timing (ideal 30-50ms)
    Math.max(0, 100 - Math.abs(avg(armToBatGaps) - 40) / 1.5), // Ideal ~30-50ms, center at 40ms
    // Bat peak timing at/near impact (should be close to 0ms from impact)
    // NOTE: batPeakTimings are POSITIVE values, but should be very small (0-20ms before impact)
    Math.max(0, 100 - Math.abs(avg(batPeakTimings) - 0) / 2), // Bat peaks at/near impact (0ms ± 20ms)
    // Timing gap consistency
    consistencyScore(torsoToArmGaps),
  ].filter(v => !isNaN(v) && v > 0));
  
  // Stability (30%): Shoulder tilt, elbow angles, front knee at impact
  const leadElbowAngles = validSwings.map((s) => s.metrics.leadElbowAngle).filter((v): v is number => v !== null && v !== undefined);
  const rearElbowAngles = validSwings.map((s) => s.metrics.rearElbowAngle).filter((v): v is number => v !== null && v !== undefined);
  const whipStability = avg([
    consistencyScore(shoulderTiltsAtImpact),
    consistencyScore(leadElbowAngles),
    consistencyScore(rearElbowAngles),
    consistencyScore(frontKneeAngles), // Bracing at impact
  ].filter(v => !isNaN(v) && v > 0));
  
  // Sequencing (30%): Torso → Arm → Bat order + gap quality
  const whipSequencing = avg([
    Math.max(0, 100 - Math.abs(avg(torsoToArmGaps) - 40) * 2), // Ideal ~30-50ms
    Math.max(0, 100 - Math.abs(avg(armToBatGaps) - 40) * 2), // Ideal ~30-50ms
    avg(sequenceTimingScores),
  ].filter(v => !isNaN(v) && v > 0));
  
  const whipScore = (
    whipMotion * 0.4 +
    whipStability * 0.3 +
    whipSequencing * 0.3
  );

  // ===== COMPILE ALL METRICS =====
  return {
    // Motion Summary
    // NOTE: Velocities are OUTPUT METRICS ONLY (for display/reference)
    // They are NOT used in Motion scoring - Motion scores are based on TIMING
    avgBatSpeed: avg(avgBatSpeeds),
    maxBatSpeed: max(maxBatSpeeds),
    avgHandSpeed: avg(avgHandSpeeds),
    maxHandSpeed: max(maxHandSpeeds),
    avgLoadToLaunch: avg(loadToLaunches),
    avgLaunchToImpact: avg(launchToImpacts),
    avgSwingDuration: avg(swingDurations),
    avgPelvisVelocity: avg(pelvisVelocities),
    avgTorsoVelocity: avg(torsoVelocities),
    avgArmVelocity: avg(armVelocities),
    avgBatVelocity: avg(batVelocities),
    motionConsistencyScore: consistencyScore(avgBatSpeeds),
    
    // Stability Summary
    avgSpineTiltAtLaunch: avg(spineTiltsAtLaunch),
    avgPelvisAngleAtLaunch: avg(pelvisAnglesAtLaunch),
    avgShoulderTiltAtLaunch: avg(shoulderTiltsAtLaunch),
    avgSpineTiltAtImpact: avg(spineTiltsAtImpact),
    avgPelvisAngleAtImpact: avg(pelvisAnglesAtImpact),
    avgShoulderTiltAtImpact: avg(shoulderTiltsAtImpact),
    avgFrontKneeAngle: avg(frontKneeAngles),
    avgXFactor: avg(xFactors),
    avgHeadDisplacement: avg(headDisplacements),
    avgStrideLengthFactor: avg(strideLengthFactors),
    spineTiltConsistencyScore: consistencyScore(spineTiltsAtLaunch),
    pelvisAngleConsistencyScore: consistencyScore(pelvisAnglesAtLaunch),
    headStabilityScore: consistencyScore(headDisplacements),
    overallStabilityScore: (anchorStability + engineStability + whipStability) / 3,
    
    // Sequencing Summary
    avgPelvisPeakTiming: avg(pelvisPeakTimings),
    avgTorsoPeakTiming: avg(torsoPeakTimings),
    avgArmPeakTiming: avg(armPeakTimings),
    avgBatPeakTiming: avg(batPeakTimings),
    avgPelvisToTorsoGap: avg(pelvisToTorsoGaps),
    avgTorsoToArmGap: avg(torsoToArmGaps),
    avgArmToBatGap: avg(armToBatGaps),
    avgSequenceScore: avg(sequenceScores),
    avgSequenceOrderScore: avg(sequenceOrderScores),
    avgSequenceTimingScore: avg(sequenceTimingScores),
    sequenceConsistency: consistencyScore(sequenceScores),
    
    // Anchor/Engine/Whip Scores (3 separate)
    anchorScore,
    anchorMotion,
    anchorStability,
    anchorSequencing,
    engineScore,
    engineMotion,
    engineStability,
    engineSequencing,
    whipScore,
    whipMotion,
    whipStability,
    whipSequencing,
    
    // Overall (for backwards compatibility)
    overallSwingScore: (anchorScore + engineScore + whipScore) / 3,
    biomechanicsScore: avg(sequenceScores),
    ballContactScore: 0, // Will be filled by ball data
  };
}

function calculateBallDataSummary(ballData: any[]) {
  if (ballData.length === 0) {
    return null;
  }

  const exitVelos = ballData.map((b) => b.exitVelocity).filter((v): v is number => v !== null && v !== undefined);
  const launchAngles = ballData.map((b) => b.launchAngle).filter((v): v is number => v !== null && v !== undefined);
  const distances = ballData.map((b) => b.distance).filter((v): v is number => v !== null && v !== undefined);

  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const max = (values: number[]) =>
    values.length > 0 ? Math.max(...values) : 0;
  const min = (values: number[]) =>
    values.length > 0 ? Math.min(...values) : 0;

  const barrelCount = ballData.filter((b) => b.result === 'barrel').length;
  const solidCount = ballData.filter((b) => b.result === 'solid').length;

  return {
    avgExitVelocity: avg(exitVelos),
    maxExitVelocity: max(exitVelos),
    minExitVelocity: min(exitVelos),
    avgLaunchAngle: avg(launchAngles),
    avgDistance: avg(distances),
    maxDistance: max(distances),
    barrelRate: (barrelCount / ballData.length) * 100,
    solidContactRate: ((barrelCount + solidCount) / ballData.length) * 100,
    totalSwings: ballData.length,
  };
}

function calculateOverallScore(
  metrics: any,
  ballDataSummary: any
): number {
  let score = 0;
  let weight = 0;

  // Bat speed (25%)
  if (metrics.avgBatSpeed) {
    score += normalizeBatSpeed(metrics.avgBatSpeed) * 0.25;
    weight += 0.25;
  }

  // Sequence score (25%)
  if (metrics.avgSequenceScore) {
    score += metrics.avgSequenceScore * 0.25;
    weight += 0.25;
  }

  // Consistency (15%)
  if (metrics.consistencyScore) {
    score += metrics.consistencyScore * 0.15;
    weight += 0.15;
  }

  // Exit velocity (20%)
  if (ballDataSummary?.avgExitVelocity) {
    score += normalizeExitVelo(ballDataSummary.avgExitVelocity) * 0.2;
    weight += 0.2;
  }

  // Barrel rate (15%)
  if (ballDataSummary?.barrelRate !== undefined) {
    score += ballDataSummary.barrelRate * 0.15;
    weight += 0.15;
  }

  // Normalize to 0-100
  return weight > 0 ? score / weight : 0;
}

function normalizeBatSpeed(batSpeedMph: number): number {
  // Normalize to 0-100 scale
  // 60 mph = 0, 80 mph = 100 (typical range)
  return Math.min(100, Math.max(0, ((batSpeedMph - 60) / 20) * 100));
}

function normalizeExitVelo(exitVeloMph: number): number {
  // Normalize to 0-100 scale
  // 70 mph = 0, 95 mph = 100 (typical range)
  return Math.min(100, Math.max(0, ((exitVeloMph - 70) / 25) * 100));
}

function generateSummaryText(
  metrics: any,
  ballDataSummary: any,
  overallScore: number,
  totalSwings: number
): string {
  const tier =
    overallScore >= 85
      ? 'Elite'
      : overallScore >= 70
      ? 'Advanced'
      : overallScore >= 55
      ? 'Intermediate'
      : 'Developing';

  let summary = `Overall Assessment: ${tier} (${overallScore.toFixed(1)}/100)\n\n`;

  summary += `This assessment analyzed ${totalSwings} swings with comprehensive biomechanical and ball flight data.\n\n`;

  if (metrics.avgBatSpeed) {
    summary += `Bat Speed: ${metrics.avgBatSpeed.toFixed(1)} mph (avg), ${metrics.maxBatSpeed?.toFixed(1) || 'N/A'} mph (max)\n`;
  }

  if (metrics.avgSequenceScore) {
    summary += `Kinematic Sequence: ${metrics.avgSequenceScore.toFixed(1)}/100 - ${metrics.avgSequenceScore >= 80 ? 'Excellent' : metrics.avgSequenceScore >= 60 ? 'Good' : 'Needs work'}\n`;
  }

  if (ballDataSummary) {
    summary += `\nBall Contact:\n`;
    summary += `- Exit Velocity: ${ballDataSummary.avgExitVelocity.toFixed(1)} mph (avg), ${ballDataSummary.maxExitVelocity.toFixed(1)} mph (max)\n`;
    summary += `- Barrel Rate: ${ballDataSummary.barrelRate.toFixed(1)}%\n`;
    summary += `- Solid Contact Rate: ${ballDataSummary.solidContactRate.toFixed(1)}%\n`;
  }

  return summary;
}

function generateScoreExplanation(score: number): string {
  if (score >= 85) {
    return 'Elite-level mechanics with excellent kinematic sequencing and consistent ball contact. Minimal mechanical adjustments needed.';
  } else if (score >= 70) {
    return 'Advanced mechanics with good fundamentals. Some refinement opportunities exist in timing and consistency.';
  } else if (score >= 55) {
    return 'Intermediate mechanics with solid foundation. Focus on improving kinematic sequence timing and bat speed development.';
  } else {
    return 'Developing mechanics. Prioritize fundamental movement patterns and consistent practice of key drills.';
  }
}

function identifyStrengths(metrics: any, ballDataSummary: any): any[] {
  const strengths = [];

  if (metrics.avgBatSpeed && metrics.avgBatSpeed >= 75) {
    strengths.push({
      area: 'Bat Speed',
      description: `Strong bat speed averaging ${metrics.avgBatSpeed.toFixed(1)} mph, indicating good rotational power and hand speed.`,
    });
  }

  if (metrics.avgSequenceScore && metrics.avgSequenceScore >= 75) {
    strengths.push({
      area: 'Kinematic Sequence',
      description: `Excellent proximal-to-distal sequencing (${metrics.avgSequenceScore.toFixed(1)}/100), showing efficient energy transfer from pelvis → torso → arms → bat.`,
    });
  }

  if (metrics.consistencyScore && metrics.consistencyScore >= 75) {
    strengths.push({
      area: 'Consistency',
      description: `High swing consistency (${metrics.consistencyScore.toFixed(1)}/100), demonstrating repeatable mechanics and muscle memory.`,
    });
  }

  if (ballDataSummary?.barrelRate && ballDataSummary.barrelRate >= 50) {
    strengths.push({
      area: 'Barrel Contact',
      description: `Strong barrel rate of ${ballDataSummary.barrelRate.toFixed(1)}%, indicating elite bat-to-ball skills and swing decisions.`,
    });
  }

  return strengths;
}

function identifyWeaknesses(metrics: any, ballDataSummary: any): any[] {
  const weaknesses = [];

  if (metrics.avgBatSpeed && metrics.avgBatSpeed < 70) {
    weaknesses.push({
      area: 'Bat Speed',
      description: `Below-average bat speed (${metrics.avgBatSpeed.toFixed(1)} mph). Focus on rotational power development and hand speed drills.`,
      priority: 'high',
    });
  }

  if (metrics.avgSequenceScore && metrics.avgSequenceScore < 60) {
    weaknesses.push({
      area: 'Kinematic Sequence',
      description: `Inefficient movement sequence (${metrics.avgSequenceScore.toFixed(1)}/100). Work on pelvis-first rotation and timing between body segments.`,
      priority: 'high',
    });
  }

  if (metrics.consistencyScore && metrics.consistencyScore < 60) {
    weaknesses.push({
      area: 'Consistency',
      description: `High variability in swing metrics (${metrics.consistencyScore.toFixed(1)}/100). Increase repetitions and focus on repeatable positions.`,
      priority: 'medium',
    });
  }

  if (ballDataSummary?.barrelRate && ballDataSummary.barrelRate < 30) {
    weaknesses.push({
      area: 'Barrel Contact',
      description: `Low barrel rate (${ballDataSummary.barrelRate.toFixed(1)}%). Work on bat path efficiency and pitch recognition.`,
      priority: 'high',
    });
  }

  return weaknesses;
}

/**
 * Generate Gamma-specific summary fields for deck generation
 */
function generateGammaSummaries(
  metrics: any,
  ballDataSummary: any,
  overallScore: number,
  strengths: any[],
  weaknesses: any[],
  comparison: ComparisonSummary | null
): {
  executiveSummary: string;
  motionSummary: string;
  stabilitySummary: string;
  sequencingSummary: string;
  neuroNotes: string;
  bodyPlan: string;
} {
  // Executive Summary
  const executiveSummary = `
**Overall Performance: ${overallScore.toFixed(0)}/100** (${getScoreGrade(overallScore)})

This assessment evaluated swing mechanics through ${metrics.totalSwingsAnalyzed || 'multiple'} swings, analyzing motion, stability, and kinematic sequencing patterns.

**Key Scores (Anchor → Engine → Whip):**
- Anchor (Lower Body Foundation): ${metrics.anchorScore?.toFixed(0) || 'N/A'}/100
- Engine (Core Rotation): ${metrics.engineScore?.toFixed(0) || 'N/A'}/100
- Whip (Bat Speed & Path): ${metrics.whipScore?.toFixed(0) || 'N/A'}/100

${comparison ? formatComparisonForGamma(comparison) : ''}
`.trim();

  // Motion Summary
  const motionSummary = `
**Velocities & Power Output:**
- Bat Speed: ${metrics.avgBatSpeed?.toFixed(1) || 'N/A'} mph (max ${metrics.maxBatSpeed?.toFixed(1) || 'N/A'} mph)
- Hand Speed: ${metrics.avgHandSpeed?.toFixed(1) || 'N/A'} mph
- Pelvis Angular Velocity: ${metrics.maxPelvisAngVel?.toFixed(0) || 'N/A'}°/s
- Torso Angular Velocity: ${metrics.maxTorsoAngVel?.toFixed(0) || 'N/A'}°/s

**Assessment:** ${
    metrics.avgBatSpeed && metrics.avgBatSpeed >= 70
      ? 'Strong rotational power and velocity generation.'
      : metrics.avgBatSpeed && metrics.avgBatSpeed >= 60
      ? 'Moderate velocity output with room for improvement.'
      : 'Focus needed on explosive power development.'
  }

${metrics.avgExitVelocity ? `**Ball Flight:** Average exit velocity ${metrics.avgExitVelocity.toFixed(1)} mph` : ''}
`.trim();

  // Stability Summary
  const stabilitySummary = `
**Postural Control & Consistency:**
- Head Stability: ${metrics.headStabilityScore?.toFixed(0) || 'N/A'}/100
- Joint Angle Consistency: ${metrics.jointAngleConsistency?.toFixed(0) || 'N/A'}/100
- Motion Stability: ${metrics.motionStabilityScore?.toFixed(0) || 'N/A'}/100

**Key Positions:**
- Hip-Shoulder Separation: ${metrics.avgHipShoulderSep?.toFixed(1) || 'N/A'}°
- Front Knee Angle: ${metrics.avgFrontKneeAngle?.toFixed(1) || 'N/A'}°
- Head Displacement: ${metrics.avgHeadDisplacementX?.toFixed(1) || 'N/A'}px horizontal

**Assessment:** ${
    metrics.headStabilityScore && metrics.headStabilityScore >= 80
      ? 'Excellent postural control and repeatability.'
      : metrics.headStabilityScore && metrics.headStabilityScore >= 60
      ? 'Good stability with some variability in key positions.'
      : 'Significant movement patterns need stabilization work.'
  }
`.trim();

  // Sequencing Summary
  const sequencingSummary = `
**Kinematic Chain Analysis:**
- Sequence Score: ${metrics.avgSequenceScore?.toFixed(0) || 'N/A'}/100
- Correct Order: ${metrics.avgSequenceOrderScore?.toFixed(0) || 'N/A'}%
- Pelvis→Torso Gap: ${metrics.avgPelvisToTorsoGap?.toFixed(0) || 'N/A'}ms (ideal: 30-50ms)
- Torso→Arm Gap: ${metrics.avgTorsoToArmGap?.toFixed(0) || 'N/A'}ms
- Arm→Bat Gap: ${metrics.avgArmToBatGap?.toFixed(0) || 'N/A'}ms

**Assessment:** ${
    metrics.avgSequenceScore && metrics.avgSequenceScore >= 80
      ? 'Elite proximal-to-distal energy transfer. Minimal efficiency losses.'
      : metrics.avgSequenceScore && metrics.avgSequenceScore >= 65
      ? 'Good sequencing with timing gaps requiring refinement.'
      : 'Kinematic chain shows significant timing issues. Focus on ground-up connection.'
  }

**Dr. Kwon's Principle:** ${
    metrics.avgSequenceOrderScore && metrics.avgSequenceOrderScore >= 80
      ? 'Athlete demonstrates proper pelvis→torso→arms→bat progression.'
      : 'Athlete shows out-of-sequence firing patterns reducing power output.'
  }
`.trim();

  // Neuro Notes (placeholder for future S2 integration)
  const neuroNotes = `
**Cognitive Performance:** (S2 assessment pending)

**Observable Patterns:**
${
    metrics.pelvisAngleConsistencyScore && metrics.pelvisAngleConsistencyScore < 60
      ? '- Inconsistent positioning suggests potential timing/recognition challenges'
      : '- Consistent mechanical execution indicates strong motor control'
  }
${
    metrics.avgGapVariability && metrics.avgGapVariability > 20
      ? '- High timing variability may indicate pitch recognition or anticipation issues'
      : '- Stable timing patterns suggest good pitch tracking'
  }

**Recommendation:** Integrate S2 Cognition assessment to evaluate pitch recognition, decision-making speed, and visual tracking.
`.trim();

  // Body Plan
  const topWeaknesses = weaknesses.slice(0, 3);
  const topStrengths = strengths.slice(0, 2);

  const bodyPlan = `
**Movement Priorities:**

${topWeaknesses.length > 0 ? topWeaknesses.map((w, i) => `
${i + 1}. **${w.area}** (${w.priority || 'medium'} priority)
   ${w.description}
`).join('') : '- Continue current training approach'}

**Leverage Strengths:**
${topStrengths.length > 0 ? topStrengths.map((s) => `
- **${s.area}:** ${s.description}
`).join('') : '- Build on current skill foundation'}

**Drills & Training Focus:**
${
    metrics.avgSequenceScore && metrics.avgSequenceScore < 70
      ? '- Kinematic sequence drills (med ball rotations, separation drills)'
      : ''
  }
${
    metrics.avgBatSpeed && metrics.avgBatSpeed < 65
      ? '- Bat speed development (overload/underload, plyometrics)'
      : ''
  }
${
    metrics.headStabilityScore && metrics.headStabilityScore < 70
      ? '- Head/posture stability work (vision tracking, balance drills)'
      : ''
  }
${
    ballDataSummary?.barrelRate && ballDataSummary.barrelRate < 40
      ? '- Barrel efficiency drills (tee work, path optimization)'
      : ''
  }
`.trim();

  return {
    executiveSummary,
    motionSummary,
    stabilitySummary,
    sequencingSummary,
    neuroNotes,
    bodyPlan,
  };
}

function getScoreGrade(score: number): string {
  if (score >= 90) return 'Elite';
  if (score >= 80) return 'Advanced';
  if (score >= 70) return 'Proficient';
  if (score >= 60) return 'Developing';
  return 'Needs Work';
}
