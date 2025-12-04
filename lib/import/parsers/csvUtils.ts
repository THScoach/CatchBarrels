/**
 * CSV Parsing Utilities (WO-IMPORT-01)
 */

import { parse } from 'csv-parse/sync';

/**
 * Parse CSV string into records
 */
export function parseCsvString(csvContent: string): Record<string, string>[] {
  try {
    const records = parse(csvContent, {
      columns: true, // Use first row as header
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true, // Allow rows with different column counts
      cast: false, // Keep all values as strings initially
    }) as Record<string, string>[];
    return records;
  } catch (error) {
    console.error('[CSV Parse] Error parsing CSV:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find a column in CSV headers using flexible name matching
 * @param headers Array of column headers from CSV
 * @param possibleNames Array of possible column names to match
 * @returns Matched header name or undefined
 */
export function findColumn(headers: string[], possibleNames: string[]): string | undefined {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (const name of possibleNames) {
    const normalizedName = name.toLowerCase().trim();
    const index = normalizedHeaders.indexOf(normalizedName);
    if (index !== -1) {
      return headers[index]; // Return original header
    }
  }
  
  return undefined;
}

/**
 * Get value from a row using flexible column matching
 */
export function getColumnValue(
  row: Record<string, string>,
  possibleNames: string[]
): string | undefined {
  const headers = Object.keys(row);
  const matchedHeader = findColumn(headers, possibleNames);
  return matchedHeader ? row[matchedHeader] : undefined;
}

/**
 * Parse a numeric value safely
 */
export function parseNumber(value: string | undefined): number | undefined {
  if (!value || value === '' || value === 'N/A' || value === 'null') {
    return undefined;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse an integer value safely
 */
export function parseInt_(value: string | undefined): number | undefined {
  if (!value || value === '' || value === 'N/A' || value === 'null') {
    return undefined;
  }
  
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse a timestamp string to Date
 * Supports multiple formats:
 * - ISO 8601: "2024-11-28T14:30:00Z"
 * - US Date: "11/28/2024 14:30:00", "11/28/2024 2:30 PM"
 * - Date only: "2024-11-28", "11/28/2024"
 * - Time only: "14:30:00", "2:30 PM" (uses current date)
 */
export function parseTimestamp(
  value: string | undefined,
  fallbackDate?: Date
): Date | undefined {
  if (!value || value === '' || value === 'N/A' || value === 'null') {
    return undefined;
  }
  
  try {
    // Try parsing as ISO 8601 or standard date
    let date = new Date(value);
    
    // If invalid, try custom formats
    if (isNaN(date.getTime())) {
      // Try MM/DD/YYYY HH:MM:SS format
      const parts = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):?(\d{2})?/);
      if (parts) {
        const [, month, day, year, hour, minute, second] = parts;
        date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          second ? parseInt(second) : 0
        );
      }
      
      // Try time only (HH:MM:SS or HH:MM)
      if (isNaN(date.getTime())) {
        const timeParts = value.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
        if (timeParts && fallbackDate) {
          const [, hour, minute, second] = timeParts;
          date = new Date(fallbackDate);
          date.setHours(parseInt(hour), parseInt(minute), second ? parseInt(second) : 0, 0);
        }
      }
    }
    
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.error(`[CSV Parse] Error parsing timestamp "${value}":`, error);
    return undefined;
  }
}

/**
 * Detect file type from filename and headers
 */
export function detectFileType(
  fileName: string,
  headers: string[]
): 'hittrax' | 'blast' | 'dk' | 'unknown' {
  const lowerFileName = fileName.toLowerCase();
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  // Check HitTrax
  if (
    lowerFileName.includes('hittrax') ||
    lowerFileName.includes('ht_') ||
    lowerHeaders.some(h => h.includes('velo') || h.includes('exit_velo') || h.includes('launch'))
  ) {
    return 'hittrax';
  }
  
  // Check Blast
  if (
    lowerFileName.includes('blast') ||
    lowerHeaders.some(h => h.includes('blast_factor') || h.includes('attack_angle'))
  ) {
    return 'blast';
  }
  
  // Check Diamond Kinetics
  if (
    lowerFileName.includes('diamond') ||
    lowerFileName.includes('dk_') ||
    lowerFileName.includes('swingtrax') ||
    lowerHeaders.some(h => h.includes('rotation') || h.includes('approach_angle'))
  ) {
    return 'dk';
  }
  
  return 'unknown';
}
