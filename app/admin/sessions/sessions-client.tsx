'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Video, User, Calendar, BarChart, ChevronRight, GitCompare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Session {
  id: string;
  title: string;
  videoType: string | null;
  analyzed: boolean;
  overallScore: number | null;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  uploadDate: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  };
}

interface SessionsClientProps {
  sessions: Session[];
}

export default function SessionsClient({ sessions }: SessionsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.videoType?.toLowerCase() === filter.toLowerCase();
  });

  const videoTypes = Array.from(new Set(sessions.map((s) => s.videoType).filter(Boolean)));

  const handleCompareToggle = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter((id) => id !== sessionId));
    } else if (selectedSessions.length < 2) {
      setSelectedSessions([...selectedSessions, sessionId]);
    } else {
      toast.error('You can only compare 2 sessions at a time');
    }
  };

  const handleStartComparison = () => {
    if (selectedSessions.length === 2) {
      router.push(`/sessions/compare?left=${selectedSessions[0]}&right=${selectedSessions[1]}`);
    } else {
      toast.error('Please select 2 sessions to compare');
    }
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setSelectedSessions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="text-gray-400 mt-1">
            {sessions.length} analyzed {sessions.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Compare Mode Toggle */}
          {!compareMode ? (
            <Button
              onClick={() => setCompareMode(true)}
              className="bg-purple-400 hover:bg-purple-500 text-black flex items-center gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Compare Swings
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleStartComparison}
                disabled={selectedSessions.length !== 2}
                className="bg-purple-400 hover:bg-purple-500 text-black disabled:opacity-50"
              >
                Compare ({selectedSessions.length}/2)
              </Button>
              <Button
                onClick={handleCancelCompare}
                variant="outline"
                className="bg-black border-gray-700 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Filter Buttons */}
          {!compareMode && (
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === 'all'
                    ? 'bg-[#9D6FDB]/20 text-[#9D6FDB]'
                    : 'bg-black/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                All
              </button>
              {videoTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type || '')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    filter === type
                      ? 'bg-[#9D6FDB]/20 text-[#9D6FDB]'
                      : 'bg-black/50 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#1A1A1A] border border-[#9D6FDB]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-[#9D6FDB]/20">
              <tr>
                {compareMode && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">
                    Select
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Scores
                </th>
                {!compareMode && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#9D6FDB]/10">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={compareMode ? 7 : 6} className="px-6 py-12 text-center">
                    <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No sessions found</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, index) => {
                  const isSelected = selectedSessions.includes(session.id);
                  return (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-[#9D6FDB]/5 transition ${
                        isSelected ? 'bg-[#9D6FDB]/10' : ''
                      }`}
                      onClick={() => compareMode && handleCompareToggle(session.id)}
                      style={{ cursor: compareMode ? 'pointer' : 'default' }}
                    >
                      {compareMode && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCompareToggle(session.id)}
                            className="w-4 h-4 accent-purple-400"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/players/${session.user.id}`}
                          className="text-[#9D6FDB] hover:text-[#B88EE8] transition"
                          onClick={(e) => compareMode && e.preventDefault()}
                        >
                          {session.user.name || session.user.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-white">{session.title || 'Untitled'}</td>
                      <td className="px-6 py-4 text-gray-300">{session.videoType || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {format(new Date(session.uploadDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="text-center">
                            <p className="text-[#9D6FDB] font-bold">{session.overallScore || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">BARREL</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300">{session.anchor || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">A</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300">{session.engine || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">E</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-300">{session.whip || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">W</p>
                          </div>
                        </div>
                      </td>
                      {!compareMode && (
                        <td className="px-6 py-4">
                          <Link
                            href={`/video/${session.id}`}
                            className="inline-flex items-center text-[#9D6FDB] hover:text-[#B88EE8] transition"
                          >
                            View
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
