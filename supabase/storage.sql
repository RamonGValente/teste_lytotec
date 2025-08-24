
-- Create the avatars bucket if it doesn't exist already
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access on avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Create a policy to allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated users to upload their avatar" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'profile-images');

-- Create a policy to allow users to update their own avatar
CREATE POLICY "Allow users to update their own avatar" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'profile-images');
