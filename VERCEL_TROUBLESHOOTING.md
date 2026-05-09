# Vercel Deployment Troubleshooting

## What problems are you experiencing?

### Problem 1: Build Fails on Vercel

**Symptoms**: Build works locally but fails on Vercel

**Solutions**:

1. **Check Node version**:
   - Add to `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Clear Vercel cache**:
   - Go to Vercel Dashboard → Project Settings → General
   - Scroll to "Build & Development Settings"
   - Click "Clear Cache"
   - Redeploy

3. **Check build logs**:
   - Go to Vercel Dashboard → Deployments → Click failed deployment
   - Read the error message carefully
   - Common errors:
     - Missing dependencies → Run `npm install` locally
     - Wrong Node version → Add engines to package.json
     - Environment variables missing → Add in Vercel dashboard

### Problem 2: Pages Return 404

**Symptoms**: Main page works but `/pages/dashboard.html` returns 404

**Solution**: The `vercel.json` file should handle this. If not working:

1. **Check your `vercel.json`** has rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/$1" }
     ]
   }
   ```

2. **Verify build output**:
   ```bash
   npm run build
   ls dist/pages/  # Should show all HTML files
   ```

### Problem 3: Environment Variables Not Working

**Symptoms**: App works locally but API calls fail on Vercel

**Solution**:

1. **Add environment variables in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable:
     - Name: `VITE_SUPABASE_URL`
     - Value: `https://your-project.supabase.co`
     - Environment: Production, Preview, Development (select all)

2. **Redeploy after adding variables**:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

3. **Check variable names**:
   - Must start with `VITE_` for Vite to include them
   - Case-sensitive: `VITE_SUPABASE_URL` not `vite_supabase_url`

### Problem 4: "Module not found" Error

**Symptoms**: Build fails with "Cannot resolve module"

**Solution**:

1. **Install missing dependencies**:
   ```bash
   npm install
   ```

2. **Check import paths**:
   - Use relative paths: `./config/supabase.js`
   - Or use alias: `@/config/supabase.js`

3. **Verify all imports**:
   ```bash
   # Search for broken imports
   grep -r "from ['\"]" src/
   ```

### Problem 5: Large Bundle Size Warning

**Symptoms**: Build succeeds but warns about large chunks

**Solution**: This is just a warning, not an error. Your app will still work.

To optimize (optional):
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-worker': ['pdfjs-dist'],
          'vendor': ['@supabase/supabase-js', 'gsap', 'motion']
        }
      }
    }
  }
});
```

### Problem 6: Google OAuth Redirect Loop

**Symptoms**: Google login redirects but doesn't complete

**Solution**:

1. **Update Supabase redirect URLs**:
   - Go to Supabase Dashboard
   - Authentication → URL Configuration
   - Add these URLs:
     ```
     https://your-project.vercel.app/pages/dashboard.html
     https://your-project.vercel.app/public/dashboard.html
     https://*.vercel.app/**
     ```

2. **Check redirect URL in code**:
   - Open `src/services/supabaseAuthService.js`
   - Verify `loginWithGoogle()` uses correct redirect URL

### Problem 7: Assets Not Loading (CSS/Images)

**Symptoms**: Page loads but no styling or images

**Solution**:

1. **Check asset paths**:
   - Use relative paths: `./styles.css` not `/styles.css`
   - Or use absolute from root: `/styles.css`

2. **Verify public directory**:
   - Assets in `public/` folder are served from root
   - Update `vite.config.js`: `publicDir: 'public'`

3. **Check build output**:
   ```bash
   npm run build
   ls dist/assets/  # Should contain CSS and JS files
   ```

### Problem 8: Deployment Stuck or Very Slow

**Symptoms**: Deployment takes forever or gets stuck

**Solution**:

1. **Cancel and retry**:
   - Go to Vercel Dashboard → Deployments
   - Click "..." → "Cancel Deployment"
   - Click "Redeploy"

2. **Check for large files**:
   ```bash
   # Find large files
   find . -type f -size +10M
   ```
   - Add large files to `.gitignore`

3. **Reduce dependencies**:
   - Remove unused packages from `package.json`

## Step-by-Step Deployment Checklist

Follow these steps in order:

### Step 1: Prepare Your Code
```bash
# 1. Make sure everything is committed
git status

# 2. Test build locally
npm run build

# 3. Test preview locally
npm run preview
# Open http://localhost:4173 and test

# 4. Commit and push
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Dashboard (Recommended)**
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New Project"
4. Select your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables (see below)
7. Click "Deploy"

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | All |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | All |

Then redeploy.

### Step 4: Update Supabase Settings

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add Site URL: `https://your-project.vercel.app`
4. Add Redirect URLs:
   - `https://your-project.vercel.app/pages/dashboard.html`
   - `https://your-project.vercel.app/public/dashboard.html`

### Step 5: Test Your Deployment

Visit your Vercel URL and test:
- [ ] Landing page loads
- [ ] Login works
- [ ] Google OAuth works
- [ ] File upload works
- [ ] All pages accessible

## Still Having Issues?

### Get Build Logs
```bash
# Via CLI
vercel logs

# Or in Dashboard
Deployments → Click deployment → View Function Logs
```

### Common Error Messages

**"Cannot find module 'path'"**
- This is a warning, not an error
- Your app will still work
- Related to mammoth.js library

**"Module externalized for browser compatibility"**
- This is a warning, not an error
- Vite handles this automatically

**"Use of eval is strongly discouraged"**
- This is from pdfjs-dist library
- It's a warning, not an error
- Your app will still work

### Need More Help?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Vercel Support**: https://vercel.com/support
3. **Share your error**: Copy the exact error message from build logs

## Quick Fix Commands

```bash
# Clear local cache and rebuild
rm -rf node_modules dist .vercel
npm install
npm run build

# Force fresh deployment
vercel --prod --force

# Check what will be deployed
vercel --prod --debug
```
