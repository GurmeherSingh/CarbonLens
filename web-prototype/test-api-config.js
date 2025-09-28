#!/usr/bin/env node

/**
 * Test API Configuration
 * Verifies that all API keys are properly loaded and accessible
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('🔍 Testing API Configuration...\n');

// Test .env file loading
const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env')
];

console.log('📁 Checking for .env files:');
envPaths.forEach(envPath => {
    const exists = fs.existsSync(envPath);
    console.log(`   ${exists ? '✅' : '❌'} ${envPath}`);
    
    if (exists) {
        console.log(`   📋 Loading from: ${envPath}`);
        const result = dotenv.config({ path: envPath });
        if (result.error) {
            console.log(`   ❌ Error loading: ${result.error.message}`);
        } else {
            console.log(`   ✅ Loaded successfully`);
        }
    }
});

console.log('\n🔑 API Key Status:');
console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`   GOOGLE_CLOUD_VISION_API_KEY: ${process.env.GOOGLE_CLOUD_VISION_API_KEY ? '✅ Present' : '❌ Missing'}`);

if (process.env.GEMINI_API_KEY) {
    console.log(`   Gemini Key Length: ${process.env.GEMINI_API_KEY.length}`);
    console.log(`   Gemini Key Preview: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
}

if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    console.log(`   Vision Key Length: ${process.env.GOOGLE_CLOUD_VISION_API_KEY.length}`);
    console.log(`   Vision Key Preview: ${process.env.GOOGLE_CLOUD_VISION_API_KEY.substring(0, 10)}...`);
}

console.log('\n🌐 Testing API Configuration Endpoint...');

// Test the API config endpoint
const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
    const config = {
        googleVisionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY
    };
    
    console.log('📡 API Config Response:', {
        googleVisionApiKey: config.googleVisionApiKey ? 'Present' : 'Missing',
        geminiApiKey: config.geminiApiKey ? 'Present' : 'Missing'
    });
    
    res.json(config);
});

const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`🧪 Test server started on port ${port}`);
    
    // Test the endpoint
    const http = require('http');
    http.get(`http://localhost:${port}/api/config`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const config = JSON.parse(data);
                console.log('✅ API Config Endpoint Test Passed');
                console.log('📋 Config Data:', {
                    googleVisionApiKey: config.googleVisionApiKey ? 'Present' : 'Missing',
                    geminiApiKey: config.geminiApiKey ? 'Present' : 'Missing'
                });
            } catch (error) {
                console.log('❌ API Config Endpoint Test Failed:', error.message);
            }
            server.close();
            process.exit(0);
        });
    }).on('error', (error) => {
        console.log('❌ API Config Endpoint Test Failed:', error.message);
        server.close();
        process.exit(1);
    });
});
