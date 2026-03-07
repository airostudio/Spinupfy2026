import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

/**
 * Image upload API endpoint.
 * Uploads files to Supabase Storage (works in serverless environments).
 *
 * Bucket setup (run once in Supabase Dashboard > Storage):
 *   1. Create a public bucket named "uploads"
 *   2. Set public access policies or use RLS to control access
 *
 * Pass an optional `websiteId` field in FormData to organize images
 * into per-site subfolders: uploads/{websiteId}/{filename}
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user ID
    const rateLimit = checkRateLimit(`upload:${user.id}`, { windowMs: 60 * 1000, maxRequests: 20 });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetIn);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const websiteId = (formData.get('websiteId') as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, GIF, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Determine storage path — organize by website when provided
    const storagePath = websiteId ? `${websiteId}/${filename}` : filename;

    // Convert File to ArrayBuffer
    const bytes = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', message);
    return NextResponse.json({ error: `Failed to upload file: ${message}` }, { status: 500 });
  }
}
