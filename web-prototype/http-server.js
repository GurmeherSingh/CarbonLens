const express = require('express');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

// Try to load .env from the current directory first, then fall back to parent
const envPath = path.join(__dirname, '.env');
const parentEnvPath = path.join(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath }) || dotenv.config({ path: parentEnvPath });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
} else {
    console.log('✅ Successfully loaded .env file');
    console.log('🔑 Gemini API Key status:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
}

const app = express();
const PORT = 3000; // Using port 3000 for HTTP

// Add middleware for parsing JSON bodies
app.use(express.json());

// Serve static files (JS, CSS, images) but not HTML files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve plant.json file specifically
app.get('/plant.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'plant.json'));
});

// Serve JavaScript files specifically
app.get('/product-api.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-api.js'));
});

app.get('/gemini-carbon-analyzer.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'gemini-carbon-analyzer.js'));
});

// Shopping list analysis endpoint
app.post('/api/shopping/analyze', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            throw new Error('Invalid items data');
        }

        // Calculate aggregate environmental impact
        const totalCarbonFootprint = items.length * 1.5; // Simplified calculation
        const totalWaterUsage = items.length * 100;
        const treesRequired = totalCarbonFootprint * 0.5;
        const milesEquivalent = totalCarbonFootprint * 2.5;

        res.json({
            success: true,
            summary: {
                items: items.length,
                totalCarbonFootprint,
                totalWaterUsage,
                treesRequired,
                milesEquivalent
            },
            recommendations: [
                'Consider buying in bulk to reduce packaging waste',
                'Look for products with eco-friendly certifications',
                'Choose items with minimal packaging'
            ]
        });
    } catch (error) {
        console.error('Shopping list analysis failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to get API keys
app.get('/api/config', (req, res) => {
    console.log('Environment variables:', {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NODE_ENV: process.env.NODE_ENV
    });
    
    res.json({
        googleVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY || 'Not loaded'
    });
});

// Serve the AI-powered version as main
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-powered-version.html'));
});

// Serve the React Native Web version at /app
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'react-native-web.html'));
});

// Serve the barcode scanner at /barcode (HTTP optimized version)
app.get('/barcode', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-scanner-http.html'));
});

// Serve the shopping mode version at /shopping
app.get('/shopping', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-carbon-scanner.html'));
});

// API endpoint for handling shopping list data
app.post('/api/shopping/analyze', express.json(), (req, res) => {
    const { items } = req.body;
    console.log('Analyzing shopping list:', items);
    // Process the items and return aggregate analysis
    res.json({
        success: true,
        items: items.length,
        analysis: {
            totalCarbonFootprint: 0,
            totalWaterUsage: 0,
            recommendations: []
        }
    });
});

// Serve the HTTPS camera version at /camera
app.get('/camera', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-carbon-scanner.html'));
});

// Serve the API test suite at /test
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-test.html'));
});

// Serve the connection test at /debug
app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-connection.html'));
});

// Create HTTP server (no SSL certificates needed)
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🌐 CarbonLens HTTP Server running at http://localhost:${PORT}`);
    console.log(`📱 For iPhone: http://YOUR_IP:${PORT}`);
    console.log(`🔑 API Key loaded from .env file`);
    console.log(`📷 Note: Camera access may be limited on HTTP (HTTPS recommended for production)`);
    console.log(`🚀 No SSL certificate issues - should work immediately!`);
});
