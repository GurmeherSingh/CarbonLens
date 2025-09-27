# Quick Fix for EcoLens Android Setup
# Run this in PowerShell as Administrator

Write-Host "🚀 Quick Fix for EcoLens Android Setup" -ForegroundColor Green

# Set environment variables for current session
$env:ANDROID_HOME = "C:\Users\leo18\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"

Write-Host "✅ Environment variables set for this session" -ForegroundColor Green

# Test adb
Write-Host "🔍 Testing ADB..." -ForegroundColor Yellow
try {
    $adbVersion = & "$env:ANDROID_HOME\platform-tools\adb.exe" version
    Write-Host "✅ ADB working!" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not working. Check Android SDK installation." -ForegroundColor Red
}

# Test React Native
Write-Host "🔍 Testing React Native..." -ForegroundColor Yellow
try {
    npx react-native doctor
} catch {
    Write-Host "❌ React Native doctor failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Now try running EcoLens:" -ForegroundColor Cyan
Write-Host "npx react-native run-android" -ForegroundColor White

