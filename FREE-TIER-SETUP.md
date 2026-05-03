# 🆓 100% Free Setup Guide

## Make Your AI Study Assistant Completely Free!

This guide shows you how to run the AI Study Assistant without any costs using free alternatives.

---

## 🎯 Free Architecture

Instead of paid services, we'll use:
- ✅ **Firebase Free Tier** (Authentication, Firestore, Storage, Hosting)
- ✅ **Hugging Face API** (Free AI - replaces OpenAI)
- ✅ **OCR.space Free Tier** (25,000 requests/month)
- ✅ **PDF.js** (Already free)

**Total Cost: $0/month forever!**

---

## Part 1: Firebase Setup (100% Free)

### Step 1: Create Firebase Account

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Sign in with Google**
   - Use your existing Google account
   - Or create a new one (free)

3. **Click "Add project"**
   - Project name: `ai-study-assistant`
   - Click "Continue"

4. **Google Analytics** (Optional)
   - Toggle OFF if you don't need it
   - Click "Create project"
   - Wait 30-60 seconds

5. **Click "Continue"** when ready

---

### Step 2: Enable Authentication (Free)

1. **In Firebase Console, click "Authentication"** (left sidebar)

2. **Click "Get started"** button

3. **Click "Sign-in method"** tab

4. **Enable Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" switch to ON
   - Click "Save"

✅ **Done!** Authentication is now enabled (free forever)

---

### Step 3: Create Firestore Database (Free)

1. **Click "Firestore Database"** (left sidebar)

2. **Click "Create database"** button

3. **Choose Mode**:
   - Select "Start in **test mode**" (easier for now)
   - Click "Next"

4. **Choose Location**:
   - Select closest region to you:
     - US: `us-central1`
     - Europe: `europe-west1`
     - Asia: `asia-southeast1`
   - Click "Enable"
   - Wait 1-2 minutes

5. **Update Security Rules** (Important!):
   - Click "Rules" tab
   - Replace ALL text with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own data
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

   - Click "Publish" button

✅ **Done!** Firestore is ready (free: 50,000 reads + 20,000 writes per day)

---

### Step 4: Enable Storage (Free)

1. **Click "Storage"** (left sidebar)

2. **Click "Get started"** button

3. **Security Rules**:
   - Keep default for now
   - Click "Next"

4. **Choose Location**:
   - Use SAME location as Firestore
   - Click "Done"

5. **Update Security Rules**:
   - Click "Rules" tab
   - Replace ALL text with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{userId}/{fileName} {
      // Allow users to upload their own files (max 10MB)
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('application/pdf|image/.*');
      
      // Allow users to read their own files
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

   - Click "Publish" button

✅ **Done!** Storage is ready (free: 5GB storage + 1GB/day downloads)

---

### Step 5: Get Your Firebase Configuration

1. **Click the Gear Icon ⚙️** next to "Project Overview"

2. **Click "Project settings"**

3. **Scroll down to "Your apps"** section

4. **Click the Web icon `</>`** (if no apps exist)
   - App nickname: `AI Study Assistant`
   - Don't check "Firebase Hosting" yet
   - Click "Register app"

5. **Copy Your Configuration**:
   - You'll see a code block like this:

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

6. **Copy these values** - you'll need them in the next step!

---

### Step 6: Update Your Code with Firebase Config

1. **Open your project in VS Code**

2. **Open file**: `src/config/firebase.js`

3. **Find this section** (around line 11):

```javascript
const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};
```

4. **Replace with YOUR values** from Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // Paste YOUR apiKey
    authDomain: "ai-study-assistant-xxxxx.firebaseapp.com",  // Paste YOUR authDomain
    projectId: "ai-study-assistant-xxxxx",  // Paste YOUR projectId
    storageBucket: "ai-study-assistant-xxxxx.appspot.com",  // Paste YOUR storageBucket
    messagingSenderId: "123456789012",  // Paste YOUR messagingSenderId
    appId: "1:123456789012:web:abcdef123456",  // Paste YOUR appId
    measurementId: "G-XXXXXXXXXX"  // Paste YOUR measurementId (optional)
};
```

5. **Save the file** (Ctrl+S or Cmd+S)

✅ **Done!** Firebase is now configured!

---

## Part 2: Free AI Setup (Hugging Face)

Instead of OpenAI ($$$), we'll use Hugging Face (FREE!)

### Step 1: Create Hugging Face Account

1. **Go to Hugging Face**:
   ```
   https://huggingface.co/join
   ```

2. **Sign up** (free):
   - Enter email
   - Create password
   - Verify email

3. **Go to Settings**:
   ```
   https://huggingface.co/settings/tokens
   ```

4. **Create Access Token**:
   - Click "New token"
   - Name: `AI Study Assistant`
   - Role: `read`
   - Click "Generate a token"
   - **Copy the token** (starts with `hf_...`)

### Step 2: Update Your Code with Hugging Face

1. **Open file**: `src/config/api.js`

2. **Find this section**:

```javascript
export const API_KEYS = {
    OPENAI: import.meta.env?.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: import.meta.env?.VITE_OCR_API_KEY || 'YOUR_OCR_API_KEY_HERE',
};
```

3. **Replace with**:

```javascript
export const API_KEYS = {
    OPENAI: import.meta.env?.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: import.meta.env?.VITE_OCR_API_KEY || 'YOUR_OCR_API_KEY_HERE',
    HUGGINGFACE: 'hf_PASTE_YOUR_TOKEN_HERE',  // Add this line
};
```

4. **Add Hugging Face endpoint**:

Find this section:
```javascript
export const API_ENDPOINTS = {
    OPENAI: 'https://api.openai.com/v1',
    OCR_SPACE: 'https://api.ocr.space/parse/image',
};
```

Replace with:
```javascript
export const API_ENDPOINTS = {
    OPENAI: 'https://api.openai.com/v1',
    OCR_SPACE: 'https://api.ocr.space/parse/image',
    HUGGINGFACE: 'https://api-inference.huggingface.co/models',
};
```

5. **Save the file**

---

### Step 3: Get Free OCR API Key

1. **Go to OCR.space**:
   ```
   https://ocr.space/ocrapi
   ```

2. **Scroll down to "Register for free API key"**

3. **Enter your email**

4. **Check your email** for the API key

5. **Update `src/config/api.js`**:

```javascript
export const API_KEYS = {
    OPENAI: 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: 'PASTE_YOUR_OCR_KEY_HERE',  // Paste here
    HUGGINGFACE: 'hf_PASTE_YOUR_TOKEN_HERE',
};
```

6. **Save the file**

✅ **Done!** All APIs configured for FREE!

---

## Part 3: Test Your Setup

### Test 1: Firebase Authentication

1. **Open your app** in browser (use Live Server)
   ```
   Right-click index.html → Open with Live Server
   ```

2. **Click "Get Started"**

3. **Register a new account**:
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Register"

4. **Check Firebase Console**:
   - Go to Firebase Console → Authentication → Users
   - You should see your test user!

✅ **Success!** Authentication works!

### Test 2: File Upload & Storage

1. **In your app, click "Upload Notes"**

2. **Upload a PDF file** (any PDF)

3. **Wait for upload to complete**

4. **Check Firebase Console**:
   - Go to Storage → Files
   - You should see `notes/YOUR_USER_ID/filename.pdf`

5. **Check Firestore**:
   - Go to Firestore Database → Data
   - You should see `notes` collection
   - Click on a document to see the data

✅ **Success!** Storage and Database work!

### Test 3: Text Extraction

1. **Upload a PDF with text**

2. **Open Browser Console** (F12)

3. **Look for these messages**:
   ```
   📝 Extracting text from file...
   📄 PDF loaded: X pages
   ✅ Extracted X characters from PDF
   ```

✅ **Success!** Text extraction works!

### Test 4: AI Generation (with Hugging Face)

1. **Click on your uploaded note**

2. **Click "Generate Summary"**

3. **Wait 10-15 seconds** (Hugging Face is slower than OpenAI)

4. **You should see a summary!**

✅ **Success!** AI generation works for FREE!

---

## 🎯 Free Tier Limits

### Firebase (Free Forever)
- **Authentication**: 50,000 verifications/month
- **Firestore**: 
  - 50,000 reads/day
  - 20,000 writes/day
  - 1GB storage
- **Storage**: 
  - 5GB total storage
  - 1GB/day downloads
- **Hosting**: 
  - 10GB storage
  - 360MB/day bandwidth

**Good for**: 100-500 active users

### Hugging Face (Free Forever)
- **API Calls**: Unlimited (with rate limiting)
- **Rate Limit**: ~30 requests/minute
- **Models**: Access to 1000+ free models

**Good for**: Personal use, small apps

### OCR.space (Free Tier)
- **Requests**: 25,000/month
- **File Size**: Up to 1MB per image

**Good for**: 800+ images/day

---

## 💡 Tips for Staying Free

### 1. Monitor Firebase Usage
```
Firebase Console → Usage tab
Check daily to ensure you're within limits
```

### 2. Optimize Firestore Reads
- Cache data in browser
- Don't reload unnecessarily
- Use pagination for large lists

### 3. Optimize Storage
- Compress PDFs before upload
- Delete old files
- Set file size limits (already 10MB)

### 4. Use Hugging Face Efficiently
- Cache AI responses
- Don't regenerate unnecessarily
- Use smaller models for faster responses

---

## 🚀 Deploy for Free

### Option 1: Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# Choose: Existing project
# Public directory: . (dot)
# Single-page app: Yes
# Don't overwrite index.html

# Deploy
firebase deploy --only hosting
```

**Your app is live at**: `https://your-project-id.web.app`

### Option 2: Netlify (Free)

1. Push code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" → "Import from Git"
4. Connect GitHub
5. Deploy!

**Your app is live at**: `https://your-app-name.netlify.app`

### Option 3: Vercel (Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Connect GitHub
5. Deploy!

**Your app is live at**: `https://your-app-name.vercel.app`

---

## ✅ Configuration Checklist

Use this to track your progress:

### Firebase Setup
- [ ] Created Firebase account
- [ ] Created project
- [ ] Enabled Authentication
- [ ] Created Firestore database
- [ ] Set Firestore security rules
- [ ] Enabled Storage
- [ ] Set Storage security rules
- [ ] Got Firebase configuration
- [ ] Updated `src/config/firebase.js`
- [ ] Tested authentication
- [ ] Tested file upload

### AI Setup
- [ ] Created Hugging Face account
- [ ] Got API token
- [ ] Updated `src/config/api.js`
- [ ] Got OCR.space API key
- [ ] Updated OCR key in config
- [ ] Tested AI generation

### Deployment
- [ ] Chose hosting platform
- [ ] Deployed application
- [ ] Tested live URL
- [ ] Shared with friends!

---

## 🐛 Troubleshooting

### "Firebase not initialized"
**Solution**:
1. Check `src/config/firebase.js`
2. Make sure all values are filled in (no "YOUR_" placeholders)
3. Refresh browser (Ctrl+F5)

### "Permission denied" in Firestore
**Solution**:
1. Go to Firebase Console → Firestore → Rules
2. Make sure rules are published
3. Check user is logged in
4. Try logging out and back in

### "Storage upload failed"
**Solution**:
1. Check file size < 10MB
2. Check file type is PDF or image
3. Check Storage rules are published
4. Try different file

### "AI generation is slow"
**Solution**:
- Hugging Face free tier is slower than OpenAI
- First request takes 10-20 seconds (model loading)
- Subsequent requests are faster (5-10 seconds)
- This is normal for free tier!

### "Text extraction failed"
**Solution**:
1. Check PDF has actual text (not scanned image)
2. Try different PDF
3. Check browser console for errors
4. Make sure PDF.js is loaded (check page source)

---

## 📊 Cost Comparison

| Service | Paid (OpenAI) | Free (Hugging Face) |
|---------|---------------|---------------------|
| AI Summary | $0.001 | $0 |
| AI Quiz | $0.002 | $0 |
| AI Flashcards | $0.0016 | $0 |
| **Monthly (100 users)** | **$15-20** | **$0** |

**Savings**: $180-240 per year! 💰

---

## 🎉 You're All Set!

Your AI Study Assistant is now:
- ✅ 100% FREE forever
- ✅ Fully configured
- ✅ Production-ready
- ✅ Ready to deploy

**No credit card needed. No hidden costs. Completely free! 🎉**

---

## 📞 Need Help?

### Firebase Issues
- Documentation: https://firebase.google.com/docs
- Community: https://stackoverflow.com/questions/tagged/firebase

### Hugging Face Issues
- Documentation: https://huggingface.co/docs
- Community: https://discuss.huggingface.co/

### General Issues
- Check browser console (F12)
- Read error messages carefully
- Try in incognito mode
- Clear browser cache

---

**Start learning with AI for FREE! 🎓✨**

*Last Updated: May 2, 2026*
*Cost: $0/month forever*
