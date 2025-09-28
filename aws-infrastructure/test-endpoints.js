/**
 * Test AWS API Endpoints
 * Run this script to test your deployed AWS infrastructure
 */

const https = require('https');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.aws' });

const API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;

if (!API_GATEWAY_URL) {
    console.error('❌ AWS_API_GATEWAY_URL not found in .env.aws');
    console.log('Please run the AWS setup first: npm run aws:setup');
    process.exit(1);
}

console.log('🧪 Testing AWS API Endpoints');
console.log('============================');
console.log(`API Gateway URL: ${API_GATEWAY_URL}`);
console.log('');

// Test functions
async function testProductDetection() {
    console.log('🔍 Testing Product Detection...');
    
    try {
        // Create a simple test image (1x1 pixel PNG in base64)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const response = await makeRequest('POST', '/detect-product', {
            imageData: testImageBase64,
            userId: 'test_user_123'
        });
        
        if (response.success) {
            console.log('✅ Product Detection: SUCCESS');
            console.log(`   Found ${response.products?.length || 0} products`);
        } else {
            console.log('❌ Product Detection: FAILED');
            console.log(`   Error: ${response.error}`);
        }
    } catch (error) {
        console.log('❌ Product Detection: ERROR');
        console.log(`   ${error.message}`);
    }
}

async function testEnvironmentalAnalysis() {
    console.log('🌱 Testing Environmental Analysis...');
    
    try {
        const testProductData = {
            id: 'test_product_123',
            name: 'Test Organic Banana',
            brand: 'Test Brand',
            category: 'Fruits',
            ingredients: 'Organic bananas',
            packaging: 'Compostable',
            origin: 'Ecuador'
        };
        
        const response = await makeRequest('POST', '/analyze-environmental', {
            productId: testProductData.id,
            productData: testProductData,
            userId: 'test_user_123'
        });
        
        if (response.success) {
            console.log('✅ Environmental Analysis: SUCCESS');
            console.log(`   Carbon Footprint: ${response.analysis?.carbonFootprint?.perUnit || 'N/A'} kg CO₂`);
            console.log(`   Sustainability Score: ${response.analysis?.sustainabilityScore || 'N/A'}`);
        } else {
            console.log('❌ Environmental Analysis: FAILED');
            console.log(`   Error: ${response.error}`);
        }
    } catch (error) {
        console.log('❌ Environmental Analysis: ERROR');
        console.log(`   ${error.message}`);
    }
}

async function testUserAnalytics() {
    console.log('📊 Testing User Analytics...');
    
    try {
        const response = await makeRequest('GET', '/user-analytics', {
            userId: 'test_user_123',
            timeframe: 'month'
        });
        
        if (response.success) {
            console.log('✅ User Analytics: SUCCESS');
            console.log(`   Total Scans: ${response.analytics?.totalScans || 0}`);
            console.log(`   Sustainability Score: ${response.analytics?.sustainabilityScore?.overall || 'N/A'}`);
        } else {
            console.log('❌ User Analytics: FAILED');
            console.log(`   Error: ${response.error}`);
        }
    } catch (error) {
        console.log('❌ User Analytics: ERROR');
        console.log(`   ${error.message}`);
    }
}

// Helper function to make HTTP requests
function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_GATEWAY_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(data))
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        
        req.write(JSON.stringify(data));
        req.end();
    });
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting AWS API Tests...');
    console.log('');
    
    await testProductDetection();
    console.log('');
    
    await testEnvironmentalAnalysis();
    console.log('');
    
    await testUserAnalytics();
    console.log('');
    
    console.log('🎉 Testing Complete!');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Copy .env.aws to your project root as .env');
    console.log('2. Update your React Native app to use AWS services');
    console.log('3. Test your mobile app with real images');
    console.log('4. Deploy your app to app stores');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testProductDetection,
    testEnvironmentalAnalysis,
    testUserAnalytics,
    runAllTests
};
