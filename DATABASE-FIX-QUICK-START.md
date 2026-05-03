# ⚡ Quick Start: Fix "Failed to save notes"

## 🎯 Problem
File uploads to storage work, but saving note metadata to database fails with "Failed to save notes".

## ⚡ Quick Fix (3 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: `gtyzqrhfdqizmykdrwws`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Step 2: Run This Script
Copy the entire script from `COMPLETE-DATABASE-SETUP.sql` and click **"Run"**

OR run this minimal version:

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

-- Create indexes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can read their own notes" ON notes;

-- Add policies
CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own notes"
ON notes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Verify
SELECT 'Table:' as check, COUNT(*) FROM information_schema.tables WHERE table_name = 'notes';
SELECT 'Policies:' as check, COUNT(*) FROM pg_policies WHERE tablename = 'notes';
```

### Step 3: Test Upload
1. Open: http://localhost:8000/public/upload.html
2. Make sure you're logged in
3. Upload a file
4. Check console (F12)

**Expected:**
```
💾 Attempting to save note...
📊 User: your@email.com (uuid)
📤 Inserting into Supabase database...
✅ Note saved successfully to database!
🎉 Upload successful!
```

---

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ No "Failed to save notes" error
- ✅ Console shows "Note saved successfully"
- ✅ Note appears in Supabase Table Editor
- ✅ Note appears in app dashboard

---

## 🐛 Still Not Working?

### Check 1: Table Exists
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'notes';
```
Should return 1 row. If not, run Step 2 again.

### Check 2: RLS Policies Exist
```sql
SELECT * FROM pg_policies WHERE tablename = 'notes';
```
Should return at least 2 rows (INSERT and SELECT policies).

### Check 3: User is Logged In
In browser console:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('User:', session?.user);
```
If null, log in first!

### Check 4: Test Manual Insert
```sql
INSERT INTO notes (user_id, title, file_name, file_url)
VALUES (auth.uid(), 'Test', 'test.pdf', 'https://example.com/test.pdf');
```
If this works, problem is in your code. If fails, check error message.

---

## 🔍 Common Errors

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "relation 'notes' does not exist" | Table not created | Run SQL script |
| "new row violates row-level security policy" | Missing RLS policy | Add INSERT policy |
| "null value in column 'user_id'" | Not logged in | Log in first |
| "column 'file_url' does not exist" | Wrong column name | Check table structure |
| "permission denied" | RLS blocking | Check policies |

---

## 📚 Detailed Guides

For more help, read:
- `DATABASE-FIX-QUICK-START.md` - This file (quick fix)
- `FIX-DATABASE-INSERT-ERROR.md` - Complete debugging guide
- `COMPLETE-DATABASE-SETUP.sql` - Full setup script

---

## 🎉 Done!

Your database is now ready to save notes! 🚀

**Next:** Test upload and verify note appears in dashboard.
