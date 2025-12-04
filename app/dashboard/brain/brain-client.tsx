'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Session {
  id: string
  date: Date
  score: number
  testType: string
  duration: string
}

interface BrainData {
  currentScore: number
  bestScore: number
  testsCompleted: number
  sessions: Session[]
}

interface BrainDashboardClientProps {
  data: BrainData
}

export default function BrainDashboardClient({ data }: BrainDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if test was just completed
  useEffect(() => {
    if (searchParams?.get('brainTest') === 'done') {
      toast.success('Brain test completed!', {
        description: 'Your results have been saved. Check your progress below.',
        icon: <CheckCircle2 className="w-5 h-5" />,
      })
      
      // Remove query param from URL
      router.replace('/dashboard/brain')
    }
  }, [searchParams, router])

  // Prepare chart data
  const chartData = data.sessions
    .slice()
    .reverse()
    .map((session, index) => ({
      name: format(session.date, 'MMM d'),
      score: session.score,
      test: index + 1,
    }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#2E3440' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-barrels-muted hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-barrels-gold to-barrels-gold-light flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-barrels-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide">4B System</p>
              <h1 className="text-xl font-semibold text-white">Brain</h1>
              <p className="text-sm text-barrels-muted mt-1">
                Your neural testing history and progress over time
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-5"
        >
          <h2 className="text-base font-semibold text-white mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Current Score */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Current Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.currentScore}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
            </div>

            {/* Best Score */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Best Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-barrels-gold">{data.bestScore}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
            </div>

            {/* Tests Completed */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Tests Completed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.testsCompleted}</span>
                <span className="text-xs text-barrels-muted">tests</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Progress Over Time</h2>
            <TrendingUp className="w-5 h-5 text-barrels-gold" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3440" />
                <XAxis
                  dataKey="name"
                  stroke="#B0B6C3"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#B0B6C3"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#05070B',
                    border: '1px solid #2E3440',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F5F5F5' }}
                  itemStyle={{ color: '#FFC93C' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#FFC93C"
                  strokeWidth={3}
                  dot={{ fill: '#FFC93C', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Session List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Test History</h2>
            <span className="text-xs text-barrels-muted">{data.testsCompleted} tests</span>
          </div>

          {data.sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-barrels-gold/20 to-barrels-gold-light/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-barrels-gold" />
              </div>
              <p className="text-white font-semibold mb-1">No tests yet</p>
              <p className="text-sm text-barrels-muted">
                Take your first THS Brain Speed test to track your cognitive performance
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-barrels-border hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-barrels-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {format(session.date, 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-barrels-muted">
                      {session.testType} • {session.duration}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{session.score}</p>
                  <p className="text-xs text-barrels-muted">Score</p>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </motion.div>

        {/* CTA - Start New Test */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          onClick={() => router.push('/brain-test/go-no-go')}
          className="w-full h-12 rounded-full font-semibold text-base transition-all duration-200 hover:brightness-110 active:scale-[0.98] bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black"
        >
          Take THS Brain Speed Test
        </motion.button>
      </main>
    </div>
  )
}
