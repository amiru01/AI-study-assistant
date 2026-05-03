# ⚡ Quick Start: Fix "Bucket not found"

## 🎯 Problem
Getting "Bucket not found" error when uploading files.

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: `gtyzqrhfdqizmykdrwws`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Step 2: Run This Script
Copy and paste this entire script, then click **"Run"**:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;

-- Add new policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'notes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'notes');

-- Verify
SELECT 'Bucket:' as check, * FROM storage.buckets WHERE id = 'notes';
SELECT 'Policies:' as check, COUNT(*) FROM pg_policies WHERE schemaname = 'storage';
```

### Step 3: Test Upload
1. Open: http://localhost:8000/public/upload.html
2. Log in if needed
3. Select a file
4. Click "Upload & Process"
5. Should work! ✅

---

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ No "Bucket not found" error
- ✅ Console shows "File uploaded successfully"
- ✅ File appears in Supabase Storage dashboard

---

## 🐛 Still Not Working?

### Check 1: Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE id = 'notes';
```
Should return 1 row. If not, run Step 2 again.

### Check 2: Logged In
Make sure you're logged in to your app first!
Go to: http://localhost:8000/public/auth-refactored.html

### Check 3: Correct Bucket Name
In your code, verify:
```javascript
supabase.storage.from('notes')  // Must be exactly 'notes'
```

---

## 📚 Detailed Guides

For more help, read:
- `STEP-BY-STEP-BUCKET-FIX.md` - Detailed walkthrough
- `FIX-BUCKET-NOT-FOUND.md` - Complete debugging guide
- `SUPABASE-STORAGE-SETUP.sql` - Full setup script

---

## 🎉 Done!

Your bucket is now ready for uploads! 🚀
