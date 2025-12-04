
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Award, 
  Clock, 
  User,
  Activity,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AssessmentDetailProps {
  assessment: any;
}

export default function AssessmentDetailClient({ assessment }: AssessmentDetailProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const user = assessment.user;

  // Calculate trial status
  const trialActive = user.trialStartDate && user.trialEndDate 
    ? new Date() < new Date(user.trialEndDate) 
    : false;
  const trialDaysRemaining = trialActive && user.trialEndDate
    ? Math.ceil((new Date(user.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch(`/api/assessments/${assessment.id}/import-hittrax`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CSV');
      }

      toast.success(data.message);
      router.refresh();
      setCsvFile(null);
    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast.error(error.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setGenerating(true);

    try {
      const response = await fetch(`/api/assessments/${assessment.id}/report`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      toast.success('Report generated successfully!');
      router.refresh();
      
      // Navigate to player-facing report view
      router.push(`/assessments/${assessment.id}/report`);
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/assessments">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
            <Badge variant="outline" className="border-[#F5A623] text-[#F5A623]">
              {assessment.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Player Info */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E89815] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name || user.username}</h1>
                <p className="text-sm text-gray-400">{user.email || user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Assessment Type</p>
              <p className="text-lg font-semibold text-white">{assessment.assessmentType}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Level</p>
              <p className="text-sm font-medium text-white">{user.level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Bats</p>
              <p className="text-sm font-medium text-white">{user.bats || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Height</p>
              <p className="text-sm font-medium text-white">
                {user.height ? `${Math.floor(user.height / 12)}'${user.height % 12}"` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Weight</p>
              <p className="text-sm font-medium text-white">{user.weight ? `${user.weight} lbs` : 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Trial Status */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#F5A623]" />
              Trial & Membership Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Trial Status</p>
              {trialActive ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Active ({trialDaysRemaining} days left)
                </Badge>
              ) : user.trialUsed ? (
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Trial Used
                </Badge>
              ) : (
                <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30">
                  Eligible
                </Badge>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Membership Tier</p>
              <Badge 
                className={
                  user.membershipTier === 'elite' 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : user.membershipTier === 'pro'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : user.membershipTier === 'athlete'
                    ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30'
                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                }
              >
                {user.membershipTier}
              </Badge>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Membership Status</p>
              <Badge 
                className={
                  user.membershipStatus === 'active'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                }
              >
                {user.membershipStatus}
              </Badge>
            </div>
          </div>
        </Card>

        {/* 4Bs Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Brain Score */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {assessment.neuroCompositeScore ? Math.round(assessment.neuroCompositeScore) : '-'}
              </span>
            </div>
            <p className="text-sm text-gray-400">Brain</p>
            <p className="text-xs text-gray-500">Cognitive</p>
          </Card>

          {/* Body Score */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {assessment.biomechanicalComposite ? Math.round(assessment.biomechanicalComposite) : '-'}
              </span>
            </div>
            <p className="text-sm text-gray-400">Body</p>
            <p className="text-xs text-gray-500">Biomechanics</p>
          </Card>

          {/* Bat Score */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#F5A623]" />
              <span className="text-2xl font-bold text-white">
                {assessment.contactRate ? Math.round(assessment.contactRate) : '-'}
              </span>
            </div>
            <p className="text-sm text-gray-400">Bat</p>
            <p className="text-xs text-gray-500">Contact</p>
          </Card>

          {/* Ball Score */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {assessment.ballScoreComposite ? Math.round(assessment.ballScoreComposite) : '-'}
              </span>
            </div>
            <p className="text-sm text-gray-400">Ball</p>
            <p className="text-xs text-gray-500">Ball Flight</p>
          </Card>
        </div>

        {/* Hit Trax Upload */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Upload className="w-5 h-5 mr-2 text-[#F5A623]" />
              Import Hit Trax Data
            </h2>
            {assessment.hitTraxDataImported && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓ Data Imported
              </Badge>
            )}
          </div>

          {assessment.hitTraxDataImported ? (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Exit Velocity (Avg)</span>
                <span className="text-sm font-medium text-white">
                  {assessment.exitVelocityAvg ? `${Math.round(assessment.exitVelocityAvg)} mph` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Distance (Avg)</span>
                <span className="text-sm font-medium text-white">
                  {assessment.ballFlightDistance ? `${Math.round(assessment.ballFlightDistance)} ft` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Ball Score</span>
                <span className="text-sm font-medium text-white">
                  {assessment.ballScoreComposite ? Math.round(assessment.ballScoreComposite) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Imported</span>
                <span className="text-sm font-medium text-white">
                  {assessment.hitTraxImportDate 
                    ? new Date(assessment.hitTraxImportDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Upload a CSV file from Hit Trax to populate ball flight data for this assessment.
              </p>

              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F5A623]/10 file:text-[#F5A623] hover:file:bg-[#F5A623]/20"
                />
                <Button
                  onClick={handleCsvUpload}
                  disabled={!csvFile || uploading}
                  className="bg-[#F5A623] hover:bg-[#E89815] text-white"
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Expected columns: Exit Velocity, Launch Angle, Distance, Spray Angle
              </p>
            </div>
          )}
        </Card>

        {/* Generate Report */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#F5A623]" />
              Assessment Report
            </h2>
            {assessment.reportGenerated && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓ Report Generated
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Generate a comprehensive 4Bs report with strengths, weaknesses, and personalized recommendations.
          </p>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              {generating ? 'Generating...' : assessment.reportGenerated ? 'Regenerate Report' : 'Generate Report'}
            </Button>

            {assessment.reportGenerated && (
              <Link href={`/assessments/${assessment.id}/report`}>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  View Report
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Assessment Details */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#F5A623]" />
            Assessment Details
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Created</span>
              <span className="text-white">{new Date(assessment.createdAt).toLocaleDateString()}</span>
            </div>
            {assessment.testDate && (
              <div className="flex justify-between">
                <span className="text-gray-400">Test Date</span>
                <span className="text-white">{new Date(assessment.testDate).toLocaleDateString()}</span>
              </div>
            )}
            {assessment.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-white">{new Date(assessment.completedAt).toLocaleDateString()}</span>
              </div>
            )}
            {assessment.location && (
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span className="text-white">{assessment.location}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
