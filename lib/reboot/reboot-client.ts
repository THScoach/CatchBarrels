/**
 * Reboot Motion API Client
 * 
 * This module handles communication with the Reboot Motion API to fetch swing data
 * for MLB, indy ball, college, HS, and youth players.
 * 
 * IMPORTANT: This is a placeholder implementation. Real API details and keys
 * must be configured in .env before this will work.
 * 
 * TODO:
 * 1. Get actual Reboot API endpoint URLs from Reboot Motion
 * 2. Get API authentication keys/tokens from Reboot Motion
 * 3. Understand the actual response payload structure
 * 4. Map Reboot's field names to our schema (athleteName, level, metrics, etc.)
 * 5. Add proper error handling and retry logic
 * 6. Add rate limiting if needed
 */

const REBOOT_API_BASE = process.env.REBOOT_API_BASE_URL;  // e.g., "https://api.rebootmotion.com/v1"
const REBOOT_API_KEY = process.env.REBOOT_API_KEY;        // API key or bearer token

/**
 * Session type classification
 * HITTING: Baseball hitting/batting sessions
 * PITCHING: Baseball pitching sessions
 * OTHER: Any other type of motion (fielding, etc.)
 */
export type SessionType = 'HITTING' | 'PITCHING' | 'OTHER';

/**
 * Maps Reboot's session type classification to our internal type
 * 
 * TODO: Update this based on actual Reboot API field names
 * Reboot may use fields like:
 * - activity_type
 * - motion_type
 * - tags
 * - labels
 * - session_category
 * 
 * @param raw - Raw session data from Reboot API
 * @returns SessionType enum value
 */
export function mapSessionTypeFromReboot(raw: any): SessionType {
  // TODO: Replace with actual Reboot API field mapping
  // Example implementations (adjust based on actual API):
  
  // Option 1: Direct field mapping
  // if (raw.activity_type === 'hitting') return 'HITTING';
  // if (raw.activity_type === 'pitching') return 'PITCHING';
  
  // Option 2: Tags array
  // if (raw.tags?.includes('hitting')) return 'HITTING';
  // if (raw.tags?.includes('pitching')) return 'PITCHING';
  
  // Option 3: Motion type classification
  // if (raw.motion_type?.toLowerCase().includes('hit')) return 'HITTING';
  // if (raw.motion_type?.toLowerCase().includes('pitch')) return 'PITCHING';
  
  // Fallback: Default to HITTING for now (since hitting is primary use case)
  // This should be updated once we have real Reboot API documentation
  
  const activityType = raw.activity_type || raw.motion_type || raw.type || '';
  const lowerType = activityType.toLowerCase();
  
  if (lowerType.includes('hit') || lowerType.includes('bat')) {
    return 'HITTING';
  }
  
  if (lowerType.includes('pitch') || lowerType.includes('throw')) {
    return 'PITCHING';
  }
  
  // Check tags if available
  if (raw.tags && Array.isArray(raw.tags)) {
    const tagStr = raw.tags.join(' ').toLowerCase();
    if (tagStr.includes('hitting') || tagStr.includes('batting')) {
      return 'HITTING';
    }
    if (tagStr.includes('pitching') || tagStr.includes('throwing')) {
      return 'PITCHING';
    }
  }
  
  // Default to HITTING if uncertain (can be changed to 'OTHER' if preferred)
  return 'HITTING';
}

/**
 * Interface for a single Reboot session from their API
 * TODO: Update this based on actual Reboot API response
 */
export interface RebootSessionPayload {
  sessionId: string;           // Unique ID from Reboot
  athleteId?: string;          // Reboot's athlete identifier
  athleteName?: string;        // Player name
  athleteEmail?: string;       // Player email (if available)
  level?: string;              // "MLB", "Pro", "College", "HS", "Youth"
  sessionType: SessionType;    // "HITTING", "PITCHING", or "OTHER"
  team?: string;               // Team or organization
  captureDate?: string;        // ISO date string
  metrics: Record<string, any>; // Full kinematic/timing data
}

/**
 * Fetch all hitting sessions from Reboot Motion API
 * 
 * Based on Reboot Motion API documentation:
 * - Endpoint: /hitting-processed-metrics
 * - Filter by movement_type_id=1 (baseball hitting)
 * - Returns processed hitting metrics for all athletes
 * 
 * @returns Array of Reboot session payloads
 */
export async function fetchRebootSessions(): Promise<RebootSessionPayload[]> {
  // Guard: Ensure environment variables are set
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error(
      'Reboot API not configured. Please set REBOOT_API_BASE_URL and REBOOT_API_KEY in .env'
    );
  }

  console.log('[Reboot API] Fetching hitting sessions...');
  console.log(`[Reboot API] Base URL: ${REBOOT_API_BASE}`);
  console.log(`[Reboot API] API Key configured: ${REBOOT_API_KEY ? 'Yes (length: ' + REBOOT_API_KEY.length + ')' : 'No'}`);

  try {
    // Use the correct endpoint from Reboot documentation
    // Filter by movement_type_id=1 for baseball hitting
    const url = `${REBOOT_API_BASE}/hitting-processed-metrics?movement_type_id=1`;
    console.log(`[Reboot API] Fetching from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REBOOT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`[Reboot API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Reboot API] Error response:`, errorText);
      throw new Error(
        `Reboot API returned ${response.status}: ${response.statusText}\n` +
        `Error details: ${errorText.substring(0, 200)}\n` +
        `Please verify API key has access to hitting-processed-metrics endpoint.`
      );
    }

    const data = await response.json();
    console.log('[Reboot API] Success! Response received');
    console.log(`[Reboot API] Response structure:`, Object.keys(data));
    
    // The response should contain an array of hitting sessions
    // Adapt based on actual response structure from Reboot
    let sessions = data;
    
    // Handle different possible response structures
    if (!Array.isArray(data)) {
      sessions = data.sessions || data.data || data.results || data.metrics || [];
    }
    
    if (!Array.isArray(sessions)) {
      console.error('[Reboot API] Unexpected response structure:', data);
      throw new Error('Reboot API response is not an array. Check API documentation.');
    }

    console.log(`[Reboot API] Found ${sessions.length} hitting sessions`);
    
    // Map Reboot's response to our internal format
    return sessions.map((session: any) => {
      const mapped = {
        // Use Reboot's session/swing ID
        sessionId: session.id || session.session_id || session.swing_id || String(Math.random()),
        
        // Athlete identification
        athleteId: session.athlete_id || session.user_id,
        athleteName: session.athlete_name || session.player_name || session.name,
        athleteEmail: session.athlete_email || session.email,
        
        // Session metadata
        level: session.level || session.skill_level,
        sessionType: 'HITTING' as SessionType, // We filtered by movement_type_id=1
        team: session.team || session.team_name || session.organization,
        
        // Timing
        captureDate: session.capture_date || session.created_at || session.date || session.timestamp,
        
        // Store full metrics payload
        metrics: session,
      };
      
      console.log(`[Reboot API] Mapped session: ${mapped.sessionId} - ${mapped.athleteName || 'Unknown'}`);
      return mapped;
    });

  } catch (error: any) {
    console.error('[Reboot API] Fatal error:', error);
    throw new Error(
      `Failed to fetch from Reboot API: ${error.message}\n\n` +
      `Troubleshooting:\n` +
      `1. Verify REBOOT_API_KEY in .env is correct\n` +
      `2. Ensure API key has access to /hitting-processed-metrics endpoint\n` +
      `3. Check Reboot Motion dashboard for API permissions\n` +
      `4. Contact Reboot support if issue persists`
    );
  }
}

/**
 * Fetch sessions for a specific athlete
 * 
 * @param athleteId - Reboot's athlete identifier
 * @returns Array of sessions for that athlete
 * 
 * TODO: Implement when we have the real API
 */
export async function fetchRebootAthleteSessions(
  athleteId: string
): Promise<RebootSessionPayload[]> {
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error('Reboot API not configured');
  }

  // TODO: Implement
  // const response = await fetch(`${REBOOT_API_BASE}/athletes/${athleteId}/sessions`, {
  //   headers: {
  //     'Authorization': `Bearer ${REBOOT_API_KEY}`,
  //   },
  // });

  throw new Error('fetchRebootAthleteSessions not implemented');
}

/**
 * Get list of all unique Reboot athletes
 * 
 * This is useful for the admin UI to show a dropdown of Reboot athletes
 * when linking a CatchBarrels user to a Reboot profile.
 * 
 * TODO: Implement or derive from sessions
 */
export async function fetchRebootAthletes(): Promise<
  Array<{ id: string; name: string; email?: string }>
> {
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error('Reboot API not configured');
  }

  // TODO: Implement
  // Option 1: If Reboot has an /athletes endpoint, use that
  // Option 2: Fetch all sessions and extract unique athletes

  throw new Error('fetchRebootAthletes not implemented');
}
