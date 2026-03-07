/**
 * One-time setup script to create the Supabase Storage bucket for uploads.
 *
 * Run this with:
 *   npx tsx scripts/setup-storage.ts
 *
 * Or manually in Supabase Dashboard > Storage > New Bucket > "uploads" (public)
 */

import { createClient } from '@supabase/supabase-js';

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.log('\nTo run this script, add SUPABASE_SERVICE_ROLE_KEY to your .env.local:');
    console.log('  1. Go to Supabase Dashboard > Settings > API');
    console.log('  2. Copy the "service_role" key (NOT the anon key)');
    console.log('  3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
    console.log('\nOr create the bucket manually:');
    console.log('  1. Go to Supabase Dashboard > Storage');
    console.log('  2. Click "New Bucket"');
    console.log('  3. Name: "uploads", Public: ✓');
    process.exit(1);
  }

  console.log('🔧 Setting up Supabase Storage...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets?.some(b => b.name === 'uploads');

  if (bucketExists) {
    console.log('✅ Bucket "uploads" already exists');
    process.exit(0);
  }

  // Create the bucket
  console.log('📦 Creating bucket "uploads"...');

  const { data, error } = await supabase.storage.createBucket('uploads', {
    public: true,
    fileSizeLimit: 10485760, // 10 MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
  });

  if (error) {
    console.error('❌ Failed to create bucket:', error.message);
    process.exit(1);
  }

  console.log('✅ Bucket "uploads" created successfully!');
  console.log('\n🎉 Setup complete. Image uploads will now work.');
}

setupStorage().catch(console.error);
