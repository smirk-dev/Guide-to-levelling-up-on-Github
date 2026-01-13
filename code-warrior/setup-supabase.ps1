# Supabase CLI Setup Script for Windows
# Run with: powershell -ExecutionPolicy Bypass -File setup-supabase.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Code Warrior - Supabase Setup  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "[1/5] Checking Supabase CLI installation..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase CLI already installed" -ForegroundColor Green
}

Write-Host ""

# Login to Supabase
Write-Host "[2/5] Logging in to Supabase..." -ForegroundColor Yellow
Write-Host "This will open a browser window. Please authorize the CLI." -ForegroundColor Gray
Start-Sleep -Seconds 2
supabase login

Write-Host ""

# Get project ref
Write-Host "[3/5] Linking to your Supabase project..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your Supabase Project Reference ID:" -ForegroundColor Cyan
Write-Host "(Find it at: Supabase Dashboard → Settings → General → Reference ID)" -ForegroundColor Gray
$projectRef = Read-Host "Project Ref"

if ($projectRef -eq "") {
    Write-Host "❌ No project ref provided. Exiting." -ForegroundColor Red
    exit 1
}

# Save to .env
Write-Host ""
Write-Host "Saving project ref to .env file..." -ForegroundColor Gray
"PROJECT_REF=$projectRef" | Out-File -FilePath ".env" -Encoding UTF8

# Link to project
Write-Host ""
Write-Host "Linking to project $projectRef..." -ForegroundColor Gray
supabase link --project-ref $projectRef

Write-Host ""

# Create supabase directory if it doesn't exist
if (-not (Test-Path "supabase")) {
    Write-Host "[4/5] Initializing Supabase directory..." -ForegroundColor Yellow
    supabase init
    Write-Host "✅ Supabase directory created!" -ForegroundColor Green
} else {
    Write-Host "[4/5] Supabase directory already exists" -ForegroundColor Yellow
}

Write-Host ""

# Create migration for github_stats
Write-Host "[5/5] Creating migration for github_stats column..." -ForegroundColor Yellow

# Check if migrations folder exists
if (-not (Test-Path "supabase/migrations")) {
    New-Item -ItemType Directory -Path "supabase/migrations" -Force | Out-Null
}

# Get current timestamp
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = "supabase/migrations/${timestamp}_add_github_stats.sql"

# Create migration file
$migrationContent = @"
-- Migration: Add github_stats column to users table
-- Date: $(Get-Date -Format "yyyy-MM-dd")
-- Purpose: Store GitHub metrics for RPG stat calculations

-- Add github_stats column if it doesn't exist
DO `$`$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'github_stats'
  ) THEN
    ALTER TABLE users ADD COLUMN github_stats JSONB DEFAULT '{}'::jsonb;
  END IF;
END `$`$;

-- Add comment
COMMENT ON COLUMN users.github_stats IS 'Stores GitHub metrics (stars, repos, commits, prs, issues, reviews) for RPG stat calculation';
"@

$migrationContent | Out-File -FilePath $migrationFile -Encoding UTF8
Write-Host "✅ Created migration: $migrationFile" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "        Setup Complete! 🎉        " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push migration to your database:" -ForegroundColor White
Write-Host "   npm run db:push" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Generate TypeScript types:" -ForegroundColor White
Write-Host "   npm run db:types" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start development:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more info, see QUICKSTART.md or SUPABASE_SETUP.md" -ForegroundColor Gray
Write-Host ""
