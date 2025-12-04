import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import BatDashboardClient from './bat-client'

export default async function BatDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  // TODO: Fetch real bat metrics data from database
  // For now, using mock data for demo
  const mockData = {
    currentBatScore: 87,
    avgBatSpeed: 72.5,
    avgAttackAngle: 18.3,
    avgOnPlaneTime: 84,
    sessionsCompleted: 5,
    sessions: [
      {
        id: '1',
        date: new Date('2025-11-20'),
        batSpeed: 73.2,
        attackAngle: 19.1,
        onPlaneTime: 86,
        source: 'BARRELS Session',
        batScore: 87,
      },
      {
        id: '2',
        date: new Date('2025-11-15'),
        batSpeed: 72.8,
        attackAngle: 18.5,
        onPlaneTime: 85,
        source: 'Blast Import',
        batScore: 85,
      },
      {
        id: '3',
        date: new Date('2025-11-10'),
        batSpeed: 71.9,
        attackAngle: 17.8,
        onPlaneTime: 82,
        source: 'BARRELS Session',
        batScore: 83,
      },
      {
        id: '4',
        date: new Date('2025-11-05'),
        batSpeed: 71.2,
        attackAngle: 17.2,
        onPlaneTime: 80,
        source: 'Blast Import',
        batScore: 81,
      },
      {
        id: '5',
        date: new Date('2025-10-30'),
        batSpeed: 70.5,
        attackAngle: 16.8,
        onPlaneTime: 78,
        source: 'BARRELS Session',
        batScore: 79,
      },
    ],
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BatDashboardClient data={mockData} />
    </Suspense>
  )
}
