'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, User, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Session {
  id: string
  date: Date
  anchor: number
  engine: number
  whip: number
  bodyScore: number
}

interface BodyData {
  currentAnchor: number
  currentEngine: number
  currentWhip: number
  sessionsCompleted: number
  sessions: Session[]
}

interface BodyDashboardClientProps {
  data: BodyData
}

export default function BodyDashboardClient({ data }: BodyDashboardClientProps) {
  const router = useRouter()

  // Prepare chart data
  const chartData = data.sessions
    .slice()
    .reverse()
    .map((session, index) => ({
      name: format(session.date, 'MMM d'),
      Anchor: session.anchor,
      Engine: session.engine,
      Whip: session.whip,
      session: index + 1,
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
              <User className="w-6 h-6 text-barrels-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide">4B System</p>
              <h1 className="text-xl font-semibold text-white">Body</h1>
              <p className="text-sm text-barrels-muted mt-1">
                Your biomechanics history: Anchor, Engine, and Whip
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
          <h2 className="text-base font-semibold text-white mb-4">Current Scores</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Anchor */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Anchor</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.currentAnchor}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
              <p className="text-xs text-barrels-muted mt-1">Feet & Ground</p>
            </div>

            {/* Engine */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Engine</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.currentEngine}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
              <p className="text-xs text-barrels-muted mt-1">Hips & Shoulders</p>
            </div>

            {/* Whip */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Whip</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.currentWhip}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
              <p className="text-xs text-barrels-muted mt-1">Arms & Bat</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#2E3440' }}>
            <p className="text-xs text-barrels-muted">Sessions completed: <span className="text-white font-semibold">{data.sessionsCompleted}</span></p>
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
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="Anchor"
                  stroke="#3B9FE8"
                  strokeWidth={2}
                  dot={{ fill: '#3B9FE8', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Engine"
                  stroke="#FFC93C"
                  strokeWidth={2}
                  dot={{ fill: '#FFC93C', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Whip"
                  stroke="#9D4EDD"
                  strokeWidth={2}
                  dot={{ fill: '#9D4EDD', r: 4 }}
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
            <h2 className="text-base font-semibold text-white">Session History</h2>
            <span className="text-xs text-barrels-muted">{data.sessionsCompleted} sessions</span>
          </div>

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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: '#3B9FE8' }}>A: {session.anchor}</span>
                      <span className="text-xs text-barrels-muted">•</span>
                      <span className="text-xs" style={{ color: '#FFC93C' }}>E: {session.engine}</span>
                      <span className="text-xs text-barrels-muted">•</span>
                      <span className="text-xs" style={{ color: '#9D4EDD' }}>W: {session.whip}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{session.bodyScore}</p>
                  <p className="text-xs text-barrels-muted">Overall</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA - Start New Assessment */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          onClick={() => router.push('/lesson/new')}
          className="w-full h-12 rounded-full font-semibold text-base transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            backgroundColor: '#2979FF',
            color: '#FFFFFF',
          }}
        >
          Start New Assessment
        </motion.button>
      </main>
    </div>
  )
}
