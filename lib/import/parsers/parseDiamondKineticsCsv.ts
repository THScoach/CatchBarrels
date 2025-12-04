/**
 * Diamond Kinetics CSV Parser (WO-IMPORT-01)
 */

import { DK_COLUMNS } from '../config';
import type { RawSensorSwing, SensorParseResult } from '../types';
import {
  parseCsvString,
  getColumnValue,
  parseNumber,
  parseTimestamp,
} from './csvUtils';

/**
 * Parse Diamond Kinetics CSV file
 */
export function parseDiamondKineticsCsv(csvContent: string, fileName?: string): SensorParseResult {
  try {
    console.log('[DK Parser] Starting parse...', { fileName });
    
    const records = parseCsvString(csvContent);
    if (records.length === 0) {
      return {
        success: false,
        sensorType: 'diamond_kinetics',
        swings: [],
        errors: ['No data rows found in CSV'],
      };
    }
    
    console.log(`[DK Parser] Found ${records.length} rows`);
    
    const swings: RawSensorSwing[] = [];
    const errors: string[] = [];
    let deviceId: string | undefined;
    let playerName: string | undefined;
    
    for (let i = 0; i < records.length; i++) {
      try {
        const row = records[i];
        
        // Parse timestamp (required for matching)
        const timestampStr = getColumnValue(row, DK_COLUMNS.timestamp);
        const timestamp = parseTimestamp(timestampStr);
        
        if (!timestamp) {
          errors.push(`Row ${i + 1}: Missing or invalid timestamp`);
          continue;
        }
        
        // Parse player info
        const player = getColumnValue(row, DK_COLUMNS.playerName);
        const device = getColumnValue(row, DK_COLUMNS.deviceId);
        
        if (player && !playerName) {
          playerName = player;
        }
        if (device && !deviceId) {
          deviceId = device;
        }
        
        // Parse core metrics
        const batSpeed = parseNumber(getColumnValue(row, DK_COLUMNS.batSpeed));
        const attackAngle = parseNumber(getColumnValue(row, DK_COLUMNS.attackAngle));
        const timeToContact = parseNumber(getColumnValue(row, DK_COLUMNS.timeToContact));
        const peakHandSpeed = parseNumber(getColumnValue(row, DK_COLUMNS.peakHandSpeed));
        
        // Parse DK-specific metrics
        const rotationMetric = parseNumber(getColumnValue(row, DK_COLUMNS.rotationMetric));
        
        const swing: RawSensorSwing = {
          deviceId: device,
          playerName: player,
          timestamp: timestampStr,
          batSpeed,
          attackAngle,
          timeToContact,
          peakHandSpeed,
          rotationMetric,
          rawData: row,
          calculatedTimestamp: timestamp,
        };
        
        swings.push(swing);
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }
    
    console.log(`[DK Parser] Successfully parsed ${swings.length} swings`);
    
    return {
      success: swings.length > 0,
      sensorType: 'diamond_kinetics',
      swings,
      metadata: {
        fileName,
        deviceId,
        playerName,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('[DK Parser] Fatal error:', error);
    return {
      success: false,
      sensorType: 'diamond_kinetics',
      swings: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
