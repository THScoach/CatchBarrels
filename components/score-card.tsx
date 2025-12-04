
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useState } from 'react';
import { MetricValue } from '@/lib/engine-metrics-config';

interface SubCategory {
  name: string;
  score: number;
  description?: string;
}

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  trend?: number;
  icon?: string;
  description?: string;
  color?: string;
  onClick?: () => void;
  subCategories?: SubCategory[];
  detailedMetrics?: MetricValue[]; // New prop for detailed ENGINE metrics
  compact?: boolean; // New prop for dashboard compact view
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  trend,
  icon,
  description,
  color = 'blue',
  onClick,
  subCategories,
  detailedMetrics,
  compact = false,
}: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (score / maxScore) * 100;

  const colorClasses = {
    blue: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  // Group detailed metrics by category if available
  const groupedMetrics = detailedMetrics
    ? {
        motion: detailedMetrics.filter((m) => m.category === 'motion'),
        stability: detailedMetrics.filter((m) => m.category === 'stability'),
        sequencing: detailedMetrics.filter((m) => m.category === 'sequencing'),
      }
    : null;

  const handleClick = () => {
    if ((subCategories && subCategories.length > 0) || detailedMetrics) {
      setIsExpanded(!isExpanded);
    }
    if (onClick) {
      onClick();
    }
  };

  // Calculate grade (A, B, C, D, F) for compact view
  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Compact view for dashboard
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`relative bg-gradient-to-br ${bgClass} border rounded-lg p-3 cursor-pointer hover:scale-[1.02] transition-all`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <div>
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">{title}</h3>
              {description && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{description}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white leading-none">{score}</div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              <span className={`font-semibold ${
                percentage >= 90 ? 'text-green-400' : 
                percentage >= 80 ? 'text-blue-400' : 
                percentage >= 70 ? 'text-yellow-400' : 
                percentage >= 60 ? 'text-orange-400' : 
                'text-red-400'
              }`}>
                {getGrade(score)}
              </span>
              <span>/ 100</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4 }}
            className={`h-1.5 rounded-full ${
              percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
              percentage >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
              percentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
              percentage >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
              'bg-gradient-to-r from-red-500 to-red-400'
            }`}
          />
        </div>

        {/* Mini sub-categories (Motion, Stability, Sequencing) */}
        {detailedMetrics && groupedMetrics && (
          <div className="flex gap-1 text-[10px]">
            {groupedMetrics.motion.length > 0 && (
              <div className="flex-1 bg-blue-500/10 rounded px-1.5 py-1 text-center">
                <div className="text-blue-300 font-medium">M</div>
                <div className="text-gray-400">{Math.round(groupedMetrics.motion.reduce((acc, m) => acc + (m.value || 0), 0) / groupedMetrics.motion.length)}</div>
              </div>
            )}
            {groupedMetrics.stability.length > 0 && (
              <div className="flex-1 bg-purple-500/10 rounded px-1.5 py-1 text-center">
                <div className="text-purple-300 font-medium">S</div>
                <div className="text-gray-400">{Math.round(groupedMetrics.stability.reduce((acc, m) => acc + (m.value || 0), 0) / groupedMetrics.stability.length)}</div>
              </div>
            )}
            {groupedMetrics.sequencing.length > 0 && (
              <div className="flex-1 bg-green-500/10 rounded px-1.5 py-1 text-center">
                <div className="text-green-300 font-medium">Q</div>
                <div className="text-gray-400">{Math.round(groupedMetrics.sequencing.reduce((acc, m) => acc + (m.value || 0), 0) / groupedMetrics.sequencing.length)}</div>
              </div>
            )}
          </div>
        )}

        {trend !== undefined && trend !== 0 && (
          <div className="flex items-center gap-1 text-[10px] mt-2 justify-end">
            {trend > 0 ? (
              <>
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">+{trend}</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3 h-3 text-red-400" />
                <span className="text-red-400 font-medium">{trend}</span>
              </>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Full detailed view (existing code)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br ${bgClass} border rounded-xl overflow-hidden shadow-lg`}
    >
      <div 
        onClick={handleClick}
        className="p-5 md:p-6 cursor-pointer hover:shadow-2xl active:scale-[0.98] transition-all touch-manipulation"
      >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm md:text-base font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
          {icon && <span className="text-3xl md:text-4xl mt-2 block animate-pulse-slow">{icon}</span>}
        </div>
        <div className="text-right ml-4">
          <div className="text-4xl md:text-5xl font-black text-white leading-none">{score}</div>
          <div className="text-xs md:text-sm text-gray-400 mt-1">
            <span className={`font-bold ${
              percentage >= 90 ? 'text-green-400' : 
              percentage >= 80 ? 'text-blue-400' : 
              percentage >= 70 ? 'text-yellow-400' : 
              percentage >= 60 ? 'text-orange-400' : 
              'text-red-400'
            }`}>
              {getGrade(score)}
            </span>
            <span className="text-gray-500"> / {maxScore}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className={`h-2.5 rounded-full shadow-lg ${
            percentage >= 90
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : percentage >= 80
              ? 'bg-gradient-to-r from-blue-500 to-blue-400'
              : percentage >= 70
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
              : percentage >= 60
              ? 'bg-gradient-to-r from-orange-500 to-orange-400'
              : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
        />
      </div>

      {description && (
        <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">{description}</p>
      )}

      {trend !== undefined && trend !== 0 && (
        <div className="flex items-center gap-2 text-xs md:text-sm bg-black/20 rounded-lg px-3 py-2">
          {trend > 0 ? (
            <>
              <ArrowUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">+{trend}</span>
            </>
          ) : trend < 0 ? (
            <>
              <ArrowDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold">{trend}</span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">No change</span>
            </>
          )}
          <span className="text-gray-400">vs last swing</span>
        </div>
      )}

      {/* Expand/Collapse indicator */}
      {((subCategories && subCategories.length > 0) || detailedMetrics) && (
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-700/30">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 font-medium">
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span>Show Details</span>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Detailed Metrics (new ENGINE view) */}
      <AnimatePresence>
        {isExpanded && detailedMetrics && groupedMetrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50"
          >
            <div className="p-4 space-y-6 bg-black/20">
              {/* Motion Section */}
              {groupedMetrics.motion.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 text-xs">
                      40%
                    </span>
                    Motion (Timing)
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.motion.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stability Section */}
              {groupedMetrics.stability.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 text-xs">
                      30%
                    </span>
                    Stability
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.stability.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sequencing Section */}
              {groupedMetrics.sequencing.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 text-xs">
                      20%
                    </span>
                    Sequencing
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.sequencing.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subcategories (backward compatible) */}
      <AnimatePresence>
        {isExpanded && !detailedMetrics && subCategories && subCategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50"
          >
            <div className="p-4 space-y-3 bg-black/20">
              {subCategories.map((sub, index) => {
                const subPercentage = (sub.score / maxScore) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{sub.name}</span>
                      <span className="text-white font-semibold">{sub.score}</span>
                    </div>
                    {sub.description && (
                      <p className="text-xs text-gray-500">{sub.description}</p>
                    )}
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subPercentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-1.5 rounded-full ${
                          subPercentage >= 80
                            ? 'bg-green-500'
                            : subPercentage >= 60
                            ? 'bg-orange-500'
                            : subPercentage >= 40
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * MetricDetailCard - Renders individual metric with kid-friendly explanations and BARREL pattern
 */
function MetricDetailCard({
  metric,
  delay,
}: {
  metric: MetricValue;
  delay: number;
}) {
  const getBadgeColor = (metricColor: string) => {
    const colors: Record<string, string> = {
      green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[metricColor] || colors.gray;
  };

  const getProgressColor = (value: number | null) => {
    if (!value || value === 0) return 'bg-gray-600';
    if (value >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (value >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (value >= 40) return 'bg-gradient-to-r from-orange-500 to-amber-600';
    return 'bg-gradient-to-r from-red-500 to-rose-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02 }}
      className="bg-black/40 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl"
    >
      {/* Header: Name + Grade */}
      <div className="flex items-start justify-between mb-3">
        <h5 className="text-sm font-bold text-white tracking-wide">{metric.name}</h5>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${getBadgeColor(
            metric.color
          )}`}
        >
          {metric.grade}
        </motion.span>
      </div>

      {/* Score bar */}
      {metric.value !== null && metric.value > 0 ? (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span className="font-medium">Score</span>
            <span className="font-bold">{metric.value}/100</span>
          </div>
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.value}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
              className={`${getProgressColor(metric.value)} h-full shadow-lg`}
            />
          </div>
        </div>
      ) : (
        <div className="mb-3 text-xs text-gray-500 italic bg-gray-800/30 rounded-lg px-3 py-2">
          Coming soon - data not yet calculated
        </div>
      )}

      {/* What it is */}
      <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">
        <span className="font-semibold text-white">What it is: </span>
        {metric.what_it_is}
      </p>

      {/* Why it matters */}
      <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">
        <span className="font-semibold text-white">Why it matters: </span>
        {metric.why_it_matters}
      </p>

      {/* BARREL pattern - highlighted */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.4 }}
        className="bg-gradient-to-br from-amber-500/15 to-yellow-500/10 border-2 border-amber-500/30 rounded-xl p-3 shadow-lg"
      >
        <div className="flex items-start gap-2.5">
          <Trophy className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse-slow" />
          <div>
            <p className="text-xs md:text-sm font-bold text-amber-200 mb-1.5 flex items-center gap-1">
              🏆 BARREL Pattern
            </p>
            <p className="text-xs md:text-sm text-amber-50/90 leading-relaxed">
              {metric.goat_pattern}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
