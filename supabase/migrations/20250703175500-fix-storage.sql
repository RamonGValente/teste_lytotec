-- Add updated_at column to storage.objects if missing
ALTER TABLE IF EXISTS storage.objects
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- RLS policy updates for avatars bucket
DROP POLICY IF EXISTS "Allow public read access on avatars" ON storage.objects;
CREATE POLICY "Allow public read access on avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated users to upload their avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload their avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'profile-images');

DROP POLICY IF EXISTS "Allow users to update their own avatar" ON storage.objects;
CREATE POLICY "Allow users to update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner);
