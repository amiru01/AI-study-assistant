# 🧪 How to Test Upload Feature

## Quick Start

### 1. Make Sure Server is Running
```bash
# Check if server is running on port 8000
# If not, start it:
python -m http.server 8000
```

### 2. Open Upload Page
Open your browser and go to:
```
http://localhost:8000/public/upload.html
```

### 3. Open Browser Console
Press **F12** (or right-click → Inspect → Console tab)

---

## ✅ Step-by-Step Testing

### Step 1: Verify Page Loads Correctly

**What to check:**
- Page displays without errors
- Navigation bar shows your email
- Upload zone is visible
- "Choose File" button is present

**Console should show:**
```
✅ Supabase initialized successfully
✅ Upload page initialized
✅ Upload button event listener attached
✅ Cancel button event listener attached
✅ Dashboard button event listener attached
✅ Upload Another button event listener attached
```

**If you don't see these logs:**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Check for red error messages in console
- Verify you're logged in (if not, go to auth-refactored.html)

---

### Step 2: Select a File

**Option A: Click to Upload**
1. Click the "Choose File" button
2. Select a PDF or image file (under 10MB)
3. Click "Open"

**Option B: Drag & Drop**
1. Drag a file from your computer
2. Drop it onto the upload zone
3. Upload zone should highlight when dragging

**What should happen:**
- Upload zone disappears
- File preview appears showing:
  - File icon (📄 for PDF, 🖼️ for images)
  - File name
  - File size
  - File type
  - Status: "Ready to upload"
- Two buttons appear: "Cancel" and "Upload & Process"

**If file preview doesn't appear:**
- Check console for validation errors
- Verify file is under 10MB
- Verify file is PDF, JPG, or PNG
- Try a different file

---

### Step 3: Upload the File

**Action:**
Click the **"Upload & Process"** button

**Console should show:**
```
🚀 Upload button clicked!
📁 Selected file: example.pdf 2500000 bytes
📤 Starting upload...
📝 Extracting text from file...
✅ Extracted 1234 characters
✅ Upload complete: {url: "...", path: "...", ...}
💾 Saving note to database...
🎉 Upload successful!
```

**Visual feedback:**
1. Button changes to "Uploading..." and becomes disabled
2. Progress bar appears
3. Progress animates: 0% → 30% → 70% → 100%
4. Status text changes:
   - "Uploading file..."
   - "Processing..."
   - "Almost done..."
   - "Saving to database..."
   - "Upload complete!"
5. Success message appears with ✅ icon
6. Toast notification: "File uploaded successfully!"

**If upload fails:**
- Check console for error message
- Verify Supabase credentials in `src/config/supabase.js`
- Check if storage bucket "notes" exists in Supabase
- Run `QUICK-FIX.sql` to set up storage policies

---

### Step 4: Verify Success

**After successful upload:**
- Success message is displayed
- Two buttons appear:
  - "Go to Dashboard"
  - "Upload Another"

**Click "Go to Dashboard":**
- Should redirect to dashboard-refactored.html
- Uploaded file should appear in the notes list

**Click "Upload Another":**
- Success message disappears
- Upload zone reappears
- Ready to upload another file

---

## 🔍 Detailed Console Debugging

### Check if Button Exists
```javascript
document.getElementById('upload-btn')
// Should return: <button class="btn-primary" id="upload-btn">
```

### Check if File is Selected
```javascript
document.getElementById('file-input').files[0]
// Should return: File {name: "example.pdf", size: 2500000, type: "application/pdf"}
```

### Check Event Listeners
```javascript
getEventListeners(document.getElementById('upload-btn'))
// Should show: click event listener attached
```

### Manually Trigger Upload
```javascript
document.getElementById('upload-btn').click()
// Should trigger upload process
```

### Check Authentication
```javascript
localStorage.getItem('supabase.auth.token')
// Should return: authentication token (long string)
```

---

## 🎯 Test Cases

### Test Case 1: PDF Upload
**File:** Any PDF file (under 10MB)
**Expected:**
- ✅ Text extracted using PDF.js
- ✅ Upload successful
- ✅ File appears in dashboard

### Test Case 2: Image Upload (JPG/PNG)
**File:** Any JPG or PNG image (under 10MB)
**Expected:**
- ⚠️ Text extraction may fail (needs OCR.space API key)
- ✅ Upload still successful
- ✅ File appears in dashboard

### Test Case 3: Large File
**File:** File close to 10MB limit
**Expected:**
- ✅ Upload takes longer
- ✅ Progress bar shows accurate progress
- ✅ Upload successful

### Test Case 4: Invalid File
**File:** .txt, .docx, or other unsupported format
**Expected:**
- ❌ Validation error
- ❌ Toast: "File type not supported"
- ❌ Upload blocked

### Test Case 5: File Too Large
**File:** File over 10MB
**Expected:**
- ❌ Validation error
- ❌ Toast: "File size exceeds 10MB limit"
- ❌ Upload blocked

### Test Case 6: Cancel Upload
**Action:** Select file, then click "Cancel"
**Expected:**
- ✅ File preview disappears
- ✅ Upload zone reappears
- ✅ File input cleared

---

## 🐛 Common Issues & Solutions

### Issue 1: Upload Button Does Nothing
**Symptoms:**
- Click button, nothing happens
- No console logs appear

**Solutions:**
1. Hard refresh: Ctrl+F5
2. Clear browser cache
3. Check console for JavaScript errors
4. Verify files were saved correctly
5. Try different browser

### Issue 2: "No file selected" Error
**Symptoms:**
- Click upload, get error message
- File preview not showing

**Solutions:**
1. Click "Choose File" button (not upload zone)
2. Select a valid file (PDF, JPG, PNG)
3. Check file size is under 10MB
4. Try drag & drop instead

### Issue 3: Upload Fails with Error
**Symptoms:**
- Upload starts but fails
- Error message in console
- Toast: "Upload failed"

**Solutions:**
1. Check Supabase credentials in `src/config/supabase.js`
2. Verify storage bucket "notes" exists
3. Run `QUICK-FIX.sql` in Supabase SQL Editor
4. Check browser Network tab for failed requests
5. Verify you're logged in

### Issue 4: Progress Bar Stuck
**Symptoms:**
- Progress bar doesn't move
- Upload seems frozen

**Solutions:**
1. Wait 30 seconds (large files take time)
2. Check Network tab for active requests
3. Check console for errors
4. Refresh and try again

### Issue 5: Text Extraction Fails
**Symptoms:**
- Console: "Text extraction failed"
- Upload still completes

**Solutions:**
- For PDFs: Check if PDF.js CDN is loaded
- For images: Add OCR.space API key in `src/config/api.js`
- Text extraction is optional, upload still works

---

## 📊 Success Checklist

After testing, verify:

- [ ] Page loads without errors
- [ ] Console shows initialization logs
- [ ] File selection works (click and drag & drop)
- [ ] File preview displays correctly
- [ ] Upload button responds to clicks
- [ ] Progress bar animates smoothly
- [ ] Success message appears
- [ ] Toast notification shows
- [ ] File appears in dashboard
- [ ] "Upload Another" works
- [ ] "Go to Dashboard" works
- [ ] No errors in console

---

## 🚀 Production Testing

Before deploying to production:

### 1. Test with Real Supabase
- [ ] Configure real Supabase credentials
- [ ] Create storage bucket "notes"
- [ ] Run `QUICK-FIX.sql` to set up policies
- [ ] Test upload with real backend

### 2. Test Different File Types
- [ ] PDF files (various sizes)
- [ ] JPG images
- [ ] PNG images
- [ ] Invalid file types (should be rejected)
- [ ] Files over 10MB (should be rejected)

### 3. Test Different Scenarios
- [ ] Upload while logged in
- [ ] Upload while logged out (should redirect)
- [ ] Upload multiple files in sequence
- [ ] Cancel upload mid-process
- [ ] Upload same file twice
- [ ] Upload with slow internet connection

### 4. Test Error Handling
- [ ] Invalid Supabase credentials
- [ ] Storage bucket doesn't exist
- [ ] Database table doesn't exist
- [ ] Network disconnected
- [ ] File too large
- [ ] Invalid file type

### 5. Test UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Drag & drop works smoothly
- [ ] Progress bar is accurate
- [ ] Error messages are clear
- [ ] Success messages are clear
- [ ] Loading states work correctly

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________

✅ Page loads correctly
✅ File selection works
✅ Upload button works
✅ Progress bar animates
✅ Success message appears
✅ File appears in dashboard
✅ No console errors

Issues found:
1. ___________
2. ___________

Notes:
___________
```

---

## 🎉 Success!

If all tests pass, your upload feature is working correctly!

You can now:
- Upload study materials (PDFs, images)
- Extract text automatically
- Store files securely in Supabase
- Generate AI summaries, quizzes, flashcards
- Access uploaded files from dashboard

**Next Steps:**
1. Test the dashboard to view uploaded files
2. Test AI generation features (summary, quiz, flashcards)
3. Deploy to production
4. Share with users!
