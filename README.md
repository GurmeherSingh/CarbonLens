# EcoLens: AR-Powered Sustainable Shopping Assistant

An innovative AR mobile app that uses computer vision to identify grocery products and overlay their environmental impact data in real-time.

## 🌟 Features

### Core Functionality
- **Real-time Product Recognition**: Point your phone at products to instantly identify them
- **AR Impact Visualization**: Products glow with color-coded aura based on sustainability
- **Interactive Supply Chain**: Tap products to see animated supply chain journey on world map
- **Environmental Metrics**: Display carbon footprint, water usage, food miles, packaging impact

### AR Capabilities
- **Color-coded Aura System**: Products glow green/yellow/red based on environmental impact
- **Real-time Overlay**: Instant feedback on shopping choices
- **Supply Chain Animation**: Animated journey from farm to shelf
- **Gamification**: Sustainability score and achievements

## 🏗️ Technical Architecture

### Frontend (Mobile App)
- **React Native** with ViroReact for AR capabilities
- Real-time camera feed with object detection overlay
- AR animations and 3D visualizations
- Clean, intuitive UI for product impact display

### Backend & Data
- **Firebase/Supabase** for product database and user data
- Product environmental impact database
- Real-time data synchronization

### AI/Computer Vision
- **Google Cloud Vision API** or custom YOLOv5 model
- Trained on common grocery items
- Real-time object detection and classification

### Data Sources
- Carbon footprint databases
- Supply chain tracking APIs
- Environmental impact metrics

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- ViroReact account for AR capabilities

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ecolens.git
   cd ecolens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup**
   - Open Android Studio
   - Configure Android SDK
   - Set up Android emulator

5. **Run the app**
   ```bash
   # For iOS
   npx react-native run-ios
   
   # For Android
   npx react-native run-android
   ```

## 📱 App Structure

```
src/
├── screens/           # Main app screens
│   ├── HomeScreen.tsx
│   ├── ARScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── SupplyChainScreen.tsx
│   └── ProfileScreen.tsx
├── services/         # API and data services
│   └── ProductService.ts
├── data/            # Product database
│   └── ProductDatabase.ts
└── utils/           # Utility functions
    └── Permissions.ts
```

## 🎯 Key Features Implementation

### AR Product Recognition
- Camera integration with real-time object detection
- Google Cloud Vision API for product identification
- AR overlay with environmental impact data

### Environmental Impact Visualization
- Color-coded sustainability scoring
- Real-time carbon footprint display
- Water usage and food miles tracking
- Packaging impact assessment

### Supply Chain Visualization
- Interactive world map with supply chain routes
- Step-by-step journey animation
- Carbon footprint breakdown by location
- Duration and impact metrics

### Gamification
- Sustainability scoring system
- Achievement badges and levels
- Progress tracking
- Social sharing capabilities

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
FIREBASE_API_KEY=your_firebase_key_here
FIREBASE_PROJECT_ID=your_project_id_here
```

### ViroReact Setup
1. Create a ViroReact account at https://viromedia.com/
2. Get your API key
3. Configure in your app

## 📊 Data Sources

The app uses comprehensive environmental impact data including:

- **Carbon Footprint**: CO₂ emissions per product unit
- **Water Usage**: Water consumption in production
- **Food Miles**: Distance traveled from source to store
- **Packaging Impact**: Environmental impact of packaging materials
- **Supply Chain**: Complete journey from farm to shelf

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Dark/Light Themes**: User preference support
- **Accessibility**: Screen reader support and high contrast
- **Responsive**: Optimized for all screen sizes
- **Smooth Animations**: Fluid transitions and AR effects

## 🚀 Deployment

### Android
1. Generate signed APK
2. Upload to Google Play Store
3. Configure app permissions

### iOS
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ViroReact for AR capabilities
- Google Cloud Vision API for product recognition
- React Native community
- Environmental data providers

## 📞 Support

For support, email support@ecolens.app or join our Discord community.

---

**Make sustainable choices with AR! 🌱📱**
