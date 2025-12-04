'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, cardHover } from '@/lib/animations';
import { Video, Upload, VideoIcon, RefreshCw, Award } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/mobile-utils';
import { calculateProgress, formatProgressChange, getProgressIcon, getProgressColor } from '@/lib/utils';

export function VideoListClient({ videos }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { scrollableRef, pullDistance, isRefreshing, isReady } = usePullToRefresh({
    onRefresh: async () => {
      triggerHaptic('medium');
      router.refresh();
      await new Promise(resolve => setTimeout(resolve, 1000));
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
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div ref={scrollableRef} className="min-h-screen bg-[#1a2332] pb-20 overflow-y-auto scroll-container">
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
            className={`w-5 h-5 ${isReady ? 'text-[#F5A623]' : 'text-gray-400'}`}
          />
        </motion.div>
      </div>
      
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-white">My Videos</h1>
          <Link
            href="/video/upload"
            className="flex items-center space-x-2 bg-[#F5A623] hover:bg-[#E89815] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        </motion.div>

        <motion.div 
          className="grid gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {videos?.map((video: any, index: number) => {
            // Calculate progress for this video
            const overallProgress = calculateProgress(
              video?.overallScore,
              video?.previousScores?.overallScore,
              video?.personalBests?.overallScore
            );
            const anchorProgress = calculateProgress(
              video?.anchor,
              video?.previousScores?.anchor,
              video?.personalBests?.anchor
            );
            const engineProgress = calculateProgress(
              video?.engine,
              video?.previousScores?.engine,
              video?.personalBests?.engine
            );
            const whipProgress = calculateProgress(
              video?.whip,
              video?.previousScores?.whip,
              video?.personalBests?.whip
            );

            return (
              <motion.div
                key={video.id}
                variants={fadeInUp}
                whileHover="hover"
                whileTap="tap"
                initial="rest"
                animate="rest"
                {...cardHover}
              >
                <Link
                  href={`/video/${video.id}`}
                  className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 relative">
                      <Video className="w-10 h-10 text-gray-400" />
                      {overallProgress.isPersonalBest && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold truncate">{video.title}</h3>
                        {overallProgress.isPersonalBest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400 flex-shrink-0">
                            Best!
                          </span>
                        )}
                        {video.videoType && !overallProgress.isPersonalBest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F5A623]/30 text-[#FDB44B] border border-[#F5A623]/50 flex-shrink-0">
                            {video.videoType}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
                      </p>
                      {video.analyzed ? (
                        <div className="mt-2 space-y-1">
                          {/* Overall Score with Progress */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white font-semibold">
                              Score: {video.overallScore}
                            </span>
                            {overallProgress.change !== 0 && (
                              <span className={`text-xs font-medium ${getProgressColor(overallProgress.direction, overallProgress.isPersonalBest)}`}>
                                {getProgressIcon(overallProgress.direction)} {formatProgressChange(overallProgress.change)}
                              </span>
                            )}
                            <span className="text-sm text-gray-400">{video.tier}</span>
                          </div>
                          {/* 4Bs Metrics with Progress */}
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="text-gray-400">
                              Anchor: {video.anchor || '—'}
                              {anchorProgress.change !== 0 && (
                                <span className={`ml-1 ${getProgressColor(anchorProgress.direction)}`}>
                                  {getProgressIcon(anchorProgress.direction)}{formatProgressChange(anchorProgress.change)}
                                </span>
                              )}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">
                              Engine: {video.engine || '—'}
                              {engineProgress.change !== 0 && (
                                <span className={`ml-1 ${getProgressColor(engineProgress.direction)}`}>
                                  {getProgressIcon(engineProgress.direction)}{formatProgressChange(engineProgress.change)}
                                </span>
                              )}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">
                              Whip: {video.whip || '—'}
                              {whipProgress.change !== 0 && (
                                <span className={`ml-1 ${getProgressColor(whipProgress.direction)}`}>
                                  {getProgressIcon(whipProgress.direction)}{formatProgressChange(whipProgress.change)}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-300 font-semibold">Analyzing...</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {videos?.length === 0 && (
            <EmptyState
              icon={VideoIcon}
              title="No Swings Yet"
              description="Upload your first swing video to start analyzing your technique and tracking your progress with BARRELS."
              actionLabel="Upload Your First Swing"
              actionHref="/video/upload"
              secondaryActionLabel="Learn About Analysis"
              secondaryActionHref="/library"
            />
          )}
        </motion.div>
      </div>

    </div>
  );
}
