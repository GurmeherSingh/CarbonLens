@echo off
echo 🌱 Setting up EcoLens - AR-Powered Sustainable Shopping Assistant
echo ==================================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file
echo 🔧 Creating environment configuration...
(
echo # Google Cloud Vision API
echo GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
echo.
echo # Firebase Configuration
echo FIREBASE_API_KEY=your_firebase_api_key_here
echo FIREBASE_PROJECT_ID=your_firebase_project_id_here
echo FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
echo FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
echo FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
echo FIREBASE_APP_ID=your_app_id_here
echo.
echo # ViroReact Configuration
echo VIRO_API_KEY=your_viro_api_key_here
) > .env

echo ✅ Setup complete!
echo.
echo 🚀 Next steps:
echo 1. Get a Google Cloud Vision API key from https://console.cloud.google.com/
echo 2. Set up Firebase project at https://console.firebase.google.com/
echo 3. Get ViroReact API key from https://viromedia.com/
echo 4. Update the .env file with your API keys
echo 5. Run 'npm start' to start the development server
echo 6. Run 'npx react-native run-android' to build the Android app
echo.
echo 🌱 Happy sustainable shopping with EcoLens!
pause
