import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const bookingId = params.id;

    // Find the booking
    const booking = await prisma.podBooking.findUnique({
      where: { id: bookingId },
      include: {
        podSlot: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if POD session is in the past
    if (new Date(booking.podSlot.date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel past POD sessions' },
        { status: 400 }
      );
    }

    // Cancel booking and refund credit in a transaction
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.podBooking.update({
        where: { id: bookingId },
        data: {
          status: 'cancelled',
        },
      });

      // Refund POD credit if it was deducted
      if (booking.creditDeducted) {
        await tx.user.update({
          where: { id: userId },
          data: {
            podCreditsAvailable: {
              increment: 1,
            },
            podCreditsUsed: {
              decrement: 1,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('[POD Cancel] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
