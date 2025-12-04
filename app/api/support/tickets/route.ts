
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// POST /api/support/tickets - Submit a new support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const whereHappened = formData.get('whereHappened') as string;
    const description = formData.get('description') as string;
    const screenshotFile = formData.get('screenshot') as File | null;
    const pageUrl = formData.get('pageUrl') as string;
    const includeDebug = formData.get('includeDebug') === 'true';

    // Validate required fields
    if (!whereHappened) {
      return NextResponse.json(
        { error: 'whereHappened is required' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      );
    }

    console.log(`[Support Ticket] New ticket from user ${(session.user as any).id}`);

    // Upload screenshot if provided
    let screenshotUrl: string | null = null;
    if (screenshotFile) {
      try {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
        if (!validTypes.includes(screenshotFile.type)) {
          return NextResponse.json(
            { error: 'Invalid file type. Please upload PNG, JPEG, or HEIC images.' },
            { status: 400 }
          );
        }

        // Validate file size (max 10MB for screenshots)
        const maxSize = 10 * 1024 * 1024;
        if (screenshotFile.size > maxSize) {
          return NextResponse.json(
            { error: 'Screenshot too large. Maximum size is 10MB.' },
            { status: 413 }
          );
        }

        // Convert to buffer
        const bytes = await screenshotFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = screenshotFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `support/${timestamp}-${sanitizedName}`;

        // Upload to S3
        screenshotUrl = await uploadFile(buffer, fileName);
        console.log(`[Support Ticket] Screenshot uploaded: ${screenshotUrl}`);
      } catch (uploadError) {
        console.error('[Support Ticket] Screenshot upload failed:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload screenshot. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Collect debug context if enabled
    let extraContext: any = null;
    if (includeDebug) {
      const userAgent = request.headers.get('user-agent') || undefined;
      extraContext = {
        browser: userAgent?.match(/\((.+?)\)/)?.[1] || 'Unknown',
        platform: userAgent?.match(/\((.+?)\)/)?.[1]?.split(';')[0] || 'Unknown',
        timestamp: new Date().toISOString(),
      };
    }

    // Create ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: (session.user as any).id,
        userEmail: (session.user as any).email || undefined,
        role: (session.user as any).role || 'player',
        whereHappened,
        description: description.trim(),
        screenshotUrl,
        userAgent: request.headers.get('user-agent') || undefined,
        pageUrl,
        extraContext,
        status: 'open',
      },
    });

    console.log(`[Support Ticket] Created ticket ${ticket.id}`);

    // TODO: Send notification email (will be implemented in next step)
    // For now, just log that we should send an email
    console.log(`[Support Ticket] Should send email to coach@catchbarrels.app about ticket ${ticket.id}`);

    return NextResponse.json(
      {
        success: true,
        ticketId: ticket.id,
        message: 'Support ticket submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Support Ticket] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to submit support ticket',
        details: error?.message || 'Please try again later.',
      },
      { status: 500 }
    );
  }
}

// GET /api/support/tickets - Get all support tickets (admin only)
export async function GET(request: NextRequest) {
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

    // Get all tickets ordered by most recent
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 tickets
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Generate signed URLs for screenshots (if they exist)
    const { getSignedDownloadUrl } = await import('@/lib/s3');
    const ticketsWithSignedUrls = await Promise.all(
      tickets.map(async (ticket) => {
        if (ticket.screenshotUrl) {
          try {
            const signedUrl = await getSignedDownloadUrl(ticket.screenshotUrl);
            return { ...ticket, screenshotSignedUrl: signedUrl };
          } catch (error) {
            console.error(`Failed to generate signed URL for ${ticket.screenshotUrl}:`, error);
            return { ...ticket, screenshotSignedUrl: null };
          }
        }
        return { ...ticket, screenshotSignedUrl: null };
      })
    );

    return NextResponse.json({ tickets: ticketsWithSignedUrls }, { status: 200 });
  } catch (error: any) {
    console.error('[Support Tickets GET] Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}
