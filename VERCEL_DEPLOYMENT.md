# Vercel Deployment Guide for AI Study Assistant

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/)**
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**:
   - Click "Environment Variables"
   - Add these variables:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
     - Add any other API keys from your `.env` file

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Add Environment Variables** (first time only):
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   - Choose "Production" when prompted
   - Paste the values from your `.env` file

## Common Issues & Solutions

### Issue 1: Build Fails with "Cannot find module"
**Solution**: Make sure all dependencies are in `package.json`:
```bash
npm install
npm run build  # Test build locally first
```

### Issue 2: Environment Variables Not Working
**Solution**: 
- Vercel only includes variables prefixed with `VITE_`
- Add them in Vercel Dashboard → Project Settings → Environment Variables
- Redeploy after adding variables

### Issue 3: 404 on Page Refresh
**Solution**: Already handled by `vercel.json` rewrites configuration

### Issue 4: Google OAuth Redirect Issues
**Solution**: Update Supabase redirect URLs:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URLs:
   - `https://your-project.vercel.app/pages/dashboard.html`
   - `https://your-project.vercel.app/public/dashboard.html`
   - `https://*.vercel.app/**` (for preview deployments)

### Issue 5: CORS Errors
**Solution**: 
1. In Supabase Dashboard → Storage → Policies
2. Add your Vercel domain to allowed origins
3. Update CORS settings in your Supabase storage bucket

### Issue 6: Assets Not Loading
**Solution**: Check that paths are relative, not absolute:
- ✅ Good: `./styles.css` or `/styles.css`
- ❌ Bad: `C:/project/styles.css`

## Project Structure for Vercel

```
ai-study-assistant/
├── dist/                  # Build output (auto-generated)
├── pages/                 # HTML pages
├── public/                # Static assets
├── src/                   # Source code
├── index.html            # Landing page
├── vercel.json           # Vercel configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies
```

## Vercel Configuration Explained

The `vercel.json` file configures:
- **buildCommand**: `npm run build` - Builds your Vite app
- **outputDirectory**: `dist` - Where built files are located
- **framework**: `vite` - Tells Vercel to use Vite optimizations
- **rewrites**: Handles routing for multi-page app
- **headers**: Sets cache headers for assets

## Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Any AI API keys (if using)
- [ ] Any other custom environment variables

## Post-Deployment Checklist

After deployment, test these features:

- [ ] Landing page loads correctly
- [ ] Login with email/password works
- [ ] Google OAuth works (check redirect URLs)
- [ ] File upload works
- [ ] PDF text extraction works
- [ ] AI features work (summaries, quizzes, flashcards)
- [ ] All pages are accessible (dashboard, library, study, upload)
- [ ] Mobile responsive design works
- [ ] Images and assets load correctly

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically builds and deploys
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs with your custom domain

## Monitoring & Logs

- **View Logs**: Vercel Dashboard → Your Project → Deployments → Click deployment → View Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Performance**: Vercel Dashboard → Your Project → Speed Insights

## Rollback

If something goes wrong:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Local Testing Before Deploy

Always test locally before deploying:

```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Open http://localhost:4173 to test
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Supabase Docs**: https://supabase.com/docs

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Preview deployment
vercel

# Production deployment
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove project
vercel remove
```
