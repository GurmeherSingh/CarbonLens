# EcoLens Android Setup Fix Script
# Run this script as Administrator to fix all Android setup issues

Write-Host "🔧 Fixing Android Setup for EcoLens..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script needs to be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Set ANDROID_HOME environment variable
Write-Host "📱 Setting ANDROID_HOME environment variable..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\leo18\AppData\Local\Android\Sdk", "Machine")

# Add Android tools to PATH
Write-Host "🔧 Adding Android tools to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$androidPaths = @(
    "%ANDROID_HOME%\platform-tools",
    "%ANDROID_HOME%\tools",
    "%ANDROID_HOME%\tools\bin"
)

foreach ($path in $androidPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath += ";$path"
        Write-Host "✅ Added: $path" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Already exists: $path" -ForegroundColor Yellow
    }
}

[Environment]::SetEnvironmentVariable("PATH", $currentPath, "Machine")

# Check if Android SDK exists
Write-Host "🔍 Checking Android SDK installation..." -ForegroundColor Yellow
$sdkPath = "C:\Users\leo18\AppData\Local\Android\Sdk"
if (Test-Path $sdkPath) {
    Write-Host "✅ Android SDK folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found at: $sdkPath" -ForegroundColor Red
    Write-Host "Please install Android SDK in Android Studio first!" -ForegroundColor Yellow
}

# Check if adb exists
$adbPath = "$sdkPath\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB found" -ForegroundColor Green
} else {
    Write-Host "❌ ADB not found. Please install Android SDK Platform-Tools" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your computer" -ForegroundColor White
Write-Host "2. Open new PowerShell window" -ForegroundColor White
Write-Host "3. Run: adb devices" -ForegroundColor White
Write-Host "4. Run: npx react-native run-android" -ForegroundColor White
Write-Host ""
Write-Host "🌱 EcoLens will then run on your Android emulator!" -ForegroundColor Green

pause

