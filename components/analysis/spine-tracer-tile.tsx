'use client';

import { Card } from '@/components/ui/card';

/**
 * Spine & Motion Tracer Tile (Dr. Kwon style)
 * 
 * Shows how the upper body/spine moves through the swing:
 * - Load → shift → rotate
 * - Spine tilt control
 * - Anchor/Engine connection
 * 
 * For v1, this is a placeholder with graph area and explanatory text.
 * Later, will display actual tracer data from skeleton overlay.
 */
export function SpineTracerTile() {
  return (
    <Card className="bg-gray-800/50 border-gray-700 p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
            Spine & Motion Tracer
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            How your body loads, shifts, and rotates through the swing
          </p>
        </div>
      </div>

      {/* Graph placeholder */}
      <div className="rounded-xl border border-gray-700 bg-black/60 h-40 md:h-48 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl">📊</div>
          <p className="text-xs text-gray-400">Motion tracer graph will appear here</p>
        </div>
      </div>

      {/* Kwon-style notes (simple for now) */}
      <div className="space-y-3 text-sm text-gray-300">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">
            Load & Shift
          </p>
          <p className="text-sm">
            This shows how your upper body moves from load into your stride.
            Too much sway toward the pitcher or catcher means you lose your
            Anchor before you rotate.
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">
            Rotation & Spine Tilt
          </p>
          <p className="text-sm">
            We want your spine angle to stay stable while the hips and torso
            turn. Big changes in tilt here mean you're "standing up" or
            "dumping" your posture during the swing.
          </p>
        </div>
      </div>
    </Card>
  );
}
