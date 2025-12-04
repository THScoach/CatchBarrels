'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Activity, Zap, Award, Target, ArrowUp, ArrowDown, Minus, RotateCw } from 'lucide-react';

interface AssessmentReport {
  id: string;
  overallScore: number | null;
  summary: string | null;
  strengths: any; // JsonValue from Prisma
  weaknesses: any; // JsonValue from Prisma
  metrics: any | null; // Simplified to avoid type mismatches
  comparisonData: any | null; // Comparison with previous assessment
}

interface AssessmentSession {
  id: string;
  sessionName: string;
  location: string | null;
  assessorName: string | null;
  status: string;
  totalSwings: number;
  successfulSwings: number;
  createdAt: Date;
  onTheBallHistory?: {
    barrelRate: any;
    avgEv: any;
    avgLa: any;
    sdLa: any;
    sdEv: any;
  } | null;
}

interface Props {
  session: AssessmentSession;
  report: AssessmentReport;
}

export default function ReportClient({ session, report }: Props) {
  const router = useRouter();
  const metrics = report.metrics;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Proficient';
    if (score >= 60) return 'Developing';
    return 'Needs Work';
  };

  const MetricCard = ({ title, value, unit, description }: { title: string; value: number | null; unit?: string; description?: string }) => (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">
        {value !== null ? `${value.toFixed(1)}${unit || ''}` : 'N/A'}
      </div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );

  const ScoreCard = ({ title, subtitle, score, icon: Icon }: { title: string; subtitle?: string; score: number | null; icon: any }) => (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Icon className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs text-gray-500">{subtitle}</p>
              <p className="text-sm text-gray-400 mt-1">{score !== null ? getScoreGrade(score) : 'N/A'}</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${score !== null ? getScoreColor(score) : 'text-gray-500'}`}>
            {score !== null ? score.toFixed(0) : '--'}
          </div>
        </div>
        {score !== null && (
          <Progress value={score} className="h-2" />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/assessments/${session.id}`)}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Assessment Report</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span>{session.sessionName}</span>
                <span>•</span>
                <span>{session.location}</span>
                <span>•</span>
                <span>{session.successfulSwings} swings analyzed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8 bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Overall Score</h2>
                <p className="text-orange-200/80 text-lg">
                  {report.overallScore !== null ? getScoreGrade(report.overallScore) : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${report.overallScore !== null ? getScoreColor(report.overallScore) : 'text-gray-500'}`}>
                  {report.overallScore !== null ? report.overallScore.toFixed(0) : '--'}
                </div>
                <div className="text-sm text-orange-200/60 mt-1">/ 100</div>
              </div>
            </div>
            {report.overallScore !== null && (
              <div className="mt-6">
                <Progress value={report.overallScore} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison with Previous Assessment */}
        {report.comparisonData && (
          <Card className="mb-8 bg-blue-900/20 border-blue-800/50">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Change Since Last Assessment
              </CardTitle>
              <CardDescription className="text-blue-200/80">
                {report.comparisonData.metrics?.daysSincePrevious 
                  ? `Compared to assessment ${report.comparisonData.metrics.daysSincePrevious} days ago`
                  : 'Compared to previous assessment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Trend */}
                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-blue-700/30">
                  <div className={`p-2 rounded-lg ${
                    report.comparisonData.overallTrend === 'improving' ? 'bg-green-500/20' :
                    report.comparisonData.overallTrend === 'declining' ? 'bg-red-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {report.comparisonData.overallTrend === 'improving' ? (
                      <ArrowUp className="w-5 h-5 text-green-400" />
                    ) : report.comparisonData.overallTrend === 'declining' ? (
                      <ArrowDown className="w-5 h-5 text-red-400" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      Overall Trend: {report.comparisonData.overallTrend?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {report.comparisonData.improvements?.length || 0} improvements • {report.comparisonData.declines?.length || 0} declines
                    </div>
                  </div>
                </div>

                {/* Key Metric Changes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Overall Score */}
                  {report.comparisonData.metrics?.overallScore?.delta !== null && (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Overall Score</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {report.comparisonData.metrics.overallScore.current?.toFixed(1)}
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${
                          (report.comparisonData.metrics.overallScore.delta || 0) > 0 ? 'text-green-400' :
                          (report.comparisonData.metrics.overallScore.delta || 0) < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {(report.comparisonData.metrics.overallScore.delta || 0) > 0 ? <ArrowUp className="w-3 h-3" /> :
                           (report.comparisonData.metrics.overallScore.delta || 0) < 0 ? <ArrowDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {Math.abs(report.comparisonData.metrics.overallScore.delta || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Anchor Score */}
                  {report.comparisonData.metrics?.anchorScore?.delta !== null && (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Anchor (Lower Body)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {report.comparisonData.metrics.anchorScore.current?.toFixed(1)}
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${
                          (report.comparisonData.metrics.anchorScore.delta || 0) > 0 ? 'text-green-400' :
                          (report.comparisonData.metrics.anchorScore.delta || 0) < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {(report.comparisonData.metrics.anchorScore.delta || 0) > 0 ? <ArrowUp className="w-3 h-3" /> :
                           (report.comparisonData.metrics.anchorScore.delta || 0) < 0 ? <ArrowDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {Math.abs(report.comparisonData.metrics.anchorScore.delta || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Engine Score */}
                  {report.comparisonData.metrics?.engineScore?.delta !== null && (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Engine (Core Rotation)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {report.comparisonData.metrics.engineScore.current?.toFixed(1)}
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${
                          (report.comparisonData.metrics.engineScore.delta || 0) > 0 ? 'text-green-400' :
                          (report.comparisonData.metrics.engineScore.delta || 0) < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {(report.comparisonData.metrics.engineScore.delta || 0) > 0 ? <ArrowUp className="w-3 h-3" /> :
                           (report.comparisonData.metrics.engineScore.delta || 0) < 0 ? <ArrowDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {Math.abs(report.comparisonData.metrics.engineScore.delta || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Whip Score */}
                  {report.comparisonData.metrics?.whipScore?.delta !== null && (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Whip (Bat Speed)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {report.comparisonData.metrics.whipScore.current?.toFixed(1)}
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${
                          (report.comparisonData.metrics.whipScore.delta || 0) > 0 ? 'text-green-400' :
                          (report.comparisonData.metrics.whipScore.delta || 0) < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {(report.comparisonData.metrics.whipScore.delta || 0) > 0 ? <ArrowUp className="w-3 h-3" /> :
                           (report.comparisonData.metrics.whipScore.delta || 0) < 0 ? <ArrowDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {Math.abs(report.comparisonData.metrics.whipScore.delta || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Improvements & Declines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {Array.isArray(report.comparisonData.improvements) && report.comparisonData.improvements.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-green-400 mb-2">Improvements:</div>
                      <ul className="space-y-1">
                        {report.comparisonData.improvements.map((imp: string, idx: number) => (
                          <li key={idx} className="text-sm text-green-200/80 flex items-start gap-2">
                            <ArrowUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(report.comparisonData.declines) && report.comparisonData.declines.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-orange-400 mb-2">Areas Needing Attention:</div>
                      <ul className="space-y-1">
                        {report.comparisonData.declines.map((dec: string, idx: number) => (
                          <li key={idx} className="text-sm text-orange-200/80 flex items-start gap-2">
                            <ArrowDown className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{dec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anchor / Engine / Whip Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard title="Anchor" subtitle="Lower Body" score={metrics?.anchorScore ?? null} icon={Target} />
          <ScoreCard title="Engine" subtitle="Core Rotation" score={metrics?.engineScore ?? null} icon={RotateCw} />
          <ScoreCard title="Whip" subtitle="Bat Speed" score={metrics?.whipScore ?? null} icon={Activity} />
        </div>

        {/* Body Metrics Board - Detailed Breakdown */}
        <Card className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-400" />
              Body Metrics - Detailed Breakdown
            </CardTitle>
            <CardDescription className="text-gray-400">
              Motion (Timing), Stability, and Sequencing sub-scores for each component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Anchor Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Anchor (Lower Body Foundation)</h3>
                    <p className="text-xs text-gray-500">Stride, pelvis, ground connection</p>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${metrics?.anchorScore !== null ? getScoreColor(metrics.anchorScore) : 'text-gray-500'}`}>
                  {metrics?.anchorScore !== null ? metrics.anchorScore.toFixed(0) : '--'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
                {/* Anchor Motion */}
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <div className="text-sm font-semibold text-blue-300">Motion (40%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.anchorMotion !== null ? getScoreColor(metrics.anchorMotion) : 'text-gray-500'}`}>
                    {metrics?.anchorMotion !== null ? metrics.anchorMotion.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Timing-based</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Load→Launch duration</div>
                    <div>• Pelvis initiation timing</div>
                    <div>• Stride timing consistency</div>
                  </div>
                </div>

                {/* Anchor Stability */}
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <div className="text-sm font-semibold text-green-300">Stability (40%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.anchorStability !== null ? getScoreColor(metrics.anchorStability) : 'text-gray-500'}`}>
                    {metrics?.anchorStability !== null ? metrics.anchorStability.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Joint consistency</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Knee angle consistency</div>
                    <div>• Head stability</div>
                    <div>• Stride length factor</div>
                  </div>
                </div>

                {/* Anchor Sequencing */}
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <div className="text-sm font-semibold text-purple-300">Sequencing (20%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.anchorSequencing !== null ? getScoreColor(metrics.anchorSequencing) : 'text-gray-500'}`}>
                    {metrics?.anchorSequencing !== null ? metrics.anchorSequencing.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Kinematic chain</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Pelvis first in sequence</div>
                    <div>• Pelvis peak timing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <RotateCw className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Engine (Core Rotational Power)</h3>
                    <p className="text-xs text-gray-500">Pelvis-torso coordination, X-factor</p>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${metrics?.engineScore !== null ? getScoreColor(metrics.engineScore) : 'text-gray-500'}`}>
                  {metrics?.engineScore !== null ? metrics.engineScore.toFixed(0) : '--'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
                {/* Engine Motion */}
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <div className="text-sm font-semibold text-blue-300">Motion (40%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.engineMotion !== null ? getScoreColor(metrics.engineMotion) : 'text-gray-500'}`}>
                    {metrics?.engineMotion !== null ? metrics.engineMotion.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Timing-based</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Pelvis→Torso gap (30-50ms)</div>
                    <div>• Torso peak timing</div>
                    <div>• Rotation initiation</div>
                  </div>
                </div>

                {/* Engine Stability */}
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <div className="text-sm font-semibold text-green-300">Stability (40%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.engineStability !== null ? getScoreColor(metrics.engineStability) : 'text-gray-500'}`}>
                    {metrics?.engineStability !== null ? metrics.engineStability.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Posture consistency</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Spine tilt consistency</div>
                    <div>• Pelvis angle stability</div>
                    <div>• X-Factor (hip-shoulder sep)</div>
                  </div>
                </div>

                {/* Engine Sequencing */}
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <div className="text-sm font-semibold text-purple-300">Sequencing (20%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.engineSequencing !== null ? getScoreColor(metrics.engineSequencing) : 'text-gray-500'}`}>
                    {metrics?.engineSequencing !== null ? metrics.engineSequencing.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Kinematic chain</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Pelvis→Torso order</div>
                    <div>• Gap quality (30-50ms)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Whip Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Whip (Upper Body / Bat)</h3>
                    <p className="text-xs text-gray-500">Arm action, bat path, connection</p>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${metrics?.whipScore !== null ? getScoreColor(metrics.whipScore) : 'text-gray-500'}`}>
                  {metrics?.whipScore !== null ? metrics.whipScore.toFixed(0) : '--'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
                {/* Whip Motion */}
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <div className="text-sm font-semibold text-blue-300">Motion (40%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.whipMotion !== null ? getScoreColor(metrics.whipMotion) : 'text-gray-500'}`}>
                    {metrics?.whipMotion !== null ? metrics.whipMotion.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Timing-based</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Torso→Arm gap (30-50ms)</div>
                    <div>• Arm→Bat gap (30-50ms)</div>
                    <div>• Bat peak at impact</div>
                  </div>
                </div>

                {/* Whip Stability */}
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <div className="text-sm font-semibold text-green-300">Stability (30%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.whipStability !== null ? getScoreColor(metrics.whipStability) : 'text-gray-500'}`}>
                    {metrics?.whipStability !== null ? metrics.whipStability.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Joint consistency</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Shoulder tilt at impact</div>
                    <div>• Elbow angle consistency</div>
                    <div>• Front knee bracing</div>
                  </div>
                </div>

                {/* Whip Sequencing */}
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <div className="text-sm font-semibold text-purple-300">Sequencing (30%)</div>
                  </div>
                  <div className={`text-2xl font-bold ${metrics?.whipSequencing !== null ? getScoreColor(metrics.whipSequencing) : 'text-gray-500'}`}>
                    {metrics?.whipSequencing !== null ? metrics.whipSequencing.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Kinematic chain</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>• Torso→Arm→Bat order</div>
                    <div>• Gap quality (30-50ms)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-6 p-4 bg-orange-900/20 rounded-lg border border-orange-800/50">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-orange-300">Understanding Motion Scores</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-orange-400">Motion = "When You Move"</strong> (not "how fast"). 
                    These scores measure <strong>timing events</strong> and <strong>phase windows</strong> based on Dr. Kwon's research. 
                    Good timing with moderate velocity scores higher than poor timing with high velocity. 
                    Velocities are displayed separately for reference in the "Motion" tab above.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              {report.summary || 'No summary available'}
            </p>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-green-900/20 border-green-800/50">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(report.strengths) && report.strengths.length > 0 ? (
                  report.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-green-200">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-green-200/60">No strengths identified yet</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(report.weaknesses) && report.weaknesses.length > 0 ? (
                  report.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-orange-200">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-orange-200/60">No areas for improvement identified yet</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* On-The-Ball Section (Contact Quality & Consistency) */}
        {session.onTheBallHistory && (
          <Card className="bg-gradient-to-br from-orange-900/20 to-gray-900 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <span className="text-2xl">⚾</span>
                On-The-Ball (Contact Quality & Consistency)
              </CardTitle>
              <CardDescription className="text-gray-400">
                We measure Barrels + consistency, not just max exit velo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Core Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Barrel Rate */}
                  <div className="rounded-lg border border-orange-500/30 bg-gray-800 p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Barrel Rate</div>
                    <div className="mt-2 text-3xl font-bold text-orange-400">
                      {session.onTheBallHistory.barrelRate
                        ? `${(parseFloat(session.onTheBallHistory.barrelRate.toString()) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      % of fair balls that qualify as barrels for your level
                    </div>
                  </div>

                  {/* Avg EV */}
                  <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Exit Velo</div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {session.onTheBallHistory.avgEv
                        ? parseFloat(session.onTheBallHistory.avgEv.toString()).toFixed(1)
                        : 'N/A'}
                      <span className="text-sm text-gray-400"> mph</span>
                    </div>
                  </div>

                  {/* Avg LA */}
                  <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Launch Angle</div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {session.onTheBallHistory.avgLa
                        ? parseFloat(session.onTheBallHistory.avgLa.toString()).toFixed(1)
                        : 'N/A'}
                      <span className="text-sm text-gray-400">°</span>
                    </div>
                  </div>

                  {/* LA SD (Consistency) */}
                  <div className="rounded-lg border border-green-500/30 bg-gray-800 p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                      LA Consistency
                      <span className="text-green-400">↓</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-green-400">
                      {session.onTheBallHistory.sdLa
                        ? parseFloat(session.onTheBallHistory.sdLa.toString()).toFixed(1)
                        : 'N/A'}
                      <span className="text-sm text-gray-400">° SD</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Lower = more consistent launch window</div>
                  </div>

                  {/* EV SD */}
                  <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                      EV Consistency
                      <span className="text-gray-400">↓</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {session.onTheBallHistory.sdEv
                        ? parseFloat(session.onTheBallHistory.sdEv.toString()).toFixed(1)
                        : 'N/A'}
                      <span className="text-sm text-gray-400"> mph SD</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Lower = more consistent contact quality</div>
                  </div>
                </div>

                {/* Explanation Box */}
                <div className="rounded-md bg-blue-900/20 border border-blue-500/30 p-4">
                  <h4 className="font-medium text-blue-300 mb-2">Why This Matters</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    We care about <strong>Barrels and consistency</strong>, not just the biggest exit velo number. Your
                    goal is to:{' '}
                    <span className="text-orange-300 font-medium">(1) Raise your Barrel Rate over time</span> and{' '}
                    <span className="text-green-300 font-medium">
                      (2) Tighten your Launch Angle SD around a productive window
                    </span>
                    , so that your best contact shows up more often in games, not just once in a lab.
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-500/20">
                    <p className="text-xs text-blue-200/80">
                      <strong>What's a Barrel?</strong> MLB's top contact-quality bucket: specific exit velocity +
                      launch angle pairs that historically produce at least a .500 batting average and 1.500 slugging
                      percentage. We adjust the thresholds for your level.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Metrics */}
        <Tabs defaultValue="motion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="motion" className="data-[state=active]:bg-orange-500/20">
              Motion
            </TabsTrigger>
            <TabsTrigger value="stability" className="data-[state=active]:bg-orange-500/20">
              Stability
            </TabsTrigger>
            <TabsTrigger value="sequencing" className="data-[state=active]:bg-orange-500/20">
              Sequencing
            </TabsTrigger>
          </TabsList>

          {/* Motion Metrics Tab */}
          <TabsContent value="motion" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Motion Metrics (Reference Data)</CardTitle>
                <CardDescription className="text-gray-400">
                  Velocity and speed reference data for power tracking (not used in Motion scoring)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Bat Speed" value={metrics?.avgBatSpeed ?? null} unit=" mph" />
                  <MetricCard title="Max Bat Speed" value={metrics?.maxBatSpeed ?? null} unit=" mph" />
                  <MetricCard title="Avg Hand Speed" value={metrics?.avgHandSpeed ?? null} unit=" mph" />
                  <MetricCard title="Max Hand Speed" value={metrics?.maxHandSpeed ?? null} unit=" mph" />
                  <MetricCard title="Avg Pelvis Ang Vel" value={metrics?.avgPelvisAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Pelvis Ang Vel" value={metrics?.maxPelvisAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Torso Ang Vel" value={metrics?.avgTorsoAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Torso Ang Vel" value={metrics?.maxTorsoAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Arm Ang Vel" value={metrics?.avgArmAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Arm Ang Vel" value={metrics?.maxArmAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Bat Ang Vel" value={metrics?.avgBatAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Bat Ang Vel" value={metrics?.maxBatAngVel ?? null} unit="°/s" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stability Metrics Tab */}
          <TabsContent value="stability" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Stability Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Joint angles, posture consistency, and head movement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Hip-Shoulder Sep" value={metrics?.avgHipShoulderSep ?? null} unit="°" />
                  <MetricCard title="Avg Front Knee Angle" value={metrics?.avgFrontKneeAngle ?? null} unit="°" />
                  <MetricCard title="Avg Lead Elbow Angle" value={metrics?.avgLeadElbowAngle ?? null} unit="°" />
                  <MetricCard title="Avg Rear Elbow Angle" value={metrics?.avgRearElbowAngle ?? null} unit="°" />
                  <MetricCard title="Avg Head Disp X" value={metrics?.avgHeadDisplacementX ?? null} unit=" px" />
                  <MetricCard title="Avg Head Disp Y" value={metrics?.avgHeadDisplacementY ?? null} unit=" px" />
                  <MetricCard title="Motion Stability Score" value={metrics?.motionStabilityScore ?? null} unit="/100" />
                  <MetricCard title="Joint Angle Consistency" value={metrics?.jointAngleConsistency ?? null} unit="/100" />
                  <MetricCard title="Head Stability Score" value={metrics?.headStabilityScore ?? null} unit="/100" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sequencing Metrics Tab */}
          <TabsContent value="sequencing" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sequencing Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Kinematic chain timing and proximal-to-distal efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Sequence Score" value={metrics?.avgSequenceScore ?? null} unit="/100" />
                  <MetricCard title="Sequence Order Correct" value={metrics?.sequenceOrderCorrect ?? null} unit="%" />
                  <MetricCard title="Avg Pelvis-Torso Gap" value={metrics?.avgPelvisToTorsoGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Torso-Arm Gap" value={metrics?.avgTorsoToArmGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Arm-Bat Gap" value={metrics?.avgArmToBatGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Gap Variability" value={metrics?.avgGapVariability ?? null} unit=" ms" description="Lower is better" />
                  <MetricCard title="Sequencing Consistency" value={metrics?.sequencingConsistency ?? null} unit="/100" />
                  <MetricCard title="Overall Sequencing Score" value={metrics?.sequencingScore ?? null} unit="/100" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
