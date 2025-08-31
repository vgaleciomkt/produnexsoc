/*
  # Storage Configuration for TeamCollab

  1. Storage Buckets
    - `task-attachments` - For task file attachments
    - `user-avatars` - For user profile pictures
    - `exports` - For generated reports and exports

  2. Security Policies
    - Authenticated users can upload files
    - Users can access files based on permissions
    - Automatic cleanup policies
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('task-attachments', 'task-attachments', false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('exports', 'exports', false, 104857600, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for task-attachments
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Users can view task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-attachments');

CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for user-avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view user avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for exports
CREATE POLICY "Users can access their own exports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can create exports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);