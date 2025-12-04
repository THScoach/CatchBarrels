"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BrainGoNoGoTrialScript } from "@/lib/brain/types";
import { Loader2 } from "lucide-react";

type Phase = "intro" | "countdown" | "trial" | "done";

export default function BrainGoNoGoPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [script, setScript] = useState<BrainGoNoGoTrialScript | null>(null);
  const [trialIndex, setTrialIndex] = useState(0);
  const [stimVisible, setStimVisible] = useState(false);
  const [stimStartTime, setStimStartTime] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "trial" || !script || responded) return;
      
      const current = script.trials[trialIndex];
      
      if (!stimVisible || stimStartTime == null) {
        // Early / false start - treat as incorrect
        handleResponse(false, null, { key: e.key, early: true });
        return;
      }
      
      const isSwingKey = e.key === " " || e.key === "ArrowUp";
      const shouldSwing = current.isSwingPitch;
      const isCorrect = (isSwingKey && shouldSwing) || (!isSwingKey && !shouldSwing);
      const reactionMs = Math.round(performance.now() - stimStartTime);
      
      handleResponse(isCorrect, reactionMs, { key: e.key, early: false });
    }
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, script, trialIndex, stimVisible, stimStartTime, responded]);

  async function startTest() {
    setLoading(true);
    try {
      const res = await fetch("/api/brain-test/go-no-go/start", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start test");
      
      const json = await res.json();
      setSessionId(json.sessionId);
      setScript(json.script);
      setLoading(false);
      setPhase("countdown");
      
      let t = 3;
      setMessage("3");
      const interval = setInterval(() => {
        t -= 1;
        if (t <= 0) {
          clearInterval(interval);
          setMessage("");
          runNextTrial(0, json.script);
        } else {
          setMessage(String(t));
        }
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      alert("Failed to start test: " + err.message);
    }
  }

  function runNextTrial(nextIndex: number, s: BrainGoNoGoTrialScript = script!) {
    if (nextIndex >= s.trials.length) {
      finishTest();
      return;
    }
    
    setPhase("trial");
    setStimVisible(false);
    setStimStartTime(null);
    setResponded(false);
    setTrialIndex(nextIndex);
    
    const current = s.trials[nextIndex];
    
    // Wait for pre-stimulus delay
    setTimeout(() => {
      setStimVisible(true);
      setStimStartTime(performance.now());
      
      // Auto-advance after stimulus window if no response
      setTimeout(() => {
        if (!responded) {
          // No response = incorrect
          handleResponse(false, null, { key: "none", timeout: true });
        }
      }, current.stimWindowMs);
    }, current.preStimDelayMs);
  }

  async function handleResponse(
    isCorrect: boolean,
    reactionMs: number | null,
    response: any
  ) {
    if (!sessionId || !script || responded) return;
    
    setResponded(true);
    setStimVisible(false);
    setStimStartTime(null);

    const current = script.trials[trialIndex];
    
    // Log trial to database (fire and forget)
    fetch("/api/brain-test/go-no-go/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        index: trialIndex,
        stimulus: current,
        response,
        isCorrect,
        reactionMs,
      }),
    }).catch(console.error);

    // Move to next trial after brief pause
    setTimeout(() => {
      const nextIndex = trialIndex + 1;
      if (nextIndex >= script.trials.length) {
        finishTest();
      } else {
        runNextTrial(nextIndex);
      }
    }, 300);
  }

  async function finishTest() {
    if (!sessionId) return;
    
    setPhase("done");
    setMessage("Calculating your Brain Speed score...");
    
    try {
      const res = await fetch("/api/brain-test/go-no-go/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!res.ok) throw new Error("Failed to complete test");
      
      const json = await res.json();
      
      // Redirect back to dashboard with brain test completion flag
      setTimeout(() => {
        router.push("/dashboard/brain?brainTest=done");
      }, 2000);
    } catch (err: any) {
      console.error("Error completing test:", err);
      alert("Test completed but failed to save results. Please try again.");
      router.push("/dashboard/brain");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {phase === "intro" && (
        <div className="max-w-lg text-center space-y-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center">
              <span className="text-4xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">THS Brain Speed</h1>
            <p className="text-barrels-gold text-sm font-semibold">Go / No Go Pitch Challenge</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 text-left space-y-4">
            <h2 className="text-xl font-semibold text-barrels-gold">How It Works</h2>
            <p className="text-gray-300">
              This test measures your reaction speed and pitch recognition.
            </p>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-barrels-gold">•</span>
                <span>When you see <strong className="text-white">"SWING"</strong> (pitch in zone), press <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">SPACE</kbd> or <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">↑</kbd></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-barrels-gold">•</span>
                <span>When you see <strong className="text-white">"TAKE"</strong> (pitch out of zone), do <strong className="text-white">nothing</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-barrels-gold">•</span>
                <span>React as quickly and accurately as possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-barrels-gold">•</span>
                <span>40 pitches total</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={startTest}
            disabled={loading}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black font-bold text-lg disabled:opacity-60 hover:scale-105 transition-transform"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing test...
              </span>
            ) : (
              "Start Test"
            )}
          </button>
        </div>
      )}

      {phase === "countdown" && (
        <div className="text-center">
          <p className="text-gray-400 mb-8 text-lg">Get ready...</p>
          <p className="text-8xl font-bold text-barrels-gold animate-pulse">{message}</p>
        </div>
      )}

      {phase === "trial" && script && (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-gray-400 text-sm">
            Trial {trialIndex + 1} / {script.trials.length}
          </div>
          
          <div className="w-80 h-80 border-2 border-gray-800 rounded-2xl flex items-center justify-center bg-gray-900 relative overflow-hidden">
            {stimVisible ? (
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold animate-pulse ${
                script.trials[trialIndex].isSwingPitch
                  ? "bg-gradient-to-br from-barrels-gold to-barrels-gold-light text-black"
                  : "bg-gradient-to-br from-red-500 to-red-600 text-white"
              }`}>
                {script.trials[trialIndex].isSwingPitch ? "SWING" : "TAKE"}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-3 h-3 bg-gray-700 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="text-gray-600 text-sm">Focus...</p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 max-w-xs text-center">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">SPACE</kbd> or <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">↑</kbd> on "SWING" • Do nothing on "TAKE"
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          </div>
          <p className="text-lg text-gray-300">{message || "Finishing up..."}</p>
        </div>
      )}
    </div>
  );
}
