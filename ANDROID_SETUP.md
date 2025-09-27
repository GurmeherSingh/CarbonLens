# Android Studio Setup Guide for EcoLens

## 🚀 **STEP 1: Download Android Studio**

1. **Go to:** https://developer.android.com/studio
2. **Download Android Studio** (latest version)
3. **Run the installer** and follow the setup wizard

## 🔧 **STEP 2: Configure Android Studio**

### **During Installation:**
- ✅ **Select "Standard" installation**
- ✅ **Install Android SDK**
- ✅ **Install Android SDK Platform-Tools**
- ✅ **Install Android SDK Build-Tools**

### **After Installation:**
1. **Open Android Studio**
2. **Go to:** File → Settings → Appearance & Behavior → System Settings → Android SDK
3. **Install these SDK Platforms:**
   - ✅ **Android 14 (API 34)** - Latest
   - ✅ **Android 13 (API 33)** - Recommended
   - ✅ **Android 12 (API 31)** - Minimum

4. **Install these SDK Tools:**
   - ✅ **Android SDK Build-Tools**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android SDK Tools**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)**

## 📱 **STEP 3: Set up Android Emulator**

1. **Open Android Studio**
2. **Go to:** Tools → AVD Manager
3. **Click "Create Virtual Device"**
4. **Select:** Pixel 6 Pro (or similar)
5. **Choose:** Android 13 (API 33) or Android 14 (API 34)
6. **Click "Finish"**

## 🔑 **STEP 4: Set Environment Variables**

### **Add to System Environment Variables:**
```
ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

### **Add to PATH:**
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

## ✅ **STEP 5: Verify Installation**

Run these commands in PowerShell:
```powershell
# Check Android SDK
& "$env:ANDROID_HOME\platform-tools\adb" version

# Check React Native
npx react-native doctor
```

## 🚀 **STEP 6: Test with EcoLens**

After setup, run:
```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npx react-native run-android
```

## 📱 **Alternative: Use Physical Device**

If you have an Android phone:
1. **Enable Developer Options** (Settings → About Phone → Tap Build Number 7 times)
2. **Enable USB Debugging** (Settings → Developer Options → USB Debugging)
3. **Connect via USB** and allow debugging
4. **Run:** `npx react-native run-android`

---

## 🎯 **Quick Start Commands**

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (in separate terminal)
npx react-native run-android

# Run on iOS (Mac only)
npx react-native run-ios
```

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **"SDK location not found"** → Set ANDROID_HOME environment variable
2. **"Build failed"** → Run `npx react-native doctor` to check setup
3. **"Metro bundler not found"** → Run `npm start` first
4. **"Device not found"** → Check USB debugging and device connection

### **Useful Commands:**
```bash
# Check React Native setup
npx react-native doctor

# Clean and rebuild
npx react-native run-android --reset-cache

# Check connected devices
adb devices
```

---

**🎉 Once Android Studio is set up, EcoLens will run on your Android device/emulator!**
