const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Serve static files for assets only (not HTML files)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from the web-prototype directory
app.use(express.static(__dirname));

// API endpoint to get API keys
app.get('/api/config', (req, res) => {
    res.json({
        googleVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY
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

// Serve the barcode scanner at /barcode
app.get('/barcode', (req, res) => {
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

// Create HTTPS server with self-signed certificate
const selfsigned = require('selfsigned');
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const options = {
    key: pems.private,
    cert: pems.cert
};

const server = https.createServer(options, app);

server.listen(PORT, () => {
    console.log(`🌐 CarbonLens AI Server running at https://localhost:${PORT}`);
    console.log(`📱 For iPhone: https://YOUR_IP:${PORT}`);
    console.log(`🔑 API Key loaded from .env file`);
    console.log(`📷 Camera access enabled with HTTPS`);
});
