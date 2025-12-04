import type { JointPoint, JointFrame } from "./types";

/**
 * Compute the height of a skeleton (pelvis to head)
 * @param joints - Dictionary of joint points by name
 * @returns Height as a normalized distance
 */
function computeHeight(joints: Record<string, JointPoint>): number {
  const pelvis = joints["pelvis"] ?? joints["mid_hip"] ?? joints["left_hip"] ?? joints["right_hip"];
  const head = joints["head_top"] ?? joints["nose"] ?? joints["left_eye"] ?? joints["right_eye"];
  
  if (!pelvis || !head) return 1;
  
  const dx = head.x - pelvis.x;
  const dy = head.y - pelvis.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Scale model skeleton to match player's body size
 * @param playerJoints - Player's joint points
 * @param modelJoints - Model's joint points to be scaled
 * @returns Scaled model joints positioned to match player
 */
export function scaleModelToPlayer(
  playerJoints: JointPoint[],
  modelJoints: JointPoint[]
): JointPoint[] {
  // Convert arrays to dictionaries for easier lookup
  const p: Record<string, JointPoint> = {};
  const m: Record<string, JointPoint> = {};
  
  for (const j of playerJoints) p[j.name] = j;
  for (const j of modelJoints) m[j.name] = j;

  // Find pelvis reference points
  const pPelvis = p["pelvis"] ?? p["mid_hip"] ?? p["left_hip"] ?? p["right_hip"];
  const mPelvis = m["pelvis"] ?? m["mid_hip"] ?? m["left_hip"] ?? m["right_hip"];
  
  if (!pPelvis || !mPelvis) {
    console.warn('[scaleModelToPlayer] Missing pelvis reference points');
    return [];
  }

  // Compute scale factor based on body height
  const pH = computeHeight(p);
  const mH = computeHeight(m);
  const scale = mH > 0 ? pH / mH : 1;

  // Scale and translate all model joints
  return modelJoints.map((mj) => {
    // Vector from model pelvis to joint
    const vx = mj.x - mPelvis.x;
    const vy = mj.y - mPelvis.y;
    
    // Scale and translate to player's pelvis position
    return {
      ...mj,
      x: pPelvis.x + vx * scale,
      y: pPelvis.y + vy * scale,
      confidence: mj.confidence,
    };
  });
}

/**
 * Find the closest frame to a given timestamp
 * @param frames - Array of joint frames
 * @param tMs - Timestamp in milliseconds
 * @returns The closest frame
 */
export function findFrame(
  frames: JointFrame[],
  tMs: number
): JointFrame {
  if (frames.length === 0) {
    return { timestamp: 0, joints: [] };
  }
  
  let best = frames[0];
  let bestDiff = Math.abs(frames[0].timestamp - tMs);
  
  for (const f of frames) {
    const diff = Math.abs(f.timestamp - tMs);
    if (diff < bestDiff) {
      best = f;
      bestDiff = diff;
    }
  }
  
  return best;
}

/**
 * Draw skeleton connections between joints
 * @param ctx - Canvas context
 * @param joints - Dictionary of joint points
 * @param color - Line color
 * @param lineWidth - Line thickness
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  joints: Record<string, JointPoint>,
  color: string,
  lineWidth: number = 2
) {
  // Define skeleton connections (pairs of joint names)
  const connections: [string, string][] = [
    // Torso
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    
    // Left arm
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    
    // Right arm
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    
    // Left leg
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    
    // Right leg
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
    
    // Head/neck
    ['nose', 'left_shoulder'],
    ['nose', 'right_shoulder'],
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  // Draw connections
  for (const [joint1Name, joint2Name] of connections) {
    const joint1 = joints[joint1Name];
    const joint2 = joints[joint2Name];
    
    if (joint1 && joint2 && joint1.confidence > 0.3 && joint2.confidence > 0.3) {
      ctx.beginPath();
      ctx.moveTo(joint1.x, joint1.y);
      ctx.lineTo(joint2.x, joint2.y);
      ctx.stroke();
    }
  }
}
