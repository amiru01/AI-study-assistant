# 🔧 Fix: "Bucket not found" Error

## Problem
Getting "Bucket not found" error when trying to upload files to Supabase Storage.

---

## 🔍 Step 1: Identify the Problem

### Possible Causes:
1. ❌ Storage bucket "notes" has not been created in Supabase
2. ❌ Incorrect bucket name used in code (case-sensitive!)
3. ❌ Typo in bucket name
4. ❌ Wrong Supabase project URL or API key
5. ❌ Storage not enabled in the project
6. ❌ Missing storage policies (RLS)

---

## ✅ Step 2: Verify Bucket Setup

### Option A: Check if Bucket Exists

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `gtyzqrhfdqizmykdrwws`

2. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Look for a bucket named **"notes"**

3. **Check Bucket Name**
   - Bucket name must be **exactly** "notes" (lowercase)
   - Case-sensitive! "Notes" ≠ "notes"

### Option B: Create Bucket Manually

If bucket doesn't exist:

1. **Click "New bucket"**
2. **Enter details:**
   - Name: `notes`
   - Public: ✅ Check this (for testing)
   - File size limit: 10 MB
   - Allowed MIME types: Leave empty (allow all)
3. **Click "Create bucket"**

### Option C: Create Bucket via SQL (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

**Note:** Setting `public = true` allows anyone to read files (good for testing). For production, use `public = false` with proper policies.

---

## 🔧 Step 3: Fix Upload Code

Your current code is correct! It uses:

```javascript
// Upload file to "notes" bucket
const { data, error } = await supabase.storage
    .from('notes')  // ← Bucket name must match exactly
    .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
    });
```

### Verify Bucket Name Matches:
- Code uses: `'notes'`
- Supabase bucket name: `notes`
- ✅ Must match exactly (case-sensitive)

---

## ⚙️ Step 4: Check Configuration

### Verify Supabase Credentials

Your `src/config/supabase.js`:
```javascript
const SUPABASE_URL = 'https://gtyzqrhfdqizmykdrwws.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Your key
```

### Test Configuration:

1. **Open browser console** (F12)
2. **Run this command:**
```javascript
// Check if Supabase is initialized
console.log('Supabase URL:', 'https://gtyzqrhfdqizmykdrwws.supabase.co');
```

3. **Test bucket access:**
```javascript
// Try to list buckets
const supabase = window.supabase.createClient(
    'https://gtyzqrhfdqizmykdrwws.supabase.co',
    'YOUR_ANON_KEY'
);

const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data);
console.log('Error:', error);
```

---

## 🔐 Step 5: Fix Permissions (CRITICAL!)

### Problem: Bucket Exists But Upload Fails

This is usually a **permissions issue**. You need to either:
- Make bucket public (for testing), OR
- Add storage policies (for production)

### Option A: Make Bucket Public (Quick Fix for Testing)

Run in **Supabase SQL Editor**:

```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'notes';
```

**Pros:** Quick, works immediately
**Cons:** Anyone can read files (not secure for production)

### Option B: Add Storage Policies (Recommended for Production)

Run in **Supabase SQL Editor**:

```sql
-- 1. Create bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 3. Allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation:**
- `bucket_id = 'notes'` - Only applies to "notes" bucket
- `(storage.foldername(name))[1] = auth.uid()::text` - Users can only access files in their own folder (user_id/filename)
- `TO authenticated` - Only logged-in users can upload

---

## 📋 Step 6: Debugging Checklist

### Run These Checks:

#### 1. Verify Bucket Exists
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'notes';
```

**Expected result:**
```
id    | name  | public
------|-------|-------
notes | notes | true
```

If no results → Bucket doesn't exist, create it!

#### 2. Check Storage Policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

**Expected result:** Should show policies for "notes" bucket

If no results → No policies, add them!

#### 3. Test Upload in Console

Open browser console (F12) and run:

```javascript
// Get Supabase client
const supabase = window.supabase.createClient(
    'https://gtyzqrhfdqizmykdrwws.supabase.co',
    'YOUR_ANON_KEY'
);

// Create a test file
const testFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });

// Try to upload
const { data, error } = await supabase.storage
    .from('notes')
    .upload('test-folder/test.txt', testFile);

console.log('Upload result:', data);
console.log('Upload error:', error);
```

**If error:**
- "Bucket not found" → Bucket doesn't exist
- "new row violates row-level security policy" → Missing policies
- "permission denied" → Wrong policies or not authenticated

#### 4. Check Authentication

```javascript
// Check if user is logged in
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
```

If `session` is null → User not logged in, policies won't work!

---

## 🎯 Step 7: Complete Fix (Run This!)

### Quick Fix Script

Run this **entire script** in **Supabase SQL Editor**:

```sql
-- ========================================
-- COMPLETE FIX FOR "BUCKET NOT FOUND"
-- ========================================

-- 1. Create bucket (public for testing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;

-- 3. Allow authenticated users to upload
CREATE POLICY "Users can upload their own files"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Allow public to read files (since bucket is public)
CREATE POLICY "Public can read files"
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'notes');

-- 6. Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- VERIFY SETUP
-- ========================================

-- Check bucket exists
SELECT 'Bucket exists:' as check, * FROM storage.buckets WHERE id = 'notes';

-- Check policies exist
SELECT 'Policies:' as check, policyname FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## ✅ Step 8: Test Upload

### Test in Your App:

1. **Open upload page:** http://localhost:8000/public/upload.html
2. **Open console** (F12)
3. **Select a file**
4. **Click "Upload & Process"**
5. **Check console for errors**

### Expected Console Output:

```
✅ Supabase initialized successfully
✅ Auth state initialized: your@email.com
✅ Upload page initialized
🚀 Upload button clicked!
📁 Selected file: example.pdf 2500000 bytes
📤 Starting upload...
📝 Extracting text from file...
✅ Extracted 1234 characters
✅ File uploaded successfully
💾 Saving note to database...
🎉 Upload successful!
```

### If You See Error:

**"Bucket not found"**
- Run the SQL script above
- Verify bucket name is exactly "notes"
- Check Supabase dashboard → Storage

**"new row violates row-level security policy"**
- Policies are missing or incorrect
- Run the SQL script above
- Make sure you're logged in

**"permission denied"**
- User not authenticated
- Go to login page first
- Then try upload again

---

## 🔍 Advanced Debugging

### Check Bucket Configuration:

```sql
-- Get bucket details
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'notes';
```

### Check All Storage Policies:

```sql
-- List all storage policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%notes%';
```

### Test Bucket Access:

```javascript
// In browser console
const supabase = window.supabase.createClient(
    'https://gtyzqrhfdqizmykdrwws.supabase.co',
    'YOUR_ANON_KEY'
);

// List all buckets
const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
console.log('All buckets:', buckets);

// List files in "notes" bucket
const { data: files, error: filesError } = await supabase.storage
    .from('notes')
    .list();
console.log('Files in notes bucket:', files);
console.log('Error:', filesError);
```

---

## 📝 Summary

### The Fix:

1. ✅ **Create bucket** named "notes" (exact match, lowercase)
2. ✅ **Set bucket to public** (for testing) OR add policies
3. ✅ **Add storage policies** for authenticated users
4. ✅ **Verify bucket name** in code matches Supabase
5. ✅ **Test upload** with logged-in user

### Quick Commands:

**Create bucket:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;
```

**Add policies:**
```sql
-- Run the complete SQL script above
```

**Test upload:**
```javascript
// In browser console after logging in
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await supabase.storage
    .from('notes')
    .upload('test/test.txt', file);
console.log(data, error);
```

---

## 🎉 Success Indicators

Upload is working when you see:

- ✅ No "Bucket not found" error
- ✅ Console shows: "✅ File uploaded successfully"
- ✅ File appears in Supabase Storage dashboard
- ✅ File URL is accessible
- ✅ Success message in app

---

## 🆘 Still Having Issues?

### Common Mistakes:

1. **Bucket name mismatch**
   - Code: `'notes'`
   - Supabase: `Notes` ❌
   - Fix: Make sure both are exactly `notes`

2. **Not logged in**
   - Policies require authentication
   - Go to login page first
   - Then try upload

3. **Wrong Supabase project**
   - Check URL matches your project
   - Verify API key is correct

4. **Policies not applied**
   - Run SQL script again
   - Check policies in dashboard
   - Verify user is authenticated

### Get Help:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify SQL script ran successfully
4. Test with public bucket first (easier to debug)

---

## 📚 Related Files

- `QUICK-FIX.sql` - Complete setup script
- `src/services/supabaseStorageService.js` - Upload code
- `src/config/supabase.js` - Configuration
- `FIX-BUCKET-NOT-FOUND.md` - This file

---

## Status: Ready to Fix!

Run the SQL script above in Supabase SQL Editor, then test your upload!
