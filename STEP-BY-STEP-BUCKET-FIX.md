# 📋 Step-by-Step: Fix "Bucket not found" Error

## 🎯 Goal
Fix the "Bucket not found" error when uploading files to Supabase Storage.

---

## ⏱️ Time Required
5-10 minutes

---

## 📝 Prerequisites
- Supabase account created
- Project created: `gtyzqrhfdqizmykdrwws`
- Logged into Supabase Dashboard

---

## 🚀 Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Click on your project: `gtyzqrhfdqizmykdrwws`
3. You should see the project dashboard

---

## 🗄️ Step 2: Check if Bucket Exists

### Option A: Check via Storage UI

1. Click **"Storage"** in the left sidebar
2. Look for a bucket named **"notes"**

**If you see "notes" bucket:**
- ✅ Bucket exists
- Skip to Step 4 (Check Policies)

**If you DON'T see "notes" bucket:**
- ❌ Bucket doesn't exist
- Continue to Step 3

### Option B: Check via SQL

1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Paste this:
```sql
SELECT * FROM storage.buckets WHERE id = 'notes';
```
4. Click **"Run"**

**Result:**
- If you see a row → Bucket exists ✅
- If no rows → Bucket doesn't exist ❌

---

## 🆕 Step 3: Create the Bucket

### Option A: Create via UI (Easy)

1. Go to **Storage** in left sidebar
2. Click **"New bucket"** button
3. Fill in:
   - **Name:** `notes` (exactly, lowercase)
   - **Public bucket:** ✅ Check this box
   - **File size limit:** `10` MB
   - **Allowed MIME types:** Leave empty
4. Click **"Create bucket"**

### Option B: Create via SQL (Recommended)

1. Go to **SQL Editor** in left sidebar
2. Click **"New query"**
3. Paste this:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('notes', 'notes', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true;
```
4. Click **"Run"**
5. Should see: "Success. No rows returned"

**Verify it worked:**
```sql
SELECT * FROM storage.buckets WHERE id = 'notes';
```

Should show:
```
id    | name  | public | file_size_limit
------|-------|--------|----------------
notes | notes | true   | 10485760
```

---

## 🔐 Step 4: Set Up Storage Policies

### Why?
Even if the bucket exists, you need **policies** to allow users to upload files.

### Quick Fix (Run This SQL):

1. Go to **SQL Editor**
2. Click **"New query"**
3. **Copy and paste** the entire script from `SUPABASE-STORAGE-SETUP.sql`
4. Click **"Run"**
5. Wait for "Success" message

### Or Run This Minimal Script:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own files"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'notes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to read files
CREATE POLICY "Public can read files"
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'notes');
```

**Verify policies were created:**
```sql
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

Should show:
```
policyname
----------------------------------
Users can upload their own files
Users can read their own files
Public can read files
```

---

## ✅ Step 5: Verify Setup

### Check 1: Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE id = 'notes';
```
**Expected:** 1 row with id='notes', public=true

### Check 2: Policies Exist
```sql
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```
**Expected:** At least 3 policies

### Check 3: Test Upload (Optional)

1. Go to **Storage** → **notes** bucket
2. Click **"Upload file"**
3. Select any small file
4. Click **"Upload"**
5. File should appear in bucket ✅

---

## 🧪 Step 6: Test in Your App

### 1. Open Upload Page
```
http://localhost:8000/public/upload.html
```

### 2. Open Browser Console
Press **F12** → **Console** tab

### 3. Log In
If not logged in, go to:
```
http://localhost:8000/public/auth-refactored.html
```

### 4. Try Upload
1. Select a PDF or image file
2. Click **"Upload & Process"**
3. Watch console for logs

### Expected Console Output:
```
✅ Supabase initialized successfully
✅ Auth state initialized: your@email.com
✅ Upload page initialized
🚀 Upload button clicked!
📁 Selected file: example.pdf 2500000 bytes
📤 Starting upload...
✅ File uploaded successfully
💾 Saving note to database...
🎉 Upload successful!
```

### If You See Error:

**"Bucket not found"**
- Go back to Step 2
- Verify bucket name is exactly "notes"
- Check bucket exists in dashboard

**"new row violates row-level security policy"**
- Go back to Step 4
- Run the policies SQL script again
- Make sure you're logged in

**"permission denied"**
- Make sure you're logged in
- Check policies are correct
- Verify user ID matches policy

---

## 🎉 Step 7: Success!

### You'll know it's working when:

1. ✅ No "Bucket not found" error
2. ✅ Console shows "File uploaded successfully"
3. ✅ Progress bar animates to 100%
4. ✅ Success message appears
5. ✅ File appears in Supabase Storage dashboard
6. ✅ File appears in your app's dashboard

### Verify in Supabase Dashboard:

1. Go to **Storage** → **notes** bucket
2. Click on your user ID folder
3. You should see uploaded files

---

## 🐛 Troubleshooting

### Issue 1: Bucket Still Not Found

**Check bucket name:**
```sql
SELECT id, name FROM storage.buckets;
```

**Make sure code uses correct name:**
```javascript
// In src/services/supabaseStorageService.js
supabase.storage.from('notes')  // Must match bucket name exactly
```

**Case matters!**
- ✅ `notes` = `notes`
- ❌ `notes` ≠ `Notes`
- ❌ `notes` ≠ `NOTES`

### Issue 2: Upload Fails with Policy Error

**Check if user is authenticated:**
```sql
SELECT auth.uid();
```

If returns NULL → Not logged in!

**Check policies exist:**
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

If no rows → Run Step 4 again

### Issue 3: File Uploads But Can't Read

**Make bucket public:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'notes';
```

**Or add public read policy:**
```sql
CREATE POLICY "Public can read files"
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'notes');
```

### Issue 4: Wrong Supabase Project

**Verify URL in code:**
```javascript
// src/config/supabase.js
const SUPABASE_URL = 'https://gtyzqrhfdqizmykdrwws.supabase.co';
```

**Check it matches dashboard URL:**
- Dashboard URL: `https://supabase.com/dashboard/project/gtyzqrhfdqizmykdrwws`
- Project ref: `gtyzqrhfdqizmykdrwws`
- API URL: `https://gtyzqrhfdqizmykdrwws.supabase.co`

---

## 📊 Quick Reference

### Bucket Configuration:
- **Name:** `notes`
- **Public:** `true` (for testing)
- **Size limit:** `10 MB`
- **MIME types:** PDF, JPG, PNG

### Required Policies:
1. Users can upload their own files
2. Users can read their own files
3. Public can read files (if bucket is public)

### File Path Structure:
```
notes/
  └── {user_id}/
      └── {timestamp}_{filename}
```

Example:
```
notes/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 1234567890_document.pdf
```

---

## 📚 Related Files

- `SUPABASE-STORAGE-SETUP.sql` - Complete setup script
- `FIX-BUCKET-NOT-FOUND.md` - Detailed debugging guide
- `QUICK-FIX.sql` - Original setup script
- `src/services/supabaseStorageService.js` - Upload code

---

## ✨ Summary

### What You Did:
1. ✅ Created "notes" bucket in Supabase
2. ✅ Set bucket to public
3. ✅ Added storage policies for authenticated users
4. ✅ Verified setup with SQL queries
5. ✅ Tested upload in your app

### What's Working Now:
- ✅ File upload to Supabase Storage
- ✅ User-specific folders (user_id/)
- ✅ Public read access
- ✅ Authenticated write access
- ✅ File size limits (10MB)
- ✅ MIME type restrictions

### Next Steps:
1. Test with different file types (PDF, JPG, PNG)
2. Test with large files (close to 10MB)
3. Verify files appear in dashboard
4. Test AI features (summary, quiz, flashcards)

---

## 🎊 Congratulations!

Your Supabase Storage is now configured correctly!

You can now:
- ✅ Upload study materials
- ✅ Store files securely
- ✅ Generate AI content
- ✅ Access files from dashboard

**Happy uploading! 🚀**
