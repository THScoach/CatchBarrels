'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target, Trophy, Info } from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GOAT_TARGET, calculateGapToGOAT } from '@/lib/engine-metrics-config';
import { formatDistanceToNow } from 'date-fns';

interface AssessmentData {
  id: string;
  sessionName: string;
  createdAt: string;
  overallScore: number;
  anchorScore: number;
  engineScore: number;
  whipScore: number;
}

interface ProgressChartsProps {
  assessments: AssessmentData[];
}

export function ProgressCharts({ assessments }: ProgressChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'anchor' | 'engine' | 'whip'>('overall');

  // Transform data for charts
  const chartData = assessments.map((assessment, index) => ({
    index: index + 1,
    name: `Session ${index + 1}`,
    fullName: assessment.sessionName,
    date: new Date(assessment.createdAt).toLocaleDateString(),
    dateDistance: formatDistanceToNow(new Date(assessment.createdAt), { addSuffix: true }),
    Overall: assessment.overallScore,
    Anchor: assessment.anchorScore,
    Engine: assessment.engineScore,
    Whip: assessment.whipScore,
    // Gap to GOAT calculations
    engineGap: calculateGapToGOAT(assessment.engineScore),
    anchorGap: calculateGapToGOAT(assessment.anchorScore),
    whipGap: calculateGapToGOAT(assessment.whipScore),
    overallGap: calculateGapToGOAT(assessment.overallScore),
  }));

  // Calculate improvement stats
  const getImprovementStats = (metric: 'Overall' | 'Anchor' | 'Engine' | 'Whip') => {
    if (chartData.length < 2) return null;
    
    const firstScore = chartData[0][metric];
    const lastScore = chartData[chartData.length - 1][metric];
    const change = lastScore - firstScore;
    const percentChange = ((change / firstScore) * 100).toFixed(1);
    
    return {
      change,
      percentChange,
      isPositive: change > 0,
    };
  };

  const improvementStats = {
    overall: getImprovementStats('Overall'),
    anchor: getImprovementStats('Anchor'),
    engine: getImprovementStats('Engine'),
    whip: getImprovementStats('Whip'),
  };

  // Custom tooltip for scores chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-white mb-1">{data.fullName}</p>
        <p className="text-xs text-gray-400 mb-2">{data.dateDistance}</p>
        {payload.map((entry: any, index: number) => {
          const prevIndex = data.index - 2;
          const prevValue = prevIndex >= 0 ? (chartData[prevIndex] as any)?.[entry.dataKey as string] : null;
          const change = prevValue !== null ? entry.value - prevValue : null;
          
          return (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <span
                className="text-xs font-medium"
                style={{ color: entry.color }}
              >
                {entry.dataKey}:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {entry.value}
                </span>
                {change !== null && change !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    ({change > 0 ? '+' : ''}{change})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom tooltip for gap chart
  const GapTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const gapKey = `${selectedMetric}Gap` as keyof typeof data;
    const scoreKey = selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1);
    const score = data[scoreKey];
    const gap = data[gapKey];

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-white mb-1">{data.fullName}</p>
        <p className="text-xs text-gray-400 mb-2">{data.dateDistance}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Score:</span>
            <span className="text-sm font-bold text-white">{score}/100</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Gap to Target:</span>
            <span className="text-sm font-bold text-amber-400">{gap} pts</span>
          </div>
        </div>
      </div>
    );
  };

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-2">No assessment data yet</p>
        <p className="text-sm text-gray-500">
          Complete a few assessments to see your progress over time
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BARREL Pattern Info */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-200 mb-1">
                What is BARREL pattern?
              </h4>
              <p className="text-xs text-amber-100/80 leading-relaxed">
                BARREL pattern = how the very best hitters in the world usually move on this part of the swing.
                Our target score of {GOAT_TARGET} represents elite-level biomechanics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Summary */}
      {improvementStats.overall && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(improvementStats).map(([key, stats]) => {
            if (!stats) return null;
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <Card key={key} className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-4">
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="flex items-center gap-2">
                    {stats.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        stats.isPositive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stats.change > 0 ? '+' : ''}{stats.change}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.percentChange}% {stats.isPositive ? 'gain' : 'loss'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Scores Over Time Chart */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Scores Over Time
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Each dot is a test. The line shows how your scores are changing over time.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Track your progress across all biomechanical categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Overall"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Anchor"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Engine"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Whip"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gap to Target Chart */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Gap to GOAT Pattern
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Gap to GOAT shows how far you are from our GOAT target ({GOAT_TARGET}) for this part of the swing. Lower is better.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Distance from elite-level biomechanics
          </CardDescription>
          <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="anchor">Anchor</TabsTrigger>
              <TabsTrigger value="engine">Engine</TabsTrigger>
              <TabsTrigger value="whip">Whip</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                label={{ value: 'Points Below GOAT', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#9CA3AF' } }}
              />
              <Tooltip content={<GapTooltip />} />
              <ReferenceLine
                y={0}
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: 'GOAT Pattern', position: 'right', fill: '#F59E0B', fontSize: 12 }}
              />
              <Bar
                dataKey={`${selectedMetric}Gap`}
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
