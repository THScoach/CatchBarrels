
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

/**
 * Detect video content type from file extension
 */
function getVideoContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  
  const contentTypeMap: Record<string, string> = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    '3gp': 'video/3gpp',
  };
  
  return contentTypeMap[ext || ''] || 'video/mp4'; // Default to mp4 if unknown
}

export async function uploadFile(buffer: Buffer, fileName: string, contentType?: string): Promise<string> {
  const key = `${folderPrefix}${fileName}`;
  
  // Auto-detect content type if not provided
  const finalContentType = contentType || getVideoContentType(fileName);
  
  console.log(`Uploading to S3: ${fileName} (${finalContentType})`);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: finalContentType,
  });

  await s3Client.send(command);
  return key;
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  // URL expires in 1 hour
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}
