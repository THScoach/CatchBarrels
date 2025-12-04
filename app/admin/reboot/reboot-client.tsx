'use client';

/**
 * Reboot Motion Data Client Component
 * 
 * Displays Reboot session data with:
 * - Sync button to fetch latest from Reboot API
 * - Summary stats by level (MLB, Pro, College, HS, Youth)
 * - Table of sessions with expandable detail drawer
 * - Search/filter by athlete name, level, date
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Database,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronRight,
  Calendar,
  User,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RebootSession {
  id: string;
  rebootSessionId: string;
  rebootAthleteId: string | null;
  athleteName: string | null;
  athleteEmail: string | null;
  level: string | null;
  sessionType: string; // "HITTING", "PITCHING", or "OTHER"
  teamTag: string | null;
  swingDate: Date | null;
  metrics: any; // JSON payload
  createdAt: Date;
  updatedAt: Date;
}

interface RebootStats {
  total: number;
  mlb: number;
  pro: number;
  college: number;
  hs: number;
  youth: number;
}

interface Props {
  sessions: RebootSession[];
  stats: RebootStats;
}

export default function RebootClient({ sessions, stats }: Props) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('HITTING'); // Default to HITTING
  const [selectedSession, setSelectedSession] = useState<RebootSession | null>(null);

  // Handle sync from Reboot API
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/reboot/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      toast.success(
        `Synced ${data.inserted + data.updated} sessions (${data.inserted} new, ${data.updated} updated)`
      );
      router.refresh();
    } catch (error: any) {
      console.error('[Reboot Sync] Error:', error);
      toast.error(error.message || 'Failed to sync Reboot data');
    } finally {
      setSyncing(false);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      !searchTerm ||
      session.athleteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.rebootAthleteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.teamTag?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = selectedLevel === 'all' || session.level === selectedLevel;
    
    const matchesSessionType = 
      selectedSessionType === 'ALL' || 
      session.sessionType === selectedSessionType;

    return matchesSearch && matchesLevel && matchesSessionType;
  });

  // Level badge color
  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'MLB':
        return 'bg-purple-600';
      case 'Pro':
        return 'bg-purple-500';
      case 'College':
        return 'bg-blue-500';
      case 'HS':
        return 'bg-green-500';
      case 'Youth':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Reboot Motion Data</h1>
            <p className="text-sm text-gray-400">MLB + Amateur Swing Database</p>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Reboot'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </CardContent>
        </Card>

        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-400">{stats.mlb}</div>
            <div className="text-sm text-gray-400">MLB</div>
          </CardContent>
        </Card>

        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-400">{stats.pro}</div>
            <div className="text-sm text-gray-400">Pro</div>
          </CardContent>
        </Card>

        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">{stats.college}</div>
            <div className="text-sm text-gray-400">College</div>
          </CardContent>
        </Card>

        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-400">{stats.hs}</div>
            <div className="text-sm text-gray-400">High School</div>
          </CardContent>
        </Card>

        <Card className="bg-barrels-black-light border-gray-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-400">{stats.youth}</div>
            <div className="text-sm text-gray-400">Youth</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-barrels-black-light border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by athlete name, ID, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-barrels-black border-gray-700 text-white"
              />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="pl-10 pr-4 py-2 bg-barrels-black border border-gray-700 text-white rounded-md appearance-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="MLB">MLB</option>
                <option value="Pro">Pro</option>
                <option value="College">College</option>
                <option value="HS">High School</option>
                <option value="Youth">Youth</option>
              </select>
            </div>
            
            {/* Session Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedSessionType}
                onChange={(e) => setSelectedSessionType(e.target.value)}
                className="pl-10 pr-4 py-2 bg-barrels-black border border-gray-700 text-white rounded-md appearance-none cursor-pointer"
              >
                <option value="HITTING">Hitting</option>
                <option value="PITCHING">Pitching</option>
                <option value="ALL">All Types</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="bg-barrels-black-light border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-400" />
            Reboot Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {sessions.length === 0
                ? 'No Reboot data yet. Click "Sync from Reboot" to import.'
                : 'No sessions match your filters.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSession(session)}
                  className="flex items-center justify-between p-4 bg-barrels-black hover:bg-gray-900 border border-gray-800 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`${getLevelColor(session.level)} text-white`}>
                        {session.level || 'Unknown'}
                      </Badge>
                      <Badge className={`${
                        session.sessionType === 'HITTING' 
                          ? 'bg-emerald-600' 
                          : session.sessionType === 'PITCHING' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-600'
                      } text-white`}>
                        {session.sessionType}
                      </Badge>
                      <span className="font-medium text-white">
                        {session.athleteName || 'Unknown Athlete'}
                      </span>
                      {session.teamTag && (
                        <span className="text-sm text-gray-400">• {session.teamTag}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      {session.swingDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.swingDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      {session.rebootAthleteId && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          ID: {session.rebootAthleteId}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedSession && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-barrels-black-light border-l border-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Session Details</h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Basic Info */}
                <Card className="bg-barrels-black border-gray-800">
                  <CardContent className="pt-6 space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Athlete Name</div>
                      <div className="text-white font-medium">
                        {selectedSession.athleteName || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <Badge className={`${getLevelColor(selectedSession.level)} text-white`}>
                        {selectedSession.level || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Session Type</div>
                      <Badge className={`${
                        selectedSession.sessionType === 'HITTING' 
                          ? 'bg-emerald-600' 
                          : selectedSession.sessionType === 'PITCHING' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-600'
                      } text-white`}>
                        {selectedSession.sessionType}
                      </Badge>
                    </div>
                    {selectedSession.teamTag && (
                      <div>
                        <div className="text-sm text-gray-400">Team</div>
                        <div className="text-white">{selectedSession.teamTag}</div>
                      </div>
                    )}
                    {selectedSession.swingDate && (
                      <div>
                        <div className="text-sm text-gray-400">Swing Date</div>
                        <div className="text-white">
                          {format(new Date(selectedSession.swingDate), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-400">Reboot Session ID</div>
                      <div className="text-white font-mono text-sm">
                        {selectedSession.rebootSessionId}
                      </div>
                    </div>
                    {selectedSession.rebootAthleteId && (
                      <div>
                        <div className="text-sm text-gray-400">Reboot Athlete ID</div>
                        <div className="text-white font-mono text-sm">
                          {selectedSession.rebootAthleteId}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metrics JSON */}
                <Card className="bg-barrels-black border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Metrics (JSON)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-gray-300 overflow-x-auto p-4 bg-black rounded-lg border border-gray-800">
                      {JSON.stringify(selectedSession.metrics, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
