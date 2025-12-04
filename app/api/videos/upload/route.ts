
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { canStartNewSession, getTierConfig, type MembershipTier } from '@/lib/membership-tiers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.error('[Video Upload] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'player';
    console.log(`[Video Upload] User ${userId} (role: ${userRole}) initiated upload`);

    // Fetch user to check membership tier and enforce session caps
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        membershipTier: true,
        membershipStatus: true,
      },
    });

    if (!user) {
      console.error('[Video Upload] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Enforce session caps (exempt admins and coaches)
    if (userRole !== 'admin' && userRole !== 'coach') {
      // Get start of current week (Sunday 12:01 AM CST)
      // CST is UTC-6 (or UTC-5 during DST)
      const now = new Date();

      // Convert to CST (for simplicity, using UTC-6)
      const cstOffset = -6 * 60; // CST is UTC-6
      const cstNow = new Date(now.getTime() + (cstOffset + now.getTimezoneOffset()) * 60000);

      // Get Sunday of this week at 00:01 CST
      const dayOfWeek = cstNow.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysFromSunday = dayOfWeek; // Days since Sunday

      const startOfWeek = new Date(cstNow);
      startOfWeek.setDate(cstNow.getDate() - daysFromSunday);
      startOfWeek.setHours(0, 1, 0, 0); // 12:01 AM

      // Convert back to UTC for database comparison
      const startOfWeekUTC = new Date(startOfWeek.getTime() - (cstOffset + now.getTimezoneOffset()) * 60000);

      // Count sessions this week
      const sessionsThisWeek = await prisma.video.count({
        where: {
          userId,
          uploadDate: {
            gte: startOfWeekUTC,
          },
        },
      });

      console.log(`[Video Upload] User ${userId} has ${sessionsThisWeek} sessions this week (tier: ${user.membershipTier})`);

      // Check if user can start a new session
      const canStart = canStartNewSession(user.membershipTier as MembershipTier, sessionsThisWeek);
      if (!canStart.allowed) {
        console.log(`[Video Upload] Session cap reached for user ${userId}: ${canStart.reason}`);
        return NextResponse.json(
          {
            error: 'Session limit reached',
            message: canStart.reason,
            sessionsThisWeek,
            membershipTier: user.membershipTier,
          },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const videoType = formData.get('videoType') as string;
    const sessionId = formData.get('sessionId') as string | null;

    if (!videoFile) {
      console.error('[Video Upload] No video file in request');
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!videoType) {
      console.error('[Video Upload] No video type provided');
      return NextResponse.json({ error: 'Video type is required' }, { status: 400 });
    }

    console.log(`[Video Upload] File: ${videoFile.name}, Size: ${(videoFile.size / 1024 / 1024).toFixed(2)}MB, Type: ${videoType}`);

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'];
    if (!validTypes.includes(videoFile.type) && !videoFile.name.match(/\.(mp4|mov|avi|wmv|webm)$/i)) {
      console.error(`[Video Upload] Invalid file type: ${videoFile.type}`);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, MOV, AVI, WMV, or WEBM files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (videoFile.size > maxSize) {
      console.error(`[Video Upload] File too large: ${videoFile.size} bytes`);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 413 }
      );
    }

    console.log(`[Video Upload] Starting upload for user ${userId}: ${videoFile.name}`);

    // Convert file to buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `videos/${timestamp}-${sanitizedName}`;

    console.log(`[Video Upload] Generated S3 key: ${fileName}`);

    // Upload to S3 with error handling
    let cloudStoragePath: string;
    try {
      cloudStoragePath = await uploadFile(buffer, fileName);
      console.log(`[Video Upload] S3 upload successful: ${cloudStoragePath}`);
    } catch (s3Error) {
      console.error('[Video Upload] S3 upload failed:', s3Error);
      console.error('[Video Upload] S3 Error details:', {
        message: (s3Error as any)?.message,
        code: (s3Error as any)?.code,
        statusCode: (s3Error as any)?.$metadata?.httpStatusCode,
      });
      return NextResponse.json(
        { error: 'Failed to upload video to storage. Please try again.' },
        { status: 500 }
      );
    }

    // Get swing limit for user's tier
    const tierConfig = getTierConfig(user.membershipTier as MembershipTier);
    const swingLimit = tierConfig.swingsPerSession;

    console.log(`[Video Upload] User tier: ${user.membershipTier}, Swing limit: ${swingLimit}`);

    // Create video record in database
    console.log(`[Video Upload] Creating database record for user ${userId}`);
    const video = await prisma.video.create({
      data: {
        userId: userId,
        sessionId: sessionId || null, // Optional - links video to training session
        title: videoFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        videoType: videoType,
        videoUrl: cloudStoragePath, // Store S3 key
        thumbnailUrl: '', // Will be generated later
        analyzed: false,
        skeletonStatus: 'PENDING', // Automatic skeleton extraction will process this
        swingCount: 0, // Will be updated during analysis
        swingLimit: swingLimit, // Store tier's swing limit at upload time
      },
    });

    console.log(`[Video Upload] Created video ${video.id} with skeleton status PENDING`);

    console.log(`✅ Video saved to database: ${video.id}`);
    console.log(`🚀 Triggering analysis for video: ${video.id}`);

    // Trigger analysis immediately
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catchbarrels.app';
    const analysisUrl = `${baseUrl}/api/videos/analyze`;

    console.log(`📡 Calling analysis endpoint: ${analysisUrl}`);

    fetch(analysisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId: video.id }),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log(`✅ Analysis response:`, data);
      })
      .catch((error) => {
        console.error(`❌ Analysis failed:`, error);
      });

    console.log(`📤 Analysis request sent (non-blocking)`);

    // Return video with id at top level for easier client parsing
    return NextResponse.json(
      {
        id: video.id,
        videoId: video.id, // Backwards compatibility
        video,
        message: 'Video uploaded successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Video Upload] Error:', error);

    // Return more specific error message
    const errorMessage = error?.message || 'Failed to upload video';
    return NextResponse.json(
      { error: errorMessage, details: 'Please check your file and try again.' },
      { status: 500 }
    );
  }
}
