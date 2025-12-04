// @ts-nocheck
/**
 * Simple Score Comparison Script
 * Compares stored scores and metadata between Pro and Kid videos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VideoComparison {
  // Video metadata
  videoId: string;
  title: string;
  uploadDate: Date;
  
  // User profile
  userLevel: string | null;
  userHeight: number | null;
  userWeight: number | null;
  userHandedness: string | null;
  
  // Video processing
  fpsDetected: number | null;
  normalizedFps: number;
  cameraAngle: string | null;
  
  // Final scores
  anchorScore: number | null;
  engineScore: number | null;
  whipScore: number | null;
  overallScore: number | null;
  
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

async function getVideoComparison(videoId: string): Promise<VideoComparison> {
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

  return {
    videoId: video.id,
    title: video.title,
    uploadDate: video.uploadDate,
    
    userLevel: video.user?.level || null,
    userHeight: video.user?.height || null,
    userWeight: video.user?.weight || null,
    userHandedness: video.user?.bats || null,
    
    fpsDetected: video.fps,
    normalizedFps: video.normalizedFps,
    cameraAngle: video.cameraAngle,
    
    anchorScore: video.anchorScore?.toNumber() || null,
    engineScore: video.engineScore?.toNumber() || null,
    whipScore: video.whipScore?.toNumber() || null,
    overallScore: video.overallScore || null,
    
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

function generateComparisonTable(proDebug: VideoComparison, kidDebug: VideoComparison): string {
  const rows: string[] = [
    '# Video Scoring Comparison: Pro vs Kid\n',
    '| Metric | Pro Clip | Kid Clip | Delta | Notes |',
    '|--------|----------|----------|-------|-------|',
  ];

  const addRow = (metric: string, proVal: any, kidVal: any, notes: string = '') => {
    const proStr = typeof proVal === 'number' ? proVal.toFixed(1) : String(proVal || 'N/A');
    const kidStr = typeof kidVal === 'number' ? kidVal.toFixed(1) : String(kidVal || 'N/A');
    
    let delta = '';
    if (typeof proVal === 'number' && typeof kidVal === 'number') {
      const diff = proVal - kidVal;
      const sign = diff > 0 ? '+' : '';
      delta = `${sign}${diff.toFixed(1)}`;
    }
    
    rows.push(`| ${metric} | ${proStr} | ${kidStr} | ${delta} | ${notes} |`);
  };

  // Metadata
  rows.push('| **VIDEO METADATA** | | | | |');
  addRow('Title', proDebug.title, kidDebug.title);
  addRow('Upload Date', proDebug.uploadDate.toISOString().split('T')[0], kidDebug.uploadDate.toISOString().split('T')[0]);
  
  // User Profile
  rows.push('| **USER PROFILE** | | | | |');
  addRow('Level', proDebug.userLevel, kidDebug.userLevel, '⚠️ Should match player skill');
  addRow('Height (inches)', proDebug.userHeight, kidDebug.userHeight, 'Used for normalization?');
  addRow('Weight (lbs)', proDebug.userWeight, kidDebug.userWeight, 'Used for normalization?');
  addRow('Handedness', proDebug.userHandedness, kidDebug.userHandedness);
  
  // Video Processing
  rows.push('| **VIDEO PROCESSING** | | | | |');
  addRow('FPS Detected', proDebug.fpsDetected, kidDebug.fpsDetected, '⚠️ Affects velocity calculations');
  addRow('Normalized FPS', proDebug.normalizedFps, kidDebug.normalizedFps);
  addRow('Camera Angle', proDebug.cameraAngle, kidDebug.cameraAngle, '⚠️ Affects angle measurements');
  
  // Final Scores
  rows.push('| **FINAL SCORES** | | | | |');
  addRow('Overall Score', proDebug.overallScore, kidDebug.overallScore, '⚠️ Pro should be higher!');
  addRow('Anchor Score', proDebug.anchorScore, kidDebug.anchorScore, 'Lower body foundation');
  addRow('Engine Score', proDebug.engineScore, kidDebug.engineScore, 'Core rotation');
  addRow('Whip Score', proDebug.whipScore, kidDebug.whipScore, 'Arms & bat');
  
  // Anchor Breakdown
  rows.push('| **ANCHOR BREAKDOWN** | | | | |');
  addRow('Anchor Motion (Timing)', proDebug.anchorMotionScore, kidDebug.anchorMotionScore, 'Load→Launch timing');
  addRow('Anchor Stability', proDebug.anchorStabilityScore, kidDebug.anchorStabilityScore, 'Knee/head stability');
  addRow('Anchor Sequencing', proDebug.anchorSequencingScore, kidDebug.anchorSequencingScore, 'Pelvis first');
  
  // Engine Breakdown
  rows.push('| **ENGINE BREAKDOWN** | | | | |');
  addRow('Engine Motion (Timing)', proDebug.engineMotionScore, kidDebug.engineMotionScore, 'Pelvis→Torso gap');
  addRow('Engine Stability', proDebug.engineStabilityScore, kidDebug.engineStabilityScore, 'Spine/pelvis angles');
  addRow('Engine Sequencing', proDebug.engineSequencingScore, kidDebug.engineSequencingScore, 'Rotation order');
  
  // Whip Breakdown
  rows.push('| **WHIP BREAKDOWN** | | | | |');
  addRow('Whip Motion (Timing)', proDebug.whipMotionScore, kidDebug.whipMotionScore, 'Torso→Arm→Bat gaps');
  addRow('Whip Stability', proDebug.whipStabilityScore, kidDebug.whipStabilityScore, 'Shoulder/elbow angles');
  addRow('Whip Sequencing', proDebug.whipSequencingScore, kidDebug.whipSequencingScore, 'Upper body timing');
  
  return rows.join('\n');
}

async function main() {
  try {
    console.log('\n🔍 Starting Video Score Comparison...\n');
    
    // Get command-line arguments
    const proVideoId = process.argv[2];
    const kidVideoId = process.argv[3];
    
    if (!proVideoId || !kidVideoId) {
      console.error('Usage: tsx scripts/compare-video-scores.ts <proVideoId> <kidVideoId>');
      console.error('\nPlease provide both video IDs to compare.');
      process.exit(1);
    }
    
    console.log(`📊 Fetching Pro video: ${proVideoId}`);
    const proDebug = await getVideoComparison(proVideoId);
    console.log(`   Title: ${proDebug.title}`);
    console.log(`   Overall: ${proDebug.overallScore}\n`);
    
    console.log(`📊 Fetching Kid video: ${kidVideoId}`);
    const kidDebug = await getVideoComparison(kidVideoId);
    console.log(`   Title: ${kidDebug.title}`);
    console.log(`   Overall: ${kidDebug.overallScore}\n`);
    
    console.log('📋 Generating comparison table...\n');
    const table = generateComparisonTable(proDebug, kidDebug);
    
    console.log(table);
    console.log('\n✅ Comparison complete!\n');
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '..', 'diagnostic_output', 'video_comparison.md');
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, table);
    console.log(`💾 Report saved to: ${outputPath}\n`);
    
    // Analysis summary
    console.log('='.repeat(80));
    console.log('KEY FINDINGS:');
    console.log('='.repeat(80));
    
    const overallDiff = (proDebug.overallScore || 0) - (kidDebug.overallScore || 0);
    console.log(`\n🎯 Overall Score Difference: ${overallDiff > 0 ? '+' : ''}${overallDiff.toFixed(1)} points`);
    
    if (overallDiff >= 5) {
      console.log('   ✅ Pro is scoring higher (expected!)');
    } else if (overallDiff >= -5) {
      console.log('   ⚠️ Scores are very close - may need investigation');
    } else {
      console.log('   ❌ Kid is scoring higher - THIS IS THE BUG!');
    }
    
    console.log('\n📊 Breakdown:');
    console.log(`   Anchor: Pro ${proDebug.anchorScore} vs Kid ${kidDebug.anchorScore} (${(proDebug.anchorScore || 0) - (kidDebug.anchorScore || 0) > 0 ? '+' : ''}${((proDebug.anchorScore || 0) - (kidDebug.anchorScore || 0)).toFixed(1)})`);
    console.log(`   Engine: Pro ${proDebug.engineScore} vs Kid ${kidDebug.engineScore} (${(proDebug.engineScore || 0) - (kidDebug.engineScore || 0) > 0 ? '+' : ''}${((proDebug.engineScore || 0) - (kidDebug.engineScore || 0)).toFixed(1)})`);
    console.log(`   Whip: Pro ${proDebug.whipScore} vs Kid ${kidDebug.whipScore} (${(proDebug.whipScore || 0) - (kidDebug.whipScore || 0) > 0 ? '+' : ''}${((proDebug.whipScore || 0) - (kidDebug.whipScore || 0)).toFixed(1)})`);
    
    console.log('\n🔍 Potential Issues:');
    if (proDebug.userLevel === kidDebug.userLevel) {
      console.log('   ✅ Both using same level setting');
    } else {
      console.log(`   ⚠️ Different levels: Pro="${proDebug.userLevel}" vs Kid="${kidDebug.userLevel}"`);
    }
    
    if (proDebug.fpsDetected === kidDebug.fpsDetected) {
      console.log('   ✅ Same FPS detected');
    } else {
      console.log(`   ⚠️ Different FPS: Pro=${proDebug.fpsDetected} vs Kid=${kidDebug.fpsDetected}`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error during comparison:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
