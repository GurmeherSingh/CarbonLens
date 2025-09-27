# AI Product Detection Setup Guide

This guide will help you set up real AI-powered product detection for the CarbonLens app.

## Overview

The app now supports two detection methods:
1. **Google Cloud Vision API** (Recommended) - Real AI detection
2. **Enhanced Fallback Detection** - Smart fallback when API is not available

## Setting up Google Cloud Vision API

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### Step 2: Enable Vision API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Vision API"
3. Click on it and press "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Vision API for security

### Step 4: Configure the App

1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your API key:
   ```
   GOOGLE_CLOUD_VISION_API_KEY=your_actual_api_key_here
   ```

3. Restart the app to load the new configuration

## How It Works

### With API Key (Recommended)
- Uses Google Cloud Vision API for real AI detection
- Analyzes images to detect objects, labels, and text
- Matches detected content to products in the database
- Provides high accuracy detection

### Without API Key (Fallback)
- Uses enhanced fallback detection
- Analyzes image characteristics (colors, shapes, textures)
- Matches products based on visual patterns
- Still provides reasonable detection accuracy

## Detection Process

1. **Image Capture**: User takes photo or selects from gallery
2. **Image Analysis**: 
   - With API: Google Cloud Vision analyzes the image
   - Without API: Local image characteristic analysis
3. **Product Matching**: Matches detected features to products in database
4. **Result Display**: Shows detected product with environmental impact

## Supported Products

The app can detect these product categories:
- 🍌 Fruits (Bananas, etc.)
- 🥛 Dairy Alternatives (Milk, etc.)
- 🥩 Meat Products (Beef, etc.)
- 🍅 Vegetables (Tomatoes, etc.)
- 🌾 Grains (Quinoa, etc.)
- 🍼 Beverages (Water bottles, etc.)

## Troubleshooting

### API Not Working
- Check if API key is correctly set in `.env` file
- Verify the API key has Vision API permissions
- Check if billing is enabled on your Google Cloud project
- The app will automatically fall back to enhanced detection

### Poor Detection Accuracy
- Ensure good lighting when taking photos
- Point camera directly at the product
- Try different angles if detection fails
- Use the gallery option to select clearer images

### Camera Issues
- Grant camera permissions when prompted
- Ensure the app has camera access in device settings
- Try the gallery option as an alternative

## Cost Considerations

- Google Cloud Vision API charges per request
- First 1,000 requests per month are free
- After that, it's approximately $1.50 per 1,000 requests
- The fallback detection is completely free

## Development vs Production

### Development
- Uses fallback detection by default
- No API costs
- Good for testing and development

### Production
- Set up Google Cloud Vision API
- Higher detection accuracy
- Real AI-powered product recognition

## Testing the Detection

1. **Test with API**: Set up the API key and test with real products
2. **Test without API**: Remove the API key and test fallback detection
3. **Test different products**: Try various food items to see detection accuracy
4. **Test in different conditions**: Try different lighting and angles

## Next Steps

1. Set up your Google Cloud Vision API key
2. Test the detection with various products
3. Monitor detection accuracy and adjust as needed
4. Consider adding more products to the database for better matching

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your API key configuration
3. Test with the fallback detection first
4. Ensure camera permissions are granted

The app is designed to work with or without the API, so you can start testing immediately!
