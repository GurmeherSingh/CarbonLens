# EcoLens Setup Verification Script
# Run this script to check if everything is set up correctly

Write-Host "🌱 EcoLens Setup Verification" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
}

# Check npm
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
}

# Check React Native CLI
Write-Host "⚛️ Checking React Native CLI..." -ForegroundColor Yellow
try {
    $rnVersion = npx react-native --version
    Write-Host "✅ React Native CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ React Native CLI not found. Run: npm install -g react-native-cli" -ForegroundColor Red
}

# Check Android SDK
Write-Host "📱 Checking Android SDK..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
    
    # Check if SDK exists
    if (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe") {
        Write-Host "✅ Android SDK platform-tools found" -ForegroundColor Green
    } else {
        Write-Host "❌ Android SDK platform-tools not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ ANDROID_HOME not set. Please set environment variable." -ForegroundColor Red
}

# Check adb
Write-Host "🔧 Checking ADB..." -ForegroundColor Yellow
try {
    $adbVersion = & "$env:ANDROID_HOME\platform-tools\adb.exe" version
    Write-Host "✅ ADB working" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not working. Check Android SDK installation." -ForegroundColor Red
}

# Check connected devices
Write-Host "📱 Checking connected devices..." -ForegroundColor Yellow
try {
    $devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices
    if ($devices -match "device$") {
        Write-Host "✅ Android device/emulator connected" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No Android devices connected. Start emulator or connect device." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check devices. ADB not working." -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. If any ❌ errors above, follow DETAILED_ANDROID_SETUP.md" -ForegroundColor White
Write-Host "2. If all ✅, run: npm start" -ForegroundColor White
Write-Host "3. Then run: npx react-native run-android" -ForegroundColor White
Write-Host ""
Write-Host "🌱 EcoLens will then run on your Android device!" -ForegroundColor Green
