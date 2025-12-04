// app/coach/players/page.tsx
// Roster List Page
// Version: 1.0
// Date: November 26, 2025

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { CoachLayout } from '@/components/coach/coach-layout';
import type { CoachPlayer, FlowLane } from '@/types/coach';

// TODO: Replace with real data from API
const mockPlayers: CoachPlayer[] = [
  {
    id: 'p1',
    firstName: 'Jalen',
    lastName: 'Brown',
    age: 14,
    level: 'Youth',
    handedness: 'R',
    bats: 'R',
    throws: 'R',
    lastAssessmentDate: '2025-11-24',
    momentumTransferScore: 78,
    weakestFlowLane: 'groundFlow',
    band: 'Above Average',
    programId: 'prog1',
    activeFlags: [
      {
        id: 'f1',
        playerId: 'p1',
        type: 'GROUND_LEAK',
        severity: 'medium',
        firstSeen: '2025-11-20',
        lastUpdated: '2025-11-24',
        summary: 'Inconsistent weight transfer',
        resolved: false,
      },
    ],
  },
  {
    id: 'p2',
    firstName: 'Marcus',
    lastName: 'Davis',
    age: 16,
    level: 'HS',
    handedness: 'L',
    bats: 'L',
    throws: 'L',
    lastAssessmentDate: '2025-11-23',
    momentumTransferScore: 85,
    weakestFlowLane: 'powerFlow',
    band: 'Advanced',
    programId: 'prog1',
  },
  {
    id: 'p3',
    firstName: 'Tyler',
    lastName: 'Chen',
    age: 15,
    level: 'HS',
    handedness: 'R',
    bats: 'R',
    throws: 'R',
    lastAssessmentDate: '2025-11-22',
    momentumTransferScore: 68,
    weakestFlowLane: 'groundFlow',
    band: 'Average',
    programId: 'prog1',
  },
  {
    id: 'p4',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    age: 17,
    level: 'HS',
    handedness: 'R',
    bats: 'R',
    throws: 'R',
    lastAssessmentDate: '2025-11-21',
    momentumTransferScore: 82,
    weakestFlowLane: 'barrelFlow',
    band: 'Advanced',
    programId: 'prog1',
  },
];

export default function CoachPlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterFlowLane, setFilterFlowLane] = useState<string>('all');
  const [filterBand, setFilterBand] = useState<string>('all');

  // Filter players
  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch =
      `${player.firstName} ${player.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || player.level === filterLevel;
    const matchesFlowLane =
      filterFlowLane === 'all' || player.weakestFlowLane === filterFlowLane;
    const matchesBand = filterBand === 'all' || player.band === filterBand;

    return matchesSearch && matchesLevel && matchesFlowLane && matchesBand;
  });

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-barrels-gold">Roster & Profiles</h1>
          <p className="text-slate-400 mt-1">
            {filteredPlayers.length} players in your program
          </p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
              />
            </div>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
            >
              <option value="all">All Levels</option>
              <option value="Youth">Youth</option>
              <option value="HS">High School</option>
              <option value="College">College</option>
              <option value="Pro">Pro</option>
            </select>

            {/* Flow Lane Filter */}
            <select
              value={filterFlowLane}
              onChange={(e) => setFilterFlowLane(e.target.value)}
              className="px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
            >
              <option value="all">All Flow Lanes</option>
              <option value="groundFlow">Ground Flow</option>
              <option value="powerFlow">Power Flow</option>
              <option value="barrelFlow">Barrel Flow</option>
            </select>

            {/* Band Filter */}
            <select
              value={filterBand}
              onChange={(e) => setFilterBand(e.target.value)}
              className="px-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
            >
              <option value="all">All Bands</option>
              <option value="Elite">Elite</option>
              <option value="Advanced">Advanced</option>
              <option value="Above Average">Above Average</option>
              <option value="Average">Average</option>
              <option value="Below Average">Below Average</option>
            </select>
          </div>
        </motion.div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
            >
              <Link href={`/coach/players/${player.id}`}>
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6 hover:border-barrels-gold/50 transition-all cursor-pointer group">
                  {/* Player Name */}
                  <h3 className="text-lg font-semibold text-slate-200 group-hover:text-barrels-gold transition-colors">
                    {player.firstName} {player.lastName}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {player.age} yrs • {player.level} • {player.bats}/{player.throws}
                  </p>

                  {/* Score Badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Momentum Transfer</p>
                      <p className="text-2xl font-bold text-barrels-gold">
                        {player.momentumTransferScore || '--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Band</p>
                      <p className="text-sm font-medium text-slate-300">
                        {player.band || '--'}
                      </p>
                    </div>
                  </div>

                  {/* Weakest Flow Lane */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Weakest Flow</p>
                    <p className="text-sm font-medium text-slate-300 capitalize">
                      {player.weakestFlowLane
                        ?.replace(/([A-Z])/g, ' $1')
                        .trim() || '--'}
                    </p>
                  </div>

                  {/* Flags */}
                  {player.activeFlags && player.activeFlags.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">
                        {player.activeFlags.length} flag(s)
                      </span>
                    </div>
                  )}

                  {/* Last Assessment Date */}
                  <p className="text-xs text-slate-500 mt-4">
                    Last assessment:{' '}
                    {player.lastAssessmentDate
                      ? new Date(player.lastAssessmentDate).toLocaleDateString()
                      : 'None'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-slate-400">No players found matching your filters.</p>
          </motion.div>
        )}
      </div>
    </CoachLayout>
  );
}
