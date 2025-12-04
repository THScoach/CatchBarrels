
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper function to get Zoom credentials from environment variables
function getZoomCredentials() {
  return {
    accountId: process.env.ZOOM_ACCOUNT_ID,
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET
  };
}

// Helper function to get Zoom OAuth access token
async function getZoomAccessToken() {
  try {
    const { accountId, clientId, clientSecret } = getZoomCredentials();
    
    if (!accountId || !clientId || !clientSecret) {
      console.log('Zoom credentials not configured');
      return null;
    }
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Zoom access token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    return null;
  }
}

// Helper function to extract meeting UUID from Zoom link
function extractMeetingUuid(zoomLink: string): string | null {
  try {
    // Try to extract from share link format: https://zoom.us/rec/share/...
    if (zoomLink.includes('/rec/share/')) {
      const parts = zoomLink.split('/rec/share/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('/')[0];
      }
    }
    
    // Try to extract from play link format: https://zoom.us/rec/play/...
    if (zoomLink.includes('/rec/play/')) {
      const parts = zoomLink.split('/rec/play/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('/')[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting meeting UUID:', error);
    return null;
  }
}

// Helper function to fetch transcript from Zoom
async function fetchZoomTranscript(meetingUuid: string, accessToken: string): Promise<string | null> {
  try {
    // URL encode the UUID (double encoding for UUIDs with slashes)
    const encodedUuid = encodeURIComponent(encodeURIComponent(meetingUuid));
    
    // First, get the list of recordings for this meeting
    const recordingsResponse = await fetch(`https://api.zoom.us/v2/meetings/${encodedUuid}/recordings`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!recordingsResponse.ok) {
      console.error('Failed to fetch recordings:', recordingsResponse.statusText);
      return null;
    }
    
    const recordingsData = await recordingsResponse.json();
    
    // Find the transcript file in the recording files
    const transcriptFile = recordingsData.recording_files?.find((file: any) => 
      file.file_type === 'TRANSCRIPT' || file.recording_type === 'audio_transcript'
    );
    
    if (!transcriptFile || !transcriptFile.download_url) {
      console.log('No transcript found for this recording');
      return null;
    }
    
    // Download the transcript
    const transcriptResponse = await fetch(transcriptFile.download_url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!transcriptResponse.ok) {
      console.error('Failed to download transcript:', transcriptResponse.statusText);
      return null;
    }
    
    const transcriptText = await transcriptResponse.text();
    return transcriptText;
  } catch (error) {
    console.error('Error fetching Zoom transcript:', error);
    return null;
  }
}

// GET - Fetch all coaching sessions (public, for all users)
export async function GET() {
  try {
    const sessions = await prisma.coachingCall.findMany({
      orderBy: {
        callDate: 'desc'
      }
    });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new coaching session (admin only) with transcript fetching
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin check here once you have admin roles
    // For now, any logged-in user can add (you can change this later)
    
    const body = await request.json();
    const { title, zoomLink, description, callDate, duration, topics } = body;
    
    // Validate required fields
    if (!title || !zoomLink || !callDate) {
      return NextResponse.json(
        { error: 'Title, Zoom link, and call date are required' },
        { status: 400 }
      );
    }
    
    let transcript = null;
    
    // Try to fetch transcript from Zoom
    try {
      const accessToken = await getZoomAccessToken();
      if (accessToken) {
        const meetingUuid = extractMeetingUuid(zoomLink);
        if (meetingUuid) {
          console.log('Fetching transcript for meeting:', meetingUuid);
          transcript = await fetchZoomTranscript(meetingUuid, accessToken);
          if (transcript) {
            console.log('Successfully fetched transcript');
          } else {
            console.log('No transcript available for this meeting');
          }
        } else {
          console.log('Could not extract meeting UUID from link');
        }
      }
    } catch (error) {
      console.error('Error during transcript fetch (non-blocking):', error);
      // Continue without transcript - don't fail the whole operation
    }
    
    // Create the coaching session with transcript
    const coachingCall = await prisma.coachingCall.create({
      data: {
        title,
        zoomLink,
        description: description || null,
        callDate: new Date(callDate),
        duration: duration ? parseInt(duration) : null,
        topics: topics || [],
        transcript: transcript
      }
    });
    
    return NextResponse.json(coachingCall, { status: 201 });
  } catch (error) {
    console.error('Error creating coaching session:', error);
    return NextResponse.json(
      { error: 'Failed to create coaching session' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a coaching session (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.coachingCall.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coaching session:', error);
    return NextResponse.json(
      { error: 'Failed to delete coaching session' },
      { status: 500 }
    );
  }
}
