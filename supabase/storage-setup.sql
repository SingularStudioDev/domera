-- =============================================================================
-- SUPABASE STORAGE SETUP FOR DOMERA PLATFORM
-- Creates storage buckets and policies for image and document management
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types, owner, owner_id)
VALUES 
  ('images', 'images', true, false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'], NULL, NULL),
  ('documents', 'documents', false, false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], NULL, NULL),
  ('avatars', 'avatars', true, false, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], NULL, NULL),
  ('project-images', 'project-images', true, false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'], NULL, NULL),
  ('unit-images', 'unit-images', true, false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'], NULL, NULL),
  ('organization-images', 'organization-images', true, false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'], NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Images bucket policies (public read, authenticated upload)
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Project images policies
CREATE POLICY "Project images are publicly accessible" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Users can manage project images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'project-images');

-- Unit images policies
CREATE POLICY "Unit images are publicly accessible" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'unit-images');

CREATE POLICY "Authenticated users can upload unit images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'unit-images');

CREATE POLICY "Users can manage unit images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'unit-images');

-- Organization images policies
CREATE POLICY "Organization images are publicly accessible" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'organization-images');

CREATE POLICY "Authenticated users can upload organization images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'organization-images');

CREATE POLICY "Users can manage organization images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'organization-images');

-- Avatar policies
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Documents policies (private, role-based access)
CREATE POLICY "Users can read their organization documents" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'documents' 
    AND EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid()::text 
      AND ur.is_active = true
    )
  );

CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can manage documents" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid()::text 
      AND ur.is_active = true
      AND ur.role IN ('admin', 'owner', 'finance_manager')
    )
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get file extension
CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text AS $$
  SELECT lower(substring(name from '\.([^.]*)$'))
$$ LANGUAGE sql;

-- Function to get filename without path
CREATE OR REPLACE FUNCTION storage.filename(name text)
RETURNS text AS $$
  SELECT substring(name from '([^/]*)$')
$$ LANGUAGE sql;