
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/support/tickets/[id] - Update ticket status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or coach
    const userRole = (session.user as any).role || 'player';
    if (userRole !== 'admin' && userRole !== 'coach') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: open, in_progress, resolved' },
        { status: 400 }
      );
    }

    // Update ticket
    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status },
    });

    console.log(`[Support Ticket] Updated ticket ${params.id} to status: ${status}`);

    return NextResponse.json(
      {
        success: true,
        ticket,
        message: 'Ticket status updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Support Ticket PATCH] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
