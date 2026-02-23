# Deploy DMP-TMS to Netlify via CLI (no GitHub required)
# Run from project root: .\scripts\deploy-netlify.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "DMP-TMS Netlify Deploy" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Increase npm timeout for slow/unreliable networks
Write-Host "Configuring npm for deploy..." -ForegroundColor Gray
npm config set fetch-timeout 120000 2>$null
npm config set fetch-retries 5 2>$null

# Ensure site is linked (fixes MissingBlobsEnvironmentError)
if (-not (Test-Path ".netlify\state.json")) {
    Write-Host "Linking to Netlify site (required for deploy)..." -ForegroundColor Yellow
    npx netlify link
}

# Deploy
Write-Host "Deploying to Netlify..." -ForegroundColor Yellow
Write-Host "(First time: you will be prompted to log in and create/link a site)" -ForegroundColor Gray
Write-Host ""

npx netlify deploy --prod

Write-Host ""
Write-Host "Deploy complete! Check the URL above." -ForegroundColor Green
