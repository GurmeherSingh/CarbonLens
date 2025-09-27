#!/bin/bash

echo "🌱 Setting up EcoLens - AR-Powered Sustainable Shopping Assistant"
echo "=================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null; then
    echo "📦 Installing React Native CLI..."
    npm install -g react-native-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# iOS setup (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios && pod install && cd ..
fi

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env << EOF
# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=your_app_id_here

# ViroReact Configuration
VIRO_API_KEY=your_viro_api_key_here
EOF

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Get a Google Cloud Vision API key from https://console.cloud.google.com/"
echo "2. Set up Firebase project at https://console.firebase.google.com/"
echo "3. Get ViroReact API key from https://viromedia.com/"
echo "4. Update the .env file with your API keys"
echo "5. Run 'npm start' to start the development server"
echo "6. Run 'npx react-native run-android' or 'npx react-native run-ios' to build the app"
echo ""
echo "🌱 Happy sustainable shopping with EcoLens!"
