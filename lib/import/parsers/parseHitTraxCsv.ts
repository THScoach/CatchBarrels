/**
 * HitTrax CSV Parser (WO-IMPORT-01)
 */

import { HITTRAX_COLUMNS, HITTRAX_MISS_CODES, HITTRAX_FOUL_CODES } from '../config';
import type { RawHitTraxSwing, HitTraxParseResult } from '../types';
import {
  parseCsvString,
  getColumnValue,
  parseNumber,
  parseInt_,
  parseTimestamp,
} from './csvUtils';

/**
 * Parse HitTrax CSV file
 */
export function parseHitTraxCsv(csvContent: string, fileName?: string): HitTraxParseResult {
  try {
    console.log('[HitTrax Parser] Starting parse...', { fileName });
    
    const records = parseCsvString(csvContent);
    if (records.length === 0) {
      return {
        success: false,
        swings: [],
        errors: ['No data rows found in CSV'],
      };
    }
    
    console.log(`[HitTrax Parser] Found ${records.length} rows`);
    
    const swings: RawHitTraxSwing[] = [];
    const errors: string[] = [];
    let sessionDate: Date | undefined;
    let playerName: string | undefined;
    let level: string | undefined;
    
    for (let i = 0; i < records.length; i++) {
      try {
        const row = records[i];
        
        // Parse row number (required)
        const rowNum = parseInt_(getColumnValue(row, HITTRAX_COLUMNS.rowNumber));
        if (rowNum === undefined) {
          continue; // Skip rows without row number
        }
        
        // Parse timestamp
        const dateStr = getColumnValue(row, HITTRAX_COLUMNS.date);
        const timeStr = getColumnValue(row, HITTRAX_COLUMNS.timestamp);
        let timestamp: Date | undefined;
        
        if (dateStr && timeStr) {
          timestamp = parseTimestamp(`${dateStr} ${timeStr}`);
        } else if (dateStr) {
          timestamp = parseTimestamp(dateStr);
        } else if (timeStr && sessionDate) {
          timestamp = parseTimestamp(timeStr, sessionDate);
        }
        
        // Track session date from first swing
        if (!sessionDate && timestamp) {
          sessionDate = timestamp;
        }
        
        // Parse player info
        const batterName = getColumnValue(row, HITTRAX_COLUMNS.batterName);
        const batterId = getColumnValue(row, HITTRAX_COLUMNS.batterId);
        const batting = getColumnValue(row, HITTRAX_COLUMNS.batting) as 'L' | 'R' | undefined;
        const playerLevel = getColumnValue(row, HITTRAX_COLUMNS.level);
        
        if (batterName && !playerName) {
          playerName = batterName;
        }
        if (playerLevel && !level) {
          level = playerLevel;
        }
        
        // Parse pitch data
        const pitchSpeed = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.pitchSpeed));
        const strikeZone = parseInt_(getColumnValue(row, HITTRAX_COLUMNS.strikeZone));
        const pitchType = getColumnValue(row, HITTRAX_COLUMNS.pitchType);
        
        // Parse ball data
        const exitVelocity = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.exitVelocity));
        const launchAngle = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.launchAngle));
        const distance = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.distance));
        const result = getColumnValue(row, HITTRAX_COLUMNS.result);
        const battedBallType = getColumnValue(row, HITTRAX_COLUMNS.battedBallType);
        
        // Parse spray data
        const horizAngle = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.horizAngle));
        const sprayChartX = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.sprayChartX));
        const sprayChartZ = parseNumber(getColumnValue(row, HITTRAX_COLUMNS.sprayChartZ));
        
        const swing: RawHitTraxSwing = {
          rowNumber: rowNum,
          ab: parseInt_(getColumnValue(row, ['ab', 'at_bat'])),
          date: timestamp,
          timestamp: timeStr,
          pitchSpeed,
          strikeZone,
          pitchType,
          exitVelocity,
          launchAngle,
          distance,
          result,
          battedBallType,
          horizAngle,
          sprayChartX,
          sprayChartZ,
          batterName,
          batterId,
          batting,
          level: playerLevel,
          calculatedTimestamp: timestamp,
        };
        
        swings.push(swing);
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }
    
    console.log(`[HitTrax Parser] Successfully parsed ${swings.length} swings`);
    
    return {
      success: swings.length > 0,
      swings,
      metadata: {
        fileName,
        sessionDate,
        playerName,
        level,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
    
  } catch (error) {
    console.error('[HitTrax Parser] Fatal error:', error);
    return {
      success: false,
      swings: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
