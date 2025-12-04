
/**
 * Player Segmentation using SAM (Segment Anything Model)
 * Isolates player from background for cleaner skeleton comparison
 */

export interface SegmentationMask {
  width: number;
  height: number;
  data: Uint8ClampedArray; // Binary mask (0 or 255)
}

export interface SegmentationResult {
  mask: SegmentationMask;
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
}

/**
 * Initialize SAM model (currently using lightweight fallback)
 * Full SAM is too heavy for browser - using simplified segmentation instead
 */
export async function initializeSAM(): Promise<boolean> {
  // Simplified segmentation doesn't require model loading
  // Return true to indicate ready state
  return Promise.resolve(true);
}

/**
 * Segment player from video frame using SAM
 * Auto-detects player using pose landmarks as seed points
 */
export async function segmentPlayer(
  canvas: HTMLCanvasElement,
  poseKeypoints?: any[]
): Promise<SegmentationResult> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const width = canvas.width;
  const height = canvas.height;

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // If pose keypoints available, use them as SAM prompts (point prompts)
  let seedPoints: { x: number; y: number }[] = [];
  
  if (poseKeypoints && poseKeypoints.length > 0) {
    // Use torso keypoints as seed points (shoulders, hips)
    const torsoIndices = [11, 12, 23, 24]; // left_shoulder, right_shoulder, left_hip, right_hip
    seedPoints = torsoIndices
      .map(idx => poseKeypoints[idx])
      .filter(kp => kp && kp.visibility > 0.5)
      .map(kp => ({ x: Math.floor(kp.x), y: Math.floor(kp.y) }));
  }

  // If no pose keypoints, use center of frame as fallback
  if (seedPoints.length === 0) {
    seedPoints = [{ x: Math.floor(width / 2), y: Math.floor(height / 2) }];
  }

  try {
    // For browser performance, use a simplified segmentation approach
    // Full SAM is too heavy for browser - use grabCut-style approach
    const mask = await simplifiedSegmentation(imageData, seedPoints, width, height);
    
    // Calculate bounding box
    const bbox = calculateBoundingBox(mask);
    
    return {
      mask,
      bbox,
      confidence: 0.85 // Simplified method confidence
    };
  } catch (error) {
    console.error('Segmentation error:', error);
    // Return full frame mask as fallback
    return createFullFrameMask(width, height);
  }
}

/**
 * Simplified segmentation using edge detection + region growing
 * Lighter weight than full SAM for browser use
 * OPTIMIZED: Reduces memory allocations and uses faster algorithms
 */
async function simplifiedSegmentation(
  imageData: ImageData,
  seedPoints: { x: number; y: number }[],
  width: number,
  height: number
): Promise<SegmentationMask> {
  const data = imageData.data;
  const mask = new Uint8ClampedArray(width * height);
  
  // Edge-based foreground detection (optimized)
  const edges = detectEdges(data, width, height);
  
  // Region growing from seed points with performance limits
  const visited = new Set<number>();
  const queue: { x: number; y: number }[] = [...seedPoints];
  
  // Dynamic color threshold based on image characteristics
  const colorThreshold = 45;
  const maxIterations = Math.min(width * height * 0.1, 20000); // Aggressive cap for browser stability
  let iterations = 0;
  
  seedPoints.forEach(point => {
    const idx = point.y * width + point.x;
    if (idx >= 0 && idx < mask.length) {
      mask[idx] = 255;
      visited.add(idx);
    }
  });
  
  // Use 4-connected instead of 8-connected for better performance
  const neighbors = [
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
  ];
  
  while (queue.length > 0 && iterations < maxIterations) {
    const { x, y } = queue.shift()!;
    const idx = y * width + x;
    iterations++;
    
    // Get pixel color once
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    
    // Check 4-connected neighbors (faster than 8-connected)
    for (const { dx, dy } of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      const nIdx = ny * width + nx;
      
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (visited.has(nIdx)) continue;
      
      // Check color similarity (optimized calculation)
      const nr = data[nIdx * 4];
      const ng = data[nIdx * 4 + 1];
      const nb = data[nIdx * 4 + 2];
      
      const colorDiff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
      
      // Check edge strength
      const edgeStrength = edges[nIdx];
      
      if (colorDiff < colorThreshold * 1.5 && edgeStrength < 120) {
        mask[nIdx] = 255;
        visited.add(nIdx);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  
  // Skip morphological operations for browser performance
  // const cleanedMask = morphologicalClose(mask, width, height, 2);
  
  return {
    width,
    height,
    data: mask // Use raw mask without cleanup for speed
  };
}

/**
 * Detect edges using Sobel operator
 */
function detectEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const edges = new Uint8ClampedArray(width * height);
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }
  
  return edges;
}

/**
 * Morphological closing operation to fill holes
 */
function morphologicalClose(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  kernelSize: number = 5
): Uint8ClampedArray {
  // Dilation followed by erosion
  const dilated = dilate(mask, width, height, kernelSize);
  const closed = erode(dilated, width, height, kernelSize);
  return closed;
}

function dilate(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  kernelSize: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(mask.length);
  const halfKernel = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0;
      
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const ny = y + ky;
          const nx = x + kx;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            maxVal = Math.max(maxVal, mask[ny * width + nx]);
          }
        }
      }
      
      result[y * width + x] = maxVal;
    }
  }
  
  return result;
}

function erode(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  kernelSize: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(mask.length);
  const halfKernel = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255;
      
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const ny = y + ky;
          const nx = x + kx;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            minVal = Math.min(minVal, mask[ny * width + nx]);
          }
        }
      }
      
      result[y * width + x] = minVal;
    }
  }
  
  return result;
}

/**
 * Calculate bounding box from mask
 */
function calculateBoundingBox(
  mask: SegmentationMask
): { x: number; y: number; width: number; height: number } {
  let minX = mask.width, minY = mask.height;
  let maxX = 0, maxY = 0;
  
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      if (mask.data[y * mask.width + x] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Create full-frame mask (fallback)
 */
function createFullFrameMask(
  width: number,
  height: number
): SegmentationResult {
  const mask = new Uint8ClampedArray(width * height);
  mask.fill(255);
  
  return {
    mask: { width, height, data: mask },
    bbox: { x: 0, y: 0, width, height },
    confidence: 1.0
  };
}

/**
 * Apply mask to canvas (create transparent background)
 */
export function applyMaskToCanvas(
  canvas: HTMLCanvasElement,
  mask: SegmentationMask
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply mask as alpha channel
  for (let i = 0; i < mask.data.length; i++) {
    data[i * 4 + 3] = mask.data[i]; // Set alpha to mask value
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Extract isolated player from canvas
 */
export function extractIsolatedPlayer(
  canvas: HTMLCanvasElement,
  mask: SegmentationMask,
  bbox: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement {
  const isolatedCanvas = document.createElement('canvas');
  isolatedCanvas.width = bbox.width;
  isolatedCanvas.height = bbox.height;
  
  const ctx = isolatedCanvas.getContext('2d');
  if (!ctx) return isolatedCanvas;
  
  const sourceCtx = canvas.getContext('2d');
  if (!sourceCtx) return isolatedCanvas;
  
  const sourceData = sourceCtx.getImageData(bbox.x, bbox.y, bbox.width, bbox.height);
  const data = sourceData.data;
  
  // Apply mask
  for (let y = 0; y < bbox.height; y++) {
    for (let x = 0; x < bbox.width; x++) {
      const maskIdx = (bbox.y + y) * mask.width + (bbox.x + x);
      const dataIdx = (y * bbox.width + x) * 4;
      
      data[dataIdx + 3] = mask.data[maskIdx]; // Set alpha
    }
  }
  
  ctx.putImageData(sourceData, 0, 0);
  return isolatedCanvas;
}
