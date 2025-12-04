'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface TimingTestFormProps {
  userId?: string;
  videoId?: string;
  onComplete?: (assessmentId: string) => void;
}

export default function TimingTestForm({
  userId,
  videoId,
  onComplete,
}: TimingTestFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');

  // Pitch Test Data
  const [totalPitches, setTotalPitches] = useState(52);
  const [contactCount, setContactCount] = useState(0);
  const [hardContactCount, setHardContactCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [foulCount, setFoulCount] = useState(0);

  // Velocity Mix
  const [fastballPitches, setFastballPitches] = useState(26);
  const [fastballContact, setFastballContact] = useState(0);
  const [offspeedPitches, setOffspeedPitches] = useState(13);
  const [offspeedContact, setOffspeedContact] = useState(0);
  const [breakingBallPitches, setBreakingBallPitches] = useState(13);
  const [breakingBallContact, setBreakingBallContact] = useState(0);

  // Timing
  const [earlySwings, setEarlySwings] = useState(0);
  const [lateSwings, setLateSwings] = useState(0);
  const [onTimeSwings, setOnTimeSwings] = useState(0);

  // Zone Discipline
  const [swingsInZone, setSwingsInZone] = useState(0);
  const [swingsOutOfZone, setSwingsOutOfZone] = useState(0);
  const [takesInZone, setTakesInZone] = useState(0);
  const [takesOutOfZone, setTakesOutOfZone] = useState(0);

  // Cognitive Metrics
  const [timingControlScore, setTimingControlScore] = useState<number | ''>('');
  const [trajectoryScore, setTrajectoryScore] = useState<number | ''>('');
  const [impulseControlScore, setImpulseControlScore] = useState<number | ''>('');

  // Contact Quality
  const [exitVelocityAvg, setExitVelocityAvg] = useState<number | ''>('');
  const [exitVelocityMax, setExitVelocityMax] = useState<number | ''>('');
  const [launchAngleAvg, setLaunchAngleAvg] = useState<number | ''>('');

  const calculateRates = () => {
    const contactRate = totalPitches > 0 ? (contactCount / totalPitches) * 100 : 0;
    const hardContactRate = contactCount > 0 ? (hardContactCount / contactCount) * 100 : 0;
    const fastballContactRate = fastballPitches > 0 ? (fastballContact / fastballPitches) * 100 : 0;
    const offspeedContactRate = offspeedPitches > 0 ? (offspeedContact / offspeedPitches) * 100 : 0;
    const breakingBallContactRate = breakingBallPitches > 0 ? (breakingBallContact / breakingBallPitches) * 100 : 0;

    const totalSwings = earlySwings + lateSwings + onTimeSwings;
    const earlySwingRate = totalSwings > 0 ? (earlySwings / totalSwings) * 100 : 0;
    const lateSwingRate = totalSwings > 0 ? (lateSwings / totalSwings) * 100 : 0;
    const onTimeSwingRate = totalSwings > 0 ? (onTimeSwings / totalSwings) * 100 : 0;

    const totalPitchesThrown = swingsInZone + swingsOutOfZone + takesInZone + takesOutOfZone;
    const swingRate = totalPitchesThrown > 0 ? ((swingsInZone + swingsOutOfZone) / totalPitchesThrown) * 100 : 0;
    const takeRate = totalPitchesThrown > 0 ? ((takesInZone + takesOutOfZone) / totalPitchesThrown) * 100 : 0;
    const chaseRate = (swingsInZone + swingsOutOfZone) > 0 ? (swingsOutOfZone / (swingsInZone + swingsOutOfZone)) * 100 : 0;
    const zoneControl = (swingsInZone + swingsOutOfZone) > 0 ? (swingsInZone / (swingsInZone + swingsOutOfZone)) * 100 : 0;

    return {
      contactRate,
      hardContactRate,
      fastballContactRate,
      offspeedContactRate,
      breakingBallContactRate,
      earlySwingRate,
      lateSwingRate,
      onTimeSwingRate,
      swingRate,
      takeRate,
      chaseRate,
      zoneControl,
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const rates = calculateRates();

      // Calculate neuro composite score
      const neuroScores = [timingControlScore, trajectoryScore, impulseControlScore].filter((s): s is number => s !== '');
      const neuroCompositeScore = neuroScores.length > 0 
        ? neuroScores.reduce((a, b) => a + b, 0) / neuroScores.length 
        : null;

      const assessmentData = {
        assessmentType: 'timing_test',
        assessmentName: '52-Pitch Timing Test',
        videoId,
        
        // Pitch Test Data
        pitchTestCompleted: true,
        totalPitches,
        contactCount,
        contactRate: rates.contactRate,
        hardContactCount,
        hardContactRate: rates.hardContactRate,
        missCount,
        foulCount,
        
        // Velocity Mix
        fastballPitches,
        fastballContact,
        fastballContactRate: rates.fastballContactRate,
        offspeedPitches,
        offspeedContact,
        offspeedContactRate: rates.offspeedContactRate,
        breakingBallPitches,
        breakingBallContact,
        breakingBallContactRate: rates.breakingBallContactRate,
        
        // Timing
        earlySwings,
        earlySwingRate: rates.earlySwingRate,
        lateSwings,
        lateSwingRate: rates.lateSwingRate,
        onTimeSwings,
        onTimeSwingRate: rates.onTimeSwingRate,
        
        // Zone Discipline
        swingsInZone,
        swingsOutOfZone,
        swingRate: rates.swingRate,
        takesInZone,
        takesOutOfZone,
        takeRate: rates.takeRate,
        chaseRate: rates.chaseRate,
        zoneControl: rates.zoneControl,
        
        // Cognitive Metrics
        timingControlScore: timingControlScore || null,
        trajectoryScore: trajectoryScore || null,
        impulseControlScore: impulseControlScore || null,
        neuroCompositeScore,
        
        // Contact Quality
        exitVelocityAvg: exitVelocityAvg || null,
        exitVelocityMax: exitVelocityMax || null,
        launchAngleAvg: launchAngleAvg || null,
        
        testDate: new Date(),
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      const assessment = await response.json();

      toast.success('Assessment saved successfully!');
      
      if (onComplete) {
        onComplete(assessment.id);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  const rates = calculateRates();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>52-Pitch Timing Test Entry</CardTitle>
          <CardDescription>
            Enter results from the standardized timing assessment protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="velocity">Velocity Mix</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="zone">Zone</TabsTrigger>
            </TabsList>

            {/* Contact Metrics */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Pitches</Label>
                  <Input
                    type="number"
                    value={totalPitches}
                    onChange={(e) => setTotalPitches(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Count</Label>
                  <Input
                    type="number"
                    value={contactCount}
                    onChange={(e) => setContactCount(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate: {rates.contactRate.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Hard Contact Count</Label>
                  <Input
                    type="number"
                    value={hardContactCount}
                    onChange={(e) => setHardContactCount(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate: {rates.hardContactRate.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Miss Count</Label>
                  <Input
                    type="number"
                    value={missCount}
                    onChange={(e) => setMissCount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Foul Count</Label>
                  <Input
                    type="number"
                    value={foulCount}
                    onChange={(e) => setFoulCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-semibold">Contact Quality Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Avg Exit Velo (mph)</Label>
                    <Input
                      type="number"
                      value={exitVelocityAvg}
                      onChange={(e) => setExitVelocityAvg(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Exit Velo (mph)</Label>
                    <Input
                      type="number"
                      value={exitVelocityMax}
                      onChange={(e) => setExitVelocityMax(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Launch Angle (°)</Label>
                    <Input
                      type="number"
                      value={launchAngleAvg}
                      onChange={(e) => setLaunchAngleAvg(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Velocity Mix */}
            <TabsContent value="velocity" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fastball Pitches</Label>
                    <Input
                      type="number"
                      value={fastballPitches}
                      onChange={(e) => setFastballPitches(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fastball Contact</Label>
                    <Input
                      type="number"
                      value={fastballContact}
                      onChange={(e) => setFastballContact(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Rate: {rates.fastballContactRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Offspeed Pitches</Label>
                    <Input
                      type="number"
                      value={offspeedPitches}
                      onChange={(e) => setOffspeedPitches(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offspeed Contact</Label>
                    <Input
                      type="number"
                      value={offspeedContact}
                      onChange={(e) => setOffspeedContact(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Rate: {rates.offspeedContactRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Breaking Ball Pitches</Label>
                    <Input
                      type="number"
                      value={breakingBallPitches}
                      onChange={(e) => setBreakingBallPitches(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breaking Ball Contact</Label>
                    <Input
                      type="number"
                      value={breakingBallContact}
                      onChange={(e) => setBreakingBallContact(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Rate: {rates.breakingBallContactRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Timing Metrics */}
            <TabsContent value="timing" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Early Swings</Label>
                  <Input
                    type="number"
                    value={earlySwings}
                    onChange={(e) => setEarlySwings(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate: {rates.earlySwingRate.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>On-Time Swings</Label>
                  <Input
                    type="number"
                    value={onTimeSwings}
                    onChange={(e) => setOnTimeSwings(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate: {rates.onTimeSwingRate.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Late Swings</Label>
                  <Input
                    type="number"
                    value={lateSwings}
                    onChange={(e) => setLateSwings(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rate: {rates.lateSwingRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-semibold">S2 Cognitive Scores (0-100)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Timing Control</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={timingControlScore}
                      onChange={(e) => setTimingControlScore(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trajectory Prediction</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={trajectoryScore}
                      onChange={(e) => setTrajectoryScore(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Impulse Control</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={impulseControlScore}
                      onChange={(e) => setImpulseControlScore(e.target.value ? parseFloat(e.target.value) : '')}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Zone Discipline */}
            <TabsContent value="zone" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Swings In Zone</Label>
                  <Input
                    type="number"
                    value={swingsInZone}
                    onChange={(e) => setSwingsInZone(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Swings Out of Zone</Label>
                  <Input
                    type="number"
                    value={swingsOutOfZone}
                    onChange={(e) => setSwingsOutOfZone(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Takes In Zone</Label>
                  <Input
                    type="number"
                    value={takesInZone}
                    onChange={(e) => setTakesInZone(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Takes Out of Zone</Label>
                  <Input
                    type="number"
                    value={takesOutOfZone}
                    onChange={(e) => setTakesOutOfZone(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Calculated Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Swing Rate: {rates.swingRate.toFixed(1)}%</div>
                  <div>Take Rate: {rates.takeRate.toFixed(1)}%</div>
                  <div>Chase Rate: {rates.chaseRate.toFixed(1)}%</div>
                  <div>Zone Control: {rates.zoneControl.toFixed(1)}%</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // Reset form
                window.location.reload();
              }}
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              {loading ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
