// app/assessments/52-pitch/run/page.tsx
// 52 Pitch Flow Assessment - Coach-facing UI
// Version: 1.0
// Date: November 26, 2025

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type DeviceFlags = {
  useKinetrax: boolean;
  useHitTrax: boolean;
  useSensor: boolean;
  useNeuralTest: boolean;
};

const defaultDevices: DeviceFlags = {
  useKinetrax: true,
  useHitTrax: true,
  useSensor: true,
  useNeuralTest: true,
};

const TOTAL_SWINGS = 52;

export default function Run52PitchAssessmentPage() {
  const router = useRouter();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [devices, setDevices] = useState<DeviceFlags>(defaultDevices);
  const [swingsCompleted, setSwingsCompleted] = useState<number>(0);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const progressPct = Math.min(100, (swingsCompleted / TOTAL_SWINGS) * 100);

  function toggleDevice(key: keyof DeviceFlags) {
    setDevices(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleStart() {
    if (!selectedPlayerId) {
      alert('Select a player first.');
      return;
    }

    setIsLoading(true);

    // Call your backend to create an assessment session
    try {
      const res = await fetch('/api/assessments/52-pitch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          devices,
        }),
      });

      if (!res.ok) throw new Error('Failed to start assessment');

      const data = await res.json();
      setSessionId(data.sessionId);
      setSwingsCompleted(0);
      setInProgress(true);
    } catch (err) {
      console.error(err);
      alert('Could not start assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkSwing() {
    if (!inProgress || !sessionId) return;

    const newCount = Math.min(TOTAL_SWINGS, swingsCompleted + 1);
    setSwingsCompleted(newCount);

    // Optionally notify backend that a swing was recorded
    try {
      await fetch(`/api/assessments/52-pitch/${sessionId}/swing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: newCount }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleComplete() {
    if (!sessionId) return;
    if (swingsCompleted < TOTAL_SWINGS) {
      const confirmEarly = confirm(
        `You only logged ${swingsCompleted}/${TOTAL_SWINGS} swings. Complete anyway?`
      );
      if (!confirmEarly) return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/assessments/52-pitch/${sessionId}/complete`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to complete assessment');

      const data = await res.json();
      setInProgress(false);
      alert('Assessment complete. Scoring & report will be generated.');
      
      // Navigate to the report page
      if (data.reportId) {
        router.push(`/assessments/52-pitch/${sessionId}/report`);
      }
    } catch (err) {
      console.error(err);
      alert('Could not complete assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-barrels-gold to-barrels-gold-light bg-clip-text text-transparent">
              52 Pitch Flow Assessment
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tag this session as an official assessment, log 52 swings, and let BARRELS
              auto-generate the Momentum Transfer report.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Status</p>
            <p className="font-medium text-barrels-gold">
              {inProgress ? 'In Progress' : 'Not Started'}
            </p>
          </div>
        </motion.header>

        {/* Player + devices card */}
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-3 text-barrels-gold">Player</h2>
            {/* For now, simple select. You'll replace with your player search. */}
            <select
              className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-barrels-gold focus:outline-none focus:ring-2 focus:ring-barrels-gold/20 transition-all"
              value={selectedPlayerId}
              onChange={e => setSelectedPlayerId(e.target.value)}
              disabled={inProgress || isLoading}
            >
              <option value="">Select player...</option>
              <option value="player_tiny">Tiny (Pro)</option>
              <option value="player_teen01">Jalen (14U)</option>
              {/* TODO: populate from real roster */}
            </select>
            <p className="mt-3 text-xs text-slate-500">
              Once started, this session is tagged as an official assessment for this player.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-3 text-barrels-gold">Devices in Use</h2>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Motion (Kinetrax / single-cam)</span>
                <input
                  type="checkbox"
                  checked={devices.useKinetrax}
                  onChange={() => toggleDevice('useKinetrax')}
                  disabled={inProgress || isLoading}
                  className="form-checkbox h-4 w-4 text-barrels-gold rounded focus:ring-barrels-gold border-slate-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Ball Data (HitTrax / similar)</span>
                <input
                  type="checkbox"
                  checked={devices.useHitTrax}
                  onChange={() => toggleDevice('useHitTrax')}
                  disabled={inProgress || isLoading}
                  className="form-checkbox h-4 w-4 text-barrels-gold rounded focus:ring-barrels-gold border-slate-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Bat Sensor (DK / Stack / etc.)</span>
                <input
                  type="checkbox"
                  checked={devices.useSensor}
                  onChange={() => toggleDevice('useSensor')}
                  disabled={inProgress || isLoading}
                  className="form-checkbox h-4 w-4 text-barrels-gold rounded focus:ring-barrels-gold border-slate-600"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Neural / Vision Test</span>
                <input
                  type="checkbox"
                  checked={devices.useNeuralTest}
                  onChange={() => toggleDevice('useNeuralTest')}
                  disabled={inProgress || isLoading}
                  className="form-checkbox h-4 w-4 text-barrels-gold rounded focus:ring-barrels-gold border-slate-600"
                />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Progress + controls */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-barrels-gold">
                Swings Logged: {swingsCompleted} / {TOTAL_SWINGS}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Each ball in play, miss, or foul in this block is part of the Flow Assessment.
              </p>
            </div>
            <div className="flex gap-3">
              {!inProgress ? (
                <button
                  className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black hover:shadow-lg hover:shadow-barrels-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={handleStart}
                  disabled={!selectedPlayerId || isLoading}
                >
                  {isLoading ? 'Starting...' : 'Start Assessment'}
                </button>
              ) : (
                <button
                  className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-40 transition-all"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Completing...' : 'Complete Assessment'}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-3 bg-gradient-to-r from-barrels-gold to-barrels-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Swing logging controls (coach taps if auto-hook isn't wired yet) */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              If your systems are not auto-connected yet, tap &ldquo;Log Swing&rdquo; every
              time the hitter finishes a swing in this 52-pitch test.
            </p>
            <button
              className="px-4 py-2 rounded-xl text-xs font-medium border border-barrels-gold/30 hover:bg-barrels-gold/10 hover:border-barrels-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={handleMarkSwing}
              disabled={!inProgress}
            >
              Log Swing
            </button>
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold mb-2 text-barrels-gold">How this works</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            This session is tagged as a <span className="font-semibold text-barrels-gold">52 Pitch Flow Assessment</span>. 
            Once complete, BARRELS will process the motion, ball, bat, and (optionally) neural data to 
            generate a full Momentum Transfer Report for this hitter. That report lives in the player 
            profile and can be shared with families.
          </p>
        </motion.div>

        {/* Back button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-400 hover:text-barrels-gold transition-colors"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
