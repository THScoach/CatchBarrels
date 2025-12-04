'use client';

import { useState } from 'react';
import { RefreshCw, User, Calendar, BarChart, ChevronRight, Crown } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, format as formatDate } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Player {
  id: string;
  name: string | null;
  email: string | null;
  username: string;
  whopUserId: string | null;
  whopMembershipId: string | null;
  membershipTier: string;
  membershipStatus: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastWhopSync: Date | null;
  lastSessionDate: Date | null;
  sessionCount: number;
  lessonCount: number;
  assessmentCompletedAt: Date | null;
  assessmentVipExpiresAt: Date | null;
  assessmentVipActive: boolean;
}

interface PlayersClientProps {
  players: Player[];
}

export default function PlayersClient({ players: initialPlayers }: PlayersClientProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/whop/sync-players', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to sync players from Whop');
        return;
      }

      // Show detailed success message
      const { createdCount, updatedCount, skippedCount, totalWhopUsers, errors } = result;
      
      if (createdCount > 0 || updatedCount > 0) {
        let message = `Successfully synced ${totalWhopUsers} Whop customers!\n`;
        if (createdCount > 0) message += `✓ Created ${createdCount} new player accounts\n`;
        if (updatedCount > 0) message += `✓ Updated ${updatedCount} existing players\n`;
        if (skippedCount > 0) message += `⚠️  Skipped ${skippedCount} (no email)`;
        
        toast.success(message, { duration: 6000 });
      } else {
        toast.info('No new players to sync');
      }
      
      if (errors && errors.length > 0) {
        console.error('Sync errors:', errors);
        toast.warning(`Synced with ${errors.length} errors. Check console for details.`);
      }
      
      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync players from Whop. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro':
        return 'bg-[#E8B14E]/20 text-[#E8B14E] border-[#E8B14E]/30';
      case 'athlete':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <p className="text-gray-400 mt-1">
            {players.length} {players.length === 1 ? 'player' : 'players'} • BARRELS Pro Members
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#E8B14E]/10 hover:bg-[#E8B14E]/20 text-[#E8B14E] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync from Whop'}</span>
        </button>
      </div>

      {/* Players Table */}
      <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-[#E8B14E]/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Last Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8B14E]/10">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No players found</p>
                    <p className="text-gray-500 text-sm">Click "Sync from Whop" to import players</p>
                  </td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-[#E8B14E]/5 transition cursor-pointer"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{player.name || player.username}</p>
                        <p className="text-gray-400 text-sm">{player.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getTierColor(
                            player.membershipTier
                          )}`}
                        >
                          {player.membershipTier}
                        </span>
                        {player.assessmentVipActive && player.assessmentVipExpiresAt && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8B14E]/20 text-[#E8B14E] border border-[#E8B14E]/30"
                            title={`VIP offer expires ${formatDate(new Date(player.assessmentVipExpiresAt), 'MMM d, yyyy')}`}
                          >
                            <Crown className="w-3 h-3" />
                            VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          player.membershipStatus
                        )}`}
                      >
                        {player.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {player.lastSessionDate ? (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatDistanceToNow(new Date(player.lastSessionDate), { addSuffix: true })}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No sessions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <BarChart className="w-4 h-4 text-gray-500" />
                        <span>{player.sessionCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="inline-flex items-center text-[#E8B14E] hover:text-[#F5C76E] transition"
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
