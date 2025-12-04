import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();

    const description = formData.get('description') as string;
    const whereHappened = formData.get('whereHappened') as string;
    const sessionId = formData.get('sessionId') as string | null;
    const videoId = formData.get('videoId') as string | null;
    const pageUrl = formData.get('pageUrl') as string | null;
    const userAgent = formData.get('userAgent') as string | null;
    const screenshot = formData.get('screenshot') as File | null;

    if (!description || !whereHappened) {
      return NextResponse.json(
        { error: 'Description and location are required' },
        { status: 400 }
      );
    }

    let screenshotUrl: string | null = null;

    // Upload screenshot if provided
    if (screenshot) {
      try {
        // For now, store as data URL (TODO: implement S3 upload if needed)
        const buffer = Buffer.from(await screenshot.arrayBuffer());
        const base64 = buffer.toString('base64');
        screenshotUrl = `data:${screenshot.type};base64,${base64}`;
      } catch (error) {
        console.error('Screenshot upload error:', error);
        // Continue without screenshot if upload fails
      }
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.user ? (session.user as any).id : null,
        userEmail: session?.user?.email || null,
        role: session?.user ? (session.user as any).role : null,
        whereHappened,
        description,
        screenshotUrl,
        pageUrl,
        userAgent,
        extraContext: {
          sessionId,
          videoId,
          timestamp: new Date().toISOString(),
        },
        status: 'open',
      },
    });

    // Log to console for immediate notification
    console.log(`
======================================
NEW SUPPORT TICKET: ${ticket.id}
======================================
User: ${session?.user?.name || 'Anonymous'} (${session?.user?.email || 'no email'})
Where: ${whereHappened}
Description: ${description}
Page URL: ${pageUrl}
Screenshot: ${screenshotUrl ? 'Yes' : 'No'}
Timestamp: ${new Date().toISOString()}
======================================
`);

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
