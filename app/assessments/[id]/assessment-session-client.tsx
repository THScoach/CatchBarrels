'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Play, Plus, CheckCircle, XCircle, Clock, FileVideo, Activity, Target } from 'lucide-react';

interface Video {
  id: string;
  title: string | null;
  videoType: string | null;
  uploadDate: Date;
}

interface AssessmentSession {
  id: string;
  sessionName: string;
  location: string | null;
  assessorName: string | null;
  status: string;
  totalSwings: number;
  processedSwings: number;
  successfulSwings: number;
  failedSwings: number;
  createdAt: Date;
  swings: Array<{
    id: string;
    swingNumber: number;
    swingType: string;
    status: string;
    video: {
      id: string;
      title: string | null;
      videoType: string | null;
      skeletonExtracted: boolean;
    } | null;
    metrics: any | null;
  }>;
  ballData: Array<{
    id: string;
    exitVelocity: number | null;
    launchAngle: number | null;
    distance: number | null;
    result: string | null;
  }>;
}

interface Props {
  session: AssessmentSession;
  availableVideos: Video[];
}

export default function AssessmentSessionClient({ session: initialSession, availableVideos }: Props) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [addingSwing, setAddingSwing] = useState(false);
  const [addingBallData, setAddingBallData] = useState(false);
  const [running, setRunning] = useState(false);
  const [pollingProgress, setPollingProgress] = useState(false);

  // Swing form
  const [swingForm, setSwingForm] = useState({
    videoId: '',
    swingNumber: session.totalSwings + 1,
    swingType: 'tee' as 'tee' | 'soft_toss' | 'front_toss' | 'bp' | 'live',
  });

  // Ball data form
  const [ballForm, setBallForm] = useState({
    exitVelocity: '',
    launchAngle: '',
    distance: '',
    result: 'barrel' as 'barrel' | 'solid' | 'flare' | 'weak' | 'miss',
  });

  // Poll for progress when running
  useEffect(() => {
    if (session.status === 'processing' && !pollingProgress) {
      setPollingProgress(true);
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/assessments/sessions/${session.id}/run`);
          if (response.ok) {
            const data = await response.json();
            setSession(prev => ({
              ...prev,
              status: data.status,
              processedSwings: data.processedSwings,
              successfulSwings: data.successfulSwings,
              failedSwings: data.failedSwings,
            }));

            if (data.status === 'completed' || data.status === 'error') {
              clearInterval(interval);
              setPollingProgress(false);
              setRunning(false);

              if (data.status === 'completed') {
                toast.success('Assessment completed!', {
                  description: 'Report is ready to view',
                  duration: 5000,
                });
                router.push(`/assessments/${session.id}/report`);
              } else {
                toast.error('Assessment failed', {
                  description: 'Some swings could not be processed',
                });
              }
            }
          }
        } catch (error) {
          console.error('Error polling progress:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [session.status, session.id, pollingProgress, router]);

  const handleAddSwing = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSwing(true);

    try {
      const response = await fetch(`/api/assessments/sessions/${session.id}/swings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swingForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add swing');
      }

      toast.success('Swing added!');
      router.refresh();
      setSwingForm({
        videoId: '',
        swingNumber: session.totalSwings + 2,
        swingType: 'tee',
      });
    } catch (error) {
      console.error('Error adding swing:', error);
      toast.error('Failed to add swing', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setAddingSwing(false);
    }
  };

  const handleAddBallData = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBallData(true);

    try {
      const response = await fetch(`/api/assessments/sessions/${session.id}/ball-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exitVelocity: parseFloat(ballForm.exitVelocity) || null,
          launchAngle: parseFloat(ballForm.launchAngle) || null,
          distance: parseFloat(ballForm.distance) || null,
          result: ballForm.result,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add ball data');
      }

      toast.success('Ball data added!');
      router.refresh();
      setBallForm({
        exitVelocity: '',
        launchAngle: '',
        distance: '',
        result: 'barrel',
      });
    } catch (error) {
      console.error('Error adding ball data:', error);
      toast.error('Failed to add ball data', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setAddingBallData(false);
    }
  };

  const handleRunAssessment = async () => {
    if (session.totalSwings === 0) {
      toast.error('No swings to analyze', {
        description: 'Add at least one swing before running the assessment',
      });
      return;
    }

    setRunning(true);

    try {
      const response = await fetch(`/api/assessments/sessions/${session.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processingMode: 'sequential' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start assessment');
      }

      const data = await response.json();
      toast.success('Assessment started!', {
        description: data.message || 'Processing swings...',
        duration: 5000,
      });

      setSession(prev => ({ ...prev, status: 'processing' }));
    } catch (error) {
      console.error('Error running assessment:', error);
      toast.error('Failed to start assessment', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      setRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const progressPercent = session.totalSwings > 0
    ? Math.round((session.processedSwings / session.totalSwings) * 100)
    : 0;

  const canRunAssessment = session.totalSwings > 0 && session.status !== 'processing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{session.sessionName}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {session.location}
                </span>
                <span>Assessor: {session.assessorName}</span>
                <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>{getStatusBadge(session.status)}</div>
          </div>

          {/* Progress Bar (when processing) */}
          {session.status === 'processing' && (
            <Card className="bg-blue-900/20 border-blue-800/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300 font-medium">Processing swings...</span>
                    <span className="text-blue-400 font-semibold">
                      {session.processedSwings} / {session.totalSwings}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-blue-300/70">
                    <span>{session.successfulSwings} successful</span>
                    {session.failedSwings > 0 && <span>{session.failedSwings} failed</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Add Forms */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Swing Form */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileVideo className="w-5 h-5" />
                  Add Swing
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Select a video from your library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSwing} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoId" className="text-white">Video</Label>
                    <Select
                      value={swingForm.videoId}
                      onValueChange={(value) => setSwingForm(prev => ({ ...prev, videoId: value }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue placeholder="Select video" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVideos.length === 0 ? (
                          <SelectItem value="no-videos" disabled>
                            No videos with skeleton data
                          </SelectItem>
                        ) : (
                          availableVideos.map(video => (
                            <SelectItem key={video.id} value={video.id}>
                              {video.title || `Video ${video.id.slice(0, 8)}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swingNumber" className="text-white">Swing #</Label>
                    <Input
                      id="swingNumber"
                      type="number"
                      min="1"
                      value={swingForm.swingNumber}
                      onChange={(e) => setSwingForm(prev => ({ ...prev, swingNumber: parseInt(e.target.value) }))}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swingType" className="text-white">Type</Label>
                    <Select
                      value={swingForm.swingType}
                      onValueChange={(value: any) => setSwingForm(prev => ({ ...prev, swingType: value }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tee">Tee</SelectItem>
                        <SelectItem value="soft_toss">Soft Toss</SelectItem>
                        <SelectItem value="front_toss">Front Toss</SelectItem>
                        <SelectItem value="bp">BP</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={addingSwing || !swingForm.videoId}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {addingSwing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" />Add Swing</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Add Ball Data Form */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Add Ball Data
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Optional HitTrax/Trackman metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBallData} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exitVelocity" className="text-white">Exit Velo (mph)</Label>
                    <Input
                      id="exitVelocity"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 92.5"
                      value={ballForm.exitVelocity}
                      onChange={(e) => setBallForm(prev => ({ ...prev, exitVelocity: e.target.value }))}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launchAngle" className="text-white">Launch Angle (°)</Label>
                    <Input
                      id="launchAngle"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 23.0"
                      value={ballForm.launchAngle}
                      onChange={(e) => setBallForm(prev => ({ ...prev, launchAngle: e.target.value }))}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-white">Distance (ft)</Label>
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 380"
                      value={ballForm.distance}
                      onChange={(e) => setBallForm(prev => ({ ...prev, distance: e.target.value }))}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result" className="text-white">Result</Label>
                    <Select
                      value={ballForm.result}
                      onValueChange={(value: any) => setBallForm(prev => ({ ...prev, result: value }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barrel">Barrel</SelectItem>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="flare">Flare</SelectItem>
                        <SelectItem value="weak">Weak</SelectItem>
                        <SelectItem value="miss">Miss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={addingBallData}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {addingBallData ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" />Add Ball Data</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Lists & Run Button */}
          <div className="lg:col-span-2 space-y-6">
            {/* Run Assessment Button */}
            <Card className="bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Ready to analyze?</h3>
                    <p className="text-sm text-orange-200/80">
                      {session.totalSwings} swing{session.totalSwings !== 1 ? 's' : ''} • {session.ballData.length} ball data point{session.ballData.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    onClick={handleRunAssessment}
                    disabled={!canRunAssessment || running}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6"
                  >
                    {running || session.status === 'processing' ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" />RUN ASSESSMENT</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Swings List */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Swings ({session.swings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {session.swings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No swings added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {session.swings.map((swing) => (
                      <div
                        key={swing.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-white font-semibold">#{swing.swingNumber}</div>
                          <div>
                            <div className="text-white text-sm">
                              {swing.video?.title || `Video ${swing.video?.id.slice(0, 8) || 'Unknown'}`}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">{swing.swingType.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div>{getStatusBadge(swing.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ball Data List */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ball Data ({session.ballData.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {session.ballData.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No ball data added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {session.ballData.map((ball, idx) => (
                      <div
                        key={ball.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-white font-semibold">#{idx + 1}</div>
                          <div className="flex gap-4 text-sm">
                            {ball.exitVelocity && (
                              <span className="text-gray-300">
                                <span className="text-gray-500">EV:</span> {ball.exitVelocity.toFixed(1)} mph
                              </span>
                            )}
                            {ball.launchAngle && (
                              <span className="text-gray-300">
                                <span className="text-gray-500">LA:</span> {ball.launchAngle.toFixed(1)}°
                              </span>
                            )}
                            {ball.distance && (
                              <span className="text-gray-300">
                                <span className="text-gray-500">Dist:</span> {ball.distance.toFixed(0)} ft
                              </span>
                            )}
                          </div>
                        </div>
                        {ball.result && (
                          <Badge className="capitalize bg-green-500/20 text-green-400 border-green-500/30">
                            {ball.result}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
