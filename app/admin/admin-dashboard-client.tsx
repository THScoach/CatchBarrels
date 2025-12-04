'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, TrendingDown, AlertTriangle, 
  ArrowRight, Clock, RefreshCw, Star, Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AdminDashboardData } from '@/lib/admin/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpBeacon } from '@/components/help/HelpBeacon';

interface AdminDashboardClientProps {
  data: AdminDashboardData;
}

export default function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const router = useRouter();

  // Section 1: Today's Focus - Recent assessments needing review (flagged or recent)
  const todaysFocus = data.recentSessions.slice(0, 5);
  
  // Section 2: Players - Top 5 active players
  const quickAccessPlayers = data.rosterSummary.slice(0, 5);
  
  // Section 3: Open Tasks
  const openTasks = [
    {
      id: 'flagged',
      title: 'Flagged Sessions',
      count: data.recentSessions.filter(s => s.flagged).length,
      description: 'Sessions with low scores or unusual drops',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      href: '/admin/sessions?filter=flagged',
    },
    {
      id: 'whop-sync',
      title: 'Sync Members',
      count: data.totalAthletes,
      description: 'Update membership tiers from Whop',
      icon: RefreshCw,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      href: '/admin/players',
    },
    {
      id: 'support',
      title: 'Open Support Tickets',
      count: 0, // Will be fetched in future update
      description: 'User-reported issues awaiting response',
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      href: '/admin/support',
    },
  ];

  return (
    <div className="min-h-screen bg-barrels-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-barrels-black via-barrels-black-light to-barrels-black border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Coach Home
            </h1>
            <p className="text-gray-400 text-lg">
              Today's priorities, quick player access, and pending tasks.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Section 1: Today's Focus */}
        <Card className="bg-barrels-black-light border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#9D6FDB]" />
                  Today's Focus
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Recent assessments needing review (last 3-5 sessions)
                </CardDescription>
              </div>
              <Link
                href="/admin/sessions"
                className="text-[#9D6FDB] hover:text-[#B88EE8] transition-colors flex items-center gap-2 text-sm"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {todaysFocus.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent sessions to review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysFocus.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className={`bg-barrels-black border rounded-lg p-4 transition-all cursor-pointer ${
                      session.flagged
                        ? 'border-red-600/50 hover:border-red-500'
                        : 'border-gray-800 hover:border-[#9D6FDB]/30'
                    }`}
                    onClick={() => router.push(`/admin/session/${session.videoId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{session.playerName}</h3>
                          {session.flagged && (
                            <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {session.flagReason}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDistanceToNow(new Date(session.date), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>
                            Weakest: {session.weakestFlow} ({session.weakestScore})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">Score</p>
                          <p
                            className={`text-2xl font-bold ${
                              session.momentumScore >= 80
                                ? 'text-green-400'
                                : session.momentumScore >= 60
                                ? 'text-[#E8B14E]'
                                : 'text-red-400'
                            }`}
                          >
                            {session.momentumScore}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Players - Quick Access */}
        <Card className="bg-barrels-black-light border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#9D6FDB]" />
                  Players
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Quick access to your most active athletes
                </CardDescription>
              </div>
              <Link
                href="/admin/players"
                className="text-[#9D6FDB] hover:text-[#B88EE8] transition-colors flex items-center gap-2 text-sm"
              >
                View All ({data.totalAthletes})
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {quickAccessPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No players found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quickAccessPlayers.map((athlete, index) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-barrels-black border border-gray-800 rounded-lg p-4 hover:border-[#9D6FDB]/30 transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/players/${athlete.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{athlete.name}</h3>
                          {athlete.level && (
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                              {athlete.level}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Last session:{' '}
                            {athlete.lastSessionDate
                              ? formatDistanceToNow(new Date(athlete.lastSessionDate), { addSuffix: true })
                              : 'Never'}
                          </span>
                          <span>•</span>
                          <span>{athlete.totalSessions} sessions (30d)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">30-Day Avg</p>
                          <p className="text-2xl font-bold text-white">{athlete.thirtyDayAvgScore}</p>
                        </div>
                        <div className="flex items-center">
                          {athlete.recentTrend === 'up' && (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          )}
                          {athlete.recentTrend === 'down' && (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                          {athlete.recentTrend === 'flat' && (
                            <div className="w-5 h-0.5 bg-gray-600" />
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Open Tasks */}
        <Card className="bg-barrels-black-light border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#9D6FDB]" />
              Open Tasks
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pending items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {openTasks.map((task, index) => {
                const Icon = task.icon;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(task.href)}
                    className={`${task.bgColor} border border-gray-800 rounded-lg p-5 cursor-pointer hover:border-[#9D6FDB]/30 transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-barrels-black ${task.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-2xl font-bold ${task.color}`}>
                        {task.count}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Beacon */}
      <HelpBeacon 
        pageId="admin-dashboard"
        contextData={{
          rosterSize: data.totalAthletes,
          flaggedSessions: data.recentSessions.filter(s => s.flagged).length,
        }}
        variant="icon"
      />
    </div>
  );
}
