# 🚀 How to Run CarbonLens App

## Quick Start (3 Options)

### Option 1: Android (Recommended)
```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

### Option 2: iOS (macOS only)
```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios
```

### Option 3: Web Development
```bash
# Start the web server
cd web-prototype
node server.js
# Then open http://localhost:3000
```

## 📱 Detailed Setup Instructions

### Step 1: Environment Setup

1. **Copy environment file** (already done):
   ```bash
   copy env.example .env
   ```

2. **Configure API Key** (Optional but recommended):
   - Edit `.env` file
   - Add your Google Cloud Vision API key:
   ```
   GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
   ```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Platform-Specific Setup

#### For Android:
1. **Install Android Studio**
2. **Set up Android SDK**
3. **Enable Developer Options** on your Android device
4. **Enable USB Debugging**
5. **Connect device via USB** or use emulator

#### For iOS (macOS only):
1. **Install Xcode** from App Store
2. **Install iOS Simulator**
3. **Install CocoaPods**: `sudo gem install cocoapods`
4. **Install iOS dependencies**: `cd ios && pod install && cd ..`

### Step 4: Run the App

#### Android:
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run Android
npm run android
```

#### iOS:
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run iOS
npm run ios
```

#### Web (for testing):
```bash
cd web-prototype
node server.js
# Open http://localhost:3000
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Metro bundler issues:
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

#### 2. Android build issues:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

#### 3. iOS build issues:
```bash
# Clean iOS build
cd ios
xcodebuild clean
cd ..
npm run ios
```

#### 4. Dependencies issues:
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

#### 5. Camera permissions:
- **Android**: Grant camera permission in device settings
- **iOS**: Grant camera permission when prompted

## 🎯 Testing the AI Detection

### Without API Key (Works immediately):
1. Open the app
2. Go to AR Scanner
3. Tap camera button
4. Take a photo or select from gallery
5. App will use enhanced fallback detection

### With API Key (Best experience):
1. Get Google Cloud Vision API key
2. Add to `.env` file
3. Restart the app
4. Test with real products
5. Get accurate AI-powered detection

## 📱 App Features to Test

### 1. AR Scanner
- **Camera Capture**: Take photos of products
- **Gallery Selection**: Choose images from gallery
- **Product Detection**: AI-powered product recognition
- **Environmental Impact**: View carbon footprint data

### 2. Product Database
- **6 Product Types**: Bananas, Milk, Beef, Quinoa, Water, Tomatoes
- **Environmental Data**: Carbon footprint, water usage, food miles
- **Supply Chain**: Track product journey from farm to store

### 3. Navigation
- **Home Screen**: Main dashboard
- **AR Scanner**: Camera-based detection
- **Product Details**: Environmental impact analysis
- **Profile**: User settings and history

## 🚨 Important Notes

### Development Mode:
- App works without API key (uses fallback detection)
- Good for testing and development
- No additional costs

### Production Mode:
- Requires Google Cloud Vision API key
- Higher detection accuracy
- Real AI-powered recognition
- Small API costs (first 1,000 requests free)

### Platform Support:
- **Android**: Full support
- **iOS**: Full support (macOS required)
- **Web**: Limited support (camera access required)

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ App launches without errors
2. ✅ Camera permission is granted
3. ✅ AR Scanner opens successfully
4. ✅ Camera capture works
5. ✅ Product detection returns results
6. ✅ Product details show environmental data

## 📞 Need Help?

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure platform-specific setup is complete
4. Test with the web version first
5. Check camera permissions

The app is designed to work with or without the API key, so you can start testing immediately!
