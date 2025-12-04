'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { ChartSkeleton, StatCardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingUp } from 'lucide-react';

// Dynamic import with ssr: false to avoid chunk loading issues with recharts
const ProgressPageChart = dynamic(
  () => import('@/components/progress-page-chart').then(mod => ({ default: mod.ProgressPageChart })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    ),
  }
);

export function ProgressClient({ progress }: any) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const chartData = progress?.map((entry: any) => ({
    date: format(new Date(entry?.date), 'MMM d'),
    'Anchor (Lower Body)': entry?.avgAnchor,
    'Engine (Trunk/Core)': entry?.avgEngine,
    'Whip (Arms & Bat)': entry?.avgWhip,
    'Overall': entry?.avgOverall,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />

          <div className="space-y-6">
            {/* Chart Skeleton */}
            <ChartSkeleton />

            {/* Stats Summary Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-white mb-6"
        >
          Progress Tracking
        </motion.h1>

        {chartData?.length > 0 ? (
          <div className="space-y-6">
            <ProgressPageChart chartData={chartData} />

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Anchor', subtitle: 'Lower Body', value: chartData[chartData.length - 1]?.['Anchor (Lower Body)'], color: '#F5A623', icon: '⚓' },
                { label: 'Engine', subtitle: 'Trunk/Core', value: chartData[chartData.length - 1]?.['Engine (Trunk/Core)'], color: '#4CAF50', icon: '🔄' },
                { label: 'Whip', subtitle: 'Arms & Bat', value: chartData[chartData.length - 1]?.['Whip (Arms & Bat)'], color: '#9C27B0', icon: '⚡' },
                { label: 'Overall', subtitle: 'Average', value: chartData[chartData.length - 1]?.['Overall'], color: '#FF9800', icon: '📊' },
              ].map((stat) => (
                <div key={stat?.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat?.color }}
                      />
                      <div>
                        <span className="text-white text-sm font-semibold">{stat?.label}</span>
                        <p className="text-gray-500 text-xs">{stat?.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xl">{stat?.icon}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat?.value}</div>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No Progress Data Yet"
            description="Upload and analyze swing videos to start tracking your improvement over time. You'll see trends in your Anchor, Engine, and Whip scores."
            actionLabel="Upload a Swing"
            actionHref="/video/upload"
            secondaryActionLabel="View Training Library"
            secondaryActionHref="/library"
          />
        )}
      </div>

    </div>
  );
}
