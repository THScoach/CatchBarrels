'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AssessmentType, ConfidenceLevel, SwingIdentity, TrainingLane, AssessmentStatus } from '@/types/player-assessment';

interface Athlete {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
}

interface CreateAssessmentClientProps {
  athletes: Athlete[];
  preSelectedAthleteId?: string;
}

export default function CreateAssessmentClient({ athletes, preSelectedAthleteId }: CreateAssessmentClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    athleteId: preSelectedAthleteId || '',
    assessmentType: 'manual_in_person' as AssessmentType,
    confidenceLevel: 'coach_verified' as ConfidenceLevel,
    swingIdentity: '' as SwingIdentity | '',
    constraints: '',
    primaryTrainingLane: '' as TrainingLane | '',
    coachSystemStatement: '',
    status: 'in_progress' as AssessmentStatus,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.athleteId) {
      alert('Please select an athlete');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/player-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId: formData.athleteId,
          assessmentType: formData.assessmentType,
          confidenceLevel: formData.confidenceLevel,
          swingIdentity: formData.swingIdentity || null,
          constraints: formData.constraints || null,
          primaryTrainingLane: formData.primaryTrainingLane || null,
          coachSystemStatement: formData.coachSystemStatement || null,
          status: formData.status,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        const { assessment } = await res.json();
        router.push('/admin/player-assessments');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/player-assessments')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Player Assessment</h1>
            <p className="text-gray-400 mt-1">
              Define the athlete's swing identity and training system
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-[#1E293B] border-gray-700">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Complete all required fields to create the assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Athlete Selection */}
              <div className="space-y-2">
                <Label>Athlete *</Label>
                <Select
                  value={formData.athleteId}
                  onValueChange={(value) => setFormData({ ...formData, athleteId: value })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue placeholder="Select athlete..." />
                  </SelectTrigger>
                  <SelectContent>
                    {athletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id}>
                        {athlete.name || athlete.username} ({athlete.email || athlete.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assessment Type */}
              <div className="space-y-2">
                <Label>Assessment Type *</Label>
                <Select
                  value={formData.assessmentType}
                  onValueChange={(value) => setFormData({ ...formData, assessmentType: value as AssessmentType })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_in_person">Manual / In-Person</SelectItem>
                    <SelectItem value="automated_onboarding">Automated / Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Level */}
              <div className="space-y-2">
                <Label>Confidence Level *</Label>
                <Select
                  value={formData.confidenceLevel}
                  onValueChange={(value) => setFormData({ ...formData, confidenceLevel: value as ConfidenceLevel })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="coach_verified">Coach Verified</SelectItem>
                    <SelectItem value="reboot_verified">Reboot Verified (Gold)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Swing Identity */}
              <div className="space-y-2">
                <Label>Swing Identity</Label>
                <Select
                  value={formData.swingIdentity}
                  onValueChange={(value) => setFormData({ ...formData, swingIdentity: value as SwingIdentity })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue placeholder="Select identity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spinner">Spinner</SelectItem>
                    <SelectItem value="Whipper">Whipper</SelectItem>
                    <SelectItem value="Slingshot">Slingshot</SelectItem>
                    <SelectItem value="Titan">Titan</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  This will be locked once set to Reboot Verified
                </p>
              </div>

              {/* Primary Training Lane */}
              <div className="space-y-2">
                <Label>Primary Training Lane</Label>
                <Select
                  value={formData.primaryTrainingLane}
                  onValueChange={(value) => setFormData({ ...formData, primaryTrainingLane: value as TrainingLane })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue placeholder="Select training lane..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pods">Pods</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Constraints */}
              <div className="space-y-2">
                <Label>Constraints (What NOT to Chase)</Label>
                <Textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="E.g., Don't chase bat speed at the expense of barrel control..."
                  className="bg-[#0f1720] border-gray-700 text-white min-h-[100px]"
                />
                <p className="text-sm text-gray-400">
                  Use coach-clear language. This is shown to the athlete.
                </p>
              </div>

              {/* Coach System Statement */}
              <div className="space-y-2">
                <Label>Coach System Statement</Label>
                <Textarea
                  value={formData.coachSystemStatement}
                  onChange={(e) => setFormData({ ...formData, coachSystemStatement: e.target.value })}
                  placeholder="Your personalized system statement from Coach Rick..."
                  className="bg-[#0f1720] border-gray-700 text-white min-h-[120px]"
                />
                <p className="text-sm text-gray-400">
                  This is displayed prominently to the athlete on their dashboard
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as AssessmentStatus })}
                >
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="automated_review_pending">Automated – Review Pending</SelectItem>
                    <SelectItem value="coach_verified">Coach Verified</SelectItem>
                    <SelectItem value="reboot_verified">Reboot Verified (Gold)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  Only "Coach Verified" and "Reboot Verified" unlock training access
                </p>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes (Internal Only)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes, observations, etc..."
                  className="bg-[#0f1720] border-gray-700 text-white min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/player-assessments')}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Assessment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
