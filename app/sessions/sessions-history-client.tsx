'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { triggerHaptic } from '@/lib/mobile-utils';

interface Session {
  id: string;
  sessionName: string | null;
  location: string | null;
  createdAt: Date;
  endedAt: Date | null;
  swingCount: number;
  avgScore: number | null;
}

interface SessionsHistoryClientProps {
  sessions: Session[];
  user: any;
}

export default function SessionsHistoryClient({
  sessions,
  user,
}: SessionsHistoryClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { scrollableRef, pullDistance, isRefreshing, isReady } = usePullToRefresh({
    onRefresh: async () => {
      triggerHaptic('medium');
      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    threshold: 80,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollableRef}
      className="min-h-screen bg-[#1a2332] pb-20 overflow-y-auto scroll-container"
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
        >
          <RefreshCw
            className={`w-5 h-5 ${
              isReady ? 'text-[#F5A623]' : 'text-gray-400'
            }`}
          />
        </motion.div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] p-6 border-b border-gray-800"
      >
        <h1 className="text-2xl font-bold text-white">Training History</h1>
        <p className="text-gray-400 text-sm mt-1">
          Review your past training sessions
        </p>
      </motion.div>

      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        {sessions.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No sessions yet"
            description="Start your first training session to track your progress"
            actionLabel="Start New Session"
            actionHref="/dashboard"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {sessions.map((session, index) => {
              const sessionDate = format(
                new Date(session.createdAt),
                'MMM dd, yyyy • h:mm a'
              );
              const sessionTitle =
                session.sessionName || `Session - ${sessionDate}`;
              const isActive = !session.endedAt;

              return (
                <Link key={session.id} href={`/sessions/${session.id}`}>
                  <Card
                    className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-all duration-200 overflow-hidden p-4"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">
                              {sessionTitle}
                            </h3>
                            {isActive && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(new Date(session.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {session.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <PlayCircle className="w-3 h-3" />
                            Swings
                          </div>
                          <div className="text-xl font-bold text-white">
                            {session.swingCount}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Avg Score
                          </div>
                          <div className="text-xl font-bold text-white">
                            {session.avgScore || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>

    </div>
  );
}
