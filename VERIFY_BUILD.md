# Verify Your Build Before Deploying

## Quick Check

Run these commands to verify everything is ready:

```bash
# 1. Clean build
rm -rf dist node_modules/.vite
npm run build

# 2. Check build output
ls dist/
ls dist/pages/
ls dist/public/
ls dist/assets/

# 3. Preview locally
npm run preview
```

## Expected Build Output

You should see these files in `dist/`:

```
dist/
├── index.html                    ✓ Landing page
├── pages/
│   ├── auth.html                ✓ Login page
│   ├── dashboard.html           ✓ Dashboard
│   ├── library.html             ✓ Library
│   ├── study.html               ✓ Study page
│   └── upload.html              ✓ Upload page
├── public/
│   ├── auth-refactored.html     ✓ Alt auth page
│   ├── dashboard.html           ✓ Alt dashboard
│   ├── library.html             ✓ Alt library
│   ├── study.html               ✓ Alt study
│   └── upload.html              ✓ Alt upload
└── assets/
    ├── *.js                     ✓ JavaScript bundles
    ├── *.css                    ✓ Stylesheets
    └── pdf.worker.min-*.js      ✓ PDF worker
```

## Test Locally

After running `npm run preview`, test these URLs:

- http://localhost:4173/ → Should show landing page
- http://localhost:4173/pages/auth.html → Should show login
- http://localhost:4173/pages/dashboard.html → Should redirect to auth (not logged in)
- http://localhost:4173/pages/library.html → Should work
- http://localhost:4173/pages/study.html → Should work
- http://localhost:4173/pages/upload.html → Should work

## Checklist Before Deploy

- [ ] Build completes without errors
- [ ] All HTML files are in `dist/` folder
- [ ] Preview works locally
- [ ] Environment variables are ready (see `.env.vercel`)
- [ ] Git is up to date (`git status`)
- [ ] Committed all changes (`git add . && git commit`)

## If Build Fails

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Error: "ENOENT: no such file or directory"
Check that these files exist:
- `index.html`
- `pages/auth.html`
- `pages/dashboard.html`
- `pages/library.html`
- `pages/study.html`
- `pages/upload.html`

### Error: Script errors
Check that all imports in your JS files are correct:
```bash
# Search for broken imports
grep -r "from ['\"]" src/
```

## Deploy When Ready

Once everything checks out:

```bash
# Push to GitHub
git push origin main

# Or deploy with CLI
vercel --prod
```

## After Deploy

Test the same URLs on Vercel:
- `https://your-project.vercel.app/`
- `https://your-project.vercel.app/pages/auth.html`
- etc.

If any URL gives 404, check:
1. Build logs in Vercel dashboard
2. That the file exists in `dist/` folder
3. Environment variables are set
4. Vercel cache is cleared
