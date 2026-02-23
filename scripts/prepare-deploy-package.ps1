# Creates a deploy-ready zip of the project for Netlify CLI deployment
# Run from project root: .\scripts\prepare-deploy-package.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$deployDir = Join-Path $env:TEMP "netlify-deploy-package-$(Get-Date -Format 'yyyyMMddHHmmss')"
$zipPath = Join-Path $projectRoot "dmp-tms-deploy.zip"

# Exclude these from the package
$exclude = @(
    "node_modules",
    ".next",
    ".git",
    ".env",
    ".env.*",
    "dmp-tms-deploy.zip",
    "dmp-tms-deploy",
    "netlify-deploy-package",
    "*.log",
    ".DS_Store"
)

Write-Host "Preparing deploy package..." -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"

# Remove old zip only (deploy dir is in TEMP, unique per run)
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Create deploy directory
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy files
Get-ChildItem -Path $projectRoot -Force | ForEach-Object {
    $name = $_.Name
    $skip = $false
    foreach ($pattern in $exclude) {
        if ($name -like $pattern -or $name -eq $pattern) { $skip = $true; break }
    }
    if (-not $skip) {
        $dest = Join-Path $deployDir $name
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
        } else {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

# Create zip
Write-Host "Creating zip..." -ForegroundColor Cyan
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

# Cleanup temp folder
Remove-Item $deployDir -Recurse -Force

Write-Host ""
Write-Host "Done! Deploy package created:" -ForegroundColor Green
Write-Host "  $zipPath"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Extract the zip to a NEW empty folder (e.g. C:\DeployDMP)"
Write-Host "  2. Open terminal in that folder (you should see app/, types/, package.json at root)"
Write-Host "  3. Run: npm install"
Write-Host "  4. Run: npx netlify deploy --prod"
Write-Host ""
Write-Host "See NETLIFY_DEPLOY_WITHOUT_GITHUB.md for full instructions."
