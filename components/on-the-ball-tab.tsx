'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, TrendingUp, TrendingDown, Minus, AlertCircle, BarChart3, Target } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface OnTheBallMetrics {
  barrelRate: number | null;
  avgEv: number | null;
  avgLa: number | null;
  sdLa: number | null;
  sdEv: number | null;
  fairPct: number | null;
  foulPct: number | null;
  missPct: number | null;
  barrels?: number;
  fairBalls?: number;
}

interface OnTheBallSession {
  id: string;
  sessionDate: string;
  sourceType: 'assessment' | 'hittrax';
  level: string;
  onTheBallHistory: {
    barrelRate: number | null;
    avgEv: number | null;
    avgLa: number | null;
    sdLa: number | null;
    sdEv: number | null;
  } | null;
  contextJson?: any;
}

export function OnTheBallTab() {
  const [sessions, setSessions] = useState<OnTheBallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Fetch both HitTrax sessions and assessment history
      const [hittraxRes, historyRes] = await Promise.all([
        fetch('/api/hittrax/sessions'),
        fetch('/api/on-the-ball/history'),
      ]);

      if (hittraxRes.ok && historyRes.ok) {
        const hittraxData = await hittraxRes.json();
        const historyData = await historyRes.json();
        
        // Combine sessions
        const combined = [
          ...(hittraxData.sessions || []).map((s: any) => ({
            ...s,
            sourceType: 'hittrax',
          })),
          ...(historyData.history || []).filter((h: any) => h.sourceType === 'assessment'),
        ].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

        setSessions(combined);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load On-The-Ball data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/hittrax/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`HitTrax session uploaded! ${data.metrics.barrels} barrels from ${data.metrics.fairBalls} fair balls`, {
          duration: 5000,
        });
        setSelectedFile(null);
        loadSessions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload HitTrax CSV');
    } finally {
      setUploading(false);
    }
  };

  const latestSession = sessions[0];
  const latestMetrics = latestSession?.onTheBallHistory;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <Upload className="h-5 w-5" />
            Upload HitTrax CSV
          </CardTitle>
          <CardDescription>
            Import HitTrax data to track barrel rate, launch angle consistency, and exit velocity spread.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200"
            />
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why This Matters */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Target className="h-5 w-5" />
            Why This Matters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">BARRELS measures how often you create true barrels</strong> (MLB-style
            exit velo + launch angle combos) and <strong className="text-white">how consistent your contact window is</strong>.
          </p>
          <p>
            We're not chasing one big exit velo PR — we're training you to hit more barrels, more often, with less
            scatter in your launch angle.
          </p>
          <div className="mt-4 rounded-md bg-gray-800 p-3">
            <p className="font-medium text-orange-400">What's a Barrel?</p>
            <p className="mt-1 text-xs text-gray-400">
              A barrel is MLB's top contact-quality bucket: specific exit velocity + launch angle pairs that historically
              produce at least a .500 batting average and 1.500 slugging percentage. We adjust the thresholds for your level.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Latest Session Summary */}
      {latestMetrics && (
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-gray-900">
          <CardHeader>
            <CardTitle className="text-orange-400">Latest On-The-Ball Metrics</CardTitle>
            <CardDescription>
              {formatDistanceToNow(new Date(latestSession.sessionDate), { addSuffix: true })} •{' '}
              {latestSession.sourceType === 'hittrax' ? 'HitTrax Session' : 'BARRELS Assessment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Barrel Rate */}
              <div className="rounded-lg border border-orange-500/30 bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Barrel Rate</span>
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                </div>
                <div className="mt-2 text-3xl font-bold text-orange-400">
                  {latestMetrics.barrelRate !== null ? `${(latestMetrics.barrelRate * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="mt-1 text-xs text-gray-400">% of fair balls that qualify as barrels</p>
              </div>

              {/* Avg EV */}
              <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg Exit Velo</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {latestMetrics.avgEv !== null ? `${latestMetrics.avgEv.toFixed(1)}` : 'N/A'}
                  <span className="text-lg text-gray-400"> mph</span>
                </div>
              </div>

              {/* Avg LA */}
              <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg Launch Angle</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {latestMetrics.avgLa !== null ? `${latestMetrics.avgLa.toFixed(1)}` : 'N/A'}
                  <span className="text-lg text-gray-400">°</span>
                </div>
              </div>

              {/* LA SD (Consistency) */}
              <div className="rounded-lg border border-green-500/30 bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">LA Consistency (SD)</span>
                  <Target className="h-4 w-4 text-green-400" />
                </div>
                <div className="mt-2 text-3xl font-bold text-green-400">
                  {latestMetrics.sdLa !== null ? `${latestMetrics.sdLa.toFixed(1)}` : 'N/A'}
                  <span className="text-lg text-gray-400">°</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Lower = more consistent launch window</p>
              </div>

              {/* EV SD */}
              <div className="rounded-lg border border-gray-600 bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">EV Consistency (SD)</span>
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {latestMetrics.sdEv !== null ? `${latestMetrics.sdEv.toFixed(1)}` : 'N/A'}
                  <span className="text-lg text-gray-400"> mph</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Lower = more consistent contact quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Track your barrel rate and consistency over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-800" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">No On-The-Ball data yet</p>
              <p className="mt-1 text-xs text-gray-500">Upload a HitTrax CSV or complete a BARRELS assessment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {session.sourceType === 'hittrax' ? '📊 HitTrax Session' : '⚾ BARRELS Assessment'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(session.sessionDate), { addSuffix: true })} • {session.level}
                      </p>
                    </div>
                    {session.onTheBallHistory && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-400">
                          {(session.onTheBallHistory.barrelRate! * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">Barrel Rate</p>
                      </div>
                    )}
                  </div>
                  {session.onTheBallHistory && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Avg EV:</span>{' '}
                        <span className="text-white">{session.onTheBallHistory.avgEv?.toFixed(1)} mph</span>
                      </div>
                      <div>
                        <span className="text-gray-400">LA SD:</span>{' '}
                        <span className="text-green-400">{session.onTheBallHistory.sdLa?.toFixed(1)}°</span>
                      </div>
                      <div>
                        <span className="text-gray-400">EV SD:</span>{' '}
                        <span className="text-white">{session.onTheBallHistory.sdEv?.toFixed(1)} mph</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
