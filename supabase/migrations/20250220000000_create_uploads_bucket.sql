-- Create storage bucket for uploads (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view uploads" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- Allow public read access to all uploads (since bucket is public)
CREATE POLICY "Public can view uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
