# 🔧 Fix: "Failed to save notes" Database Error

## Problem
File upload to Supabase Storage works, but saving note metadata to the database fails with "Failed to save notes" error.

---

## 🔍 Step 1: Identify the Problem

### Possible Causes:

1. ❌ **Table "notes" does not exist** in Supabase
2. ❌ **Incorrect table name** in code (case-sensitive!)
3. ❌ **Missing required columns** (user_id, file_url, etc.)
4. ❌ **Row Level Security (RLS) blocking insert**
5. ❌ **Invalid or undefined data** being sent
6. ❌ **Column type mismatch** (e.g., sending string to integer column)
7. ❌ **User not authenticated** (user_id is null)
8. ❌ **Error not being properly logged**

---

## ✅ Step 2: Verify Database Table

### Check if Table Exists

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select project:** `gtyzqrhfdqizmykdrwws`
3. **Click "Table Editor"** in left sidebar
4. **Look for "notes" table**

**If table doesn't exist** → Go to Step 3 (Create Table)
**If table exists** → Go to Step 4 (Verify Columns)

---

## 🆕 Step 3: Create Notes Table

### Option A: Create via SQL (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Create notes table
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- Verify table was created
SELECT 'Table created:' as status, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;
```

### Option B: Create via UI

1. Go to **Table Editor**
2. Click **"New table"**
3. **Table name:** `notes`
4. **Add columns:**

| Column Name | Type | Default | Nullable | Primary |
|-------------|------|---------|----------|---------|
| id | uuid | gen_random_uuid() | No | Yes |
| user_id | uuid | - | No | No |
| title | text | - | No | No |
| file_name | text | - | No | No |
| file_url | text | - | No | No |
| file_path | text | - | Yes | No |
| file_type | text | - | Yes | No |
| file_size | int8 | - | Yes | No |
| extracted_text | text | - | Yes | No |
| created_at | timestamptz | now() | No | No |
| updated_at | timestamptz | now() | No | No |

5. **Add foreign key:**
   - Column: `user_id`
   - References: `auth.users(id)`
   - On delete: CASCADE

6. Click **"Save"**

---

## 🔍 Step 4: Verify Table Structure

### Check Columns Match Code

Run this in **SQL Editor**:

```sql
-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;
```

**Expected columns:**
```
column_name      | data_type                   | is_nullable
-----------------|-----------------------------|-----------
id               | uuid                        | NO
user_id          | uuid                        | NO
title            | text                        | NO
file_name        | text                        | NO
file_url         | text                        | NO
file_path        | text                        | YES
file_type        | text                        | YES
file_size        | bigint                      | YES
extracted_text   | text                        | YES
created_at       | timestamp with time zone    | NO
updated_at       | timestamp with time zone    | NO
```

### Your Code Sends:

```javascript
const note = {
    user_id: user.uid,           // UUID
    title: noteData.title,       // TEXT
    file_url: noteData.fileURL,  // TEXT
    file_name: noteData.fileName,// TEXT
    file_type: noteData.fileType,// TEXT
    file_size: noteData.fileSize,// BIGINT
    extracted_text: noteData.extractedText, // TEXT
    created_at: new Date().toISOString(),   // TIMESTAMPTZ
    updated_at: new Date().toISOString(),   // TIMESTAMPTZ
};
```

**✅ Column names match!**
**✅ Data types match!**

---

## 🔧 Step 5: Fix Insert Code (Already Correct!)

Your current code is actually correct:

```javascript
// Production mode
const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single();

if (error) throw error;
```

### But Let's Add Better Error Logging:

Update `src/services/supabaseDatabaseService.js`:

```javascript
export async function saveNote(noteData) {
    try {
        const supabase = getSupabase();
        const user = getCurrentUser();

        console.log('💾 Attempting to save note...');
        console.log('User:', user);
        console.log('Note data:', noteData);

        if (!user) {
            throw new Error('User not authenticated');
        }

        const note = {
            user_id: user.uid,
            title: noteData.title || 'Untitled Note',
            file_url: noteData.fileURL || '',
            file_name: noteData.fileName || '',
            file_type: noteData.fileType || '',
            file_size: noteData.fileSize || 0,
            extracted_text: noteData.extractedText || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        console.log('Prepared note object:', note);

        // Development mode
        if (!isSupabaseReady()) {
            console.log('🔧 Development mode: Mock save note');
            const mockId = 'note-' + Date.now();
            const notes = getMockNotes();
            notes.push({ id: mockId, ...note });
            localStorage.setItem('mockNotes', JSON.stringify(notes));
            return mockId;
        }

        // Production mode
        console.log('📤 Inserting into Supabase...');
        const { data, error } = await supabase
            .from('notes')
            .insert([note])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase insert error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            throw error;
        }

        console.log('✅ Note saved successfully:', data);
        return data.id;

    } catch (error) {
        console.error('❌ Save note error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to save note: ${error.message}`);
    }
}
```

---

## 🔐 Step 6: Fix RLS (CRITICAL!)

### Problem: RLS Blocking Inserts

Even if the table exists, **Row Level Security (RLS)** might be blocking inserts.

### Check if RLS is Enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notes';
```

**If `rowsecurity = true`** → RLS is enabled, you need policies!

### Option A: Disable RLS (Quick Test Only!)

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** This allows anyone to insert/read/delete notes! Only for testing!

### Option B: Add RLS Policies (Recommended)

```sql
-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Policy 1: Allow authenticated users to insert notes
CREATE POLICY "Users can insert their own notes"
ON notes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to read their own notes
CREATE POLICY "Users can read their own notes"
ON notes 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
ON notes 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
ON notes 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Verify policies were created
SELECT 'Policies created:' as status, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'notes';
```

**Explanation:**
- `TO authenticated` - Only logged-in users
- `auth.uid() = user_id` - Users can only access their own notes
- `WITH CHECK` - Validates data before insert
- `USING` - Filters which rows user can access

---

## 📋 Step 7: Debugging Checklist

### Run These Checks:

#### 1. Verify Table Exists
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'notes';
```
**Expected:** 1 row
**If 0 rows:** Table doesn't exist, create it!

#### 2. Verify Table Name Matches Code
- **Code uses:** `'notes'` (lowercase)
- **Database table:** `notes` (lowercase)
- ✅ Must match exactly (case-sensitive)

#### 3. Check RLS Status
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notes';
```
**If `rowsecurity = true`:** Check policies exist

#### 4. Check RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'notes';
```
**Expected:** At least 1 policy for INSERT
**If 0 rows:** No policies, add them!

#### 5. Test Insert Manually
```sql
-- Test insert (replace with your user ID)
INSERT INTO notes (user_id, title, file_name, file_url)
VALUES (
    auth.uid(),  -- Your user ID
    'Test Note',
    'test.pdf',
    'https://example.com/test.pdf'
);
```

**If error:** Check error message for clues
**If success:** Problem is in your code, not database

#### 6. Check User Authentication

In browser console:
```javascript
// Check if user is logged in
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

**If session is null:** User not logged in!
**If user.id is undefined:** Authentication issue

#### 7. Test Insert from Console

In browser console:
```javascript
// Get Supabase client
const supabase = window.supabase.createClient(
    'https://gtyzqrhfdqizmykdrwws.supabase.co',
    'YOUR_ANON_KEY'
);

// Get current user
const { data: { session } } = await supabase.auth.getSession();
console.log('User:', session?.user);

// Try to insert
const { data, error } = await supabase
    .from('notes')
    .insert([{
        user_id: session.user.id,
        title: 'Test Note',
        file_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf'
    }])
    .select()
    .single();

console.log('Insert result:', data);
console.log('Insert error:', error);
```

**Check error message for specific issue!**

---

## 🎯 Step 8: Complete Fix Script

### Run This Entire Script in SQL Editor:

```sql
-- ========================================
-- COMPLETE FIX FOR "FAILED TO SAVE NOTES"
-- ========================================

-- 1. Create notes table (if not exists)
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- 3. Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;

-- 5. Create policies
CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own notes"
ON notes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- VERIFICATION
-- ========================================

-- Check table exists
SELECT 'Table exists:' as check, COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'notes';

-- Check columns
SELECT 'Columns:' as check, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Check RLS enabled
SELECT 'RLS enabled:' as check, rowsecurity
FROM pg_tables 
WHERE tablename = 'notes';

-- Check policies
SELECT 'Policies:' as check, policyname, cmd
FROM pg_policies 
WHERE tablename = 'notes';

-- ========================================
-- SUCCESS
-- ========================================

SELECT '✅ DATABASE SETUP COMPLETE!' as status,
       'Table "notes" is ready for inserts.' as message;
```

---

## ✅ Step 9: Test the Fix

### 1. Run the SQL Script Above

### 2. Open Your App
```
http://localhost:8000/public/upload.html
```

### 3. Open Console (F12)

### 4. Upload a File

### 5. Check Console Logs

**Expected output:**
```
💾 Attempting to save note...
User: {uid: "...", email: "..."}
Note data: {title: "...", fileURL: "...", ...}
Prepared note object: {user_id: "...", title: "...", ...}
📤 Inserting into Supabase...
✅ Note saved successfully: {id: "...", ...}
🎉 Upload successful!
```

**If you see error:**
```
❌ Supabase insert error: {...}
Error code: ...
Error message: ...
```

**Common error codes:**
- `42P01` - Table doesn't exist
- `42703` - Column doesn't exist
- `23502` - NOT NULL violation (missing required field)
- `23503` - Foreign key violation (invalid user_id)
- `42501` - Permission denied (RLS blocking)
- `PGRST116` - No rows returned

---

## 🐛 Common Errors & Solutions

### Error: "relation 'notes' does not exist"
**Cause:** Table not created
**Fix:** Run the SQL script to create table

### Error: "new row violates row-level security policy"
**Cause:** RLS blocking insert
**Fix:** Add INSERT policy or temporarily disable RLS

### Error: "null value in column 'user_id' violates not-null constraint"
**Cause:** User not authenticated or user.uid is undefined
**Fix:** Make sure user is logged in, check `getCurrentUser()`

### Error: "column 'file_url' does not exist"
**Cause:** Column name mismatch
**Fix:** Check table has `file_url` column (not `fileURL`)

### Error: "invalid input syntax for type uuid"
**Cause:** user_id is not a valid UUID
**Fix:** Check `user.uid` is a valid UUID string

### Error: "Failed to save note: undefined"
**Cause:** Error not being caught properly
**Fix:** Add better error logging (see Step 5)

---

## 📊 Verification Queries

### Check if Insert Worked:

```sql
-- See all notes
SELECT * FROM notes ORDER BY created_at DESC LIMIT 10;

-- Count notes per user
SELECT user_id, COUNT(*) as note_count
FROM notes
GROUP BY user_id;

-- Check your notes (replace with your user ID)
SELECT * FROM notes 
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

### Check Table Structure:

```sql
-- Full table info
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes'
ORDER BY ordinal_position;
```

### Check Policies:

```sql
-- Detailed policy info
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notes';
```

---

## 📝 Summary

### The Fix:

1. ✅ **Create "notes" table** with correct columns
2. ✅ **Enable RLS** on notes table
3. ✅ **Add INSERT policy** for authenticated users
4. ✅ **Add SELECT policy** to read own notes
5. ✅ **Verify user is authenticated** before insert
6. ✅ **Add better error logging** to debug issues

### Quick Commands:

**Create table:**
```sql
CREATE TABLE IF NOT EXISTS notes (...);
```

**Add policies:**
```sql
CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Test insert:**
```sql
INSERT INTO notes (user_id, title, file_name, file_url)
VALUES (auth.uid(), 'Test', 'test.pdf', 'https://...');
```

---

## 🎉 Success Indicators

Database insert is working when:

- ✅ No "Failed to save notes" error
- ✅ Console shows: "✅ Note saved successfully"
- ✅ Note appears in Supabase Table Editor
- ✅ Note appears in app dashboard
- ✅ No RLS policy errors

---

## 🆘 Still Having Issues?

### Debug Steps:

1. **Check Supabase logs:** Dashboard → Logs → Postgres Logs
2. **Check browser console:** Look for detailed error messages
3. **Test insert manually:** Use SQL Editor to insert test row
4. **Verify authentication:** Make sure user is logged in
5. **Check user_id:** Verify it's a valid UUID
6. **Temporarily disable RLS:** Test if RLS is the issue

### Get Detailed Error:

Add this to your code:
```javascript
if (error) {
    console.error('Full error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });
}
```

---

## 📚 Related Files

- `SUPABASE-STORAGE-SETUP.sql` - Complete setup (includes notes table)
- `src/services/supabaseDatabaseService.js` - Database service
- `src/services/supabaseAuthService.js` - Authentication service
- `FIX-DATABASE-INSERT-ERROR.md` - This file

---

## Status: Ready to Fix!

Run the SQL script above, then test your upload! The database will be ready to save notes! 🚀
