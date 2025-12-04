'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Hammer, TrendingUp, Calendar, Upload, FileCheck } from 'lucide-react'
import { format } from 'date-fns'
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
  batSpeed: number
  attackAngle: number
  onPlaneTime: number
  source: string
  batScore: number
}

interface BatData {
  currentBatScore: number
  avgBatSpeed: number
  avgAttackAngle: number
  avgOnPlaneTime: number
  sessionsCompleted: number
  sessions: Session[]
}

interface BatDashboardClientProps {
  data: BatData
}

export default function BatDashboardClient({ data }: BatDashboardClientProps) {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  // Prepare chart data
  const chartData = data.sessions
    .slice()
    .reverse()
    .map((session, index) => ({
      name: format(session.date, 'MMM d'),
      'Bat Speed': session.batSpeed,
      session: index + 1,
    }))

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file.name)
      // TODO: Implement actual CSV parsing and upload
      console.log('Uploaded file:', file.name)
    }
  }

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
              <Hammer className="w-6 h-6 text-barrels-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide">4B System</p>
              <h1 className="text-xl font-semibold text-white">Bat</h1>
              <p className="text-sm text-barrels-muted mt-1">
                Your bat speed, path, and power metrics
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
          <h2 className="text-base font-semibold text-white mb-4">Current Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Bat Score */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Bat Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-barrels-gold">{data.currentBatScore}</span>
                <span className="text-xs text-barrels-muted">/ 100</span>
              </div>
            </div>

            {/* Bat Speed */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Bat Speed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.avgBatSpeed}</span>
                <span className="text-xs text-barrels-muted">mph</span>
              </div>
            </div>

            {/* Attack Angle */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">Attack Angle</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.avgAttackAngle}</span>
                <span className="text-xs text-barrels-muted">°</span>
              </div>
            </div>

            {/* On-Plane Time */}
            <div>
              <p className="text-xs text-barrels-muted uppercase tracking-wide mb-1">On-Plane</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{data.avgOnPlaneTime}</span>
                <span className="text-xs text-barrels-muted">%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#2E3440' }}>
            <p className="text-xs text-barrels-muted">Sessions completed: <span className="text-white font-semibold">{data.sessionsCompleted}</span></p>
          </div>
        </motion.div>

        {/* Blast Motion Upload Tile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Blast Motion Import</h2>
            <Upload className="w-5 h-5 text-barrels-gold" />
          </div>
          <p className="text-sm text-barrels-muted mb-4">
            Upload your Blast Motion CSV file to import bat metrics
          </p>

          <label className="block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="blast-upload"
            />
            <div className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-barrels-border bg-white/3 hover:bg-white/5 cursor-pointer transition-colors">
              {uploadedFile ? (
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-barrels-gold" />
                  <span className="text-sm text-white">{uploadedFile}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-barrels-muted" />
                  <span className="text-sm text-barrels-muted">Click to upload CSV</span>
                </div>
              )}
            </div>
          </label>

          {uploadedFile && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-barrels-muted text-center"
            >
              File uploaded successfully. Processing coming soon!
            </motion.p>
          )}
        </motion.div>

        {/* Progress Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Bat Speed Over Time</h2>
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
                  domain={[65, 80]}
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
                  dataKey="Bat Speed"
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
                      <span className="text-xs text-barrels-muted">{session.source}</span>
                      <span className="text-xs text-barrels-muted">•</span>
                      <span className="text-xs text-white">{session.batSpeed} mph</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{session.batScore}</p>
                  <p className="text-xs text-barrels-muted">Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
