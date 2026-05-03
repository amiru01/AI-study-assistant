# 🔧 Supabase Code Update Guide

## Update Your Code to Use Supabase

Follow these steps to complete the integration.

---

## ✅ Step 1: Add Your Supabase Credentials

### Open: `src/config/supabase.js`

**Find lines 8-9**:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

**Replace with YOUR actual values** from Supabase Dashboard:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your anon public key
```

**Where to find these**:
1. Go to your Supabase project dashboard
2. Click "Settings" (gear icon)
3. Click "API" in left sidebar
4. Copy "Project URL" and "anon public" key

**Save the file!**

---

## ✅ Step 2: Update HTML Files

You need to replace Firebase SDK with Supabase SDK in 4 HTML files.

### File 1: `public/auth-refactored.html`

**Find lines 191-194** (near the end of file):
```html
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
```

**Replace with**:
```html
    <!-- Supabase SDK (Free - no credit card required!) -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### File 2: `public/dashboard-refactored.html`

**Find lines 259-261**:
```html
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

**Replace with**:
```html
    <!-- Supabase SDK (Free - no credit card required!) -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### File 3: `public/upload.html`

**Find lines 419-422**:
```html
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
```

**Replace with**:
```html
    <!-- Supabase SDK (Free - no credit card required!) -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### File 4: `public/study.html`

**Find lines 536-538**:
```html
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

**Replace with**:
```html
    <!-- Supabase SDK (Free - no credit card required!) -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

## ✅ Step 3: Update Service Imports

Now update your page files to use Supabase services instead of Firebase services.

### File 1: `src/pages/auth-page.js`

**Find line 8**:
```javascript
import { registerUser, loginUser } from '../services/authService.js';
```

**Replace with**:
```javascript
import { registerUser, loginUser } from '../services/supabaseAuthService.js';
```

---

### File 2: `src/pages/dashboard-page.js`

**Find line 8**:
```javascript
import { getCurrentUser, logoutUser, isAuthenticated } from '../services/authService.js';
```

**Replace with**:
```javascript
import { getCurrentUser, logoutUser, isAuthenticated } from '../services/supabaseAuthService.js';
```

**Find line 9**:
```javascript
import { getNotes } from '../services/databaseService.js';
```

**Replace with**:
```javascript
import { getNotes } from '../services/supabaseDatabaseService.js';
```

**Find line 127** (inside deleteNoteConfirm function):
```javascript
        const { deleteNote } = await import('../services/databaseService.js');
```

**Replace with**:
```javascript
        const { deleteNote } = await import('../services/supabaseDatabaseService.js');
```

---

### File 3: `src/pages/upload-page.js`

**Find line 8**:
```javascript
import { getCurrentUser, isAuthenticated } from '../services/authService.js';
```

**Replace with**:
```javascript
import { getCurrentUser, isAuthenticated } from '../services/supabaseAuthService.js';
```

**Find line 9**:
```javascript
import { uploadFile } from '../services/storageService.js';
```

**Replace with**:
```javascript
import { uploadFile } from '../services/supabaseStorageService.js';
```

**Find line 10**:
```javascript
import { saveNote } from '../services/databaseService.js';
```

**Replace with**:
```javascript
import { saveNote } from '../services/supabaseDatabaseService.js';
```

---

### File 4: `src/pages/study-page.js`

**Find line 8**:
```javascript
import { getCurrentUser, isAuthenticated } from '../services/authService.js';
```

**Replace with**:
```javascript
import { getCurrentUser, isAuthenticated } from '../services/supabaseAuthService.js';
```

**Find line 9**:
```javascript
import { getNote, getGeneratedContent, saveGeneratedContent } from '../services/databaseService.js';
```

**Replace with**:
```javascript
import { getNote, getGeneratedContent, saveGeneratedContent } from '../services/supabaseDatabaseService.js';
```

---

## ✅ Step 4: Test Your Setup

### Test 1: Open Your App

1. **Open**: `index.html` with Live Server
2. **Check console** (F12):
   - Should see: `✅ Supabase initialized successfully`
   - If you see warnings, check your credentials in `src/config/supabase.js`

### Test 2: Register a User

1. **Click**: "Get Started"
2. **Register** with:
   - Email: `test@example.com`
   - Password: `password123`
3. **Should see**: Success message and redirect to dashboard

**Verify in Supabase**:
4. Go to Supabase Dashboard → Authentication → Users
5. You should see your test user!

### Test 3: Upload a File

1. **Click**: "Upload Notes"
2. **Upload**: A PDF file
3. **Should see**: Progress bar and success message

**Verify in Supabase**:
4. Go to Supabase Dashboard → Storage → notes bucket
5. You should see your uploaded file!

**Verify in Database**:
6. Go to Supabase Dashboard → Table Editor → notes table
7. You should see a new row with your note!

### Test 4: Generate AI Content

1. **Click**: On your uploaded note
2. **Click**: "Generate Summary"
3. **Wait**: 10-20 seconds
4. **Should see**: AI-generated summary

**Check console**:
```
🤖 Generating summary with Hugging Face (FREE)...
✅ Summary generated successfully (FREE)
```

---

## 🐛 Troubleshooting

### "Supabase not initialized"
**Solution**:
- Check `src/config/supabase.js` has your actual URL and key
- Make sure Supabase SDK script tag is in HTML files
- Refresh browser (Ctrl+F5)

### "User not authenticated"
**Solution**:
- Logout and login again
- Check Supabase Dashboard → Authentication
- Clear browser cache

### "Permission denied" or "Row level security"
**Solution**:
- Check you created RLS policies in Supabase
- Policy should allow: `auth.uid() = user_id`
- Go to Supabase Dashboard → Authentication → Policies

### "File upload failed"
**Solution**:
- Check storage bucket is created (name: "notes")
- Check storage policies are set
- Check file size < 10MB
- Check file type is PDF or image

### "Cannot find module"
**Solution**:
- Make sure all import paths are correct
- Check file names match exactly
- Clear browser cache

---

## ✅ Quick Checklist

- [ ] Updated `src/config/supabase.js` with credentials
- [ ] Replaced Firebase SDK with Supabase SDK in 4 HTML files
- [ ] Updated imports in `src/pages/auth-page.js`
- [ ] Updated imports in `src/pages/dashboard-page.js`
- [ ] Updated imports in `src/pages/upload-page.js`
- [ ] Updated imports in `src/pages/study-page.js`
- [ ] Tested user registration
- [ ] Tested file upload
- [ ] Tested AI generation
- [ ] Verified data in Supabase Dashboard

---

## 🎉 You're Done!

After completing all steps, your app will:
- ✅ Use Supabase instead of Firebase
- ✅ Store data in the cloud
- ✅ Sync across devices
- ✅ Work without credit card
- ✅ Stay 100% free!

**Enjoy your cloud-powered AI Study Assistant! 🚀**

---

*Need help? Check browser console (F12) for error messages*
*All services work in development mode if Supabase isn't configured*
