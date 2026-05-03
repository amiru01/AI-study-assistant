# 🔧 Fix: "Failed to save generated summary" Error

## Problem
AI summary is generated successfully, but saving to database fails with "Failed to save generated summary" error.

---

## 🔍 Root Cause

The `generated_content` table either:
1. ❌ Doesn't exist in your Supabase database
2. ❌ Has incorrect structure
3. ❌ Missing Row Level Security (RLS) policies
4. ❌ RLS policies are blocking inserts

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select project: `gtyzqrhfdqizmykdrwws`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Step 2: Run This SQL Script

Copy and paste this entire script, then click **"Run"**:

```sql
-- ========================================
-- FIX: GENERATED_CONTENT TABLE
-- ========================================

-- 1. Create generated_content table (if not exists)
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content TEXT NOT NULL,  -- Changed from JSONB to TEXT for summaries
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS generated_content_note_id_idx ON generated_content(note_id);
CREATE INDEX IF NOT EXISTS generated_content_user_id_idx ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS generated_content_type_idx ON generated_content(type);
CREATE INDEX IF NOT EXISTS generated_content_created_at_idx ON generated_content(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can insert their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can read their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can update their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can delete their own content" ON generated_content;
DROP POLICY IF EXISTS "Users can manage their own content" ON generated_content;

-- 5. Create RLS policies
CREATE POLICY "Users can insert their own content"
ON generated_content 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own content"
ON generated_content 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
ON generated_content 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
ON generated_content 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- VERIFICATION
-- ========================================

-- Check table exists
SELECT 'Table exists:' as check, COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'generated_content';

-- Check columns
SELECT 'Columns:' as check, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'generated_content'
ORDER BY ordinal_position;

-- Check RLS enabled
SELECT 'RLS enabled:' as check, rowsecurity
FROM pg_tables 
WHERE tablename = 'generated_content';

-- Check policies
SELECT 'Policies:' as check, policyname, cmd
FROM pg_policies 
WHERE tablename = 'generated_content';

-- ========================================
-- SUCCESS
-- ========================================

SELECT '✅ GENERATED_CONTENT TABLE READY!' as status,
       'You can now save AI summaries, quizzes, and flashcards.' as message;
```

### Step 3: Test the Fix

1. **Refresh your app** (Ctrl+F5)
2. **Go to a note** in your dashboard
3. **Click "Generate Summary"**
4. **Check browser console** (F12)

**Expected console output:**
```
💾 Attempting to save generated content...
  Note ID: uuid-here
  Content Type: summary
  User: your@email.com
📤 Inserting into Supabase generated_content table...
✅ Generated content saved successfully!
  Content ID: uuid-here
```

---

## 🔍 Debugging Steps

### Step 1: Check Console for Detailed Error

Open browser console (F12) and look for:

```
❌ Supabase insert error:
  Code: 42P01
  Message: relation "generated_content" does not exist
```

**Error codes:**
- `42P01` - Table doesn't exist → Run SQL script
- `42501` - Permission denied → Check RLS policies
- `23502` - Missing required field → Check data
- `23503` - Foreign key violation → Check note_id exists

### Step 2: Verify Table Exists

Run in SQL Editor:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'generated_content';
```

**Expected:** 1 row
**If 0 rows:** Table doesn't exist, run the SQL script above

### Step 3: Check Table Structure

Run in SQL Editor:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'generated_content'
ORDER BY ordinal_position;
```

**Expected columns:**
```
column_name  | data_type                   | is_nullable
-------------|-----------------------------|-----------
id           | uuid                        | NO
note_id      | uuid                        | NO
user_id      | uuid                        | NO
type         | text                        | NO
content      | text                        | NO
created_at   | timestamp with time zone    | NO
```

### Step 4: Check RLS Policies

Run in SQL Editor:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'generated_content';
```

**Expected:** At least 4 policies (INSERT, SELECT, UPDATE, DELETE)

**If 0 rows:** No policies, run the SQL script above

### Step 5: Test Manual Insert

Run in SQL Editor:
```sql
-- Test insert (replace with your note ID)
INSERT INTO generated_content (note_id, user_id, type, content)
VALUES (
    'YOUR_NOTE_ID_HERE',  -- Replace with actual note ID
    auth.uid(),           -- Your user ID
    'summary',
    'This is a test summary'
);
```

**If error:** Check error message for specific issue
**If success:** Problem is in your JavaScript code, not database

---

## 🐛 Common Issues & Solutions

### Issue 1: "relation 'generated_content' does not exist"

**Cause:** Table not created

**Solution:** Run the SQL script above

### Issue 2: "new row violates row-level security policy"

**Cause:** Missing INSERT policy

**Solution:** Run the policies part of SQL script

### Issue 3: "null value in column 'user_id' violates not-null constraint"

**Cause:** User not authenticated

**Solution:** Make sure you're logged in before generating summary

### Issue 4: "insert or update on table 'generated_content' violates foreign key constraint"

**Cause:** Invalid note_id (note doesn't exist)

**Solution:** 
1. Check if note exists in notes table
2. Verify note_id is correct
3. Make sure note belongs to current user

### Issue 5: "column 'content' is of type jsonb but expression is of type text"

**Cause:** Column type mismatch

**Solution:** Run this to fix column type:
```sql
ALTER TABLE generated_content 
ALTER COLUMN content TYPE TEXT;
```

---

## 📊 Verify Setup

### Check if everything is working:

```sql
-- 1. Check table exists
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'generated_content';
-- Expected: 1

-- 2. Check RLS is enabled
SELECT rowsecurity as rls_enabled 
FROM pg_tables 
WHERE tablename = 'generated_content';
-- Expected: true

-- 3. Check policies exist
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'generated_content';
-- Expected: 4 (INSERT, SELECT, UPDATE, DELETE)

-- 4. Check your notes exist
SELECT id, title FROM notes 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 5;
-- Should show your uploaded notes

-- 5. Check existing generated content
SELECT * FROM generated_content 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 5;
-- Should show any saved summaries
```

---

## 🎯 Complete Fix Script

If you want to set up EVERYTHING (storage, notes, generated_content), run this:

```sql
-- Run COMPLETE-DATABASE-SETUP.sql
-- This sets up:
-- - Storage bucket
-- - Notes table
-- - Generated_content table
-- - All RLS policies
```

See `COMPLETE-DATABASE-SETUP.sql` for the full script.

---

## ✅ Success Indicators

You'll know it's fixed when:

- ✅ No "Failed to save generated summary" error
- ✅ Console shows "Generated content saved successfully"
- ✅ Summary appears in UI
- ✅ Summary persists after page refresh
- ✅ Summary appears in Supabase Table Editor

---

## 📝 Test Checklist

After running the SQL script:

- [ ] Table `generated_content` exists
- [ ] Table has correct columns
- [ ] RLS is enabled
- [ ] At least 4 policies exist
- [ ] User is logged in
- [ ] Note exists in notes table
- [ ] Console shows detailed logging
- [ ] Summary saves successfully
- [ ] Summary displays in UI
- [ ] Summary persists after refresh

---

## 🆘 Still Having Issues?

### Get Detailed Error Info:

1. **Open browser console** (F12)
2. **Look for red error messages**
3. **Find the error code** (e.g., 42P01, 42501)
4. **Check the error message**

### Common Error Codes:

| Code | Meaning | Fix |
|------|---------|-----|
| 42P01 | Table doesn't exist | Run SQL script |
| 42501 | Permission denied | Check RLS policies |
| 23502 | NOT NULL violation | Check required fields |
| 23503 | Foreign key violation | Check note_id exists |
| 42703 | Column doesn't exist | Check table structure |

### Check Supabase Logs:

1. Go to Supabase Dashboard
2. Click **"Logs"** in left sidebar
3. Click **"Postgres Logs"**
4. Look for recent errors

### Manual Test:

Try inserting manually in SQL Editor:
```sql
INSERT INTO generated_content (note_id, user_id, type, content)
SELECT 
    id as note_id,
    user_id,
    'summary' as type,
    'Test summary content' as content
FROM notes 
WHERE user_id = auth.uid()
LIMIT 1;
```

If this works, problem is in JavaScript. If fails, problem is in database.

---

## 📚 Related Files

- `COMPLETE-DATABASE-SETUP.sql` - Full database setup
- `FIX-DATABASE-INSERT-ERROR.md` - Fix notes table issues
- `src/services/supabaseDatabaseService.js` - Database service
- `src/pages/study-page.js` - Study page logic

---

## 🎉 Done!

After running the SQL script, your AI summaries will save successfully! 🚀

**Next:** Test by generating a summary and checking if it persists after page refresh.
