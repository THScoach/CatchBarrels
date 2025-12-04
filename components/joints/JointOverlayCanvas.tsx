"use client";

import React, { useEffect, useRef } from "react";
import type { JointFrame } from "@/lib/joints/types";
import { findFrame, scaleModelToPlayer, drawSkeleton } from "@/lib/joints/compare";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  playerData: JointFrame[];
  modelData?: JointFrame[];
  showModel?: boolean;
}

export const JointOverlayCanvas: React.FC<Props> = ({ 
  videoRef, 
  playerData, 
  modelData, 
  showModel = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas to match video element
  useEffect(() => {
    function syncSize() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [videoRef]);

  // Draw current frame joints whenever video time updates
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || playerData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      if (!ctx || !video || !canvas) return;

      const currentTimeMs = video.currentTime * 1000;

      // Find player frame
      const playerFrame = findFrame(playerData, currentTimeMs);

      // Find and scale model frame if enabled
      let scaledModelJoints: any[] = [];
      if (showModel && modelData && modelData.length > 0) {
        const modelFrame = findFrame(modelData, currentTimeMs);
        scaledModelJoints = scaleModelToPlayer(playerFrame.joints, modelFrame.joints);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Convert joints to dictionary for skeleton drawing
      const playerJointsDict: Record<string, any> = {};
      const modelJointsDict: Record<string, any> = {};

      for (const joint of playerFrame.joints) {
        playerJointsDict[joint.name] = {
          x: joint.x * canvas.width,
          y: joint.y * canvas.height,
          confidence: joint.confidence,
        };
      }

      for (const joint of scaledModelJoints) {
        modelJointsDict[joint.name] = {
          x: joint.x * canvas.width,
          y: joint.y * canvas.height,
          confidence: joint.confidence,
        };
      }

      // Draw model skeleton first (so player overlays on top)
      if (showModel && scaledModelJoints.length > 0) {
        // Draw model skeleton lines
        drawSkeleton(ctx, modelJointsDict, "#89CFF0", 2); // Light blue
        
        // Draw model joints
        ctx.fillStyle = "#89CFF0";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        
        for (const joint of scaledModelJoints) {
          if (joint.confidence > 0.3) {
            const x = joint.x * canvas.width;
            const y = joint.y * canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      // Draw player skeleton
      drawSkeleton(ctx, playerJointsDict, "#E8B14E", 3); // BARRELS gold, thicker
      
      // Draw player joints
      ctx.fillStyle = "#E8B14E";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;

      for (const joint of playerFrame.joints) {
        if (joint.confidence > 0.3) {
          const x = joint.x * canvas.width;
          const y = joint.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Optionally draw joint name for high confidence joints
          if (joint.confidence > 0.7 && !showModel) {
            ctx.fillStyle = "white";
            ctx.font = "10px sans-serif";
            ctx.fillText(joint.name, x + 8, y - 8);
            ctx.fillStyle = "#E8B14E";
          }
        }
      }

      requestAnimationFrame(render);
    }

    const id = requestAnimationFrame(render);
    return () => cancelAnimationFrame(id);
  }, [videoRef, playerData, modelData, showModel]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
};
