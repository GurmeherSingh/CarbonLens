@echo off
echo 🚀 CarbonLens Quick Start
echo ========================

echo.
echo 📦 Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo 📁 Setting up environment...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎯 Choose your platform:
echo 1. Android
echo 2. iOS (macOS only)
echo 3. Web
echo 4. Just start Metro bundler
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🤖 Starting Android...
    echo Make sure your Android device is connected or emulator is running
    start "Metro" cmd /k "npm start"
    timeout /t 3
    call npm run android
) else if "%choice%"=="2" (
    echo.
    echo 🍎 Starting iOS...
    echo Make sure Xcode and iOS Simulator are installed
    start "Metro" cmd /k "npm start"
    timeout /t 3
    call npm run ios
) else if "%choice%"=="3" (
    echo.
    echo 🌐 Starting Web version...
    cd web-prototype
    start "Web Server" cmd /k "node server.js"
    echo.
    echo ✅ Web server started at http://localhost:3000
    echo Open your browser and navigate to the URL above
) else if "%choice%"=="4" (
    echo.
    echo 📱 Starting Metro bundler...
    call npm start
) else (
    echo ❌ Invalid choice. Please run the script again.
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. If you chose Android/iOS, the app should launch automatically
echo 2. If you chose Web, open http://localhost:3000 in your browser
echo 3. Test the AR Scanner feature
echo 4. Try capturing products with the camera
echo.
echo 💡 Tip: For best results, add your Google Cloud Vision API key to .env file
echo.
pause
