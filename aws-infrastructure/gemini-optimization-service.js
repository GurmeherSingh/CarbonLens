/**
 * High-Performance Gemini Optimization Service
 * Runs on EC2 with Redis caching, connection pooling, and batch processing
 * Designed to make Gemini queries 3-5x faster
 */

const express = require('express');
const redis = require('redis');
const crypto = require('crypto');
const cluster = require('cluster');
const os = require('os');

// Multi-process setup for better performance
if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`🚀 Starting ${numCPUs} worker processes...`);
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
    
} else {
    startWorker();
}

function startWorker() {
    const app = express();
    const port = process.env.PORT || 3000;
    
    // Redis client with connection pooling
    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                return new Error('Redis server connection refused');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                return new Error('Redis retry time exhausted');
            }
            if (options.attempt > 10) {
                return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
        }
    });
    
    redisClient.on('connect', () => {
        console.log(`✅ Worker ${process.pid}: Connected to Redis`);
    });
    
    redisClient.on('error', (err) => {
        console.error(`❌ Worker ${process.pid}: Redis error:`, err);
    });
    
    // Gemini API setup with connection pooling
    const https = require('https');
    const httpsAgent = new https.Agent({
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000
    });
    
    // Request queue and batch processing
    const requestQueue = [];
    const processingBatches = new Map();
    let batchCounter = 0;
    
    // Middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // CORS middleware
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            worker: process.pid,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            queueLength: requestQueue.length,
            activeBatches: processingBatches.size
        });
    });
    
    // Main Gemini analysis endpoint with optimizations
    app.post('/analyze-carbon', async (req, res) => {
        const startTime = Date.now();
        
        try {
            const { productData, priority = 'normal' } = req.body;
            
            if (!productData) {
                return res.status(400).json({ error: 'Product data is required' });
            }
            
            // Generate cache key
            const prompt = buildAnalysisPrompt(productData);
            const cacheKey = `gemini:${crypto.createHash('md5').update(prompt).digest('hex')}`;
            
            // Check cache first (fastest path)
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    const cachedResult = JSON.parse(cached);
                    console.log(`⚡ Cache hit for ${cacheKey.substring(0, 16)}... (${Date.now() - startTime}ms)`);
                    
                    return res.json({
                        success: true,
                        analysis: cachedResult,
                        cached: true,
                        processingTime: Date.now() - startTime,
                        worker: process.pid
                    });
                }
            } catch (cacheError) {
                console.warn('Cache read error:', cacheError.message);
            }
            
            // Add to processing queue
            const requestPromise = new Promise((resolve, reject) => {
                const request = {
                    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    prompt,
                    cacheKey,
                    priority,
                    startTime,
                    resolve,
                    reject,
                    productData
                };
                
                // Priority queue: high priority requests go first
                if (priority === 'high') {
                    requestQueue.unshift(request);
                } else {
                    requestQueue.push(request);
                }
                
                // Trigger batch processing
                processBatches();
            });
            
            const result = await requestPromise;
            
            res.json({
                success: true,
                analysis: result,
                cached: false,
                processingTime: Date.now() - startTime,
                worker: process.pid
            });
            
        } catch (error) {
            console.error(`❌ Worker ${process.pid}: Analysis error:`, error);
            res.status(500).json({
                error: 'Analysis failed',
                message: error.message,
                worker: process.pid
            });
        }
    });
    
    // Batch processing function (the magic happens here)
    async function processBatches() {
        if (requestQueue.length === 0) return;
        
        // Create batches of requests
        const batchSize = Math.min(5, requestQueue.length); // Process up to 5 at once
        const batch = requestQueue.splice(0, batchSize);
        
        if (batch.length === 0) return;
        
        const batchId = `batch_${++batchCounter}`;
        processingBatches.set(batchId, batch);
        
        console.log(`🔄 Worker ${process.pid}: Processing batch ${batchId} with ${batch.length} requests`);
        
        // Process batch in parallel
        const batchPromises = batch.map(request => processGeminiRequest(request));
        
        try {
            await Promise.allSettled(batchPromises);
        } catch (error) {
            console.error(`❌ Batch ${batchId} processing error:`, error);
        } finally {
            processingBatches.delete(batchId);
            
            // Process next batch if queue has more requests
            if (requestQueue.length > 0) {
                setImmediate(processBatches);
            }
        }
    }
    
    // Process individual Gemini request
    async function processGeminiRequest(request) {
        const { id, prompt, cacheKey, resolve, reject, startTime, productData } = request;
        
        try {
            console.log(`🤖 Processing request ${id}...`);
            
            // Call Gemini API with optimizations
            const analysis = await callGeminiAPI(prompt, productData);
            
            // Cache the result for 1 hour
            try {
                await redisClient.setex(cacheKey, 3600, JSON.stringify(analysis));
                console.log(`💾 Cached result for ${cacheKey.substring(0, 16)}...`);
            } catch (cacheError) {
                console.warn('Cache write error:', cacheError.message);
            }
            
            console.log(`✅ Request ${id} completed (${Date.now() - startTime}ms)`);
            resolve(analysis);
            
        } catch (error) {
            console.error(`❌ Request ${id} failed:`, error);
            
            // Try fallback analysis
            try {
                const fallbackAnalysis = getFallbackAnalysis(productData);
                resolve(fallbackAnalysis);
            } catch (fallbackError) {
                reject(error);
            }
        }
    }
    
    // Optimized Gemini API call
    async function callGeminiAPI(prompt, productData) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable not set');
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };
        
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(requestBody);
            
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                agent: httpsAgent,
                timeout: 30000
            };
            
            const req = https.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode !== 200) {
                            throw new Error(`Gemini API error: ${res.statusCode} ${data}`);
                        }
                        
                        const content = response.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (!content) {
                            throw new Error('No content in Gemini response');
                        }
                        
                        // Parse JSON from response
                        const jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) {
                            throw new Error('No JSON found in Gemini response');
                        }
                        
                        const analysis = JSON.parse(jsonMatch[0]);
                        
                        // Add metadata
                        analysis.metadata = {
                            source: 'Gemini AI (Optimized)',
                            timestamp: new Date().toISOString(),
                            productBarcode: productData.barcode,
                            confidence: 'High',
                            worker: process.pid
                        };
                        
                        resolve(analysis);
                        
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Gemini response: ${parseError.message}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Gemini API request failed: ${error.message}`));
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Gemini API request timeout'));
            });
            
            req.write(postData);
            req.end();
        });
    }
    
    // Build analysis prompt (same as original but optimized)
    function buildAnalysisPrompt(productData) {
        return `Analyze the carbon footprint of this product and provide specific alternative product recommendations with carbon savings. Return ONLY valid JSON:

Product: ${productData.name || 'Unknown'} by ${productData.brand || 'Unknown'}
Category: ${productData.category || 'Unknown'}
Ingredients: ${productData.ingredients || 'Not specified'}

IMPORTANT: For recommendations, provide 3 MAINSTREAM and POPULAR alternative products that users will recognize. Use well-known brands available in major stores (Walmart, Target, grocery stores). Calculate actual carbon savings compared to this product.

Recommendation format requirements:
- Use proper capitalization (not ALL CAPS)
- Include "kg" in carbon savings
- Format: "Brand Name Product - saves X kg carbon per 1000 units"
- Choose products consumers actually know and can find easily

CRITICAL: Use REALISTIC VALUES based on actual product categories. DO NOT HALLUCINATE or use unrealistic numbers.

STRICT REALISTIC RANGES BY PRODUCT TYPE:
- BEVERAGES (soda, juice): carbonFootprint 0.1-0.5 kg CO₂, waterUsage 1-10 liters, waterInGallons 0.3-3 gallons (MAX 3 GALLONS)
- FOOD SPREADS (Nutella, peanut butter): carbonFootprint 1-5 kg CO₂, waterUsage 50-500 liters, waterInGallons 13-132 gallons
- SNACKS (chips, cookies): carbonFootprint 0.5-3 kg CO₂, waterUsage 10-100 liters, waterInGallons 3-26 gallons
- DAIRY PRODUCTS: carbonFootprint 1-8 kg CO₂, waterUsage 100-1000 liters, waterInGallons 26-264 gallons

MANDATORY CONSTRAINTS:
- For BEVERAGES: waterInGallons MUST be between 0.3-3 gallons (convert liters × 0.264)
- For BEVERAGES: treesAbsorbed MUST be between 0.005-0.025 trees
- For BEVERAGES: milesDriven MUST be between 0.25-1.25 miles
- NEVER exceed these ranges or the analysis will be rejected

For environmentalEquivalents, use EXACT CALCULATIONS:
- treesPer1000Units = treesAbsorbed × 1000 (simple multiplication)
- waterInGallons = waterUsage × 0.264172 (liters to gallons conversion)
- milesDriven = carbonFootprint × 2.5 (realistic conversion)
- treesAbsorbed = carbonFootprint × 0.05 (realistic tree absorption rate)

Return this exact JSON structure with REALISTIC estimates within the ranges above:
{
  "carbonFootprint": {
    "perUnit": 0.0,
    "per1000Units": 0.0,
    "breakdown": {
      "production": 0.0,
      "transportation": 0.0,
      "packaging": 0.0,
      "distribution": 0.0
    }
  },
  "waterUsage": {
    "perUnit": 0,
    "per1000Units": 0
  },
  "environmentalEquivalents": {
    "treesAbsorbed": 0,
    "treesPer1000Units": 0,
    "milesDriven": 0,
    "waterInGallons": 0,
    "plasticBottlesEquivalent": 0
  },
  "sustainabilityScore": 0,
  "recommendations": [
    "Brand Name Product - saves X kg carbon per 1000 units",
    "Brand Name Product - saves X kg carbon per 1000 units",
    "Brand Name Product - saves X kg carbon per 1000 units"
  ],
  "analysis": {
    "keyFindings": "Brief summary",
    "strengths": "Positive aspects",
    "concerns": "Environmental concerns"
  }
}`;
    }
    
    // Fallback analysis when Gemini fails
    function getFallbackAnalysis(productData) {
        return {
            carbonFootprint: {
                perUnit: estimateCarbonFootprint(productData),
                per1000Units: estimateCarbonFootprint(productData) * 1000,
                breakdown: {
                    production: estimateCarbonFootprint(productData) * 0.6,
                    transportation: estimateCarbonFootprint(productData) * 0.2,
                    packaging: estimateCarbonFootprint(productData) * 0.15,
                    distribution: estimateCarbonFootprint(productData) * 0.05
                }
            },
            waterUsage: {
                perUnit: estimateWaterUsage(productData),
                per1000Units: estimateWaterUsage(productData) * 1000
            },
            environmentalEquivalents: {
                treesAbsorbed: Math.round(estimateCarbonFootprint(productData) * 0.05 * 100) / 100,
                treesPer1000Units: Math.round(estimateCarbonFootprint(productData) * 0.05 * 1000 * 100) / 100,
                milesDriven: Math.round(estimateCarbonFootprint(productData) * 2.5 * 100) / 100,
                waterInGallons: Math.round(estimateWaterUsage(productData) * 0.264172 * 100) / 100,
                plasticBottlesEquivalent: Math.round(estimateWaterUsage(productData) / 0.5)
            },
            sustainabilityScore: calculateSustainabilityScore(productData),
            recommendations: [
                'Organic Valley Brand - saves 150 kg carbon per 1000 units',
                'Local Store Brand - saves 200 kg carbon per 1000 units',
                'Nature Valley Brand - saves 100 kg carbon per 1000 units'
            ],
            analysis: {
                keyFindings: 'Estimated environmental impact based on product category',
                strengths: 'Product appears to be standard for its category',
                concerns: 'Limited environmental data available'
            },
            metadata: {
                source: 'Fallback Analysis (High-Performance)',
                timestamp: new Date().toISOString(),
                productBarcode: productData.barcode,
                confidence: 'Medium',
                worker: process.pid
            }
        };
    }
    
    // Helper functions
    function estimateCarbonFootprint(productData) {
        const category = productData.category?.toLowerCase() || '';
        let baseFootprint = 0.5;
        
        if (category.includes('meat') || category.includes('dairy')) baseFootprint = 2.5;
        else if (category.includes('processed') || category.includes('snack')) baseFootprint = 1.2;
        else if (category.includes('organic') || category.includes('local')) baseFootprint = 0.8;
        else if (category.includes('beverage')) baseFootprint = 0.3;
        
        return Math.round(baseFootprint * 100) / 100;
    }
    
    function estimateWaterUsage(productData) {
        const category = productData.category?.toLowerCase() || '';
        let baseWater = 50;
        
        if (category.includes('meat')) baseWater = 200;
        else if (category.includes('dairy')) baseWater = 100;
        else if (category.includes('beverage')) baseWater = 30;
        else if (category.includes('organic')) baseWater *= 0.9;
        
        return Math.round(baseWater);
    }
    
    function calculateSustainabilityScore(productData) {
        let score = 50;
        
        if (productData.environmental?.sustainability === 'A') score += 20;
        if (productData.environmental?.sustainability === 'B') score += 15;
        if (productData.ingredients?.includes('organic')) score += 10;
        if (productData.packaging?.includes('recyclable')) score += 5;
        
        if (productData.environmental?.palmOil?.length > 0) score -= 15;
        if (productData.environmental?.deforestation?.length > 0) score -= 20;
        if (productData.ingredients?.includes('artificial')) score -= 5;
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Batch processing endpoint for multiple products
    app.post('/analyze-batch', async (req, res) => {
        try {
            const { products } = req.body;
            
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ error: 'Products array is required' });
            }
            
            if (products.length > 10) {
                return res.status(400).json({ error: 'Maximum 10 products per batch' });
            }
            
            const startTime = Date.now();
            
            // Process all products in parallel
            const analysisPromises = products.map(productData => 
                new Promise(async (resolve) => {
                    try {
                        const analysis = await processGeminiRequest({
                            prompt: buildAnalysisPrompt(productData),
                            productData,
                            startTime: Date.now()
                        });
                        resolve({ success: true, analysis, productData });
                    } catch (error) {
                        resolve({ success: false, error: error.message, productData });
                    }
                })
            );
            
            const results = await Promise.all(analysisPromises);
            
            res.json({
                success: true,
                results,
                totalProcessingTime: Date.now() - startTime,
                worker: process.pid
            });
            
        } catch (error) {
            res.status(500).json({
                error: 'Batch analysis failed',
                message: error.message
            });
        }
    });
    
    // Statistics endpoint
    app.get('/stats', async (req, res) => {
        try {
            const stats = {
                worker: process.pid,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                queueLength: requestQueue.length,
                activeBatches: processingBatches.size,
                cacheStats: await getCacheStats()
            };
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    async function getCacheStats() {
        try {
            const info = await redisClient.info('memory');
            return {
                connected: redisClient.connected,
                memory: info
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // Start the server
    app.listen(port, () => {
        console.log(`🚀 Worker ${process.pid}: High-Performance Gemini Service running on port ${port}`);
        console.log(`📊 Features: Caching, Batching, Connection Pooling, Multi-Process`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log(`🛑 Worker ${process.pid}: Received SIGTERM, shutting down gracefully`);
        redisClient.quit();
        process.exit(0);
    });
}
