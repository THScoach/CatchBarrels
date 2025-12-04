/**
 * Diamond Kinetics API Client (WO15)
 * 
 * Provides functions to interact with the DK Developer API
 * to retrieve swing data for POD sessions.
 * 
 * NOTE: Placeholder implementation with TODO comments for real DK API integration.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * A Diamond Kinetics session (represents a hitting session)
 */
export interface DkSession {
  id: string;
  startedAt: string; // ISO date
  endedAt?: string; // ISO date
}

/**
 * Swing metrics from Diamond Kinetics sensor
 */
export interface DkSwingMetrics {
  barrelSpeed?: number;       // mph
  impactMomentum?: number;    // arbitrary DK units
  attackAngle?: number;       // degrees
  handSpeed?: number;         // mph or DK units
  timeToContact?: number;     // seconds
}

/**
 * An individual swing captured by DK sensor
 */
export interface DkSwing {
  id: string;
  timestamp: string; // ISO date
  metrics: DkSwingMetrics;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DK_API_BASE_URL = process.env.DK_API_BASE_URL;
const DK_API_KEY = process.env.DK_API_KEY;

/**
 * Validates DK API configuration
 */
function validateConfig(): void {
  if (!DK_API_BASE_URL) {
    throw new Error('DK_API_BASE_URL environment variable is not set');
  }
  if (!DK_API_KEY) {
    throw new Error('DK_API_KEY environment variable is not set');
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Retrieves DK sessions for a specific player within a time range
 * 
 * @param dkPlayerId - Diamond Kinetics player identifier
 * @param from - Start of time window
 * @param to - End of time window
 * @returns Array of DK sessions
 */
export async function getPlayerSessions(
  dkPlayerId: string,
  from: Date,
  to: Date
): Promise<DkSession[]> {
  validateConfig();
  
  // TODO: align with real DK API once docs are available
  // Expected endpoint: ${DK_API_BASE_URL}/players/${dkPlayerId}/sessions
  // with query params: ?from=${from.toISOString()}&to=${to.toISOString()}
  
  console.log('[DK API] getPlayerSessions called', {
    dkPlayerId,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  
  try {
    const url = `${DK_API_BASE_URL}/players/${dkPlayerId}/sessions?from=${from.toISOString()}&to=${to.toISOString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[DK API] getPlayerSessions failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return []; // Return empty array on error to not block attendance updates
    }
    
    const data = await response.json();
    console.log('[DK API] getPlayerSessions success', {
      sessionCount: data?.sessions?.length || 0,
    });
    
    // TODO: map real DK API response structure to DkSession[]
    // Expected structure: { sessions: [...] }
    return data?.sessions || [];
    
  } catch (error) {
    console.error('[DK API] getPlayerSessions exception', error);
    return []; // Return empty array on error to not block attendance updates
  }
}

/**
 * Retrieves all swings for a specific DK session
 * 
 * @param sessionId - DK session identifier
 * @returns Array of swings with metrics
 */
export async function getSessionSwings(sessionId: string): Promise<DkSwing[]> {
  validateConfig();
  
  // TODO: align with real DK API once docs are available
  // Expected endpoint: ${DK_API_BASE_URL}/sessions/${sessionId}/swings
  
  console.log('[DK API] getSessionSwings called', { sessionId });
  
  try {
    const url = `${DK_API_BASE_URL}/sessions/${sessionId}/swings`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[DK API] getSessionSwings failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return []; // Return empty array on error to not block attendance updates
    }
    
    const data = await response.json();
    console.log('[DK API] getSessionSwings success', {
      swingCount: data?.swings?.length || 0,
    });
    
    // TODO: map real DK API response structure to DkSwing[]
    // Expected structure: { swings: [...] }
    return data?.swings || [];
    
  } catch (error) {
    console.error('[DK API] getSessionSwings exception', error);
    return []; // Return empty array on error to not block attendance updates
  }
}
