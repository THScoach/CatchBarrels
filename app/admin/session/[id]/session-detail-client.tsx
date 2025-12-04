'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Play,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { AdminSessionDetail } from '@/lib/admin/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpBeacon } from '@/components/help/HelpBeacon';

interface SessionDetailClientProps {
  session: AdminSessionDetail;
}

export default function SessionDetailClient({ session }: SessionDetailClientProps) {
  const router = useRouter();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/coach-rick/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerName: session.playerName,
          playerLevel: session.playerLevel,
          momentumScore: session.momentumScore,
          categoryScores: {
            timing: session.timing,
            sequence: session.sequence,
            stability: session.stability,
            directional: session.directional,
            posture: session.posture,
          },
          flags: session.flags,
          context: 'admin_view',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze session');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze session. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGoatyLabel = (band: number | null) => {
    if (band === null) return 'Developing';
    if (band >= 2) return 'Elite';
    if (band >= 1) return 'Advanced';
    if (band >= 0) return 'Developing';
    return 'Needs Work';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-barrels-gold';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const categoryMetrics = [
    {
      name: 'Timing & Rhythm',
      score: session.timing,
      key: 'timing',
    },
    {
      name: 'Sequence & Braking',
      score: session.sequence,
      key: 'sequence',
    },
    {
      name: 'Stability & Balance',
      score: session.stability,
      key: 'stability',
    },
    {
      name: 'Directional Barrels',
      score: session.directional,
      key: 'directional',
    },
    {
      name: 'Posture & Spine',
      score: session.posture,
      key: 'posture',
    },
  ];

  return (
    <div className="min-h-screen bg-barrels-black pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-barrels-black via-barrels-black-light to-barrels-black border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => router.push('/admin')}
              className="text-barrels-gold hover:text-barrels-gold-light transition-colors flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Control Room
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {session.playerName}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(session.date), 'MMMM d, yyyy • h:mm a')}</span>
                  </div>
                  {session.playerLevel && (
                    <>
                      <span>•</span>
                      <span>{session.playerLevel}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Momentum Transfer Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(session.momentumScore)}`}>
                  {session.momentumScore}
                </p>
                <Badge
                  className={`mt-2 ${
                    session.goatyBand && session.goatyBand >= 1
                      ? 'bg-green-600/20 text-green-400 border-green-600/30'
                      : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                  }`}
                >
                  {getGoatyLabel(session.goatyBand)}
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Metrics */}
          <Card className="bg-barrels-black-light border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white">Biomechanical Categories</CardTitle>
              <CardDescription className="text-gray-400">
                Five-category breakdown from new scoring engine
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryMetrics.map((metric) => {
                  const isWeakest = metric.key === session.weakestCategory;
                  const isStrongest = metric.key === session.strongestCategory;

                  return (
                    <motion.div
                      key={metric.key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-barrels-black border rounded-lg p-4 ${
                        isWeakest
                          ? 'border-red-600/50'
                          : isStrongest
                          ? 'border-green-600/50'
                          : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">{metric.name}</h3>
                        {isWeakest && <Badge className="text-xs bg-red-600/20 text-red-400">Needs attention</Badge>}
                        {isStrongest && (
                          <Badge className="text-xs bg-green-600/20 text-green-400">Big strength</Badge>
                        )}
                      </div>
                      <p className={`text-3xl font-bold ${getScoreColor(metric.score)}`}>{metric.score}</p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            metric.score >= 80
                              ? 'bg-green-400'
                              : metric.score >= 60
                              ? 'bg-barrels-gold'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Flags & Highlights */}
          {session.flags.length > 0 && (
            <Card className="bg-barrels-black-light border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Flags & Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {session.flags.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-red-600/10 border border-red-600/30 rounded-lg p-3"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-300">{flag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Player */}
          {session.videoUrl && (
            <Card className="bg-barrels-black-light border-gray-800">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white">Video</CardTitle>
                <CardDescription className="text-gray-400">
                  {session.videoFileName || 'Session video'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video bg-barrels-black rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500 text-sm">Video player placeholder</p>
                </div>
                <Button
                  onClick={() => window.open(`/video/${session.videoId}`, '_blank')}
                  className="w-full bg-barrels-gold hover:bg-barrels-gold-light text-barrels-black"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Open Full Player in New Tab
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - AI Analyst */}
        <div className="space-y-6">
          <Card className="bg-barrels-black-light border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-barrels-gold" />
                <CardTitle className="text-white">Coach Rick - Session Analyst</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                AI-powered analysis for coaches
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!aiAnalysis && !isAnalyzing && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-barrels-gold mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-sm mb-6">
                    Get a detailed AI analysis of this session's mechanics, flags, and coaching recommendations.
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-semibold hover:opacity-90"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explain This Session
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-barrels-gold mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400 text-sm">Analyzing session data...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                  <Button
                    onClick={handleAnalyze}
                    variant="outline"
                    className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-4">
                  <div className="bg-barrels-black rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</div>
                    </div>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Re-analyze
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legacy Scores */}
          <Card className="bg-barrels-black-light border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white text-sm">Flow Scores</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Ground Flow</p>
                  <p className="text-2xl font-bold text-white">{session.anchor}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Engine Flow</p>
                  <p className="text-2xl font-bold text-white">{session.engine}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Barrel Flow</p>
                  <p className="text-2xl font-bold text-white">{session.whip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Beacon */}
      <HelpBeacon 
        pageId="admin-session"
        contextData={{
          sessionId: session.id,
          playerName: session.playerName,
          momentumTransferScore: session.momentumScore,
          timing: session.timing,
          sequence: session.sequence,
          stability: session.stability,
          directional: session.directional,
          posture: session.posture,
          weakestCategory: session.weakestCategory,
          strongestCategory: session.strongestCategory,
        }}
        variant="icon"
      />
    </div>
  );
}
