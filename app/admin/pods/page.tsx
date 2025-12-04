import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import PodsAdminClient from './pods-admin-client';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export const metadata: Metadata = {
  title: 'POD Management | Admin',
  description: 'Manage POD sessions and attendance',
};

export default async function AdminPodsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'admin' && userRole !== 'coach') {
    redirect('/dashboard');
  }

  // Get current week's POD slots
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const slots = await prisma.podSlot.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: addWeeks(weekEnd, 4), // Next 4 weeks
      },
    },
    include: {
      bookings: {
        where: {
          status: { in: ['confirmed', 'attended', 'no_show'] },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });

  return <PodsAdminClient slots={JSON.parse(JSON.stringify(slots))} />;
}
