import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import PodsClient from './pods-client';
import { addDays, startOfDay, isSaturday, isSunday } from 'date-fns';

export const metadata: Metadata = {
  title: 'POD Sessions | CatchBarrels',
  description: 'Book in-person POD training sessions',
};

export default async function PodsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/pods');
  }

  const userId = (session.user as any).id;

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      membershipTier: true,
      podCreditsAvailable: true,
      podCreditsUsed: true,
    },
  });

  if (!user) {
    redirect('/dashboard');
  }

  // Get next 4 weekends (8 days)
  const getUpcomingWeekends = () => {
    const weekends: Date[] = [];
    let currentDate = new Date();
    
    while (weekends.length < 8) {
      if (isSaturday(currentDate) || isSunday(currentDate)) {
        weekends.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return weekends;
  };

  const weekendDates = getUpcomingWeekends();

  // Fetch or create POD slots for upcoming weekends
  const slots = await Promise.all(
    weekendDates.map(async (date) => {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const times = [
        { start: '12:00', end: '12:30' },
        { start: '12:30', end: '13:00' },
        { start: '13:00', end: '13:30' },
        { start: '13:30', end: '14:00' },
        { start: '14:00', end: '14:30' },
      ];

      // Create or find slots for each time
      const daySlots = await Promise.all(
        times.map(async (time) => {
          const startOfDate = startOfDay(date);
          
          // Check if slot exists
          let slot = await prisma.podSlot.findUnique({
            where: {
              date_startTime: {
                date: startOfDate,
                startTime: time.start,
              },
            },
            include: {
              bookings: {
                where: {
                  status: 'confirmed',
                },
                select: {
                  id: true,
                  userId: true,
                  status: true,
                },
              },
            },
          });

          // Create slot if it doesn't exist
          if (!slot) {
            slot = await prisma.podSlot.create({
              data: {
                date: startOfDate,
                dayOfWeek,
                startTime: time.start,
                endTime: time.end,
                maxAthletes: 3,
              },
              include: {
                bookings: {
                  where: {
                    status: 'confirmed',
                  },
                  select: {
                    id: true,
                    userId: true,
                    status: true,
                  },
                },
              },
            });
          }

          return slot;
        })
      );

      return daySlots;
    })
  );

  const allSlots = slots.flat();

  // Fetch user's bookings
  const userBookings = await prisma.podBooking.findMany({
    where: {
      userId,
      status: 'confirmed',
      podSlot: {
        date: {
          gte: new Date(),
        },
      },
    },
    include: {
      podSlot: {
        select: {
          id: true,
          date: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: {
      podSlot: {
        date: 'asc',
      },
    },
  });

  return (
    <PodsClient
      initialSlots={JSON.parse(JSON.stringify(allSlots))}
      userBookings={JSON.parse(JSON.stringify(userBookings))}
      podCredits={user.podCreditsAvailable}
      userTier={user.membershipTier}
    />
  );
}
