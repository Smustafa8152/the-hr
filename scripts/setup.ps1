# Supabase Setup Script
# This script will link your project and push migrations

Write-Host "🚀 Supabase Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check if access token is provided
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "❌ SUPABASE_ACCESS_TOKEN environment variable is not set." -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your access token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate new token'" -ForegroundColor White
    Write-Host "3. Copy the token" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_ACCESS_TOKEN="your_token_here"' -ForegroundColor Green
    Write-Host '  .\scripts\setup.ps1' -ForegroundColor Green
    Write-Host ""
    Write-Host "OR run the commands manually:" -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_ACCESS_TOKEN="your_token_here"' -ForegroundColor Green
    Write-Host '  npx supabase link --project-ref wqfbltrnlwngyohvxjjq' -ForegroundColor Green
    Write-Host '  npx supabase db push' -ForegroundColor Green
    exit 1
}

Write-Host "✅ Access token found" -ForegroundColor Green
Write-Host ""

# Step 1: Link project
Write-Host "📎 Linking project to Supabase..." -ForegroundColor Cyan
npx supabase link --project-ref wqfbltrnlwngyohvxjjq

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Push migrations
Write-Host "📤 Pushing migrations to database..." -ForegroundColor Cyan
npx supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push migrations" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup complete! Your tables have been created." -ForegroundColor Green
Write-Host ""

