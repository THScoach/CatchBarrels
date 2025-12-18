'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Trash2, Lock, Unlock } from 'lucide-react';
import { PlayerAssessment, AssessmentType, ConfidenceLevel, SwingIdentity, TrainingLane, AssessmentStatus } from '@/types/player-assessment';
import { Badge } from '@/components/ui/badge';

interface EditAssessmentClientProps {
  assessment: PlayerAssessment;
}

export default function EditAssessmentClient({ assessment }: EditAssessmentClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    assessmentType: assessment.assessmentType,
    confidenceLevel: assessment.confidenceLevel,
    swingIdentity: assessment.swingIdentity || '',
    identityLocked: assessment.identityLocked,
    constraints: assessment.constraints || '',
    primaryTrainingLane: assessment.primaryTrainingLane || '',
    coachSystemStatement: assessment.coachSystemStatement || '',
    status: assessment.status,
    notes: assessment.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      const res = await fetch(`/api/player-assessment/${assessment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentType: formData.assessmentType,
          confidenceLevel: formData.confidenceLevel,
          swingIdentity: formData.swingIdentity || null,
          identityLocked: formData.identityLocked,
          constraints: formData.constraints || null,
          primaryTrainingLane: formData.primaryTrainingLane || null,
          coachSystemStatement: formData.coachSystemStatement || null,
          status: formData.status,
          notes: formData.notes || null,
        }),
      });

      if (res.ok) {
        router.push('/admin/player-assessments');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Failed to update assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/player-assessment/${assessment.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin/player-assessments');
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Failed to delete assessment');
    } finally {
      setDeleting(false);
    }
  };

  const isIdentityEditable = !formData.identityLocked && formData.confidenceLevel !== 'reboot_verified';

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
            <h1 className="text-3xl font-bold">Edit Player Assessment</h1>
            <p className="text-gray-400 mt-1">
              {assessment.athlete?.name || assessment.athlete?.username}
            </p>
          </div>
        </div>

        {/* Assessment Info Card */}
        <Card className="bg-[#1E293B] border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="font-medium">{new Date(assessment.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Updated</p>
                <p className="font-medium">{new Date(assessment.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Created By</p>
                <p className="font-medium">{assessment.createdByUser?.name || assessment.createdByUser?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Identity Status</p>
                <Badge className={formData.identityLocked ? 'bg-red-500' : 'bg-green-500'}>
                  {formData.identityLocked ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Unlocked
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-[#1E293B] border-gray-700">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Update the assessment details as needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  disabled={!isIdentityEditable}
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
                {!isIdentityEditable && (
                  <p className="text-sm text-amber-400">
                    Identity is locked. Unlock to edit.
                  </p>
                )}
              </div>

              {/* Identity Lock Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#0f1720] rounded-lg border border-gray-700">
                <div className="space-y-0.5">
                  <Label>Lock Swing Identity</Label>
                  <p className="text-sm text-gray-400">
                    Prevent further changes to the identity classification
                  </p>
                </div>
                <Switch
                  checked={formData.identityLocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, identityLocked: checked })}
                />
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
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Assessment
                </>
              )}
            </Button>
            <div className="flex gap-4">
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
