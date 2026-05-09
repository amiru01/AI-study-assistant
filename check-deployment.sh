#!/bin/bash

echo "🔍 Checking Deployment Readiness..."
echo ""

# Check if dist exists
if [ -d "dist" ]; then
    echo "✅ dist/ folder exists"
else
    echo "❌ dist/ folder missing - run 'npm run build'"
    exit 1
fi

# Check if index.html exists
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists"
else
    echo "❌ dist/index.html missing"
    exit 1
fi

# Check if pages folder exists
if [ -d "dist/pages" ]; then
    echo "✅ dist/pages/ folder exists"
    
    # Check individual pages
    pages=("auth.html" "dashboard.html" "library.html" "study.html" "upload.html")
    for page in "${pages[@]}"; do
        if [ -f "dist/pages/$page" ]; then
            echo "  ✅ $page"
        else
            echo "  ❌ $page missing"
        fi
    done
else
    echo "❌ dist/pages/ folder missing"
    exit 1
fi

# Check if assets folder exists
if [ -d "dist/assets" ]; then
    echo "✅ dist/assets/ folder exists"
    asset_count=$(ls -1 dist/assets | wc -l)
    echo "  📦 $asset_count asset files"
else
    echo "❌ dist/assets/ folder missing"
fi

# Check vercel.json
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
else
    echo "⚠️  vercel.json missing (optional)"
fi

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check for build script
    if grep -q '"build"' package.json; then
        echo "  ✅ build script found"
    else
        echo "  ❌ build script missing"
    fi
    
    # Check for vercel-build script
    if grep -q '"vercel-build"' package.json; then
        echo "  ✅ vercel-build script found"
    else
        echo "  ⚠️  vercel-build script missing (optional)"
    fi
else
    echo "❌ package.json missing"
    exit 1
fi

# Check git status
echo ""
echo "📝 Git Status:"
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No uncommitted changes"
else
    echo "⚠️  You have uncommitted changes"
    echo "   Run: git add . && git commit -m 'Deploy to Vercel'"
fi

# Check if on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "✅ On main branch"
else
    echo "⚠️  On branch: $current_branch (should be main/master)"
fi

echo ""
echo "🎯 Deployment Readiness Summary:"
echo "================================"

if [ -f "dist/index.html" ] && [ -d "dist/pages" ] && [ -f "package.json" ]; then
    echo "✅ READY TO DEPLOY!"
    echo ""
    echo "Next steps:"
    echo "1. git add . && git commit -m 'Deploy' && git push origin main"
    echo "2. Go to https://vercel.com/new"
    echo "3. Import your repository"
    echo "4. Click Deploy"
else
    echo "❌ NOT READY - Fix errors above first"
fi
