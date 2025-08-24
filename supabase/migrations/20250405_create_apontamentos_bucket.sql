
-- Create apontamentos bucket for storing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('apontamentos', 'apontamentos', true);

-- Create policy to allow authenticated users to upload files to the apontamentos bucket
CREATE POLICY "Allow users to upload files to apontamentos" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'apontamentos');

-- Create policy to allow public to view files in apontamentos bucket
CREATE POLICY "Allow public to view files in apontamentos" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id = 'apontamentos');

-- Create policy to allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files in apontamentos" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'apontamentos' AND auth.uid() = owner);

-- Create policy to allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files in apontamentos" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'apontamentos' AND auth.uid() = owner);
