'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  FileBarChart,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string | null;
  videoType: string | null;
  overallScore: number | null;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  uploadDate: Date;
  newScoringBreakdown: any;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Player {
  id: string;
  name: string | null;
}

interface ReportsClientProps {
  videos: Video[];
  players: Player[];
}

export default function ReportsClient({ videos, players }: ReportsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Filter videos based on selections
  const filteredVideos = useMemo(() => {
    let filtered = videos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Player filter
    if (selectedPlayer !== 'all') {
      filtered = filtered.filter((v) => v.user.id === selectedPlayer);
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(selectedDateRange);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((v) => new Date(v.uploadDate) >= cutoffDate);
    }

    // Tag filter (video type)
    if (selectedTag !== 'all') {
      filtered = filtered.filter((v) => v.videoType === selectedTag);
    }

    return filtered;
  }, [videos, searchTerm, selectedPlayer, selectedDateRange, selectedTag]);

  // Get weakest flow path from new scoring breakdown
  const getWeakestFlow = (video: Video) => {
    if (!video.newScoringBreakdown || typeof video.newScoringBreakdown !== 'object') {
      return { name: 'Unknown', score: 0 };
    }

    const breakdown = video.newScoringBreakdown as any;
    const categories = breakdown.categoryScores || {};

    const catScores = [
      { name: 'Timing & Rhythm', score: categories.timing || 0 },
      { name: 'Sequence & Braking', score: categories.sequence || 0 },
      { name: 'Stability & Balance', score: categories.stability || 0 },
      { name: 'Directional Barrels', score: categories.directional || 0 },
      { name: 'Posture & Spine', score: categories.posture || 0 },
    ];

    const weakest = catScores.reduce((min, cat) => (cat.score < min.score ? cat : min));
    return { name: weakest.name, score: Math.round(weakest.score) };
  };

  // Get unique video types for tag filter
  const videoTypes = useMemo(() => {
    const types = new Set(videos.map((v) => v.videoType).filter((t): t is string => !!t));
    return Array.from(types).sort();
  }, [videos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-[#9D6FDB]" />
            Video Library & Reports
          </h1>
          <p className="text-gray-400 mt-1">
            Browse and analyze {filteredVideos.length} analyzed sessions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9D6FDB]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Player or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Player Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Player</label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date Range</label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            {/* Tag Filter (Video Type) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Video Type</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Types</option>
                {videoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardContent className="p-0">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No videos found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-[#9D6FDB]/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date / Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Video Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      BARREL Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Weakest Flow
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredVideos.map((video, index) => {
                    const weakest = getWeakestFlow(video);
                    return (
                      <motion.tr
                        key={video.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-[#9D6FDB]/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/players/${video.user.id}`}
                            className="text-white hover:text-[#9D6FDB] font-medium transition"
                          >
                            {video.user.name || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {format(new Date(video.uploadDate), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {video.videoType ? (
                            <Badge className="bg-[#9D6FDB]/20 text-[#9D6FDB] border-[#9D6FDB]/30">
                              {video.videoType}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-lg font-bold ${
                              (video.overallScore || 0) >= 80
                                ? 'text-green-400'
                                : (video.overallScore || 0) >= 60
                                ? 'text-[#E8B14E]'
                                : 'text-red-400'
                            }`}
                          >
                            {video.overallScore || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {weakest.name} ({weakest.score})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/video/${video.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#9D6FDB]/10 hover:bg-[#9D6FDB]/20 text-[#9D6FDB] rounded-lg transition text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Report
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
