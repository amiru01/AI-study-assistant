# PowerShell script to check deployment readiness

Write-Host "Checking Deployment Readiness..." -ForegroundColor Cyan
Write-Host ""

$ready = $true

# Check if dist exists
if (Test-Path "dist") {
    Write-Host "[OK] dist/ folder exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] dist/ folder missing - run 'npm run build'" -ForegroundColor Red
    $ready = $false
}

# Check if index.html exists
if (Test-Path "dist/index.html") {
    Write-Host "[OK] dist/index.html exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] dist/index.html missing" -ForegroundColor Red
    $ready = $false
}

# Check if pages folder exists
if (Test-Path "dist/pages") {
    Write-Host "[OK] dist/pages/ folder exists" -ForegroundColor Green
    
    # Check individual pages
    $pages = @("auth.html", "dashboard.html", "library.html", "study.html", "upload.html")
    foreach ($page in $pages) {
        if (Test-Path "dist/pages/$page") {
            Write-Host "  [OK] $page" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] $page missing" -ForegroundColor Red
            $ready = $false
        }
    }
} else {
    Write-Host "[ERROR] dist/pages/ folder missing" -ForegroundColor Red
    $ready = $false
}

# Check if assets folder exists
if (Test-Path "dist/assets") {
    Write-Host "[OK] dist/assets/ folder exists" -ForegroundColor Green
    $assetCount = (Get-ChildItem "dist/assets" | Measure-Object).Count
    Write-Host "  Found $assetCount asset files" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] dist/assets/ folder missing" -ForegroundColor Red
}

# Check vercel.json
if (Test-Path "vercel.json") {
    Write-Host "[OK] vercel.json exists" -ForegroundColor Green
} else {
    Write-Host "[WARN] vercel.json missing (optional)" -ForegroundColor Yellow
}

# Check package.json
if (Test-Path "package.json") {
    Write-Host "[OK] package.json exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] package.json missing" -ForegroundColor Red
    $ready = $false
}

Write-Host ""
Write-Host "Deployment Readiness Summary:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

if ($ready) {
    Write-Host "[READY] You can deploy to Vercel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Commit: git add . ; git commit -m 'Deploy' ; git push origin main" -ForegroundColor Gray
    Write-Host "2. Go to https://vercel.com/new" -ForegroundColor Gray
    Write-Host "3. Import your repository" -ForegroundColor Gray
    Write-Host "4. Click Deploy" -ForegroundColor Gray
} else {
    Write-Host "[NOT READY] Fix errors above first" -ForegroundColor Red
}

Write-Host ""
