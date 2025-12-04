import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import BallDashboardClient from './ball-client'

export default async function BallDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  // TODO: Fetch real ball tracking data from database
  // For now, using mock data for demo
  const mockData = {
    currentBallScore: 89,
    avgExitVelo: 87.3,
    avgLaunchAngle: 22.5,
    hardHitPercent: 68,
    sessionsCompleted: 4,
    sessions: [
      {
        id: '1',
        date: new Date('2025-11-20'),
        exitVelo: 88.5,
        launchAngle: 23.2,
        games: 3,
        ballScore: 89,
      },
      {
        id: '2',
        date: new Date('2025-11-15'),
        exitVelo: 87.2,
        launchAngle: 22.8,
        games: 2,
        ballScore: 87,
      },
      {
        id: '3',
        date: new Date('2025-11-10'),
        exitVelo: 86.5,
        launchAngle: 21.9,
        games: 3,
        ballScore: 85,
      },
      {
        id: '4',
        date: new Date('2025-11-05'),
        exitVelo: 85.8,
        launchAngle: 21.2,
        games: 2,
        ballScore: 83,
      },
    ],
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BallDashboardClient data={mockData} />
    </Suspense>
  )
}
