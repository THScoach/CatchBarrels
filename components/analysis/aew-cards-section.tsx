'use client';

import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/score-card';
import { MetricValue } from '@/lib/engine-metrics-config';

interface SubCategory {
  name: string;
  score: number;
  description?: string;
}

interface AEWCardsSectionProps {
  anchorScore: number;
  engineScore: number;
  whipScore: number;
  anchorMetrics?: MetricValue[];
  engineMetrics?: MetricValue[];
  whipMetrics?: MetricValue[];
  anchorSubCategories?: SubCategory[];
  engineSubCategories?: SubCategory[];
  whipSubCategories?: SubCategory[];
}

export function AEWCardsSection({
  anchorScore,
  engineScore,
  whipScore,
  anchorMetrics,
  engineMetrics,
  whipMetrics,
  anchorSubCategories,
  engineSubCategories,
  whipSubCategories,
}: AEWCardsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-6"
    >
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Flow Metrics Breakdown</h2>
        <p className="text-sm text-gray-400">
          Ground • Engine • Barrel
        </p>
      </div>

      {/* Three cards stacked vertically */}
      <div className="space-y-4">
        {/* GROUND FLOW Card */}
        <ScoreCard
          title="GROUND FLOW"
          score={anchorScore}
          maxScore={100}
          icon="⚓"
          description="Lower body & ground interaction • stability • rhythm at start"
          color="orange"
          detailedMetrics={anchorMetrics}
          subCategories={anchorSubCategories}
        />

        {/* ENGINE FLOW Card */}
        <ScoreCard
          title="ENGINE FLOW"
          score={engineScore}
          maxScore={100}
          icon="🔄"
          description="Torso / core / spine rotation and sequencing"
          color="green"
          detailedMetrics={engineMetrics}
          subCategories={engineSubCategories}
        />

        {/* BARREL FLOW Card */}
        <ScoreCard
          title="BARREL FLOW"
          score={whipScore}
          maxScore={100}
          icon="⚡"
          description="Barrel path, depth, direction, on-plane movement and timing"
          color="purple"
          detailedMetrics={whipMetrics}
          subCategories={whipSubCategories}
        />
      </div>
    </motion.div>
  );
}
