
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Award,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Zap,
  Activity,
  Target,
  TrendingUp,
  ArrowRight,
  Download,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/bottom-nav';

interface ReportProps {
  report: any;
  trialStatus: any;
}

export default function AssessmentReportClient({ report, trialStatus }: ReportProps) {
  const router = useRouter();
  const [activatingTrial, setActivatingTrial] = useState(false);

  const { playerInfo, assessmentDate, scores, details, strengths, weaknesses, recommendations } = report;
  const { brain, body, bat, ball, overall } = scores;

  // Determine overall grade
  const getGrade = (score: number | null) => {
    if (!score) return { label: 'N/A', color: 'text-gray-400', bg: 'bg-gray-600/20' };
    if (score >= 80) return { label: 'Elite', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (score >= 65) return { label: 'Advanced', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 50) return { label: 'Intermediate', color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/20' };
    return { label: 'Developing', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const overallGrade = getGrade(overall);

  // Handle trial activation
  const handleActivateTrial = async () => {
    setActivatingTrial(true);

    try {
      const response = await fetch('/api/trial/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier: 'athlete' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate trial');
      }

      toast.success(data.message);
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Trial activation error:', error);
      toast.error(error.message || 'Failed to activate trial');
    } finally {
      setActivatingTrial(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E89815] mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your BARRELS Assessment Report
          </h1>
          <p className="text-gray-400">
            {playerInfo.name} • {new Date(assessmentDate).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-[#F5A623]/30 p-8 text-center">
          <div className="flex justify-center mb-4">
            <Badge className={`${overallGrade.bg} ${overallGrade.color} text-lg px-6 py-2`}>
              {overallGrade.label}
            </Badge>
          </div>
          <div className="text-6xl font-bold text-white mb-2">
            {overall || 'N/A'}
          </div>
          <p className="text-sm text-gray-400">Overall Score</p>
        </Card>

        {/* 4Bs Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">4Bs Breakdown</h2>
          
          <div className="space-y-6">
            {/* Brain */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Brain (Cognitive)</span>
                </div>
                <span className="text-2xl font-bold text-white">{brain || '-'}</span>
              </div>
              {brain && <Progress value={brain} className="h-2" />}
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Body (Biomechanics)</span>
                </div>
                <span className="text-2xl font-bold text-white">{body || '-'}</span>
              </div>
              {body && <Progress value={body} className="h-2" />}
            </div>

            {/* Bat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-white font-medium">Bat (Contact Quality)</span>
                </div>
                <span className="text-2xl font-bold text-white">{bat || '-'}</span>
              </div>
              {bat && <Progress value={bat} className="h-2" />}
            </div>

            {/* Ball */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Ball (Ball Flight)</span>
                </div>
                <span className="text-2xl font-bold text-white">{ball || '-'}</span>
              </div>
              {ball && <Progress value={ball} className="h-2" />}
            </div>
          </div>
        </Card>

        {/* Strengths */}
        {strengths.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
              Your Strengths
            </h2>
            <ul className="space-y-3">
              {strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-[#F5A623]" />
              Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {weaknesses.map((weakness: string, index: number) => (
                <li key={index} className="flex items-start">
                  <XCircle className="w-5 h-5 mr-3 text-[#F5A623] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-[#F5A623]" />
            Personalized Recommendations
          </h2>
          <ul className="space-y-3">
            {recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="w-5 h-5 mr-3 text-[#F5A623] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Trial CTA */}
        {trialStatus?.eligible && (
          <Card className="bg-gradient-to-br from-[#F5A623] to-[#E89815] border-none p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Want to Improve These Scores?
            </h2>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Start your <strong>7-day free trial</strong> of BARRELS Athlete and get access to:
            </p>
            <ul className="text-left max-w-md mx-auto mb-6 space-y-2 text-white/90">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-3 text-white flex-shrink-0" />
                Pro model video overlays (Mike Trout, Juan Soto, more)
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-3 text-white flex-shrink-0" />
                Personalized AI coaching from Coach Rick
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-3 text-white flex-shrink-0" />
                Complete drill library targeting your weaknesses
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-3 text-white flex-shrink-0" />
                Progress tracking & advanced analytics
              </li>
            </ul>
            <Button
              onClick={handleActivateTrial}
              disabled={activatingTrial}
              className="bg-white text-[#F5A623] hover:bg-gray-100 font-bold text-lg px-8 py-6"
            >
              {activatingTrial ? 'Activating...' : 'Start Free 7-Day Trial'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-white/70 mt-4">
              No credit card required • Cancel anytime
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
