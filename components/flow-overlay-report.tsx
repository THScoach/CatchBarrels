"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, Target, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { FlowReport } from '@/lib/flow-report-types';
import { getFlowScoreColor } from '@/lib/flow-report-types';

interface FlowOverlayReportProps {
  videoId: string;
  videoUrl: string;
}

export function FlowOverlayReport({ videoId, videoUrl }: FlowOverlayReportProps) {
  const [flowReport, setFlowReport] = useState<FlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlowReport();
  }, [videoId]);

  const fetchFlowReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos/${videoId}/flow-report`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load flow report');
      }

      const data = await response.json();
      setFlowReport(data.flowReport);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load flow report';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-barrels-gold" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Unable to load Flow Report</p>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!flowReport) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No flow data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { overlay, metrics, notes, drills } = flowReport;
  const scoreColor = getFlowScoreColor(metrics.momentumFlowScore);

  const colorClasses = {
    green: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    red: 'text-red-400 border-red-500/30 bg-red-500/10',
    gray: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-barrels-gold/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-barrels-gold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Flow Overlay Report</h2>
          <p className="text-sm text-gray-400">Momentum Transfer Analysis</p>
        </div>
      </div>

      {/* Flow Overlay Video (if available) */}
      {overlay.flowOverlayMp4Url && (
        <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <video
                src={overlay.flowOverlayMp4Url}
                controls
                className="w-full rounded-lg"
                poster={overlay.flowOverlayGifUrl || undefined}
              />
              {/* A-B-C Markers Info */}
              {(overlay.triggerFrame || overlay.fireFrame || overlay.contactFrame) && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex justify-between text-xs">
                    {overlay.triggerFrame && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-white">A: Trigger (Frame {overlay.triggerFrame})</span>
                      </div>
                    )}
                    {overlay.fireFrame && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-white">B: Fire (Frame {overlay.fireFrame})</span>
                      </div>
                    )}
                    {overlay.contactFrame && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-white">C: Contact (Frame {overlay.contactFrame})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flow Metrics Summary */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-barrels-gold" />
            Flow Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Momentum Flow Score */}
            {metrics.momentumFlowScore !== null && (
              <div className={`p-4 rounded-lg border ${colorClasses[scoreColor]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Momentum Flow</span>
                  <Badge variant="outline" className={`${colorClasses[scoreColor]} border-none`}>
                    {metrics.momentumFlowScore.toFixed(0)}/100
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">Ground → Engine → Barrel</p>
              </div>
            )}

            {/* Tempo Ratio */}
            {metrics.tempoRatio && (
              <div className="p-4 rounded-lg border border-gray-600/30 bg-gray-700/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Tempo Ratio</span>
                  <span className="text-sm font-bold text-barrels-gold">{metrics.tempoRatio}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Load : Fire Duration</p>
              </div>
            )}

            {/* Smoothness Score */}
            {metrics.flowSmoothnessScore !== null && (
              <div className="p-4 rounded-lg border border-gray-600/30 bg-gray-700/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Flow Smoothness</span>
                  <Badge variant="outline" className="border-gray-500">
                    {metrics.flowSmoothnessScore.toFixed(0)}/100
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">Kinematic Sequence</p>
              </div>
            )}

            {/* Transfer Efficiency */}
            {metrics.transferEfficiencyScore !== null && (
              <div className="p-4 rounded-lg border border-gray-600/30 bg-gray-700/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Transfer Efficiency</span>
                  <Badge variant="outline" className="border-gray-500">
                    {metrics.transferEfficiencyScore.toFixed(0)}/100
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">Energy Transfer</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coaching Notes */}
      {notes.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-barrels-gold" />
              Flow Coaching Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-3">
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-barrels-gold/20 flex items-center justify-center text-xs font-bold text-barrels-gold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-200">{note.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Drills */}
      {drills.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-barrels-gold" />
              Recommended Flow Drills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drills.map((drill, index) => (
                <motion.div
                  key={drill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-barrels-gold/20 flex items-center justify-center text-xs font-bold text-barrels-gold">
                      {index + 1}
                    </span>
                    {drill.title}
                  </h4>
                  <p className="text-sm text-gray-300 ml-8">{drill.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
