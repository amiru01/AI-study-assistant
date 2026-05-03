# 📸 Step-by-Step Configuration Guide with Visual Instructions

## Complete Firebase & API Setup with Detailed Steps

This guide includes detailed descriptions of what you'll see at each step.

---

## 🔥 Part 1: Firebase Configuration

### Step 1: Access Firebase Console

1. **Open your web browser**
2. **Go to**: `https://console.firebase.google.com/`
3. **You'll see**: Firebase welcome page with "Add project" button
4. **Sign in** with your Google account if not already signed in

---

### Step 2: Create New Project

1. **Click**: The blue "Add project" button (center of screen)
2. **You'll see**: "Create a project" dialog

**Screen 1: Project Name**
- **Field**: "Enter your project name"
- **Type**: `ai-study-assistant` (or your preferred name)
- **Note**: You'll see a unique project ID generated below (like `ai-study-assistant-a1b2c`)
- **Click**: Blue "Continue" button

**Screen 2: Google Analytics** (Optional)
- **Toggle**: You can turn OFF "Enable Google Analytics" if you don't need it
- **Click**: Blue "Create project" button
- **Wait**: 30-60 seconds while Firebase creates your project
- **You'll see**: Progress bar and "Your new project is ready" message
- **Click**: "Continue" button

---

### Step 3: Get to Project Dashboard

**You'll now see**: Your Firebase project dashboard with:
- Left sidebar with menu items
- Main area showing "Get started by adding Firebase to your app"
- Top bar showing your project name

---

### Step 4: Enable Authentication

1. **In left sidebar, click**: "Authentication" (🔐 icon)
2. **You'll see**: "Get started with Firebase Authentication" page
3. **Click**: Blue "Get started" button

**Set up sign-in method**:
4. **You'll see**: "Sign-in method" tab (should be selected)
5. **You'll see**: List of providers (Google, Email/Password, etc.)
6. **Click on**: "Email/Password" row
7. **You'll see**: Dialog box opens

**Enable Email/Password**:
8. **Toggle ON**: First switch "Enable"
9. **Leave**: Second switch "Email link" OFF (unless you want passwordless)
10. **Click**: Blue "Save" button
11. **You'll see**: "Email/Password" now shows "Enabled" status

✅ **Success indicator**: Green checkmark next to Email/Password

---

### Step 5: Create Firestore Database

1. **In left sidebar, click**: "Firestore Database" (📊 icon)
2. **You'll see**: "Cloud Firestore" page with "Create database" button
3. **Click**: "Create database" button

**Screen 1: Security Rules**:
4. **You'll see**: Two options:
   - "Start in production mode" (recommended)
   - "Start in test mode"
5. **Select**: "Start in **test mode**" (easier for development)
6. **Click**: "Next" button

**Screen 2: Location**:
7. **You'll see**: Dropdown menu "Cloud Firestore location"
8. **Select**: Closest region to you:
   - US: `us-central1` (Iowa)
   - Europe: `europe-west1` (Belgium)
   - Asia: `asia-southeast1` (Singapore)
9. **Click**: "Enable" button
10. **Wait**: 1-2 minutes (you'll see "Creating Cloud Firestore" progress)

**You'll now see**: Firestore Data tab with empty database

---

### Step 6: Set Firestore Security Rules

1. **Click**: "Rules" tab (next to "Data" tab)
2. **You'll see**: Text editor with default rules
3. **Select ALL text** (Ctrl+A or Cmd+A)
4. **Delete** all text
5. **Copy and paste** this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /notes/{noteId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /generatedContent/{contentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

6. **Click**: Blue "Publish" button (top right)
7. **You'll see**: "Rules published successfully" message

✅ **Success indicator**: Green banner at top

---

### Step 7: Enable Storage

1. **In left sidebar, click**: "Storage" (📦 icon)
2. **You'll see**: "Get started with Cloud Storage" page
3. **Click**: Blue "Get started" button

**Screen 1: Security Rules**:
4. **You'll see**: Default rules shown
5. **Click**: "Next" button

**Screen 2: Location**:
6. **You'll see**: Location dropdown (should match Firestore location)
7. **Verify**: Same location as Firestore
8. **Click**: "Done" button
9. **Wait**: 10-20 seconds

**You'll now see**: Storage Files tab (empty)

---

### Step 8: Set Storage Security Rules

1. **Click**: "Rules" tab (next to "Files" tab)
2. **You'll see**: Text editor with default rules
3. **Select ALL text** (Ctrl+A or Cmd+A)
4. **Delete** all text
5. **Copy and paste** this code:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{userId}/{fileName} {
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('application/pdf|image/.*');
      
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. **Click**: Blue "Publish" button (top right)
7. **You'll see**: "Rules published successfully" message

✅ **Success indicator**: Green banner at top

---

### Step 9: Get Firebase Configuration

1. **Click**: Gear icon ⚙️ (next to "Project Overview" in left sidebar)
2. **Click**: "Project settings"
3. **You'll see**: General tab with project info
4. **Scroll down** to "Your apps" section
5. **You'll see**: "There are no apps in your project" message

**Add Web App**:
6. **Click**: Web icon `</>` button
7. **You'll see**: "Add Firebase to your web app" dialog

**Register App**:
8. **Field**: "App nickname"
9. **Type**: `AI Study Assistant`
10. **Checkbox**: "Also set up Firebase Hosting" - LEAVE UNCHECKED for now
11. **Click**: Blue "Register app" button

**Copy Configuration**:
12. **You'll see**: Code snippet with `firebaseConfig` object
13. **It looks like this**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ai-study-assistant-xxxxx.firebaseapp.com",
  projectId: "ai-study-assistant-xxxxx",
  storageBucket: "ai-study-assistant-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

14. **Copy**: All values (you'll need them next)
15. **Click**: "Continue to console" button

---

### Step 10: Update Your Code

1. **Open VS Code** (or your code editor)
2. **Open file**: `src/config/firebase.js`
3. **Find lines 11-18** (the firebaseConfig object)
4. **You'll see**:

```javascript
const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
    // ... more lines
};
```

5. **Replace with YOUR values** from Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "ai-study-assistant-xxxxx.firebaseapp.com",
    projectId: "ai-study-assistant-xxxxx",
    storageBucket: "ai-study-assistant-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};
```

6. **Save file** (Ctrl+S or Cmd+S)

✅ **Firebase configuration complete!**

---

## 🤖 Part 2: Free AI Configuration (Hugging Face)

### Step 1: Create Hugging Face Account

1. **Open browser**
2. **Go to**: `https://huggingface.co/join`
3. **You'll see**: Sign up form

**Fill in form**:
4. **Email**: Enter your email
5. **Username**: Choose a username
6. **Password**: Create a password
7. **Click**: "Sign up" button
8. **Check email**: Verify your account
9. **Click**: Verification link in email

---

### Step 2: Get Access Token

1. **Go to**: `https://huggingface.co/settings/tokens`
2. **You'll see**: "Access Tokens" page
3. **Click**: "New token" button

**Create Token**:
4. **You'll see**: Dialog box
5. **Field**: "Name"
6. **Type**: `AI Study Assistant`
7. **Dropdown**: "Role"
8. **Select**: "read"
9. **Click**: "Generate a token" button

**Copy Token**:
10. **You'll see**: Your token (starts with `hf_`)
11. **Example**: `hf_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
12. **Click**: Copy icon or select and copy
13. **IMPORTANT**: Save this token somewhere safe!

---

### Step 3: Update Your Code

1. **Open VS Code**
2. **Open file**: `src/config/api.js`
3. **Find line 11** (API_KEYS object)
4. **You'll see**:

```javascript
export const API_KEYS = {
    OPENAI: import.meta.env?.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: import.meta.env?.VITE_OCR_API_KEY || 'YOUR_OCR_API_KEY_HERE',
    HUGGINGFACE: import.meta.env?.VITE_HUGGINGFACE_TOKEN || 'YOUR_HUGGINGFACE_TOKEN_HERE',
};
```

5. **Replace** `YOUR_HUGGINGFACE_TOKEN_HERE` with your actual token:

```javascript
export const API_KEYS = {
    OPENAI: 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: 'YOUR_OCR_API_KEY_HERE',
    HUGGINGFACE: 'hf_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',  // Your token here
};
```

6. **Save file** (Ctrl+S or Cmd+S)

✅ **Hugging Face configured!**

---

## 📸 Part 3: Free OCR Configuration

### Step 1: Get OCR.space API Key

1. **Open browser**
2. **Go to**: `https://ocr.space/ocrapi`
3. **Scroll down** to "Free OCR API" section
4. **You'll see**: "Register for free API key" form

**Fill in form**:
5. **Field**: "Email"
6. **Type**: Your email address
7. **Click**: "Register" button
8. **You'll see**: "Thank you" message

**Check Email**:
9. **Open your email**
10. **Look for**: Email from OCR.space
11. **Subject**: "Your OCR.space API Key"
12. **You'll see**: Your API key in the email
13. **Example**: `K12345678901234`
14. **Copy**: The API key

---

### Step 2: Update Your Code

1. **Open VS Code**
2. **Open file**: `src/config/api.js`
3. **Find**: API_KEYS object (same as before)
4. **Replace** `YOUR_OCR_API_KEY_HERE` with your actual key:

```javascript
export const API_KEYS = {
    OPENAI: 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: 'K12345678901234',  // Your OCR key here
    HUGGINGFACE: 'hf_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
};
```

5. **Save file** (Ctrl+S or Cmd+S)

✅ **OCR configured!**

---

## ✅ Verification Checklist

After completing all steps, verify your configuration:

### Firebase Configuration
- [ ] `src/config/firebase.js` has your actual Firebase values
- [ ] No "YOUR_" placeholders remain
- [ ] All 7 values are filled in (apiKey, authDomain, projectId, etc.)

### API Configuration
- [ ] `src/config/api.js` has your Hugging Face token
- [ ] `src/config/api.js` has your OCR.space API key
- [ ] Tokens start with correct prefixes (hf_ for Hugging Face)

### Firebase Console
- [ ] Authentication is enabled (Email/Password)
- [ ] Firestore database is created
- [ ] Firestore rules are published
- [ ] Storage is enabled
- [ ] Storage rules are published

---

## 🧪 Test Your Configuration

### Test 1: Open Your App

1. **In VS Code**: Right-click `index.html`
2. **Select**: "Open with Live Server"
3. **Browser opens**: Your app should load
4. **Check console** (F12): Look for Firebase messages

**Expected console output**:
```
✅ Firebase initialized successfully
```

**If you see errors**: Check your Firebase config values

---

### Test 2: Test Authentication

1. **Click**: "Get Started" button
2. **Click**: "Register" tab
3. **Enter**:
   - Email: `test@example.com`
   - Password: `password123`
4. **Click**: "Register" button
5. **You should see**: Success message and redirect to dashboard

**Verify in Firebase Console**:
6. **Go to**: Firebase Console → Authentication → Users
7. **You should see**: Your test user in the list

✅ **If user appears**: Authentication works!

---

### Test 3: Test File Upload

1. **In your app**: Click "Upload Notes"
2. **Upload**: Any PDF file
3. **Wait**: For upload to complete
4. **You should see**: Success message

**Verify in Firebase Console**:
5. **Go to**: Firebase Console → Storage → Files
6. **You should see**: `notes/` folder with your file

**Verify in Firestore**:
7. **Go to**: Firebase Console → Firestore Database → Data
8. **You should see**: `notes` collection with a document

✅ **If file and document appear**: Storage and Firestore work!

---

### Test 4: Test AI Generation

1. **Click**: On your uploaded note
2. **Click**: "Generate Summary" button
3. **Wait**: 10-20 seconds (first time is slower)
4. **You should see**: AI-generated summary

**Check console** (F12):
```
🤖 Generating summary with Hugging Face (FREE)...
✅ Summary generated successfully (FREE)
```

✅ **If summary appears**: AI works!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase not initialized"

**What you see**: Error in console
**Cause**: Firebase config not updated
**Solution**:
1. Open `src/config/firebase.js`
2. Check all values are filled in
3. No "YOUR_" placeholders should remain
4. Save file and refresh browser (Ctrl+F5)

---

### Issue 2: "Permission denied" in Firestore

**What you see**: Error when uploading or loading data
**Cause**: Security rules not published or user not logged in
**Solution**:
1. Go to Firebase Console → Firestore → Rules
2. Click "Publish" button
3. In your app, logout and login again
4. Try operation again

---

### Issue 3: "Storage upload failed"

**What you see**: Upload fails with error
**Cause**: Storage rules not published or file too large
**Solution**:
1. Check file size < 10MB
2. Check file type is PDF or image
3. Go to Firebase Console → Storage → Rules
4. Click "Publish" button
5. Try upload again

---

### Issue 4: "AI generation is very slow"

**What you see**: Takes 20+ seconds for first generation
**Cause**: Hugging Face loads model on first request (normal)
**Solution**:
- This is expected behavior for free tier
- First request: 15-20 seconds (model loading)
- Subsequent requests: 5-10 seconds (faster)
- Be patient, it will work!

---

### Issue 5: "Text extraction failed"

**What you see**: Error when uploading PDF
**Cause**: PDF is encrypted or image-based
**Solution**:
1. Try different PDF file
2. Make sure PDF has actual text (not scanned image)
3. Check browser console for specific error
4. Try smaller PDF file

---

## 📞 Still Need Help?

### Check These First:
1. Browser console (F12) for error messages
2. Firebase Console for service status
3. All config files saved
4. Browser cache cleared (Ctrl+Shift+Delete)

### Resources:
- Firebase Docs: https://firebase.google.com/docs
- Hugging Face Docs: https://huggingface.co/docs
- Project README: `FREE-TIER-SETUP.md`

---

## 🎉 Success!

If all tests pass, you're ready to use your AI Study Assistant!

**What works now**:
- ✅ User registration and login
- ✅ File upload to cloud
- ✅ Text extraction from PDFs
- ✅ AI-powered summaries
- ✅ AI-generated quizzes
- ✅ AI-generated flashcards
- ✅ All data saved to cloud
- ✅ Access from any device

**And it's all FREE! 🎉**

---

*Configuration time: ~20-30 minutes*
*Difficulty: Beginner-friendly*
*Cost: $0/month forever*
