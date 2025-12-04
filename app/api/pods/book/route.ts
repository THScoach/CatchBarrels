import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { podSlotId } = await request.json();

    if (!podSlotId) {
      return NextResponse.json({ error: 'POD slot ID required' }, { status: 400 });
    }

    // Fetch user to check POD credits and tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipTier: true,
        podCreditsAvailable: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has Hybrid tier
    if (user.membershipTier !== 'hybrid') {
      return NextResponse.json(
        { error: 'POD sessions are only available for Hybrid tier members' },
        { status: 403 }
      );
    }

    // Check if user has POD credits
    if (user.podCreditsAvailable <= 0) {
      return NextResponse.json(
        { error: 'No POD credits available' },
        { status: 403 }
      );
    }

    // Check if slot exists
    const slot = await prisma.podSlot.findUnique({
      where: { id: podSlotId },
      include: {
        bookings: {
          where: {
            status: 'confirmed',
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json({ error: 'POD slot not found' }, { status: 404 });
    }

    // Check if slot is in the past
    if (new Date(slot.date) < new Date()) {
      return NextResponse.json({ error: 'Cannot book past slots' }, { status: 400 });
    }

    // Check if slot is full
    if (slot.bookings.length >= slot.maxAthletes) {
      return NextResponse.json({ error: 'POD slot is full' }, { status: 400 });
    }

    // Check if user already has a booking for this slot
    const existingBooking = await prisma.podBooking.findUnique({
      where: {
        userId_podSlotId: {
          userId,
          podSlotId,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this slot' },
        { status: 400 }
      );
    }

    // Create booking and deduct credit in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.podBooking.create({
        data: {
          userId,
          podSlotId,
          status: 'confirmed',
          creditDeducted: true,
        },
      });

      // Deduct POD credit
      await tx.user.update({
        where: { id: userId },
        data: {
          podCreditsAvailable: {
            decrement: 1,
          },
          podCreditsUsed: {
            increment: 1,
          },
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('[POD Book] Error:', error);
    return NextResponse.json(
      { error: 'Failed to book POD session' },
      { status: 500 }
    );
  }
}
