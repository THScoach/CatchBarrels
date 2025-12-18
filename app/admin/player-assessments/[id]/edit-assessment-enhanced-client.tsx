'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Lock,
  Unlock,
  Upload,
  FileText,
  Star,
  History as HistoryIcon,
} from 'lucide-react';
import {
  PlayerAssessment,
  AssessmentType,
  ConfidenceLevel,
  SwingIdentity,
  TrainingLane,
  AssessmentStatus,
  AssessmentHistory,
  formatHistoryChange,
} from '@/types/player-assessment';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface EditAssessmentEnhancedClientProps {
  assessment: PlayerAssessment & {
    history?: AssessmentHistory[];
  };
}

export default function EditAssessmentEnhancedClient({ assessment }: EditAssessmentEnhancedClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
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
    rebootDerivedIdentityConfidence: assessment.rebootDerivedIdentityConfidence || '',
    historyNote: '',
  });

  const [rebootFiles, setRebootFiles] = useState<File[]>([]);

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
          rebootDerivedIdentityConfidence: formData.rebootDerivedIdentityConfidence ? parseFloat(formData.rebootDerivedIdentityConfidence as string) : null,
          historyNote: formData.historyNote || null,
        }),
      });

      if (res.ok) {
        router.push('/admin/player-assessments');
        router.refresh();
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

  const handleUploadRebootFiles = async () => {
    if (rebootFiles.length === 0) {
      alert('Please select at least one Reboot Motion file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      rebootFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      if (formData.rebootDerivedIdentityConfidence) {
        formData.append('rebootDerivedConfidence', formData.rebootDerivedIdentityConfidence as string);
      }

      const res = await fetch(`/api/player-assessment/${assessment.id}/upload-reboot`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Reboot files uploaded successfully!');
        setRebootFiles([]);
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading Reboot files:', error);
      alert('Failed to upload Reboot files');
    } finally {
      setUploading(false);
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
  const isRebootVerified = formData.status === 'reboot_verified' || formData.confidenceLevel === 'reboot_verified';
  const existingRebootFiles = (assessment.rebootMotionFiles as any[]) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
          
          {/* History Toggle */}
          {assessment.history && assessment.history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-gray-700"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          )}
        </div>

        {/* Gold Standard Badge */}
        {isRebootVerified && (
          <Card className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400" fill="currentColor" />
                <div>
                  <p className="font-bold text-amber-400">Gold Standard Assessment</p>
                  <p className="text-sm text-amber-200">This assessment is verified by Reboot Motion data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessment Info Card */}
            <Card className="bg-[#1E293B] border-gray-700">
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
                  <CardTitle>Core Assessment Details</CardTitle>
                  <CardDescription>
                    Fast-access fields for between-pod updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Edit Row 1: Identity + Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Swing Identity *</Label>
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
                        <p className="text-xs text-amber-400">🔒 Locked</p>
                      )}
                    </div>

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
                          <SelectItem value="reboot_verified">⭐ Reboot Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quick Edit Row 2: Training Lane + Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Training Lane</Label>
                      <Select
                        value={formData.primaryTrainingLane}
                        onValueChange={(value) => setFormData({ ...formData, primaryTrainingLane: value as TrainingLane })}
                      >
                        <SelectTrigger className="bg-[#0f1720] border-gray-700">
                          <SelectValue placeholder="Select lane..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pods">Pods</SelectItem>
                          <SelectItem value="1:1">1:1</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                          <SelectItem value="automated_review_pending">Review Pending</SelectItem>
                          <SelectItem value="coach_verified">Coach Verified</SelectItem>
                          <SelectItem value="reboot_verified">⭐ Reboot Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2">
                    <Label>Constraints (What NOT to Chase)</Label>
                    <Textarea
                      value={formData.constraints}
                      onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                      placeholder="E.g., Don't chase bat speed at the expense of barrel control..."
                      className="bg-[#0f1720] border-gray-700 text-white min-h-[80px]"
                    />
                  </div>

                  {/* Coach System Statement */}
                  <div className="space-y-2">
                    <Label>Coach System Statement (Athlete-Facing)</Label>
                    <Textarea
                      value={formData.coachSystemStatement}
                      onChange={(e) => setFormData({ ...formData, coachSystemStatement: e.target.value })}
                      placeholder="Your personalized system statement in Coach Rick's voice..."
                      className="bg-[#0f1720] border-gray-700 text-white min-h-[100px]"
                    />
                  </div>

                  {/* Identity Lock Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#0f1720] rounded-lg border border-gray-700">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {formData.identityLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        Lock Swing Identity
                      </Label>
                      <p className="text-xs text-gray-400">
                        Prevent further changes to identity classification
                      </p>
                    </div>
                    <Switch
                      checked={formData.identityLocked}
                      onCheckedChange={(checked) => setFormData({ ...formData, identityLocked: checked })}
                    />
                  </div>

                  {/* Change Note */}
                  <div className="space-y-2">
                    <Label>Change Note (Optional)</Label>
                    <Input
                      value={formData.historyNote}
                      onChange={(e) => setFormData({ ...formData, historyNote: e.target.value })}
                      placeholder="Brief note about this update..."
                      className="bg-[#0f1720] border-gray-700 text-white"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <Label>Admin Notes (Internal)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Internal notes..."
                      className="bg-[#0f1720] border-gray-700 text-white min-h-[60px]"
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
                  size="sm"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/player-assessments')}
                    className="border-gray-700"
                    size="sm"
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

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Reboot Motion Files */}
            <Card className="bg-[#1E293B] border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Reboot Motion Files
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload Reboot Motion analysis files (.csv, .json, .pdf)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Files */}
                {existingRebootFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Uploaded Files ({existingRebootFiles.length})</Label>
                    <div className="space-y-1">
                      {existingRebootFiles.map((file: any, idx: number) => (
                        <div key={idx} className="text-xs bg-[#0f1720] p-2 rounded border border-gray-700">
                          <p className="font-medium text-white truncate">{file.fileName}</p>
                          <p className="text-gray-400">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-xs">Upload New Files</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".csv,.json,.pdf"
                    onChange={(e) => {
                      if (e.target.files) {
                        setRebootFiles(Array.from(e.target.files));
                      }
                    }}
                    className="bg-[#0f1720] border-gray-700 text-white text-xs"
                  />
                  {rebootFiles.length > 0 && (
                    <p className="text-xs text-green-400">
                      {rebootFiles.length} file(s) selected
                    </p>
                  )}
                </div>

                {/* Reboot Confidence Score */}
                <div className="space-y-2">
                  <Label className="text-xs">Reboot Identity Confidence (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.rebootDerivedIdentityConfidence}
                    onChange={(e) => setFormData({ ...formData, rebootDerivedIdentityConfidence: e.target.value })}
                    placeholder="e.g., 95.5"
                    className="bg-[#0f1720] border-gray-700 text-white"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleUploadRebootFiles}
                  disabled={uploading || rebootFiles.length === 0}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Reboot Files
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Assessment History */}
            {showHistory && assessment.history && assessment.history.length > 0 && (
              <Card className="bg-[#1E293B] border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HistoryIcon className="w-5 h-5" />
                    Change History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Track of changes made to this assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {assessment.history.map((entry) => (
                      <div key={entry.id} className="border-l-2 border-amber-500 pl-3 py-2">
                        <p className="text-sm font-medium">{formatHistoryChange(entry)}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {entry.changedByUser?.name || entry.changedByUser?.username}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-300 mt-1 italic">"{entry.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
