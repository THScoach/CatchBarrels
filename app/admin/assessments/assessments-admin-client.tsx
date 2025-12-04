'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import TimingTestForm from '@/components/assessments/timing-test-form';

interface User {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
}

interface AssessmentsAdminClientProps {
  users: User[];
}

export default function AssessmentsAdminClient({ users }: AssessmentsAdminClientProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showTimingTest, setShowTimingTest] = useState(false);

  const handleAssessmentComplete = (assessmentId: string) => {
    setShowTimingTest(false);
    setSelectedUserId('');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Assessment Management</h1>
              <p className="text-gray-400 mt-1">
                Create and manage comprehensive assessments
              </p>
            </div>
          </div>
        </div>

        {!showTimingTest ? (
          <>
            {/* Create New Assessment */}
            <Card className="bg-[#1E293B] border-gray-700">
              <CardHeader>
                <CardTitle>Create New Assessment</CardTitle>
                <CardDescription>
                  Select a user and assessment type to begin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-[#0f1720] border-gray-700">
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.username} ({user.email || user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assessment Types */}
                <div className="space-y-4">
                  <Label>Assessment Type</Label>
                  <div className="grid gap-4">
                    <Card
                      className={`bg-[#0f1720] border-gray-700 hover:border-[#F5A623] cursor-pointer transition-all ${
                        !selectedUserId ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => {
                        if (selectedUserId) setShowTimingTest(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                            <FileText className="w-6 h-6 text-[#F5A623]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              52-Pitch Timing Test
                            </h3>
                            <p className="text-sm text-gray-400 mb-3">
                              Standardized S2 cognitive timing assessment with comprehensive metrics
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                Timing Control
                              </span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                                Trajectory Prediction
                              </span>
                              <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">
                                Impulse Control
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                Contact Quality
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f1720] border-gray-700 opacity-50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-600/10 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 text-gray-500">
                              Full Biomechanical Assessment
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              Complete Anchor-Engine-Whip analysis with video integration
                            </p>
                            <span className="text-xs text-gray-600">Coming Soon</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f1720] border-gray-700 opacity-50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-600/10 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 text-gray-500">
                              Combined Neuro + Biomechanical
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              Comprehensive assessment combining all metrics
                            </p>
                            <span className="text-xs text-gray-600">Coming Soon</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="bg-[#1E293B] border-gray-700">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-400 mb-1">Total Users</div>
                  <div className="text-3xl font-bold text-[#F5A623]">{users.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1E293B] border-gray-700">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-400 mb-1">Assessments Today</div>
                  <div className="text-3xl font-bold text-blue-400">0</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1E293B] border-gray-700">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-400 mb-1">Pending Reports</div>
                  <div className="text-3xl font-bold text-purple-400">0</div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Back to Selection */}
            <Button
              variant="outline"
              onClick={() => setShowTimingTest(false)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessment Selection
            </Button>

            {/* Timing Test Form */}
            <TimingTestForm
              userId={selectedUserId}
              onComplete={handleAssessmentComplete}
            />
          </>
        )}
      </div>
    </div>
  );
}
