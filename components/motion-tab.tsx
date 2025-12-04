"use client";

import React, { useRef, useState, useTransition, useEffect } from "react";
import { JointOverlayCanvas } from "@/components/joints/JointOverlayCanvas";
import type { JointDataPayload } from "@/lib/joints/types";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface MotionTabProps {
  videoId: string;
  videoUrl: string;
  initialJointData: JointDataPayload | null;
  jointAnalyzed: boolean;
}

export const MotionTab: React.FC<MotionTabProps> = ({
  videoId,
  videoUrl,
  initialJointData,
  jointAnalyzed,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [data, setData] = useState<JointDataPayload | null>(initialJointData);
  const [analyzed, setAnalyzed] = useState(jointAnalyzed);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Model swing comparison state
  const [modelSwings, setModelSwings] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [modelData, setModelData] = useState<JointDataPayload | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);

  // Fetch available model swings when component mounts
  useEffect(() => {
    async function fetchModelSwings() {
      try {
        const res = await fetch('/api/model-swings');
        if (res.ok) {
          const json = await res.json();
          setModelSwings(json.modelSwings || []);
        }
      } catch (err) {
        console.error('Failed to fetch model swings:', err);
      }
    }
    
    if (analyzed) {
      fetchModelSwings();
    }
  }, [analyzed]);

  // Handle model selection
  const handleModelSelect = async (modelId: string) => {
    setSelectedModelId(modelId);
    
    if (!modelId) {
      setModelData(null);
      return;
    }
    
    setLoadingModel(true);
    try {
      const res = await fetch(`/api/model-swings/${modelId}`);
      if (!res.ok) {
        throw new Error('Failed to load model swing');
      }
      
      const json = await res.json();
      setModelData(json.jointData);
      
      toast.success('Model swing loaded', {
        description: 'Compare your swing with the model',
      });
    } catch (err: any) {
      toast.error('Failed to load model swing', {
        description: err.message,
      });
      setSelectedModelId("");
      setModelData(null);
    } finally {
      setLoadingModel(false);
    }
  };

  const handleAnalyze = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/analyze-motion`, {
          method: "POST",
        });
        
        if (!res.ok) {
          throw new Error("Failed to analyze motion");
        }
        
        const result = await res.json();
        
        // Update state with new joint data
        setData(result.jointData);
        setAnalyzed(true);
        
        toast.success("Motion analysis complete!", {
          description: "Joint overlay is now available",
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } catch (e: any) {
        const errorMsg = e.message || "Failed to analyze motion";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  if (!analyzed) {
    return (
      <div className="space-y-4 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-barrels-gold" />
          <h3 className="text-white text-lg font-semibold">Motion Analysis</h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          This swing has not been motion-analyzed yet. Click below to extract joint data
          and visualize your body mechanics frame-by-frame.
        </p>
        
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-white text-sm font-semibold mb-2">What happens:</h4>
          <ul className="text-gray-400 text-xs space-y-1 ml-4">
            <li>✓ Extract 33 body joints per frame</li>
            <li>✓ Track hips, shoulders, hands, feet</li>
            <li>✓ Visualize movement patterns</li>
            <li>✓ Identify mechanical inefficiencies</li>
          </ul>
        </div>
        
        <Button
          onClick={handleAnalyze}
          disabled={isPending}
          className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black hover:opacity-90 transition-opacity"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Motion...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Analyze Motion (Skeleton)
            </>
          )}
        </Button>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (!data || !data.frames?.length) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No joint data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <CheckCircle2 className="w-6 h-6 text-green-400" />
        <div>
          <h3 className="text-white text-sm font-semibold">Motion Analyzed</h3>
          <p className="text-gray-400 text-xs">Joint overlay is active on the video below</p>
        </div>
      </div>
      
      {/* Model Swing Comparison Selector */}
      {modelSwings.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <label className="block text-white text-sm font-semibold mb-2">
            Compare with Model Swing
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => handleModelSelect(e.target.value)}
            disabled={loadingModel}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-barrels-gold"
          >
            <option value="">No Model (Player Only)</option>
            {modelSwings.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.hitterName ? `- ${model.hitterName}` : ""} 
                {model.handedness ? ` (${model.handedness})` : ""}
              </option>
            ))}
          </select>
          {loadingModel && (
            <p className="text-gray-400 text-xs mt-2">
              <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />
              Loading model swing...
            </p>
          )}
          {selectedModelId && !loadingModel && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-barrels-gold rounded-full"></div>
                <span className="text-gray-300">Your Swing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#89CFF0] rounded-full"></div>
                <span className="text-gray-300">Model Swing</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="relative inline-block bg-gray-900 rounded-lg overflow-hidden w-full">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="rounded-lg w-full"
        />
        <JointOverlayCanvas
          videoRef={videoRef}
          playerData={data.frames}
          modelData={modelData?.frames}
          showModel={!!selectedModelId && !!modelData}
        />
      </div>
      
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400 text-xs">
          <strong className="text-white">Tip:</strong> Gold skeleton shows your swing. 
          {selectedModelId && " Light blue skeleton shows the model swing scaled to your body size."}
          {!selectedModelId && " Select a model swing above to compare with a pro."}
        </p>
      </div>
    </div>
  );
};
