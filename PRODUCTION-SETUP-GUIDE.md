# 🚀 Production Setup Guide

## Complete Guide to Deploy AI Study Assistant to Production

This guide will walk you through setting up Firebase, OpenAI API, and deploying your application to production.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- [ ] A Google account (for Firebase)
- [ ] An OpenAI account (for AI features)
- [ ] A credit card (for OpenAI API - pay-as-you-go)
- [ ] Node.js installed (optional, for local development)
- [ ] A code editor (VS Code recommended)

---

## Part 1: Firebase Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Configure Project**
   - Enter project name: `ai-study-assistant` (or your choice)
   - Enable Google Analytics (optional)
   - Click "Create project"
   - Wait for project creation (30-60 seconds)

### Step 2: Enable Firebase Authentication

1. **Navigate to Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get started"

2. **Enable Email/Password Authentication**
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" switch
   - Click "Save"

3. **Optional: Enable Google Sign-In**
   - Click "Google" provider
   - Toggle "Enable" switch
   - Select support email
   - Click "Save"

### Step 3: Set Up Cloud Firestore

1. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click "Create database"

2. **Choose Mode**
   - Select "Start in production mode" (we'll add rules later)
   - Click "Next"

3. **Choose Location**
   - Select closest region to your users
   - Click "Enable"
   - Wait for database creation

4. **Set Security Rules**
   - Click "Rules" tab
   - Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notes collection
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Generated content collection
    match /generatedContent/{contentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

   - Click "Publish"

### Step 4: Set Up Firebase Storage

1. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click "Get started"

2. **Set Security Rules**
   - Use default rules for now
   - Click "Next"

3. **Choose Location**
   - Use same location as Firestore
   - Click "Done"

4. **Update Storage Rules**
   - Click "Rules" tab
   - Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{userId}/{fileName} {
      // Allow users to upload their own files
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('application/pdf|image/.*');
      
      // Allow users to read their own files
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

   - Click "Publish"

### Step 5: Get Firebase Configuration

1. **Add Web App**
   - Click gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click "</>" (Web) icon

2. **Register App**
   - Enter app nickname: "AI Study Assistant Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - You'll see a `firebaseConfig` object
   - Copy these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123" // Optional
};
```

4. **Update Your Code**
   - Open `src/config/firebase.js`
   - Replace the placeholder values with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
    measurementId: "G-ABC123"
};
```

---

## Part 2: OpenAI API Setup

### Step 1: Create OpenAI Account

1. **Sign Up**
   - Visit: https://platform.openai.com/signup
   - Sign up with email or Google account
   - Verify your email

2. **Add Payment Method**
   - Go to: https://platform.openai.com/account/billing
   - Click "Add payment method"
   - Enter credit card details
   - Set usage limits (recommended: $10-20/month for testing)

### Step 2: Get API Key

1. **Create API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Enter name: "AI Study Assistant"
   - Click "Create secret key"

2. **Copy API Key**
   - **IMPORTANT**: Copy the key immediately (you won't see it again!)
   - Format: `sk-proj-...` or `sk-...`
   - Store it securely

3. **Update Your Code**
   - Open `src/config/api.js`
   - Replace the placeholder:

```javascript
export const API_KEYS = {
    OPENAI: 'sk-proj-YOUR_ACTUAL_API_KEY_HERE',
    // ...
};
```

### Step 3: Set Usage Limits (Recommended)

1. **Set Monthly Budget**
   - Go to: https://platform.openai.com/account/billing/limits
   - Set "Hard limit": $20 (or your preference)
   - Set "Soft limit": $15
   - This prevents unexpected charges

2. **Monitor Usage**
   - Check usage at: https://platform.openai.com/usage
   - Review costs regularly

---

## Part 3: OCR API Setup (Optional)

For image text extraction, you can use OCR.space (free tier available):

### Step 1: Get OCR API Key

1. **Sign Up**
   - Visit: https://ocr.space/ocrapi
   - Click "Register for free API key"
   - Enter email address
   - Check your email for API key

2. **Update Your Code**
   - Open `src/config/api.js`
   - Add your OCR API key:

```javascript
export const API_KEYS = {
    OPENAI: 'sk-proj-...',
    OCR_SPACE: 'YOUR_OCR_API_KEY_HERE',
};
```

**Note**: Free tier allows 25,000 requests/month. For production, consider upgrading or using Google Cloud Vision API.

---

## Part 4: Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding API keys.

### Option A: Using .env File (Local Development)

1. **Create .env File**
   - Create `.env` file in project root
   - Add your keys:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123

VITE_OPENAI_API_KEY=sk-proj-...
VITE_OCR_API_KEY=your-ocr-key
```

2. **Add to .gitignore**
   - Open `.gitignore`
   - Add line: `.env`
   - This prevents committing secrets

3. **Your Config Files Already Support This!**
   - `src/config/firebase.js` and `src/config/api.js` already check for environment variables
   - They fall back to hardcoded values if env vars aren't found

### Option B: Using Firebase Hosting Environment Config

If deploying to Firebase Hosting:

```bash
firebase functions:config:set openai.key="sk-proj-..."
firebase functions:config:set ocr.key="your-ocr-key"
```

---

## Part 5: Testing Your Setup

### Test Firebase Connection

1. **Open Browser Console**
   - Open your app in browser
   - Press F12 → Console tab

2. **Check for Success Messages**
   ```
   ✅ Firebase initialized successfully
   ```

3. **Test Authentication**
   - Try registering a new user
   - Check Firebase Console → Authentication → Users
   - You should see the new user

4. **Test File Upload**
   - Upload a PDF or image
   - Check Firebase Console → Storage
   - You should see the file

5. **Test Database**
   - Check Firebase Console → Firestore Database
   - You should see a `notes` collection with your uploaded file metadata

### Test OpenAI Integration

1. **Upload a File**
   - Upload a PDF with text content

2. **Generate Summary**
   - Click on the uploaded note
   - Click "Generate Summary"
   - Wait 5-10 seconds

3. **Check Console**
   - Look for success message:
   ```
   ✅ Summary generated successfully
   ```

4. **If You See Errors**
   - Check API key is correct
   - Check you have credits in OpenAI account
   - Check browser console for detailed error messages

### Test Text Extraction

1. **Upload PDF**
   - Upload a PDF with text
   - Check console for:
   ```
   📄 PDF loaded: X pages
   ✅ Extracted X characters from PDF
   ```

2. **Upload Image**
   - Upload an image with text
   - Check console for:
   ```
   🔍 Sending image to OCR API...
   ✅ Extracted X characters from image
   ```

---

## Part 6: Deployment

### Option A: Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory: `.` (current directory)
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

5. **Access Your App**
   - URL: `https://your-project-id.web.app`
   - Or custom domain (configure in Firebase Console)

### Option B: Netlify

1. **Create netlify.toml**
   ```toml
   [build]
     publish = "."
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Push code to GitHub
   - Connect repository to Netlify
   - Add environment variables in Netlify dashboard
   - Deploy

### Option C: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all VITE_* variables

---

## Part 7: Security Best Practices

### 1. Never Commit API Keys
```bash
# Add to .gitignore
.env
.env.local
.env.production
src/config/firebase.js  # If you hardcoded keys
src/config/api.js       # If you hardcoded keys
```

### 2. Use Environment Variables
- Always use environment variables in production
- Never hardcode API keys in source code

### 3. Set Firebase Security Rules
- Already covered in Part 1
- Review rules regularly

### 4. Monitor API Usage
- Check OpenAI usage daily: https://platform.openai.com/usage
- Set up billing alerts

### 5. Rate Limiting
- Consider implementing rate limiting for AI features
- Prevent abuse and unexpected costs

---

## Part 8: Cost Estimation

### Firebase Costs (Free Tier)
- **Authentication**: 50,000 verifications/month (free)
- **Firestore**: 50,000 reads, 20,000 writes/day (free)
- **Storage**: 5GB storage, 1GB/day downloads (free)
- **Hosting**: 10GB storage, 360MB/day bandwidth (free)

**Typical Usage**: Free tier is sufficient for 100-500 users

### OpenAI Costs (Pay-as-you-go)
- **GPT-3.5-Turbo**: ~$0.002 per 1K tokens
- **Average Summary**: ~500 tokens = $0.001
- **Average Quiz**: ~1000 tokens = $0.002
- **Average Flashcards**: ~800 tokens = $0.0016

**Typical Usage**: 
- 100 summaries/day = $3/month
- 100 quizzes/day = $6/month
- 100 flashcards/day = $4.80/month
- **Total**: ~$15-20/month for moderate usage

### OCR.space Costs
- **Free Tier**: 25,000 requests/month
- **Paid Tier**: $60/month for 100,000 requests

---

## Part 9: Troubleshooting

### Firebase Issues

**Error: "Firebase not initialized"**
- Check firebaseConfig values are correct
- Check Firebase SDK is loaded (view page source)
- Check browser console for detailed errors

**Error: "Permission denied"**
- Check Firestore security rules
- Check user is authenticated
- Check userId matches in rules

**Error: "Storage upload failed"**
- Check Storage security rules
- Check file size < 10MB
- Check file type is PDF or image

### OpenAI Issues

**Error: "Invalid API key"**
- Check API key is correct (starts with `sk-`)
- Check no extra spaces or quotes
- Generate new key if needed

**Error: "Insufficient credits"**
- Add payment method to OpenAI account
- Check billing page for balance

**Error: "Rate limit exceeded"**
- Wait a few minutes
- Implement rate limiting in your app
- Upgrade OpenAI plan if needed

### Text Extraction Issues

**PDF extraction fails**
- Check PDF is not encrypted
- Check PDF contains actual text (not scanned images)
- Check PDF.js library is loaded

**Image OCR fails**
- Check OCR API key is correct
- Check image is clear and readable
- Check image contains text
- Try different image format

---

## Part 10: Next Steps

### After Setup
1. ✅ Test all features thoroughly
2. ✅ Create test user accounts
3. ✅ Upload sample files
4. ✅ Generate AI content
5. ✅ Monitor costs for first week

### Enhancements
- [ ] Add user profile page
- [ ] Add progress tracking
- [ ] Add study statistics
- [ ] Add collaboration features
- [ ] Add mobile app
- [ ] Add dark mode

### Monitoring
- [ ] Set up Firebase Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API costs daily
- [ ] Review user feedback

---

## 📞 Support Resources

### Firebase
- Documentation: https://firebase.google.com/docs
- Support: https://firebase.google.com/support
- Community: https://stackoverflow.com/questions/tagged/firebase

### OpenAI
- Documentation: https://platform.openai.com/docs
- API Reference: https://platform.openai.com/docs/api-reference
- Community: https://community.openai.com/

### PDF.js
- Documentation: https://mozilla.github.io/pdf.js/
- GitHub: https://github.com/mozilla/pdf.js

---

## ✅ Setup Checklist

Use this checklist to track your progress:

### Firebase Setup
- [ ] Created Firebase project
- [ ] Enabled Authentication (Email/Password)
- [ ] Created Firestore database
- [ ] Set Firestore security rules
- [ ] Set up Firebase Storage
- [ ] Set Storage security rules
- [ ] Got Firebase configuration
- [ ] Updated firebase.js with config

### OpenAI Setup
- [ ] Created OpenAI account
- [ ] Added payment method
- [ ] Set usage limits
- [ ] Got API key
- [ ] Updated api.js with key
- [ ] Tested API connection

### OCR Setup (Optional)
- [ ] Got OCR.space API key
- [ ] Updated api.js with key
- [ ] Tested OCR functionality

### Testing
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested file upload
- [ ] Tested PDF text extraction
- [ ] Tested image OCR
- [ ] Tested AI summary generation
- [ ] Tested AI quiz generation
- [ ] Tested AI flashcard generation

### Deployment
- [ ] Chose hosting platform
- [ ] Set up environment variables
- [ ] Deployed application
- [ ] Tested production deployment
- [ ] Set up custom domain (optional)

### Security
- [ ] Added .env to .gitignore
- [ ] Removed hardcoded API keys
- [ ] Set Firebase security rules
- [ ] Set up billing alerts
- [ ] Implemented rate limiting (optional)

---

**Congratulations! Your AI Study Assistant is now production-ready! 🎉**

*Last Updated: May 2, 2026*
