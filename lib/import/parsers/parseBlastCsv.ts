/**
 * Blast Motion CSV Parser (WO-IMPORT-01)
 */

import { BLAST_COLUMNS } from '../config';
import type { RawSensorSwing, SensorParseResult } from '../types';
import {
  parseCsvString,
  getColumnValue,
  parseNumber,
  parseTimestamp,
} from './csvUtils';

/**
 * Parse Blast Motion CSV file
 */
export function parseBlastCsv(csvContent: string, fileName?: string): SensorParseResult {
  try {
    console.log('[Blast Parser] Starting parse...', { fileName });
    
    const records = parseCsvString(csvContent);
    if (records.length === 0) {
      return {
        success: false,
        sensorType: 'blast',
        swings: [],
        errors: ['No data rows found in CSV'],
      };
    }
    
    console.log(`[Blast Parser] Found ${records.length} rows`);
    
    const swings: RawSensorSwing[] = [];
    const errors: string[] = [];
    let deviceId: string | undefined;
    let playerName: string | undefined;
    
    for (let i = 0; i < records.length; i++) {
      try {
        const row = records[i];
        
        // Parse timestamp (required for matching)
        const timestampStr = getColumnValue(row, BLAST_COLUMNS.timestamp);
        const timestamp = parseTimestamp(timestampStr);
        
        if (!timestamp) {
          errors.push(`Row ${i + 1}: Missing or invalid timestamp`);
          continue;
        }
        
        // Parse player info
        const player = getColumnValue(row, BLAST_COLUMNS.playerName);
        const device = getColumnValue(row, BLAST_COLUMNS.deviceId);
        
        if (player && !playerName) {
          playerName = player;
        }
        if (device && !deviceId) {
          deviceId = device;
        }
        
        // Parse core metrics
        const batSpeed = parseNumber(getColumnValue(row, BLAST_COLUMNS.batSpeed));
        const attackAngle = parseNumber(getColumnValue(row, BLAST_COLUMNS.attackAngle));
        const timeToContact = parseNumber(getColumnValue(row, BLAST_COLUMNS.timeToContact));
        const peakHandSpeed = parseNumber(getColumnValue(row, BLAST_COLUMNS.peakHandSpeed));
        
        // Parse Blast-specific metrics
        const blastFactor = parseNumber(getColumnValue(row, BLAST_COLUMNS.blastFactor));
        const powerOutput = parseNumber(getColumnValue(row, BLAST_COLUMNS.powerOutput));
        
        const swing: RawSensorSwing = {
          deviceId: device,
          playerName: player,
          timestamp: timestampStr,
          batSpeed,
          attackAngle,
          timeToContact,
          peakHandSpeed,
          blastFactor,
          powerOutput,
          rawData: row,
          calculatedTimestamp: timestamp,
        };
        
        swings.push(swing);
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }
    
    console.log(`[Blast Parser] Successfully parsed ${swings.length} swings`);
    
    return {
      success: swings.length > 0,
      sensorType: 'blast',
      swings,
      metadata: {
        fileName,
        deviceId,
        playerName,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('[Blast Parser] Fatal error:', error);
    return {
      success: false,
      sensorType: 'blast',
      swings: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
