# 🚀 COMPLETE ANDROID SETUP FOR ECOLENS

## 📱 **STEP 1: Download Android Studio**

### **1.1 Go to Official Website**
- **URL:** https://developer.android.com/studio
- **Click:** "Download Android Studio"

### **1.2 Download the Installer**
- **File:** `android-studio-2023.3.1.18-windows.exe` (or latest)
- **Size:** ~1GB
- **Save to:** Downloads folder

---

## 🔧 **STEP 2: Install Android Studio**

### **2.1 Run the Installer**
1. **Double-click** the downloaded `.exe` file
2. **Click "Next"** through the setup wizard
3. **IMPORTANT:** Check these boxes:
   - ✅ **Android SDK**
   - ✅ **Android SDK Platform**
   - ✅ **Android Virtual Device**
   - ✅ **Performance (Intel HAXM)**

### **2.2 Choose Installation Path**
- **Default:** `C:\Program Files\Android\Android Studio`
- **Click "Next"** and **"Install"**

### **2.3 Wait for Installation**
- **Time:** 10-15 minutes
- **Don't close** the installer window

---

## ⚙️ **STEP 3: Configure Android Studio**

### **3.1 First Launch**
1. **Click "Finish"** when installation completes
2. **Android Studio** will open automatically
3. **Choose:** "Do not import settings" (if first time)
4. **Click "OK"**

### **3.2 Setup Wizard**
1. **Click "Next"** through the welcome screens
2. **Choose:** "Standard" installation type
3. **Accept** all license agreements
4. **Click "Finish"**

### **3.3 Wait for SDK Download**
- **Time:** 5-10 minutes
- **Downloads:** Android SDK, build tools, platform tools
- **Don't close** Android Studio

---

## 📱 **STEP 4: Set Up Android Emulator**

### **4.1 Open AVD Manager**
1. **In Android Studio:** Tools → AVD Manager
2. **Click:** "Create Virtual Device"

### **4.2 Choose Device**
1. **Select:** "Pixel 6 Pro" (or similar)
2. **Click "Next"**

### **4.3 Choose System Image**
1. **Select:** "Android 13 (API 33)" or "Android 14 (API 34)"
2. **Click "Download"** if not already downloaded
3. **Wait** for download to complete
4. **Click "Next"**

### **4.4 Configure AVD**
1. **Name:** "EcoLens_Emulator"
2. **Click "Finish"**

---

## 🔑 **STEP 5: Set Environment Variables**

### **5.1 Open System Properties**
1. **Press:** `Windows + R`
2. **Type:** `sysdm.cpl`
3. **Press Enter**

### **5.2 Add Environment Variables**
1. **Click:** "Environment Variables" button
2. **Under "System Variables":**
   - **Click "New"**
   - **Variable name:** `ANDROID_HOME`
   - **Variable value:** `C:\Users\%USERNAME%\AppData\Local\Android\Sdk`
   - **Click "OK"**

3. **Edit PATH variable:**
   - **Find "Path"** in System Variables
   - **Click "Edit"**
   - **Click "New"** and add:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

### **5.3 Apply Changes**
1. **Click "OK"** on all dialogs
2. **Restart** Command Prompt/PowerShell

---

## ✅ **STEP 6: Verify Installation**

### **6.1 Test Android SDK**
```powershell
# Open new PowerShell window
adb version
```

**Expected output:**
```
Android Debug Bridge version 1.0.41
```

### **6.2 Test React Native**
```powershell
# In your EcoLens project folder
npx react-native doctor
```

**Should show:**
```
✓ Android Studio
✓ Android SDK
✓ ANDROID_HOME
```

---

## 🚀 **STEP 7: Run EcoLens**

### **7.1 Start Metro Bundler**
```powershell
# In EcoLens project folder
npm start
```

### **7.2 Start Android Emulator**
1. **Open Android Studio**
2. **Tools → AVD Manager**
3. **Click ▶️** next to your emulator
4. **Wait** for emulator to boot (2-3 minutes)

### **7.3 Run EcoLens**
```powershell
# In new terminal window
npx react-native run-android
```

---

## 🎯 **ALTERNATIVE: Use Physical Android Device**

### **If you have an Android phone:**

#### **8.1 Enable Developer Options**
1. **Settings → About Phone**
2. **Tap "Build Number"** 7 times
3. **Go back to Settings**

#### **8.2 Enable USB Debugging**
1. **Settings → Developer Options**
2. **Enable "USB Debugging"**
3. **Connect phone via USB**

#### **8.3 Run EcoLens**
```powershell
npx react-native run-android
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **"ANDROID_HOME not set"**
- **Solution:** Restart PowerShell and try again
- **Check:** Environment variables in System Properties

#### **"No devices found"**
- **Solution:** Start Android emulator first
- **Or:** Connect Android device with USB debugging

#### **"Gradle build failed"**
- **Solution:** Run `npx react-native run-android --reset-cache`

#### **"Metro bundler not found"**
- **Solution:** Run `npm start` in separate terminal

---

## 🎉 **SUCCESS CHECKLIST**

When everything is working, you should see:
- ✅ **Android Studio** installed and configured
- ✅ **Android SDK** downloaded and set up
- ✅ **Emulator** running (or device connected)
- ✅ **Environment variables** set correctly
- ✅ **EcoLens app** running on Android

---

## 📱 **WHAT YOU'LL SEE**

Once setup is complete:
1. **EcoLens app** will install on your Android device/emulator
2. **Home screen** with sustainability score
3. **AR Scanner** with camera simulation
4. **Product detection** with environmental impact
5. **Supply chain** visualization
6. **User profile** with analytics

**🚀 EcoLens will be running as a real mobile app!**
