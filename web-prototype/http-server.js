const express = require('express');
const path = require('path');
const https = require('https'); // Changed from http to https
const selfsigned = require('selfsigned'); // Added for certificate generation
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
const PORT = 3000; // Keeping port 3000 for HTTPS

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

// --- Your App Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-scanner-http.html'));
});
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'react-native-web.html'));
});
app.get('/ai', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-powered-version.html'));
});
app.get('/shopping', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-carbon-scanner.html'));
});
app.get('/camera', (req, res) => {
    res.sendFile(path.join(__dirname, 'barcode-carbon-scanner.html'));
});
app.get('/zxing', (req, res) => {
    res.sendFile(path.join(__dirname, 'zxing-barcode-scanner.html'));
});
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-test.html'));
});
app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-connection.html'));
});


// --- HTTPS Server Setup ---
// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const options = {
    key: pems.private,
    cert: pems.cert
};

// Create HTTPS server
const server = https.createServer(options, app);

server.listen(PORT, () => {
    console.log(`🌐 CarbonLens HTTPS Server running at https://localhost:${PORT}`);
    console.log(`📱 For iPhone: https://YOUR_IP:${PORT}`);
    console.log(`🔑 API Key loaded from .env file`);
    console.log(`📷 Camera access is now enabled via HTTPS.`);
    console.log(`❗️ IMPORTANT: You will see a browser warning. Click 'Advanced' and 'Proceed to localhost' to continue.`);
});
