'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlayerAssessment } from '@/types/player-assessment';
import Link from 'next/link';

interface EnrichedAthlete {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  createdAt: Date;
  assessment: PlayerAssessment | null;
  hasAssessment: boolean;
  isCompleted: boolean;
}

interface AssessmentData {
  athletes: EnrichedAthlete[];
  totalAthletes: number;
  withAssessments: number;
  completed: number;
}

export default function PlayerAssessmentsAdminClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AssessmentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/player-assessments');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching player assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (athlete: EnrichedAthlete) => {
    if (!athlete.hasAssessment) {
      return <Badge variant="secondary">No Assessment</Badge>;
    }

    const status = athlete.assessment?.status || 'not_started';
    const colors: Record<string, string> = {
      not_started: 'bg-gray-500',
      in_progress: 'bg-yellow-500',
      automated_review_pending: 'bg-blue-500',
      coach_verified: 'bg-green-500',
      reboot_verified: 'bg-amber-500',
    };

    const labels: Record<string, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      automated_review_pending: 'Review Pending',
      coach_verified: 'Coach Verified',
      reboot_verified: 'Reboot Verified',
    };

    return (
      <Badge className={`${colors[status]} text-white`}>
        {labels[status]}
      </Badge>
    );
  };

  const filteredAthletes = data?.athletes.filter((athlete) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      athlete.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'no_assessment' && !athlete.hasAssessment) ||
      (statusFilter === 'in_progress' &&
        athlete.hasAssessment &&
        !athlete.isCompleted) ||
      (statusFilter === 'completed' && athlete.isCompleted);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1720] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Player Assessments</h1>
              <p className="text-gray-400 mt-1">
                Manage player assessments and system identities
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#1E293B] border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Athletes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.totalAthletes || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">With Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.withAssessments || 0}</div>
              <p className="text-sm text-gray-400 mt-1">
                {data?.totalAthletes
                  ? Math.round(((data.withAssessments || 0) / data.totalAthletes) * 100)
                  : 0}
                % coverage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{data?.completed || 0}</div>
              <p className="text-sm text-gray-400 mt-1">
                Coach or Reboot verified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1E293B] border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search athletes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#0f1720] border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-[#0f1720] border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="no_assessment">No Assessment</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Athletes Table */}
        <Card className="bg-[#1E293B] border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Athletes</CardTitle>
                <CardDescription>
                  {filteredAthletes?.length || 0} athletes
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/admin/player-assessments/create')}
                className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Athlete</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Swing Identity</TableHead>
                    <TableHead className="text-gray-400">Training Lane</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes?.map((athlete) => (
                    <TableRow key={athlete.id} className="border-gray-700">
                      <TableCell className="font-medium">
                        {athlete.name || athlete.username}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {athlete.email || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(athlete)}</TableCell>
                      <TableCell>
                        {athlete.assessment?.swingIdentity ? (
                          <Badge variant="outline">
                            {athlete.assessment.swingIdentity}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {athlete.assessment?.primaryTrainingLane || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {athlete.hasAssessment ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/player-assessments/${athlete.assessment?.id}`
                                  )
                                }
                                className="text-white hover:bg-white/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/player-assessments/create?athleteId=${athlete.id}`
                                )
                              }
                              className="text-[#F5A623] hover:bg-[#F5A623]/10"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Create
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
