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

// Serve static files (JS, CSS, images) but not HTML files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve JavaScript files specifically
app.get('/product-api.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-api.js'));
});

app.get('/gemini-carbon-analyzer.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'gemini-carbon-analyzer.js'));
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
