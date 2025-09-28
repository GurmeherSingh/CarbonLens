#!/usr/bin/env node

/**
 * Quick end-to-end sanity check for the barcode pipeline.
 * Usage: node scripts/test-barcode.js [BARCODE]
 */

const path = require('path');
const util = require('util');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ProductDataAPI = require('../web-prototype/product-api.js');
const GeminiCarbonAnalyzer = require('../web-prototype/gemini-carbon-analyzer.js');

const barcode = process.argv[2] || '012000221545';

async function main() {
    console.log('🧪 CarbonLens barcode pipeline check');
    console.log('📦 Barcode:', barcode);

    const productAPI = new ProductDataAPI();

    try {
        const productData = await productAPI.getProductData(barcode);
        console.log('✅ Product data fetched from Open Food Facts (or fallback)');
        console.log(util.inspect(productData, { depth: 2, colors: true }));

        if (productData.error) {
            console.error('⚠️ Product lookup failed:', productData.error);
            process.exitCode = 1;
            return;
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_GEMINI')) {
            console.warn('⚠️ GEMINI_API_KEY missing or placeholder. Skipping Gemini analysis.');
            return;
        }

        const analyzer = new GeminiCarbonAnalyzer(process.env.GEMINI_API_KEY);
        console.log('🤖 Sending product data to Gemini...');
        const analysis = await analyzer.analyzeCarbonFootprint(productData);
        console.log('✅ Gemini analysis responded successfully');
        console.log(util.inspect(analysis, { depth: 2, colors: true }));
    } catch (error) {
        console.error('❌ Pipeline test failed:', error);
        process.exitCode = 1;
    }
}

main();

