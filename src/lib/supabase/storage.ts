// =============================================================================
// SUPABASE S3 CLIENT FOR STORAGE OPERATIONS
// Direct S3 integration for better performance and reliability
// =============================================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Result } from '@/lib/dal/base';
import { success, failure } from '@/lib/dal/base';

// =============================================================================
// S3 CLIENT CONFIGURATION
// =============================================================================

function createS3Client(): S3Client {
  return new S3Client({
    forcePathStyle: true,
    region: process.env.SUPABASE_S3_REGION || 'sa-east-1',
    endpoint: process.env.SUPABASE_S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
      secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!,
    },
  });
}

// =============================================================================
// S3 STORAGE OPERATIONS
// =============================================================================

export async function uploadFileToS3(
  file: File,
  key: string,
  bucket: string = 'files'
): Promise<Result<{ key: string; url: string }>> {
  try {
    const s3Client = createS3Client();
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=3600',
    });

    await s3Client.send(command);
    
    // Generate public URL
    const publicUrl = `${process.env.SUPABASE_S3_PUBLIC_URL}/${bucket}/${key}`;
    
    return success({
      key,
      url: publicUrl
    });
    
  } catch (error) {
    console.error('S3 upload error:', error);
    return failure(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFileFromS3(
  key: string,
  bucket: string = 'files'
): Promise<Result<boolean>> {
  try {
    const s3Client = createS3Client();
    
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    return success(true);
    
  } catch (error) {
    console.error('S3 delete error:', error);
    return failure(`Failed to delete from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}