'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, cardHover, buttonVariants } from '@/lib/animations';
import { Target, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DrillCardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/mobile-utils';

export function DrillsClient({ drills }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
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

  const categories = ['All', 'Ground Flow', 'Engine Flow', 'Barrel Flow', 'Tempo', 'General'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredDrills = drills?.filter((drill: any) => {
    const matchesSearch = drill?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase() || '');
    const matchesCategory = categoryFilter === 'All' || drill?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />

          {/* Search Skeleton */}
          <Skeleton className="h-12 w-full mb-4 rounded-lg" />

          {/* Category Filter Skeleton */}
          <div className="flex space-x-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-lg" />
            ))}
          </div>

          {/* Drills Skeleton */}
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <DrillCardSkeleton key={i} />
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
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-white mb-6"
        >
          Drill Library
        </motion.h1>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search drills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex overflow-x-auto space-x-2 mb-6 pb-2 scrollbar-hide"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setCategoryFilter(category)}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                categoryFilter === category
                  ? 'bg-[#F5A623] text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Drills Grid */}
        <motion.div 
          className="grid gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredDrills?.map((drill: any, index: number) => (
            <motion.div
              key={drill?.id}
              variants={fadeInUp}
              whileHover="hover"
              whileTap="tap"
              initial="rest"
              animate="rest"
              {...cardHover}
            >
              <Link
                href={`/drills/${drill?.id}`}
                className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 hover:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F5A623] to-[#E89815] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1">{drill?.name}</h3>
                  <p className="text-white/80 text-sm mb-2 line-clamp-2">{drill?.primaryPurpose}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#F5A623]/30 text-white text-xs font-medium rounded border border-[#F5A623]/50">
                      {drill?.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-700/50 text-white text-xs font-medium rounded border border-gray-600">
                      {drill?.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredDrills?.length === 0 && (
          <EmptyState
            icon={Search}
            title="No Drills Found"
            description={`No drills match your current filters${searchTerm ? ` for "${searchTerm}"` : ''}${categoryFilter !== 'All' ? ` in the ${categoryFilter} category` : ''}. Try adjusting your search or browsing all drills.`}
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setCategoryFilter('All');
            }}
            secondaryActionLabel="View Training Library"
            secondaryActionHref="/library"
          />
        )}
      </div>

    </div>
  );
}
