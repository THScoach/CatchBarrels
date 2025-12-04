/**
 * Import Service (WO-IMPORT-01)
 * 
 * Orchestrates the import process from file upload to database storage
 */

import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { parseHitTraxCsv, parseBlastCsv, parseDiamondKineticsCsv, detectFileType } from './parsers';
import { matchSwingsByTimestamp, groupSwingsByPlayer } from './matching';
import { namesMatch } from './config';
import type {
  ImportContext,
  ImportSummary,
  PlayerImportSummary,
  UnassignedSwing,
  RawHitTraxSwing,
  RawSensorSwing,
} from './types';

/**
 * Process per-player import
 */
export async function processPerPlayerImport(
  playerId: string,
  userId: string,
  files: File[]
): Promise<ImportSummary> {
  console.log('[Import Service] Starting per-player import', { playerId, fileCount: files.length });

  const startTime = new Date();
  
  // Create import session
  const importSession = await prisma.importSession.create({
    data: {
      userId,
      importType: 'per_player',
      sourceTypes: [],
      fileNames: files.map(f => f.name),
      fileCount: files.length,
      status: 'processing',
    },
  });

  try {
    // Upload and parse files
    const hittraxSwings: RawHitTraxSwing[] = [];
    const sensorSwings: RawSensorSwing[] = [];
    const sourceTypes: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Upload to S3
        const buffer = Buffer.from(await file.arrayBuffer());
        const s3Key = `imports/${userId}/${Date.now()}-${file.name}`;
        await uploadFile(buffer, s3Key);

        // Read content
        const content = buffer.toString('utf-8');
        const firstLine = content.split('\n')[0];
        const headers = firstLine.split(',').map(h => h.trim());
        
        // Detect file type
        const fileType = detectFileType(file.name, headers);

        if (fileType === 'hittrax') {
          const result = parseHitTraxCsv(content, file.name);
          if (result.success) {
            hittraxSwings.push(...result.swings);
            if (!sourceTypes.includes('hittrax')) sourceTypes.push('hittrax');
          } else {
            errors.push(...(result.errors || []));
          }
        } else if (fileType === 'blast') {
          const result = parseBlastCsv(content, file.name);
          if (result.success) {
            sensorSwings.push(...result.swings);
            if (!sourceTypes.includes('blast')) sourceTypes.push('blast');
          } else {
            errors.push(...(result.errors || []));
          }
        } else if (fileType === 'dk') {
          const result = parseDiamondKineticsCsv(content, file.name);
          if (result.success) {
            sensorSwings.push(...result.swings);
            if (!sourceTypes.includes('dk')) sourceTypes.push('dk');
          } else {
            errors.push(...(result.errors || []));
          }
        } else {
          errors.push(`Unknown file type: ${file.name}`);
        }
      } catch (error) {
        console.error(`[Import Service] Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Match swings
    const { matched, unmatchedHitTrax, unmatchedSensor } = matchSwingsByTimestamp(
      hittraxSwings,
      sensorSwings
    );

    // Save to database
    let hittraxSessionId: string | undefined;
    
    if (hittraxSwings.length > 0) {
      const hittraxSession = await prisma.hitTraxSession.create({
        data: {
          userId: playerId,
          sessionDate: hittraxSwings[0].calculatedTimestamp || new Date(),
          sourceFileName: files.find(f => f.name.toLowerCase().includes('hittrax'))?.name,
          level: hittraxSwings[0].level,
          importSessionId: importSession.id,
        },
      });
      hittraxSessionId = hittraxSession.id;

      // Create HitTrax events
      for (const swing of hittraxSwings) {
        await prisma.hitTraxEvent.create({
          data: {
            sessionId: hittraxSession.id,
            rowNumber: swing.rowNumber,
            date: swing.calculatedTimestamp,
            timeStamp: swing.timestamp,
            pitch: swing.pitchSpeed ?? null,
            strikeZone: swing.strikeZone ?? null,
            pType: swing.pitchType ?? null,
            velo: swing.exitVelocity ?? null,
            la: swing.launchAngle ?? null,
            dist: swing.distance ?? null,
            res: swing.result ?? null,
            type: swing.battedBallType ?? null,
            horizAngle: swing.horizAngle ?? null,
            sprayChartX: swing.sprayChartX ?? null,
            sprayChartZ: swing.sprayChartZ ?? null,
            batting: swing.batting ?? null,
            playerLevel: swing.level ?? null,
          },
        });
      }
    }

    // Save sensor swings
    for (const swing of sensorSwings) {
      const sensorType = swing.rawData?.blast_factor !== undefined ? 'blast' : 'diamond_kinetics';
      
      await prisma.sensorSwing.create({
        data: {
          userId: playerId,
          importSessionId: importSession.id,
          sensorType,
          sensorDeviceId: swing.deviceId,
          sensorTimestamp: swing.calculatedTimestamp || new Date(),
          batSpeed: swing.batSpeed,
          attackAngle: swing.attackAngle,
          timeToContact: swing.timeToContact,
          peakHandSpeed: swing.peakHandSpeed,
          blastFactor: swing.blastFactor,
          powerOutput: swing.powerOutput,
          rotationMetric: swing.rotationMetric,
          rawDataJson: swing.rawData,
          assigned: true,
          assignedAt: new Date(),
          assignedBy: userId,
        },
      });
    }

    // Update import session
    const completedAt = new Date();
    await prisma.importSession.update({
      where: { id: importSession.id },
      data: {
        status: 'completed',
        sourceTypes,
        totalSwings: hittraxSwings.length + sensorSwings.length,
        matchedSwings: matched.length,
        unmatchedSwings: unmatchedHitTrax.length + unmatchedSensor.length,
        playersDetected: 1,
        completedAt,
      },
    });

    // Get player name
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      select: { name: true },
    });

    const summary: ImportSummary = {
      importSessionId: importSession.id,
      importType: 'per_player',
      status: 'completed',
      filesProcessed: files.length,
      fileNames: files.map(f => f.name),
      totalSwings: hittraxSwings.length + sensorSwings.length,
      matchedSwings: matched.length,
      unmatchedSwings: unmatchedHitTrax.length + unmatchedSensor.length,
      playersDetected: 1,
      players: [
        {
          playerId,
          playerName: player?.name || 'Unknown',
          hittraxSessionId,
          swingsImported: hittraxSwings.length + sensorSwings.length,
          swingsMatched: matched.length,
          sources: sourceTypes as any[],
        },
      ],
      unassignedSwings: [],
      startedAt: startTime,
      completedAt,
      durationMs: completedAt.getTime() - startTime.getTime(),
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('[Import Service] Per-player import completed', summary);
    return summary;

  } catch (error) {
    console.error('[Import Service] Fatal error:', error);
    
    await prisma.importSession.update({
      where: { id: importSession.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
