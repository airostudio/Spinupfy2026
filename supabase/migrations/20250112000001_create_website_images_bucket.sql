-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload images to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;

-- Delete existing bucket if it exists (this will fail if there are objects in it)
-- To force delete with objects, uncomment the next line (WARNING: deletes all images)
-- DELETE FROM storage.objects WHERE bucket_id = 'website-images';
DELETE FROM storage.buckets WHERE id = 'website-images';

-- Create storage bucket for website images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-images',
  'website-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
);

-- Storage policies for website-images bucket

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all images (since bucket is public)
CREATE POLICY "Public can view all images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-images');
