# ⚡ Quick Fix: "Failed to save generated summary"

## 🎯 Problem
AI generates summary successfully, but saving to database fails.

## ⚡ Quick Fix (1 Minute)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: `gtyzqrhfdqizmykdrwws`
3. Click **"SQL Editor"**
4. Click **"New query"**

### Step 2: Run This Script
Copy and paste, then click **"Run"**:

```sql
-- Create table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can insert their own content"
ON generated_content FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own content"
ON generated_content FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Verify
SELECT '✅ FIXED!' as status;
```

### Step 3: Test
1. **Refresh your app** (Ctrl+F5)
2. **Generate summary again**
3. **Should work now!** ✅

---

## 🔍 Check Console

Open browser console (F12) and look for:

**Before fix:**
```
❌ Supabase insert error:
  Code: 42P01
  Message: relation "generated_content" does not exist
```

**After fix:**
```
✅ Generated content saved successfully!
  Content ID: uuid-here
```

---

## ✅ Success!

You should now see:
- ✅ Summary saves successfully
- ✅ Summary displays in UI
- ✅ Summary persists after refresh
- ✅ No errors in console

---

## 🐛 Still Not Working?

### Check 1: User Logged In?
Make sure you're logged in before generating summary.

### Check 2: Note Exists?
Make sure the note exists in the notes table.

### Check 3: Run Full Setup
If still failing, run the complete setup:
```sql
-- See COMPLETE-DATABASE-SETUP.sql
```

---

## 📚 More Help

- `FIX-GENERATED-CONTENT-ERROR.md` - Detailed guide
- `FIX-GENERATED-CONTENT.sql` - Complete SQL script
- `COMPLETE-DATABASE-SETUP.sql` - Full database setup

---

## 🎉 Done!

Your AI summaries will now save successfully! 🚀
