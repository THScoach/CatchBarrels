import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import BrainDashboardClient from './brain-client'
import type { BrainGoNoGoSummary } from '@/lib/brain/types'

export default async function BrainDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  // Fetch real brain test data from database
  const sessions = await prisma.brainTestSession.findMany({
    where: {
      userId: session.user.id,
      completedAt: { not: null },
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: 20, // Last 20 tests
  })

  // Process sessions
  const processedSessions = sessions.map((s) => {
    const summary = s.summaryJson as any as BrainGoNoGoSummary | null
    const score = summary?.compositeScore ?? 0
    
    return {
      id: s.id,
      date: s.completedAt!,
      score,
      testType: s.type === 'GO_NO_GO' ? 'THS Brain Speed' : 'Brain Test',
      duration: '~2 min',
    }
  })

  // Calculate stats
  const scores = processedSessions.map((s) => s.score)
  const currentScore = scores[0] ?? 0
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0
  const testsCompleted = sessions.length

  const data = {
    currentScore,
    bestScore,
    testsCompleted,
    sessions: processedSessions,
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrainDashboardClient data={data} />
    </Suspense>
  )
}
