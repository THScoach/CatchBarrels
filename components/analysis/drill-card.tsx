'use client';

import { motion } from 'framer-motion';
import { Play, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface DrillCardProps {
  drill: {
    name: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    steps: string[];
    category?: string;
    difficulty?: string;
  };
}

export function DrillCard({ drill }: DrillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Play className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Here's Your Drill to Work On
            </h3>
          </div>
          {drill.difficulty && (
            <Badge variant="outline" className="text-xs">
              {drill.difficulty}
            </Badge>
          )}
        </div>

        {/* Drill Name */}
        <h4 className="text-lg font-bold text-white mb-3">{drill.name}</h4>

        {/* Video Thumbnail */}
        {drill.thumbnailUrl && (
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 group cursor-pointer">
            <Image
              src={drill.thumbnailUrl}
              alt={drill.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2">
          {drill.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
