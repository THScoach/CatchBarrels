'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Play, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LessonHistoryClientProps {
  lessons: any[];
  user: any;
}

export default function LessonHistoryClient({ lessons, user }: LessonHistoryClientProps) {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState('barrel');

  // Prepare chart data
  const chartData = lessons
    .slice(0, 10)
    .reverse()
    .map((lesson, index) => ({
      index: index + 1,
      date: lesson.completedAt ? format(new Date(lesson.completedAt), 'MMM d') : '',
      barrel: lesson.lessonBarrelScore || 0,
      anchor: lesson.lessonAnchorScore || 0,
      engine: lesson.lessonEngineScore || 0,
      whip: lesson.lessonWhipScore || 0,
    }));

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="p-4 max-w-4xl mx-auto mt-6">
          <EmptyState
            icon={Calendar}
            title="No Lessons Yet"
            description="Start your first lesson to begin tracking your progress!"
            actionLabel="Start Your First Lesson"
            onAction={() => router.push('/lesson/new')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-4 space-y-6 max-w-4xl mx-auto mt-6">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                <TrendingUp className="inline h-5 w-5 mr-2 text-orange-400" />
                Your Progress
              </h3>
              <div className="flex gap-2">
                {['barrel', 'anchor', 'engine', 'whip'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      selectedMetric === metric
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ fill: '#F97316', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Lessons List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">
            <Calendar className="inline h-5 w-5 mr-2 text-orange-400" />
            Recent Lessons
          </h3>
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const lowestScore = Math.min(
                lesson.lessonAnchorScore || 100,
                lesson.lessonEngineScore || 100,
                lesson.lessonWhipScore || 100
              );
              const keyFocus =
                lowestScore === lesson.lessonAnchorScore
                  ? 'Anchor Priority'
                  : lowestScore === lesson.lessonEngineScore
                  ? 'Engine Focus'
                  : 'Whip Cleanup';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="bg-gray-800/50 border-gray-700 p-5 hover:bg-gray-800/70 hover:border-orange-500/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/lesson/${lesson.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-gray-400 text-sm">
                            {lesson.completedAt
                              ? format(new Date(lesson.completedAt), 'MMM d, yyyy')
                              : 'Date unknown'}
                          </p>
                          {lesson.goal && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-semibold">
                              {lesson.goal.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-semibold">
                            {keyFocus}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-3xl font-bold text-white">
                              {lesson.lessonBarrelScore?.toFixed(0) || '—'}
                            </p>
                            <p className="text-gray-400 text-xs">BARREL</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <p className="font-bold text-white">
                                {lesson.lessonAnchorScore?.toFixed(0) || '—'}
                              </p>
                              <p className="text-gray-400 text-xs">A</p>
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {lesson.lessonEngineScore?.toFixed(0) || '—'}
                              </p>
                              <p className="text-gray-400 text-xs">E</p>
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {lesson.lessonWhipScore?.toFixed(0) || '—'}
                              </p>
                              <p className="text-gray-400 text-xs">W</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-white">{lesson.swingCount}</p>
                            <p className="text-gray-400 text-xs">Swings</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
