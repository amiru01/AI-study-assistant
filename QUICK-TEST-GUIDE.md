# 🚀 Quick Test Guide - AI Study Assistant

## ⚡ 5-Minute Test Flow

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox)
- Local web server (Live Server, Python server, etc.)

---

## 🎯 Test Scenario: Complete User Journey

### Step 1: Start Application
```bash
# Option 1: VS Code Live Server
Right-click index.html → "Open with Live Server"

# Option 2: Python Server
python -m http.server 8000

# Option 3: Node.js Server
npx http-server
```

### Step 2: Landing Page → Authentication
1. Open `http://localhost:8000/index.html`
2. Click **"Get Started"** button
3. Should redirect to `public/auth-refactored.html`

### Step 3: Login (Dev Mode)
1. Enter any email: `test@example.com`
2. Enter any password: `password123`
3. Click **"Login"**
4. Should see success toast
5. Should redirect to `public/dashboard-refactored.html`

### Step 4: Upload a Note
1. On dashboard, click **"Upload Notes"** card
2. Should redirect to `public/upload.html`
3. Drag & drop a PDF or image file (or click to browse)
4. Wait for upload progress (0% → 100%)
5. Should see success message
6. Click **"Go to Dashboard"**

### Step 5: View Notes on Dashboard
1. Should see your uploaded note as a card
2. Note card shows:
   - 📄 Icon
   - File name
   - Upload date
   - View (👁️) and Delete (🗑️) buttons

### Step 6: Open Study Page
1. **Click anywhere on the note card** (or click the 👁️ icon)
2. Should redirect to `public/study.html?noteId=XXX`
3. Should see:
   - Note title and metadata
   - Three tabs: Summary, Quiz, Flashcards
   - "Back to Dashboard" link

### Step 7: Generate Summary
1. On Study page, ensure **"Summary"** tab is active
2. Click **"✨ Generate Summary"** button
3. Should see:
   - Loading spinner
   - "AI is analyzing your notes..." message
4. After 2-3 seconds:
   - Summary text appears
   - Success toast notification

### Step 8: Generate Quiz
1. Click **"❓ Quiz"** tab
2. Click **"✨ Generate Quiz"** button
3. Should see:
   - Loading spinner
   - "AI is creating quiz questions..." message
4. After 2-3 seconds:
   - 5 multiple-choice questions appear
   - Each with 4 options (A, B, C, D)

### Step 9: Take Quiz
1. Click on options to select answers
2. Selected options turn blue
3. Click **"Check Answers"** button
4. Should see:
   - Correct answers turn green
   - Incorrect answers turn red
   - Explanations appear below each question
   - Score toast (e.g., "You scored 3/5 (60%)")

### Step 10: Generate Flashcards
1. Click **"🎴 Flashcards"** tab
2. Click **"✨ Generate Flashcards"** button
3. Should see:
   - Loading spinner
   - "AI is creating flashcards..." message
4. After 2-3 seconds:
   - 10 flashcards appear in grid
   - Each shows "QUESTION" side

### Step 11: Use Flashcards
1. Click on any flashcard
2. Card flips with 3D animation
3. Shows "ANSWER" side
4. Click again to flip back

### Step 12: Test Navigation
1. Click **"← Back to Dashboard"** link
2. Should return to dashboard
3. Click the same note again
4. Should return to study page
5. In production mode, generated content persists

---

## ✅ Expected Results Checklist

### Authentication Flow
- [ ] Landing page loads correctly
- [ ] "Get Started" redirects to auth page
- [ ] Login form accepts any credentials (dev mode)
- [ ] Success toast appears
- [ ] Redirects to dashboard

### Upload Flow
- [ ] Upload page has drag & drop area
- [ ] File picker opens on click
- [ ] Progress bar shows 0% → 100%
- [ ] Success message appears
- [ ] Redirects to dashboard

### Dashboard Flow
- [ ] User email displays in navbar
- [ ] Welcome message shows user name
- [ ] Uploaded notes appear as cards
- [ ] Note cards are clickable
- [ ] Logout button works

### Study Page Flow
- [ ] Study page loads with note info
- [ ] Three tabs are visible
- [ ] Tab switching works smoothly
- [ ] Generate buttons are functional

### AI Features
- [ ] Summary generates and displays
- [ ] Quiz generates with 5 questions
- [ ] Quiz options are selectable
- [ ] Check answers reveals correct/incorrect
- [ ] Flashcards generate (10 cards)
- [ ] Flashcards flip on click

---

## 🐛 Troubleshooting

### Issue: "Cannot read property of undefined"
**Solution**: Make sure you're using a web server, not opening files directly (file://)

### Issue: "Module not found"
**Solution**: Check that all files are in correct folders:
- HTML files in `/public/`
- JS files in `/src/pages/`, `/src/services/`

### Issue: "Firebase not initialized"
**Solution**: This is normal in dev mode. App uses mock data.

### Issue: Notes don't appear on dashboard
**Solution**: 
1. Open browser console (F12)
2. Check Application → Local Storage
3. Look for `mockNotes` key
4. If empty, upload a file again

### Issue: Study page shows "Note not found"
**Solution**:
1. Go back to dashboard
2. Upload a new file
3. Click on the newly uploaded note

### Issue: Generated content doesn't persist
**Solution**: In dev mode, content is not saved to localStorage (only notes are). This is expected. In production mode with Firebase, all content persists.

---

## 🎨 Visual Indicators

### Loading States
- Spinner animation
- Button text changes to "⏳ Generating..."
- Button becomes disabled

### Success States
- Green toast notification
- Content appears with fade-in animation
- Button returns to normal

### Error States
- Red toast notification
- Error message in content area
- Button returns to normal

### Interactive States
- Hover effects on cards
- Selected quiz options turn blue
- Correct answers turn green
- Incorrect answers turn red
- Flashcards flip with 3D effect

---

## 📊 Performance Expectations

| Action | Expected Time |
|--------|---------------|
| Page Load | < 1 second |
| Login | < 1 second |
| File Upload | 2-3 seconds |
| Generate Summary | 2-3 seconds |
| Generate Quiz | 2-3 seconds |
| Generate Flashcards | 2-3 seconds |
| Tab Switch | Instant |
| Flashcard Flip | 0.6 seconds |

---

## 🎯 Success Criteria

**Test is successful if:**
1. ✅ All pages load without errors
2. ✅ Navigation flows smoothly
3. ✅ File upload completes
4. ✅ Notes appear on dashboard
5. ✅ Clicking note opens study page
6. ✅ All three AI features generate content
7. ✅ Quiz is interactive
8. ✅ Flashcards flip
9. ✅ No console errors (except Firebase warnings in dev mode)

---

## 📝 Test Notes

### What to Check in Browser Console:
```
✅ Dashboard initialized
✅ Study page initialized
✅ Development mode: Mock get notes
✅ Development mode: Mock save note
🔧 Firebase not initialized (using mock data)
```

### What NOT to Worry About:
- Firebase warnings (expected in dev mode)
- "Mock" messages (this is development mode)
- OpenAI API warnings (not configured yet)

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Core functionality is working
2. ✅ Ready for text extraction implementation
3. ✅ Ready for OpenAI API integration
4. ✅ Ready for Firebase production setup

If tests fail:
1. Check browser console for errors
2. Verify file structure
3. Clear browser cache
4. Try different browser
5. Check QUICK-TEST-GUIDE.md troubleshooting section

---

## 💡 Pro Tips

1. **Use Browser DevTools**
   - F12 → Console for logs
   - F12 → Network for requests
   - F12 → Application for localStorage

2. **Test in Multiple Browsers**
   - Chrome (recommended)
   - Edge
   - Firefox

3. **Test Responsive Design**
   - F12 → Toggle device toolbar
   - Test mobile view
   - Test tablet view

4. **Clear Data Between Tests**
   - F12 → Application → Local Storage → Clear All
   - Refresh page
   - Start fresh test

---

## 📞 Need Help?

Check these files for more info:
- `AI-FEATURES-COMPLETE.md` - Complete feature documentation
- `REFACTORED-QUICKSTART.md` - Setup guide
- `UPLOAD-FEATURE-GUIDE.md` - Upload feature details
- `TEST-FLOW.md` - Detailed test scenarios

---

**Happy Testing! 🎉**

*Last Updated: May 2, 2026*
