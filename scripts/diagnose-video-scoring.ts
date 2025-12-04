// @ts-nocheck
/**
 * Diagnostic Script: Video Scoring Analysis
 * Compares Pro vs Kid video analysis to debug scoring discrepancies
 */

import { PrismaClient } from '@prisma/client';
import { analyzeSwing } from '../lib/swing-analyzer';
import { calculateKinematicSequence } from '../lib/kinematic-sequence';

const prisma = new PrismaClient();

interface VideoDebugInfo {
  // Video metadata
  videoId: string;
  filename: string;
  uploadDate: Date;
  
  // User profile
  userLevel: string | null;
  userHeight: number | null;
  userWeight: number | null;
  userHandedness: string | null;
  
  // Video processing
  fpsDetected: number | null;
  normalizedFps: number | null;
  cameraAngle: string | null;
  frameCount: number;
  impactFrame: number | null;
  
  // Skeleton quality
  avgConfidence: number;
  hipConfidence: number;
  shoulderConfidence: number;
  wristConfidence: number;
  
  // Raw kinematic values
  pelvisMaxVelocity: number;
  torsoMaxVelocity: number;
  armMaxVelocity: number;
  batMaxVelocity: number;
  
  pelvisPeakTimingMs: number;
  torsoPeakTimingMs: number;
  armPeakTimingMs: number;
  batPeakTimingMs: number;
  
  pelvisToTorsoGapMs: number;
  torsoToArmGapMs: number;
  armToBatGapMs: number;
  
  // Raw biomechanical values
  batSpeedMph: number;
  handSpeedMph: number;
  hipRotationDeg: number;
  frontKneeAngleDeg: number;
  
  loadToLaunchMs: number;
  launchToImpactMs: number;
  swingDurationMs: number;
  
  // Sequence analysis
  sequenceOrder: string[];
  sequenceOrderScore: number;
  sequenceTimingScore: number;
  sequenceScore: number;
  
  // Final scores
  anchorScore: number | null;
  engineScore: number | null;
  whipScore: number | null;
  overallScore: number;
  
  // Anchor breakdown
  anchorMotionScore: number | null;
  anchorStabilityScore: number | null;
  anchorSequencingScore: number | null;
  
  // Engine breakdown
  engineMotionScore: number | null;
  engineStabilityScore: number | null;
  engineSequencingScore: number | null;
  
  // Whip breakdown
  whipMotionScore: number | null;
  whipStabilityScore: number | null;
  whipSequencingScore: number | null;
}

async function analyzeVideoForDebug(videoId: string): Promise<VideoDebugInfo> {
  // Fetch video with user data
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      user: {
        select: {
          level: true,
          height: true,
          weight: true,
          bats: true,
        },
      },
    },
  });

  if (!video) {
    throw new Error(`Video ${videoId} not found`);
  }

  if (!video.skeletonData || !Array.isArray(video.skeletonData)) {
    throw new Error(`Video ${videoId} has no skeleton data`);
  }

  const skeletonData = video.skeletonData as any[];
  const fps = video.fps || 60;
  const impactFrame = video.impactFrame || Math.floor(skeletonData.length / 2);

  // Calculate average confidence
  let totalConfidence = 0;
  let confidenceCount = 0;
  let hipConfidenceSum = 0;
  let shoulderConfidenceSum = 0;
  let wristConfidenceSum = 0;
  let hipCount = 0;
  let shoulderCount = 0;
  let wristCount = 0;

  for (const frame of skeletonData) {
    if (frame.keypoints) {
      for (const kp of frame.keypoints) {
        if (kp && kp.score !== undefined) {
          totalConfidence += kp.score;
          confidenceCount++;
        }
      }
      
      // Hip keypoints: 23 (left hip), 24 (right hip)
      if (frame.keypoints[23]?.score) {
        hipConfidenceSum += frame.keypoints[23].score;
        hipCount++;
      }
      if (frame.keypoints[24]?.score) {
        hipConfidenceSum += frame.keypoints[24].score;
        hipCount++;
      }
      
      // Shoulder keypoints: 11 (left shoulder), 12 (right shoulder)
      if (frame.keypoints[11]?.score) {
        shoulderConfidenceSum += frame.keypoints[11].score;
        shoulderCount++;
      }
      if (frame.keypoints[12]?.score) {
        shoulderConfidenceSum += frame.keypoints[12].score;
        shoulderCount++;
      }
      
      // Wrist keypoints: 15 (left wrist), 16 (right wrist)
      if (frame.keypoints[15]?.score) {
        wristConfidenceSum += frame.keypoints[15].score;
        wristCount++;
      }
      if (frame.keypoints[16]?.score) {
        wristConfidenceSum += frame.keypoints[16].score;
        wristCount++;
      }
    }
  }

  const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
  const hipConfidence = hipCount > 0 ? hipConfidenceSum / hipCount : 0;
  const shoulderConfidence = shoulderCount > 0 ? shoulderConfidenceSum / shoulderCount : 0;
  const wristConfidence = wristCount > 0 ? wristConfidenceSum / wristCount : 0;

  // Run full analysis
  const swing = {
    video: {
      skeletonData,
      impactFrame,
      fps,
      cameraAngle: video.cameraAngle,
      playerHeight: video.user?.height,
    },
  };

  const analysis = await analyzeSwing(swing);
  const sequence = calculateKinematicSequence(skeletonData, impactFrame, fps);

  return {
    videoId: video.id,
    filename: video.title,
    uploadDate: video.uploadDate,
    
    userLevel: video.user?.level || null,
    userHeight: video.user?.height || null,
    userWeight: video.user?.weight || null,
    userHandedness: video.user?.bats || null,
    
    fpsDetected: video.fps,
    normalizedFps: video.normalizedFps,
    cameraAngle: video.cameraAngle,
    frameCount: skeletonData.length,
    impactFrame: impactFrame,
    
    avgConfidence,
    hipConfidence,
    shoulderConfidence,
    wristConfidence,
    
    pelvisMaxVelocity: sequence.pelvisMaxVelocity,
    torsoMaxVelocity: sequence.torsoMaxVelocity,
    armMaxVelocity: sequence.armMaxVelocity,
    batMaxVelocity: sequence.batMaxVelocity,
    
    pelvisPeakTimingMs: sequence.pelvisPeakTiming,
    torsoPeakTimingMs: sequence.torsoPeakTiming,
    armPeakTimingMs: sequence.armPeakTiming,
    batPeakTimingMs: sequence.batPeakTiming,
    
    pelvisToTorsoGapMs: Math.abs(sequence.pelvisPeakTiming - sequence.torsoPeakTiming),
    torsoToArmGapMs: Math.abs(sequence.torsoPeakTiming - sequence.armPeakTiming),
    armToBatGapMs: Math.abs(sequence.armPeakTiming - sequence.batPeakTiming),
    
    batSpeedMph: analysis.metrics.avgBatSpeedMph || 0,
    handSpeedMph: analysis.metrics.avgHandSpeedMph || 0,
    hipRotationDeg: analysis.metrics.hipShoulderSeparation || 0,
    frontKneeAngleDeg: analysis.metrics.frontKneeFlexionAtImpactDeg || 0,
    
    loadToLaunchMs: analysis.metrics.loadToLaunchMs || 0,
    launchToImpactMs: analysis.metrics.launchToImpactMs || 0,
    swingDurationMs: analysis.metrics.swingDurationMs || 0,
    
    sequenceOrder: analysis.metrics.sequenceOrder || [],
    sequenceOrderScore: analysis.metrics.sequenceOrderScore || 0,
    sequenceTimingScore: analysis.metrics.sequenceTimingScore || 0,
    sequenceScore: analysis.metrics.sequenceScore || 0,
    
    anchorScore: video.anchorScore?.toNumber() || null,
    engineScore: video.engineScore?.toNumber() || null,
    whipScore: video.whipScore?.toNumber() || null,
    overallScore: analysis.metrics.overallScore || 0,
    
    anchorMotionScore: video.anchorMotion?.toNumber() || null,
    anchorStabilityScore: video.anchorStability?.toNumber() || null,
    anchorSequencingScore: video.anchorSequencing?.toNumber() || null,
    
    engineMotionScore: video.engineMotion?.toNumber() || null,
    engineStabilityScore: video.engineStability?.toNumber() || null,
    engineSequencingScore: video.engineSequencing?.toNumber() || null,
    
    whipMotionScore: video.whipMotion?.toNumber() || null,
    whipStabilityScore: video.whipStability?.toNumber() || null,
    whipSequencingScore: video.whipSequencing?.toNumber() || null,
  };
}

function generateComparisonTable(proDebug: VideoDebugInfo, kidDebug: VideoDebugInfo): string {
  const rows: string[] = [
    '# Video Scoring Comparison: Pro vs Kid\n',
    '| Metric | Pro Clip | Kid Clip | Notes |',
    '|--------|----------|----------|-------|',
  ];

  const addRow = (metric: string, proVal: any, kidVal: any, notes: string = '') => {
    const proStr = typeof proVal === 'number' ? proVal.toFixed(2) : String(proVal || 'N/A');
    const kidStr = typeof kidVal === 'number' ? kidVal.toFixed(2) : String(kidVal || 'N/A');
    rows.push(`| ${metric} | ${proStr} | ${kidStr} | ${notes} |`);
  };

  // Metadata
  rows.push('| **VIDEO METADATA** | | | |');
  addRow('Filename', proDebug.filename, kidDebug.filename);
  addRow('Upload Date', proDebug.uploadDate.toISOString().split('T')[0], kidDebug.uploadDate.toISOString().split('T')[0]);
  
  // User Profile
  rows.push('| **USER PROFILE** | | | |');
  addRow('Level', proDebug.userLevel, kidDebug.userLevel, '⚠️ Should match player skill');
  addRow('Height (inches)', proDebug.userHeight, kidDebug.userHeight, 'Used for normalization?');
  addRow('Weight (lbs)', proDebug.userWeight, kidDebug.userWeight, 'Used for normalization?');
  addRow('Handedness', proDebug.userHandedness, kidDebug.userHandedness);
  
  // Video Processing
  rows.push('| **VIDEO PROCESSING** | | | |');
  addRow('FPS Detected', proDebug.fpsDetected, kidDebug.fpsDetected, '⚠️ Affects velocity calculations');
  addRow('Normalized FPS', proDebug.normalizedFps, kidDebug.normalizedFps);
  addRow('Camera Angle', proDebug.cameraAngle, kidDebug.cameraAngle, '⚠️ Affects angle measurements');
  addRow('Frame Count', proDebug.frameCount, kidDebug.frameCount);
  addRow('Impact Frame', proDebug.impactFrame, kidDebug.impactFrame);
  
  // Skeleton Quality
  rows.push('| **SKELETON QUALITY** | | | |');
  addRow('Avg Confidence', proDebug.avgConfidence, kidDebug.avgConfidence, 'Overall pose quality');
  addRow('Hip Confidence', proDebug.hipConfidence, kidDebug.hipConfidence, '⚠️ Critical for rotation');
  addRow('Shoulder Confidence', proDebug.shoulderConfidence, kidDebug.shoulderConfidence);
  addRow('Wrist Confidence', proDebug.wristConfidence, kidDebug.wristConfidence, 'Critical for bat speed');
  
  // Raw Velocities
  rows.push('| **RAW VELOCITIES (deg/s)** | | | |');
  addRow('Pelvis Max Velocity', proDebug.pelvisMaxVelocity, kidDebug.pelvisMaxVelocity, 'Higher = more rotation');
  addRow('Torso Max Velocity', proDebug.torsoMaxVelocity, kidDebug.torsoMaxVelocity);
  addRow('Arm Max Velocity', proDebug.armMaxVelocity, kidDebug.armMaxVelocity);
  addRow('Bat Max Velocity', proDebug.batMaxVelocity, kidDebug.batMaxVelocity);
  
  // Timing Metrics (ms before impact)
  rows.push('| **TIMING METRICS (ms before impact)** | | | |');
  addRow('Pelvis Peak Timing', proDebug.pelvisPeakTimingMs, kidDebug.pelvisPeakTimingMs, '⚠️ Ideal: 100-120ms');
  addRow('Torso Peak Timing', proDebug.torsoPeakTimingMs, kidDebug.torsoPeakTimingMs, '⚠️ Ideal: 60-80ms');
  addRow('Arm Peak Timing', proDebug.armPeakTimingMs, kidDebug.armPeakTimingMs, 'Ideal: 30-50ms');
  addRow('Bat Peak Timing', proDebug.batPeakTimingMs, kidDebug.batPeakTimingMs, '⚠️ Ideal: 0-20ms');
  
  // Timing Gaps
  rows.push('| **TIMING GAPS (ms)** | | | |');
  addRow('Pelvis→Torso Gap', proDebug.pelvisToTorsoGapMs, kidDebug.pelvisToTorsoGapMs, '⚠️ Ideal: 30-50ms');
  addRow('Torso→Arm Gap', proDebug.torsoToArmGapMs, kidDebug.torsoToArmGapMs, '⚠️ Ideal: 30-50ms');
  addRow('Arm→Bat Gap', proDebug.armToBatGapMs, kidDebug.armToBatGapMs, '⚠️ Ideal: 30-50ms');
  
  // Biomechanical
  rows.push('| **BIOMECHANICAL** | | | |');
  addRow('Bat Speed (mph)', proDebug.batSpeedMph, kidDebug.batSpeedMph, 'Pro should be higher');
  addRow('Hand Speed (mph)', proDebug.handSpeedMph, kidDebug.handSpeedMph);
  addRow('Hip Rotation (deg)', proDebug.hipRotationDeg, kidDebug.hipRotationDeg, 'X-Factor');
  addRow('Front Knee Angle (deg)', proDebug.frontKneeAngleDeg, kidDebug.frontKneeAngleDeg);
  
  // Swing Timing
  rows.push('| **SWING TIMING** | | | |');
  addRow('Load→Launch (ms)', proDebug.loadToLaunchMs, kidDebug.loadToLaunchMs, 'Ideal: 150-220ms');
  addRow('Launch→Impact (ms)', proDebug.launchToImpactMs, kidDebug.launchToImpactMs);
  addRow('Total Swing (ms)', proDebug.swingDurationMs, kidDebug.swingDurationMs);
  
  // Sequence
  rows.push('| **SEQUENCE ANALYSIS** | | | |');
  addRow('Sequence Order', proDebug.sequenceOrder.join('→'), kidDebug.sequenceOrder.join('→'), '⚠️ Should be pelvis→torso→arm→bat');
  addRow('Sequence Order Score', proDebug.sequenceOrderScore, kidDebug.sequenceOrderScore, '/100');
  addRow('Sequence Timing Score', proDebug.sequenceTimingScore, kidDebug.sequenceTimingScore, '/100');
  addRow('Total Sequence Score', proDebug.sequenceScore, kidDebug.sequenceScore, '/100');
  
  // Final Scores
  rows.push('| **FINAL SCORES** | | | |');
  addRow('Anchor Score', proDebug.anchorScore, kidDebug.anchorScore, '⚠️ Pro should be higher!');
  addRow('Engine Score', proDebug.engineScore, kidDebug.engineScore, '⚠️ Pro should be higher!');
  addRow('Whip Score', proDebug.whipScore, kidDebug.whipScore, '⚠️ Pro should be higher!');
  addRow('Overall Score', proDebug.overallScore, kidDebug.overallScore, '⚠️ Pro should be higher!');
  
  // Anchor Breakdown
  rows.push('| **ANCHOR BREAKDOWN** | | | |');
  addRow('Anchor Motion (Timing)', proDebug.anchorMotionScore, kidDebug.anchorMotionScore, '/100');
  addRow('Anchor Stability', proDebug.anchorStabilityScore, kidDebug.anchorStabilityScore, '/100');
  addRow('Anchor Sequencing', proDebug.anchorSequencingScore, kidDebug.anchorSequencingScore, '/100');
  
  // Engine Breakdown
  rows.push('| **ENGINE BREAKDOWN** | | | |');
  addRow('Engine Motion (Timing)', proDebug.engineMotionScore, kidDebug.engineMotionScore, '/100');
  addRow('Engine Stability', proDebug.engineStabilityScore, kidDebug.engineStabilityScore, '/100');
  addRow('Engine Sequencing', proDebug.engineSequencingScore, kidDebug.engineSequencingScore, '/100');
  
  // Whip Breakdown
  rows.push('| **WHIP BREAKDOWN** | | | |');
  addRow('Whip Motion (Timing)', proDebug.whipMotionScore, kidDebug.whipMotionScore, '/100');
  addRow('Whip Stability', proDebug.whipStabilityScore, kidDebug.whipStabilityScore, '/100');
  addRow('Whip Sequencing', proDebug.whipSequencingScore, kidDebug.whipSequencingScore, '/100');
  
  return rows.join('\n');
}

async function main() {
  try {
    console.log('\n🔍 Starting Video Scoring Diagnostic...\n');
    
    // Get command-line arguments
    const proVideoId = process.argv[2];
    const kidVideoId = process.argv[3];
    
    if (!proVideoId || !kidVideoId) {
      console.error('Usage: tsx scripts/diagnose-video-scoring.ts <proVideoId> <kidVideoId>');
      console.error('\nPlease provide both video IDs to compare.');
      process.exit(1);
    }
    
    console.log(`📊 Analyzing Pro video: ${proVideoId}`);
    const proDebug = await analyzeVideoForDebug(proVideoId);
    console.log('✅ Pro analysis complete\n');
    
    console.log(`📊 Analyzing Kid video: ${kidVideoId}`);
    const kidDebug = await analyzeVideoForDebug(kidVideoId);
    console.log('✅ Kid analysis complete\n');
    
    console.log('📋 Generating comparison table...\n');
    const table = generateComparisonTable(proDebug, kidDebug);
    
    console.log(table);
    console.log('\n✅ Diagnostic complete!\n');
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '..', 'diagnostic_output', 'video_comparison_diagnostic.md');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, table);
    console.log(`💾 Report saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('❌ Error during diagnostic:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
