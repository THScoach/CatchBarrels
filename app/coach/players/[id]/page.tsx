// app/coach/players/[id]/page.tsx
// Player Detail Page with Tabs
// Version: 1.0
// Date: November 26, 2025

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { CoachLayout } from '@/components/coach/coach-layout';

type TabType = 'summary' | 'assessments' | 'sessions' | 'videos' | 'notes';

export default function CoachPlayerDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // TODO: Fetch real player data
  const mockPlayer = {
    id: params.id,
    firstName: 'Jalen',
    lastName: 'Brown',
    age: 14,
    level: 'Youth',
    momentumTransferScore: 78,
    weakestFlowLane: 'Ground Flow',
    band: 'Above Average',
  };

  const tabs: { value: TabType; label: string }[] = [
    { value: 'summary', label: 'Summary' },
    { value: 'assessments', label: 'Assessments' },
    { value: 'sessions', label: 'Sessions & Swings' },
    { value: 'videos', label: 'Video & Clips' },
    { value: 'notes', label: 'Notes & Plans' },
  ];

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/coach/players">
          <motion.div
            className="flex items-center gap-2 text-slate-400 hover:text-barrels-gold transition-colors cursor-pointer w-fit"
            whileHover={{ x: -4 }}
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back to Roster</span>
          </motion.div>
        </Link>

        {/* Player Header */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-barrels-gold">
            {mockPlayer.firstName} {mockPlayer.lastName}
          </h1>
          <p className="text-slate-400 mt-1">
            {mockPlayer.age} yrs • {mockPlayer.level}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? 'border-barrels-gold text-barrels-gold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">
                  Momentum Transfer
                </h3>
                <p className="text-4xl font-bold text-barrels-gold">
                  {mockPlayer.momentumTransferScore}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {mockPlayer.band} • Weakest: {mockPlayer.weakestFlowLane}
                </p>
              </div>

              {/* AI Insights (Stub) */}
              <div className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/5 border border-barrels-gold/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-barrels-gold mb-3">
                  Coach Rick AI
                </h3>
                <p className="text-sm text-slate-300">
                  This player's timing has improved over the last 3 weeks. Focus on
                  maintaining ground flow consistency.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  TODO: Integrate with DeepAgent AI
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'assessments' && (
          <motion.div
            key="assessments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Assessment History
              </h3>
              <p className="text-sm text-slate-400">
                TODO: List all assessments for this player with filters and links to reports.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Sessions & Swings
              </h3>
              <p className="text-sm text-slate-400">
                TODO: Show training sessions with metrics and swing breakdowns.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Video & Clips
              </h3>
              <p className="text-sm text-slate-400">
                TODO: Grid of video clips with "Open in Film Room" buttons.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Notes & Plans
              </h3>
              <textarea
                placeholder="Add coaching notes for this player..."
                className="w-full p-3 bg-slate-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
                rows={6}
              />
              <button className="mt-3 px-4 py-2 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black rounded-xl text-sm font-medium hover:shadow-lg">
                Save Notes
              </button>
              <p className="text-xs text-slate-500 mt-3">
                TODO: Implement notes persistence and templates.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </CoachLayout>
  );
}
