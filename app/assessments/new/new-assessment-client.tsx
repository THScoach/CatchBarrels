'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ClipboardList } from 'lucide-react';

export default function NewAssessmentClient() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    location: '',
    assessorName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/assessments/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create session');
      }

      const data = await response.json();
      toast.success('Assessment session created!', {
        description: `Session ID: ${data.sessionId}`
      });

      router.push(`/assessments/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">New Assessment</h1>
              <p className="text-gray-400 text-sm">Create a multi-swing assessment session</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Session Details</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the session information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Name */}
              <div className="space-y-2">
                <Label htmlFor="sessionName" className="text-white">
                  Session Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sessionName"
                  name="sessionName"
                  type="text"
                  placeholder="e.g., John Doe - Pre-Season Assessment"
                  value={formData.sessionName}
                  onChange={handleChange}
                  required
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Performance Lab - Cage 2"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Assessor Name */}
              <div className="space-y-2">
                <Label htmlFor="assessorName" className="text-white">
                  Assessor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assessorName"
                  name="assessorName"
                  type="text"
                  placeholder="e.g., Coach Mike Smith"
                  value={formData.assessorName}
                  onChange={handleChange}
                  required
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !formData.sessionName || !formData.location || !formData.assessorName}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Session'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-900/20 border-blue-800/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-blue-300">What's Next?</h3>
                <p className="text-sm text-blue-200/80">
                  After creating this session, you'll be able to add swings from your video library and input ball data. Then run the assessment to generate a comprehensive report with Motion, Stability, and Sequencing metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
