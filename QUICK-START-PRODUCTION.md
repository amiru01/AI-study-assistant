# ⚡ Quick Start - Production Setup

## Get Your AI Study Assistant Live in 30 Minutes!

Follow these steps to go from development to production.

---

## 🎯 Prerequisites

- [ ] Google account
- [ ] OpenAI account with payment method
- [ ] Credit card (for OpenAI - pay-as-you-go)
- [ ] 30 minutes of time

---

## Step 1: Firebase Setup (10 minutes)

### 1.1 Create Project
```
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: "ai-study-assistant"
4. Click "Create project"
```

### 1.2 Enable Services
```
Authentication:
1. Click "Authentication" → "Get started"
2. Enable "Email/Password"

Firestore:
1. Click "Firestore Database" → "Create database"
2. Start in "production mode"
3. Choose closest region

Storage:
1. Click "Storage" → "Get started"
2. Use default rules
```

### 1.3 Get Config
```
1. Click ⚙️ → "Project settings"
2. Scroll to "Your apps"
3. Click "</>" (Web icon)
4. Copy firebaseConfig object
```

### 1.4 Update Code
Open `src/config/firebase.js` and replace:
```javascript
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
    messagingSenderId: "PASTE_YOUR_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};
```

---

## Step 2: OpenAI Setup (5 minutes)

### 2.1 Get API Key
```
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name: "AI Study Assistant"
4. Copy the key (starts with sk-proj- or sk-)
```

### 2.2 Add Payment
```
1. Go to: https://platform.openai.com/account/billing
2. Add payment method
3. Set usage limit: $20/month
```

### 2.3 Update Code
Open `src/config/api.js` and replace:
```javascript
export const API_KEYS = {
    OPENAI: 'PASTE_YOUR_OPENAI_KEY_HERE',
    OCR_SPACE: 'YOUR_OCR_API_KEY_HERE', // Optional
};
```

---

## Step 3: Security Rules (5 minutes)

### 3.1 Firestore Rules
```
1. Firebase Console → Firestore Database → Rules
2. Paste this code:
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /generatedContent/{contentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

```
3. Click "Publish"
```

### 3.2 Storage Rules
```
1. Firebase Console → Storage → Rules
2. Paste this code:
```

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{userId}/{fileName} {
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024;
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

```
3. Click "Publish"
```

---

## Step 4: Test (5 minutes)

### 4.1 Open Your App
```
Open index.html in browser (use Live Server)
```

### 4.2 Test Authentication
```
1. Click "Get Started"
2. Register with real email
3. Check Firebase Console → Authentication
4. You should see your user
```

### 4.3 Test Upload
```
1. Upload a PDF file
2. Check Firebase Console → Storage
3. You should see the file
4. Check Firestore → notes collection
5. You should see note document
```

### 4.4 Test AI Features
```
1. Click on uploaded note
2. Click "Generate Summary"
3. Wait 5-10 seconds
4. You should see real AI-generated summary
5. Try Quiz and Flashcards too
```

---

## Step 5: Deploy (5 minutes)

### Option A: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# Choose: existing project
# Public directory: . (current)
# Single-page app: Yes
# Don't overwrite index.html

# Deploy
firebase deploy --only hosting

# Your app is live at:
# https://your-project-id.web.app
```

### Option B: Netlify (No CLI needed)

```
1. Push code to GitHub
2. Go to: https://app.netlify.com/
3. Click "Add new site" → "Import from Git"
4. Connect GitHub repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: .
6. Click "Deploy site"
7. Your app is live!
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Firebase Console shows your project
- [ ] Authentication has at least 1 user
- [ ] Storage has uploaded files
- [ ] Firestore has notes collection
- [ ] OpenAI API key is working
- [ ] Summary generates real content (not mock)
- [ ] Quiz generates real questions
- [ ] Flashcards generate real content
- [ ] App is deployed and accessible via URL

---

## 🐛 Quick Troubleshooting

### "Firebase not initialized"
→ Check firebaseConfig in `src/config/firebase.js`
→ Make sure all values are filled in

### "Invalid API key" (OpenAI)
→ Check API key in `src/config/api.js`
→ Make sure it starts with `sk-`
→ Generate new key if needed

### "Permission denied" (Firebase)
→ Check security rules are published
→ Make sure user is logged in
→ Check userId matches in rules

### "Text extraction failed"
→ PDF.js library loaded? (check page source)
→ PDF has actual text? (not scanned image)
→ Try different PDF file

### AI generates mock content
→ Check OpenAI API key is correct
→ Check you have credits in OpenAI account
→ Check browser console for errors

---

## 💰 Cost Estimate

### First Month (Testing)
- Firebase: $0 (free tier)
- OpenAI: $5-10 (light testing)
- **Total: $5-10**

### Regular Usage (100 active users)
- Firebase: $0 (still within free tier)
- OpenAI: $15-20 (moderate usage)
- **Total: $15-20/month**

### Set Usage Limits
```
1. OpenAI Dashboard → Billing → Usage limits
2. Set hard limit: $20/month
3. Set soft limit: $15/month
4. This prevents unexpected charges
```

---

## 📊 Monitor Your App

### Daily Checks (First Week)
```
1. OpenAI Usage: https://platform.openai.com/usage
2. Firebase Usage: Console → Usage tab
3. Check costs are within budget
```

### Weekly Checks
```
1. Review error logs
2. Check user feedback
3. Monitor performance
4. Optimize if needed
```

---

## 🎯 What's Next?

### After Going Live:
1. Share with friends for testing
2. Gather feedback
3. Monitor costs for 1 week
4. Optimize based on usage

### Future Enhancements:
- Add user profiles
- Add progress tracking
- Add study statistics
- Add collaboration
- Add mobile app

---

## 📞 Need Help?

### Documentation:
- **Full Setup Guide**: `PRODUCTION-SETUP-GUIDE.md`
- **Feature Docs**: `AI-FEATURES-COMPLETE.md`
- **Testing Guide**: `QUICK-TEST-GUIDE.md`

### Support:
- Firebase: https://firebase.google.com/support
- OpenAI: https://help.openai.com/
- PDF.js: https://github.com/mozilla/pdf.js

---

## 🎉 You're Done!

Your AI Study Assistant is now:
- ✅ Fully configured
- ✅ Production-ready
- ✅ Deployed and live
- ✅ Ready for users

**Congratulations! 🚀**

---

*Time to complete: ~30 minutes*
*Difficulty: Beginner-friendly*
*Cost: $15-20/month*

**Start transforming education with AI today! 🎓✨**
