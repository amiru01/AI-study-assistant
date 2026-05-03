# ⚡ Quiz Generator - Quick Start

## 🎉 Your Quiz Generator is Already Built!

Everything is ready to use. Just follow these steps:

---

## 🚀 How to Use (3 Steps)

### Step 1: Make Sure Database is Ready

Run this SQL in Supabase SQL Editor (if not already done):

```sql
-- Create generated_content table
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
```

### Step 2: Configure Hugging Face (if not done)

1. Get FREE token: https://huggingface.co/settings/tokens
2. Add to `src/config/api.js`:
```javascript
HUGGINGFACE: 'hf_xxxxxxxxxxxxxxxxxxxxx',
```

### Step 3: Use It!

1. **Upload a note** (PDF or image)
2. **Go to dashboard**
3. **Click on the note**
4. **Click "Quiz" tab**
5. **Click "✨ Generate Quiz"**
6. **Wait 3-5 seconds**
7. **Take the quiz!**

---

## 🎯 Quiz Features

### What You Can Do:

✅ **Generate Quiz** - AI creates 5 MCQ questions
✅ **Select Answers** - Click on options A, B, C, or D
✅ **Check Answers** - See your score and correct answers
✅ **Reset Quiz** - Try again
✅ **View Explanations** - Learn why answers are correct

### Quiz Format:

- **5 questions** per quiz
- **4 options** per question (A, B, C, D)
- **1 correct answer** per question
- **Explanations** for each question
- **Automatic scoring** (percentage)

---

## 🎨 How It Looks

### Before Checking Answers:
```
Question 1 of 5
What is photosynthesis?

○ A  Process of converting light to chemical energy
○ B  Process of breaking down glucose
○ C  Process of cellular respiration
○ D  Process of protein synthesis

[Reset Quiz]  [Check Answers]
```

### After Checking Answers:
```
Question 1 of 5
What is photosynthesis?

✓ A  Process of converting light to chemical energy  [GREEN]
○ B  Process of breaking down glucose
○ C  Process of cellular respiration
○ D  Process of protein synthesis

Explanation: Photosynthesis is the process by which plants 
convert light energy into chemical energy stored in glucose.

You scored 4/5 (80%)! 🎉
```

---

## 🔍 Console Output

### When Generating:
```
🤖 Generating quiz with Hugging Face (FREE)...
✅ Quiz generated successfully (FREE)
💾 Attempting to save generated content...
✅ Generated content saved successfully!
```

### When Taking Quiz:
```
Selected option 0 for question 0
Selected option 1 for question 1
...
Checking answers...
Score: 4/5 (80%)
```

---

## ✅ Success Checklist

Quiz is working when you see:

- [ ] "Generate Quiz" button appears
- [ ] Button changes to "⏳ Generating..." when clicked
- [ ] 5 questions appear after 3-5 seconds
- [ ] Each question has 4 options (A, B, C, D)
- [ ] Clicking an option highlights it
- [ ] "Check Answers" button works
- [ ] Correct answers turn green
- [ ] Wrong answers turn red
- [ ] Score appears as toast notification
- [ ] Explanations appear
- [ ] "Reset Quiz" clears everything

---

## 🐛 Quick Troubleshooting

### Quiz Not Generating?

**Check:**
1. Hugging Face token configured?
2. Note has text content?
3. Console shows errors?

**Fix:**
- Add token to `src/config/api.js`
- Check console (F12) for errors
- Try with a different note

### Quiz Not Saving?

**Check:**
1. `generated_content` table exists?
2. RLS policies set up?

**Fix:**
- Run the SQL script above
- Check console for error code

### Answers Not Highlighting?

**Check:**
1. JavaScript errors?
2. CSS loaded?

**Fix:**
- Check console for errors
- Hard refresh (Ctrl+F5)

---

## 🎊 That's It!

Your quiz generator is ready to use!

**Features:**
- ✅ AI-powered
- ✅ FREE (Hugging Face)
- ✅ Interactive
- ✅ Automatic scoring
- ✅ Explanations
- ✅ Database storage

**Just click "Generate Quiz" and start learning! 🚀**

---

## 📚 More Info

- `QUIZ-GENERATOR-GUIDE.md` - Complete documentation
- `AI-SUMMARIZATION-GUIDE.md` - AI features overview
- `FIX-GENERATED-CONTENT.sql` - Database setup

Enjoy your FREE AI-powered quizzes! 🎉
