# 🔑 API Keys Setup Guide for EcoLens

## 🚀 **STEP 1: Google Cloud Vision API**

### **Get Your API Key:**
1. **Go to:** https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable the Vision API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"
4. **Create credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

### **Add to EcoLens:**
```bash
# Copy the example file
copy env.example .env

# Edit .env file and add your key
GOOGLE_CLOUD_VISION_API_KEY=your_actual_api_key_here
```

---

## 🔥 **STEP 2: Firebase Setup**

### **Create Firebase Project:**
1. **Go to:** https://console.firebase.google.com/
2. **Click "Add project"**
3. **Enter project name:** "EcoLens"
4. **Enable Google Analytics** (optional)
5. **Click "Create project"**

### **Add Android App:**
1. **Click "Add app"** → **Android**
2. **Package name:** `com.ecolens`
3. **App nickname:** "EcoLens"
4. **Download google-services.json**
5. **Place it in:** `android/app/google-services.json`

### **Get Configuration:**
1. **Go to Project Settings** → **General**
2. **Copy the config values:**
   - API Key
   - Project ID
   - Auth Domain
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### **Add to EcoLens:**
```bash
# Edit .env file
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

## 🎯 **STEP 3: ViroReact Setup**

### **Get ViroReact API Key:**
1. **Go to:** https://viromedia.com/
2. **Sign up for free account**
3. **Go to Dashboard** → **API Keys**
4. **Create new API key**
5. **Copy the key**

### **Add to EcoLens:**
```bash
# Edit .env file
VIRO_API_KEY=your_viro_api_key_here
```

---

## 🔧 **STEP 4: Configure React Native**

### **Install react-native-dotenv:**
```bash
npm install react-native-dotenv
```

### **Update babel.config.js:**
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true
      }
    ]
  ],
};
```

### **Create config file:**
```javascript
// src/config/Config.js
import { GOOGLE_CLOUD_VISION_API_KEY, FIREBASE_API_KEY, VIRO_API_KEY } from '@env';

export const Config = {
  GOOGLE_CLOUD_VISION_API_KEY,
  FIREBASE_API_KEY,
  VIRO_API_KEY,
  FIREBASE_CONFIG: {
    apiKey: FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  }
};
```

---

## ✅ **STEP 5: Test Configuration**

### **Check if APIs are working:**
```bash
# Start Metro bundler
npm start

# In another terminal, test the app
npx react-native run-android
```

### **Verify in app:**
1. **Open EcoLens app**
2. **Go to AR Scanner**
3. **Check if camera opens**
4. **Test product detection**

---

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **"API key not found"** → Check .env file and restart Metro
2. **"Firebase not initialized"** → Check google-services.json placement
3. **"Camera permission denied"** → Check Android permissions
4. **"ViroReact not working"** → Check ViroReact API key

### **Useful Commands:**
```bash
# Clean and rebuild
npx react-native run-android --reset-cache

# Check environment variables
npx react-native config

# Test API connectivity
curl -H "Authorization: Bearer YOUR_API_KEY" https://vision.googleapis.com/v1/images:annotate
```

---

## 🎉 **You're Ready!**

Once all API keys are configured:
- ✅ **Google Cloud Vision** → Product recognition
- ✅ **Firebase** → Data storage and user management
- ✅ **ViroReact** → AR features and 3D visualization

**🚀 EcoLens will have full functionality with real AI-powered product recognition and AR features!**
