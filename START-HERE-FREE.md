# 🆓 START HERE - Free Setup

## Get Your AI Study Assistant Running for FREE in 30 Minutes!

---

## 🎯 What You'll Get

✅ **100% Free** - No credit card needed  
✅ **AI-Powered** - Summaries, quizzes, flashcards  
✅ **Cloud Storage** - Access from anywhere  
✅ **Text Extraction** - From PDFs and images  
✅ **User Authentication** - Secure login  
✅ **Unlimited Usage** - Within free tier limits  

**Total Cost: $0/month forever!**

---

## 📚 Documentation Files

Choose your path:

### 🚀 Quick Start (Recommended)
**File**: `FREE-TIER-SETUP.md`  
**Time**: 20-30 minutes  
**Best for**: Everyone  
**What it covers**: Complete setup with explanations

### 📸 Visual Guide
**File**: `STEP-BY-STEP-CONFIG.md`  
**Time**: 30-40 minutes  
**Best for**: First-time users  
**What it covers**: Detailed steps with screen descriptions

### ⚡ Super Quick
**File**: This file (below)  
**Time**: 15 minutes  
**Best for**: Experienced developers  
**What it covers**: Just the essentials

---

## ⚡ Super Quick Setup

### Step 1: Firebase (10 minutes)

1. **Create project**: https://console.firebase.google.com/
   - Click "Add project"
   - Name: `ai-study-assistant`
   - Create

2. **Enable services**:
   - Authentication → Email/Password → Enable
   - Firestore → Create database → Test mode
   - Storage → Get started

3. **Get config**:
   - Settings ⚙️ → Project settings
   - Add web app `</>`
   - Copy firebaseConfig

4. **Update code**:
   - Open `src/config/firebase.js`
   - Paste your config values
   - Save

### Step 2: Free AI (5 minutes)

1. **Hugging Face**: https://huggingface.co/join
   - Sign up (free)
   - Settings → Tokens → New token
   - Copy token (starts with `hf_`)

2. **Update code**:
   - Open `src/config/api.js`
   - Find `HUGGINGFACE: 'YOUR_HUGGINGFACE_TOKEN_HERE'`
   - Replace with your token
   - Save

### Step 3: OCR (Optional - 3 minutes)

1. **OCR.space**: https://ocr.space/ocrapi
   - Enter email
   - Get API key from email

2. **Update code**:
   - Open `src/config/api.js`
   - Find `OCR_SPACE: 'YOUR_OCR_API_KEY_HERE'`
   - Replace with your key
   - Save

### Step 4: Test (2 minutes)

1. **Open app**: Right-click `index.html` → Open with Live Server
2. **Register**: Create account
3. **Upload**: Upload a PDF
4. **Generate**: Click "Generate Summary"

✅ **Done!**

---

## 🔧 Configuration Files

You need to update 2 files:

### File 1: `src/config/firebase.js`

Replace this:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

With YOUR values from Firebase Console.

### File 2: `src/config/api.js`

Replace this:
```javascript
export const API_KEYS = {
    OPENAI: 'YOUR_OPENAI_API_KEY_HERE',
    OCR_SPACE: 'YOUR_OCR_API_KEY_HERE',
    HUGGINGFACE: 'YOUR_HUGGINGFACE_TOKEN_HERE',
};
```

With YOUR actual keys.

---

## 🆓 Free Tier Limits

### Firebase (Free Forever)
- **Users**: 50,000/month
- **Database**: 50,000 reads/day, 20,000 writes/day
- **Storage**: 5GB total, 1GB/day downloads
- **Good for**: 100-500 active users

### Hugging Face (Free Forever)
- **API Calls**: Unlimited (with rate limiting)
- **Rate**: ~30 requests/minute
- **Good for**: Personal use, small apps

### OCR.space (Free Tier)
- **Requests**: 25,000/month
- **Good for**: 800+ images/day

---

## ✅ Quick Checklist

- [ ] Created Firebase project
- [ ] Enabled Authentication
- [ ] Created Firestore database
- [ ] Enabled Storage
- [ ] Got Firebase config
- [ ] Updated `src/config/firebase.js`
- [ ] Created Hugging Face account
- [ ] Got Hugging Face token
- [ ] Updated `src/config/api.js`
- [ ] Got OCR.space API key (optional)
- [ ] Tested app works

---

## 🐛 Quick Troubleshooting

### "Firebase not initialized"
→ Check `src/config/firebase.js` has your actual values

### "Permission denied"
→ Publish security rules in Firebase Console

### "AI is slow"
→ Normal for free tier (first request: 15-20 seconds)

### "Upload failed"
→ Check file < 10MB and is PDF or image

---

## 📖 Need More Help?

### Detailed Guides:
1. **`FREE-TIER-SETUP.md`** - Complete guide with explanations
2. **`STEP-BY-STEP-CONFIG.md`** - Visual guide with screen descriptions

### Support:
- Firebase: https://firebase.google.com/docs
- Hugging Face: https://huggingface.co/docs

---

## 🎉 What's Next?

After setup:
1. Test all features
2. Upload your study materials
3. Generate AI content
4. Share with friends!

**Enjoy your FREE AI Study Assistant! 🎓✨**

---

*Setup time: 15-30 minutes*
*Cost: $0/month forever*
*No credit card required*
