# Vercel Deployment Checklist - Follow This Exactly

## ✅ Pre-Deployment Checks

### 1. Verify Local Build Works
```bash
# Clean and rebuild
rm -rf dist
npm run build

# Check output
ls dist/
ls dist/pages/

# You should see:
# dist/index.html ✓
# dist/pages/auth.html ✓
# dist/pages/dashboard.html ✓
# dist/pages/library.html ✓
# dist/pages/study.html ✓
# dist/pages/upload.html ✓
```

### 2. Test Local Preview
```bash
npm run preview
```
- Open http://localhost:4173
- Click through all pages
- Everything should work

### 3. Commit All Changes
```bash
git status
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## 🚀 Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Import Project
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import" next to `AI-study-assistant`
4. **DO NOT CHANGE ANY SETTINGS YET**
5. Click "Deploy"

#### Step 2: Wait for First Build
- Watch the build logs
- Should take 1-2 minutes
- **If build fails**: Copy error message and share with me

#### Step 3: Check Deployment
After build completes:
1. Click "Visit" button
2. **Test these URLs**:
   - `https://your-project.vercel.app/` → Should show landing page
   - `https://your-project.vercel.app/pages/auth.html` → Should show login

#### Step 4: Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add these one by one:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://gtyzqrhfdqizmykdrwws.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | (from .env file) | Production, Preview, Development |
| `VITE_HUGGINGFACE_TOKEN` | (from .env file) | Production, Preview, Development |

3. After adding all variables, go to Deployments
4. Click "..." on latest deployment
5. Click "Redeploy"

#### Step 5: Update Supabase
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add these URLs:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs:
     - `https://your-project.vercel.app/pages/dashboard.html`
     - `https://your-project.vercel.app/public/dashboard.html`
     - `https://*.vercel.app/**`

#### Step 6: Final Test
Test all features:
- [ ] Landing page loads
- [ ] Login with email works
- [ ] Google OAuth works
- [ ] File upload works
- [ ] All pages accessible

---

### Method 2: Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? ai-study-assistant
# - Directory? ./
# - Override settings? No
```

---

## 🔍 Troubleshooting

### If You Get 404 Error

#### Check 1: Verify Build Succeeded
1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Look for "Building" section
4. Should say "Build Completed"
5. Should show: `✓ dist/index.html` and other files

#### Check 2: Verify Files Are Deployed
1. In deployment view, click "Source" tab
2. Navigate to `dist/` folder
3. Check if `index.html` and `pages/` folder exist
4. If missing → Build failed

#### Check 3: Check Project Settings
1. Settings → General
2. Verify:
   - Framework Preset: **Vite** or **Other**
   - Build Command: **`npm run build`**
   - Output Directory: **`dist`**
   - Install Command: **`npm install`**

#### Check 4: Clear Cache and Redeploy
1. Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Cache"
4. Go to Deployments
5. Click "..." → "Redeploy"

### If Build Fails

#### Error: "Cannot find module"
```bash
# Locally:
rm -rf node_modules
npm install
npm run build

# Then push:
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

#### Error: "Command failed"
- Check build logs for specific error
- Usually means a file is missing or import is broken

### If Environment Variables Don't Work

1. Make sure variable names start with `VITE_`
2. Make sure you selected all environments (Production, Preview, Development)
3. Must redeploy after adding variables
4. Check spelling - they're case-sensitive

---

## 📊 Expected Results

### Successful Build Output
```
✓ dist/index.html                    16.72 kB
✓ dist/pages/auth.html              17.28 kB
✓ dist/pages/dashboard.html         15.00 kB
✓ dist/pages/library.html           14.82 kB
✓ dist/pages/study.html             11.85 kB
✓ dist/pages/upload.html            12.42 kB
✓ dist/assets/*.js                  (multiple files)
✓ dist/assets/*.css                 (multiple files)
```

### Successful Deployment
- Build time: 1-2 minutes
- Status: "Ready"
- URL: `https://your-project.vercel.app`
- All pages accessible

---

## 🆘 Still Having Issues?

### Share This Information:

1. **Vercel project URL**: `https://your-project.vercel.app`
2. **Which URL gives 404?**: (root, /pages/auth.html, etc.)
3. **Build logs**: Copy from Vercel dashboard
4. **Does local preview work?**: Yes/No
5. **Screenshot of error**: If possible

### Quick Diagnostic:

```bash
# Run these and share output:
npm run build
ls dist/
ls dist/pages/
git status
```

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] `https://your-project.vercel.app/` shows landing page
- [ ] `https://your-project.vercel.app/pages/auth.html` shows login
- [ ] Can navigate to all pages
- [ ] Login works (after adding env variables)
- [ ] No 404 errors

---

## 🎯 Most Common Mistake

**Forgetting to add environment variables!**

After first deployment:
1. Add environment variables
2. **MUST REDEPLOY** for them to take effect
3. Don't just refresh the page - actually redeploy

Without environment variables, Supabase won't work, but pages should still load.
