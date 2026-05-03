-- ========================================
-- SUPABASE STORAGE SETUP
-- Fix "Bucket not found" Error
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ========================================

-- ========================================
-- STEP 1: CREATE STORAGE BUCKET
-- ========================================

-- Create "notes" bucket (public for easy testing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'notes',                    -- Bucket ID
    'notes',                    -- Bucket name
    true,                       -- Public (anyone can read)
    10485760,                   -- 10MB file size limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']  -- Allowed file types
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Verify bucket was created
SELECT 'Bucket created:' as status, * FROM storage.buckets WHERE id = 'notes';

-- ========================================
-- STEP 2: DROP EXISTING STORAGE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- ========================================
-- STEP 3: CREATE STORAGE POLICIES
-- ========================================

-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public to read files (since bucket is public)
CREATE POLICY "Public can read files"
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'notes');

-- Policy 4: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Allow authenticated users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify policies were created
SELECT 'Policies created:' as status, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%files%';

-- ========================================
-- STEP 4: CREATE NOTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- Verify table was created
SELECT 'Notes table created:' as status, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notes';

-- ========================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 6: DROP EXISTING NOTES POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- ========================================
-- STEP 7: CREATE NOTES POLICIES
-- ========================================

-- Single policy for all operations (simpler)
CREATE POLICY "Users can manage their own notes"
ON notes 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify notes policies
SELECT 'Notes policies created:' as status, policyname 
FROM pg_policies 
WHERE tablename = 'notes';

-- ========================================
-- STEP 8: CREATE GENERATED_CONTENT TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS generated_content_note_id_idx ON generated_content(note_id);
CREATE INDEX IF NOT EXISTS generated_content_user_id_idx ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS generated_content_type_idx ON generated_content(type);

-- Verify table was created
SELECT 'Generated content table created:' as status, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'generated_content';

-- ========================================
-- STEP 9: ENABLE RLS ON GENERATED_CONTENT
-- ========================================

ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 10: DROP EXISTING CONTENT POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can read their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can insert their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON generated_content;

-- ========================================
-- STEP 11: CREATE CONTENT POLICIES
-- ========================================

CREATE POLICY "Users can manage their own content"
ON generated_content 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify content policies
SELECT 'Content policies created:' as status, policyname 
FROM pg_policies 
WHERE tablename = 'generated_content';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check bucket configuration
SELECT 
    '=== BUCKET CONFIGURATION ===' as section,
    id,
    name,
    public,
    file_size_limit / 1024 / 1024 as "size_limit_mb",
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'notes';

-- Check storage policies
SELECT 
    '=== STORAGE POLICIES ===' as section,
    policyname,
    cmd as operation,
    CASE 
        WHEN roles = '{authenticated}' THEN 'authenticated'
        WHEN roles = '{public}' THEN 'public'
        ELSE roles::text
    END as role
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Check notes table
SELECT 
    '=== NOTES TABLE ===' as section,
    COUNT(*) as total_notes
FROM notes;

-- Check notes policies
SELECT 
    '=== NOTES POLICIES ===' as section,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'notes';

-- Check generated_content table
SELECT 
    '=== GENERATED CONTENT TABLE ===' as section,
    COUNT(*) as total_content
FROM generated_content;

-- Check content policies
SELECT 
    '=== CONTENT POLICIES ===' as section,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'generated_content';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT '✅ SETUP COMPLETE!' as status,
       'Your Supabase storage is now configured correctly.' as message,
       'Bucket "notes" is ready for file uploads.' as details;

-- ========================================
-- NEXT STEPS
-- ========================================

-- 1. Go to your app: http://localhost:8000/public/upload.html
-- 2. Log in with your account
-- 3. Try uploading a PDF or image file
-- 4. Check console for success message
-- 5. Verify file appears in Supabase Storage dashboard

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If upload still fails, run these queries:

-- Check if bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'notes';

-- Check if policies exist
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check if user is authenticated
-- SELECT auth.uid(); -- Should return your user ID

-- Test bucket access
-- SELECT * FROM storage.objects WHERE bucket_id = 'notes' LIMIT 5;

