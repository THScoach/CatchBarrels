/**
 * Timing Calculations for 52-Pitch Timing Test
 * 
 * Calculates key metrics:
 * - Time to plate (TTC): How long ball takes to reach plate
 * - Decision time: Time from release to hips commit (launch)
 * - Buffer: Remaining time when player commits
 * - Swing time: Time from launch to contact
 */

interface TimingInput {
  machineDistanceFt: number;
  machineSpeedMph: number;
  videoFps: number;
  frameRelease?: number;
  frameLaunch?: number;
  frameContact?: number;
}

interface TimingMetrics {
  timeToPlatMs: number | null;
  decisionTimeMs: number | null;
  bufferMs: number | null;
  swingTimeMs: number | null;
}

/**
 * Calculate all timing metrics for a single pitch
 */
export function calculateTimingMetrics(input: TimingInput): TimingMetrics {
  const { machineDistanceFt, machineSpeedMph, videoFps, frameRelease, frameLaunch, frameContact } = input;

  // Calculate time to plate (ms)
  // Formula: (distance in feet / speed in fps) * 1000
  // Convert mph to fps: mph * 1.467
  const speedFps = machineSpeedMph * 1.467;
  const timeToPlatMs = (machineDistanceFt / speedFps) * 1000;

  // Calculate decision time (ms)
  // Time from ball release to hips commit (launch)
  let decisionTimeMs: number | null = null;
  if (frameRelease !== undefined && frameLaunch !== undefined) {
    const frameDiff = frameLaunch - frameRelease;
    decisionTimeMs = (frameDiff / videoFps) * 1000;
  }

  // Calculate buffer (ms)
  // Time remaining when player commits
  let bufferMs: number | null = null;
  if (decisionTimeMs !== null) {
    bufferMs = timeToPlatMs - decisionTimeMs;
  }

  // Calculate swing time (ms)
  // Time from launch to contact
  let swingTimeMs: number | null = null;
  if (frameLaunch !== undefined && frameContact !== undefined) {
    const frameDiff = frameContact - frameLaunch;
    swingTimeMs = (frameDiff / videoFps) * 1000;
  }

  return {
    timeToPlatMs: Number(timeToPlatMs.toFixed(2)),
    decisionTimeMs: decisionTimeMs !== null ? Number(decisionTimeMs.toFixed(2)) : null,
    bufferMs: bufferMs !== null ? Number(bufferMs.toFixed(2)) : null,
    swingTimeMs: swingTimeMs !== null ? Number(swingTimeMs.toFixed(2)) : null,
  };
}

/**
 * Calculate suggested machine speed for desired game-equivalent speed
 * Based on distance adjustment
 * 
 * @param gameSpeed - Desired game-equivalent speed (e.g., 90 mph)
 * @param machineDist - Machine distance (e.g., 30 ft)
 * @param gameDist - Regulation distance (60.5 ft for MLB)
 * @returns Suggested machine speed in mph
 */
export function calculateMachineSpeed(gameSpeed: number, machineDist: number, gameDist: number = 60.5): number {
  // Formula: machine_speed = game_speed * (machine_dist / game_dist)
  const machineSpeed = gameSpeed * (machineDist / gameDist);
  return Number(machineSpeed.toFixed(1));
}

/**
 * Get suggested machine speeds for common game-equivalent speeds at 30ft
 */
export const MACHINE_SPEED_LOOKUP_30FT = {
  90: 44.6, // 90 mph game speed
  80: 39.7, // 80 mph game speed
  70: 34.7, // 70 mph game speed
};

/**
 * Get suggested machine speeds for common game-equivalent speeds at 35ft
 */
export const MACHINE_SPEED_LOOKUP_35FT = {
  90: 52.1, // 90 mph game speed
  80: 46.3, // 80 mph game speed
  70: 40.5, // 70 mph game speed
};

/**
 * Calculate time to contact (TTC) for a given speed and distance
 * Used for determining ideal TTC to match game conditions
 */
export function calculateTTC(distanceFt: number, speedMph: number): number {
  const speedFps = speedMph * 1.467;
  return (distanceFt / speedFps) * 1000; // in milliseconds
}

/**
 * Validate timing input data
 */
export function validateTimingInput(input: Partial<TimingInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.machineDistanceFt || input.machineDistanceFt < 20 || input.machineDistanceFt > 60) {
    errors.push('Machine distance must be between 20-60 feet');
  }

  if (!input.machineSpeedMph || input.machineSpeedMph < 20 || input.machineSpeedMph > 100) {
    errors.push('Machine speed must be between 20-100 mph');
  }

  if (!input.videoFps || input.videoFps < 30 || input.videoFps > 300) {
    errors.push('Video FPS must be between 30-300');
  }

  if (input.frameRelease !== undefined && input.frameLaunch !== undefined) {
    if (input.frameLaunch <= input.frameRelease) {
      errors.push('Launch frame must be after release frame');
    }
  }

  if (input.frameLaunch !== undefined && input.frameContact !== undefined) {
    if (input.frameContact <= input.frameLaunch) {
      errors.push('Contact frame must be after launch frame');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
