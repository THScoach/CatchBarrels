import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import BodyDashboardClient from './body-client'

export default async function BodyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  // TODO: Fetch real swing assessment data from database
  // For now, using mock data for demo
  const mockData = {
    currentAnchor: 82,
    currentEngine: 88,
    currentWhip: 85,
    sessionsCompleted: 6,
    sessions: [
      {
        id: '1',
        date: new Date('2025-11-20'),
        anchor: 82,
        engine: 88,
        whip: 85,
        bodyScore: 85,
      },
      {
        id: '2',
        date: new Date('2025-11-15'),
        anchor: 80,
        engine: 86,
        whip: 83,
        bodyScore: 83,
      },
      {
        id: '3',
        date: new Date('2025-11-10'),
        anchor: 78,
        engine: 85,
        whip: 82,
        bodyScore: 82,
      },
      {
        id: '4',
        date: new Date('2025-11-05'),
        anchor: 75,
        engine: 83,
        whip: 80,
        bodyScore: 79,
      },
      {
        id: '5',
        date: new Date('2025-10-30'),
        anchor: 73,
        engine: 80,
        whip: 78,
        bodyScore: 77,
      },
      {
        id: '6',
        date: new Date('2025-10-25'),
        anchor: 70,
        engine: 78,
        whip: 75,
        bodyScore: 74,
      },
    ],
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BodyDashboardClient data={mockData} />
    </Suspense>
  )
}
