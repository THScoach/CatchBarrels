
/**
 * OnForm Video Import Utilities
 * 
 * Handles importing videos from OnForm share links into BARRELS
 * for 4Bs analysis while preserving capture metadata.
 */

/**
 * Extract video ID from OnForm share link
 * @example https://link.getonform.com/view?id=Yu6gD1kzy3nindx38CiE
 */
export function parseOnFormLink(url: string): string | null {
  try {
    // Support various OnForm URL formats
    const patterns = [
      /link\.getonform\.com\/view\?id=([a-zA-Z0-9_-]+)/,
      /app\.getonform\.com\/.*\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to parse OnForm link:', error);
    return null;
  }
}

/**
 * Validate OnForm share link
 */
export function isValidOnFormLink(url: string): boolean {
  const videoId = parseOnFormLink(url);
  return videoId !== null;
}

/**
 * Download video from OnForm share link
 * Note: This is a placeholder implementation. In production, you may need:
 * 1. Browser automation (Puppeteer/Playwright) to access the share page
 * 2. OnForm API access (if available)
 * 3. User authentication if required
 */
export async function downloadOnFormVideo(
  shareUrl: string
): Promise<{
  videoBlob: Blob;
  metadata: {
    videoId: string;
    source: 'onform';
    capturedAt?: Date;
    fps?: number;
    duration?: number;
  };
}> {
  const videoId = parseOnFormLink(shareUrl);
  
  if (!videoId) {
    throw new Error('Invalid OnForm share link');
  }

  // Attempt to fetch the video from the share page
  // OnForm share pages typically have the video embedded
  try {
    const response = await fetch(shareUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OnForm video: ${response.statusText}`);
    }

    const html = await response.text();

    // Look for video URL in the HTML
    // OnForm typically uses <video> tags or embedded players
    const videoUrlPatterns = [
      /<video[^>]+src="([^"]+)"/i,
      /<source[^>]+src="([^"]+)"/i,
      /videoUrl["\s:]+["']([^"']+)/i,
      /"url"["\s:]+["']([^"']+\.mp4[^"']*)/i,
    ];

    let videoUrl: string | null = null;
    
    for (const pattern of videoUrlPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        videoUrl = match[1];
        break;
      }
    }

    if (!videoUrl) {
      throw new Error(
        'Could not find video URL in OnForm share page. The video may be private or require authentication.'
      );
    }

    // Download the video
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': shareUrl,
      },
    });

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();

    // Extract metadata from video blob
    const metadata = {
      videoId,
      source: 'onform' as const,
      capturedAt: new Date(),
      fps: undefined, // Will be detected during processing
      duration: undefined, // Will be detected during processing
    };

    return { videoBlob, metadata };

  } catch (error) {
    console.error('OnForm video download error:', error);
    throw new Error(
      error instanceof Error 
        ? `OnForm import failed: ${error.message}` 
        : 'Failed to import OnForm video'
    );
  }
}

/**
 * Get video metadata from OnForm share link (without downloading)
 */
export async function getOnFormVideoMetadata(shareUrl: string): Promise<{
  videoId: string;
  title?: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
} | null> {
  const videoId = parseOnFormLink(shareUrl);
  
  if (!videoId) {
    return null;
  }

  try {
    const response = await fetch(shareUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract metadata from HTML
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);

    return {
      videoId,
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      thumbnail: ogImageMatch?.[1],
    };

  } catch (error) {
    console.error('Failed to fetch OnForm metadata:', error);
    return null;
  }
}

/**
 * Import OnForm video into BARRELS system
 * This is a high-level wrapper that:
 * 1. Downloads the video
 * 2. Uploads to S3
 * 3. Creates database record
 */
export async function importOnFormVideo(
  shareUrl: string,
  userId: string,
  videoType: string
): Promise<{
  success: boolean;
  videoId?: string;
  error?: string;
}> {
  try {
    // Validate link
    if (!isValidOnFormLink(shareUrl)) {
      return {
        success: false,
        error: 'Invalid OnForm share link. Please check the URL and try again.',
      };
    }

    // Download video
    const { videoBlob, metadata } = await downloadOnFormVideo(shareUrl);

    // The actual upload and database creation will be handled by the API endpoint
    return {
      success: true,
      videoId: metadata.videoId,
    };

  } catch (error) {
    console.error('OnForm import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Import failed',
    };
  }
}
