'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, LogOut, ClipboardList, FileText, ExternalLink } from 'lucide-react';

export function ProfileClient({ user, assessments }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-orange-500/20"
              onClick={() => setActiveTab('info')}
            >
              Info
            </TabsTrigger>
            <TabsTrigger 
              value="assessments" 
              className="data-[state=active]:bg-orange-500/20"
              onClick={() => setActiveTab('assessments')}
            >
              Assessments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-[#F5A623] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400">{user?.username}</p>
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          {(user?.height || user?.weight) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Physical Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.height && (
                  <div>
                    <p className="text-gray-400 text-sm">Height</p>
                    <p className="text-white">{Math.floor(user.height / 12)}'{user.height % 12}"</p>
                  </div>
                )}
                {user?.weight && (
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white">{user.weight} lbs</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Playing Profile */}
          {(user?.bats || user?.throws || user?.position || user?.level) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Playing Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.bats && (
                  <div>
                    <p className="text-gray-400 text-sm">Bats</p>
                    <p className="text-white">{user.bats}</p>
                  </div>
                )}
                {user?.throws && (
                  <div>
                    <p className="text-gray-400 text-sm">Throws</p>
                    <p className="text-white">{user.throws}</p>
                  </div>
                )}
                {user?.position && (
                  <div>
                    <p className="text-gray-400 text-sm">Position</p>
                    <p className="text-white">{user.position}</p>
                  </div>
                )}
                {user?.level && (
                  <div>
                    <p className="text-gray-400 text-sm">Level</p>
                    <p className="text-white">{user.level}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment */}
          {(user?.batLength || user?.batWeight || user?.batType) && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Equipment</h3>
              <div className="grid grid-cols-2 gap-4">
                {user?.batLength && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Length</p>
                    <p className="text-white">{user.batLength}"</p>
                  </div>
                )}
                {user?.batWeight && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Weight</p>
                    <p className="text-white">{user.batWeight} oz</p>
                  </div>
                )}
                {user?.batType && (
                  <div>
                    <p className="text-gray-400 text-sm">Bat Type</p>
                    <p className="text-white">{user.batType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <div className="space-y-4">
              {!assessments || assessments.length === 0 ? (
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardContent className="pt-6 text-center py-12">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Assessments Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Complete your first multi-swing assessment to track your progress over time.
                    </p>
                    <Button
                      onClick={() => router.push('/assessments/new')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Create Assessment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Assessment History ({assessments.length})
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => router.push('/assessments/new')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      New Assessment
                    </Button>
                  </div>

                  {assessments.map((assessment: any) => (
                    <Card key={assessment.id} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">
                              {assessment.sessionName}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-400">
                              <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{assessment.location}</span>
                              <span>•</span>
                              <span>{assessment.totalSwings} swings</span>
                            </div>
                          </div>
                          {assessment.report?.overallScore && (
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange-400">
                                {assessment.report.overallScore.toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-400">Overall</div>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Scores */}
                        {assessment.report?.metrics && (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {assessment.report.metrics.anchorScore !== null && (
                              <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                                <div className="text-xl font-bold text-blue-400">
                                  {assessment.report.metrics.anchorScore.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Anchor</div>
                              </div>
                            )}
                            {assessment.report.metrics.engineScore !== null && (
                              <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                                <div className="text-xl font-bold text-purple-400">
                                  {assessment.report.metrics.engineScore.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Engine</div>
                              </div>
                            )}
                            {assessment.report.metrics.whipScore !== null && (
                              <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                  {assessment.report.metrics.whipScore.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Whip</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/assessments/${assessment.id}/report`)}
                            className="flex-1 border-gray-600 hover:bg-gray-700"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="flex-1 border-gray-600 hover:bg-gray-700 opacity-50 cursor-not-allowed"
                            title="Gamma deck generation coming soon"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Generate Deck
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
