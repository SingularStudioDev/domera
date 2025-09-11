// =============================================================================
// SUPABASE STORAGE OPERATIONS
// Using native Supabase Storage API for better compatibility
// =============================================================================

import { createClient } from "@supabase/supabase-js";

import type { Result } from "@/lib/dal/base";
import { failure, success } from "@/lib/dal/base";

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// =============================================================================
// S3 STORAGE OPERATIONS
// =============================================================================

export async function uploadFileToS3(
  file: File,
  key: string,
  bucket: string = process.env.SUPABASE_S3_BUCKET_NAME || "files",
): Promise<Result<{ key: string; url: string }>> {
  try {
    console.log('🔧 Supabase Storage Config:', {
      bucket,
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    
    const supabase = createSupabaseClient();

    // Upload file using Supabase Storage API
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return failure(`Error uploading file to Supabase Storage: ${error.message}`);
    }

    // Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(key);

    return success({
      key,
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("Supabase storage error:", error);
    return failure(
      `Error uploading file to Supabase Storage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function deleteFileFromS3(
  key: string,
  bucket: string = process.env.SUPABASE_S3_BUCKET_NAME || "files",
): Promise<Result<boolean>> {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([key]);

    if (error) {
      console.error("Supabase storage delete error:", error);
      return failure(`Error deleting file from Supabase Storage: ${error.message}`);
    }

    return success(true);
  } catch (error) {
    console.error("Supabase storage delete error:", error);
    return failure(
      `Error deleting file from Supabase Storage: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
