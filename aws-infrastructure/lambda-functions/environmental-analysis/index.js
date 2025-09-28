/**
 * CarbonLens Environmental Analysis Lambda Function
 * Uses Amazon Bedrock (Claude) for AI-powered environmental impact analysis
 */

const AWS = require('aws-sdk');
const bedrock = new AWS.BedrockRuntime();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const ENVIRONMENTAL_DATA_TABLE = process.env.ENVIRONMENTAL_DATA_TABLE;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
    console.log('🌱 Environmental Analysis Lambda triggered');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { productId, productData, userId } = JSON.parse(event.body);
        
        if (!productData) {
            return createResponse(400, { error: 'Product data is required' });
        }
        
        // Step 1: Use Amazon Bedrock for AI-powered environmental analysis
        const aiAnalysis = await performAIAnalysis(productData);
        console.log('🤖 AI analysis completed');
        
        // Step 2: Enhance with additional calculations
        const enhancedAnalysis = enhanceAnalysisWithCalculations(aiAnalysis, productData);
        
        // Step 3: Save analysis to database
        await saveEnvironmentalAnalysis(productId, enhancedAnalysis);
        
        // Step 4: Update product with environmental data
        if (productId) {
            await updateProductEnvironmentalData(productId, enhancedAnalysis);
        }
        
        return createResponse(200, {
            success: true,
            analysis: enhancedAnalysis,
            metadata: {
                timestamp: new Date().toISOString(),
                productId: productId,
                userId: userId,
                analysisMethod: 'Amazon Bedrock (Claude)'
            }
        });
        
    } catch (error) {
        console.error('❌ Environmental analysis error:', error);
        return createResponse(500, { 
            error: 'Environmental analysis failed',
            message: error.message 
        });
    }
};

/**
 * Perform AI-powered environmental analysis using Amazon Bedrock
 */
async function performAIAnalysis(productData) {
    try {
        const prompt = buildAnalysisPrompt(productData);
        
        const params = {
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 4000,
                temperature: 0.3,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        };
        
        console.log('🤖 Calling Amazon Bedrock...');
        const result = await bedrock.invokeModel(params).promise();
        const response = JSON.parse(result.body.toString());
        
        // Parse the AI response
        const analysis = parseAIResponse(response.content[0].text);
        console.log('✅ AI analysis completed');
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Bedrock analysis error:', error);
        // Fallback to rule-based analysis
        return performFallbackAnalysis(productData);
    }
}

/**
 * Build comprehensive analysis prompt for Claude
 */
function buildAnalysisPrompt(productData) {
    return `You are an environmental impact analyst. Analyze this product and provide a comprehensive environmental impact assessment.

Product Information:
- Name: ${productData.name || 'Unknown'}
- Brand: ${productData.brand || 'Unknown'}
- Category: ${productData.category || 'Unknown'}
- Ingredients: ${productData.ingredients || 'Not specified'}
- Packaging: ${productData.packaging || 'Not specified'}
- Origin: ${productData.origin || 'Not specified'}

Please provide a detailed analysis in the following JSON format:

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
    "per1000Units": 0,
    "breakdown": {
      "ingredients": 0,
      "processing": 0,
      "packaging": 0
    }
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
    "Specific alternative product 1 - saves X kg carbon per 1000 units",
    "Specific alternative product 2 - saves X kg carbon per 1000 units",
    "Specific alternative product 3 - saves X kg carbon per 1000 units"
  ],
  "analysis": {
    "keyFindings": "Brief summary of environmental impact",
    "strengths": "Positive environmental aspects",
    "concerns": "Environmental concerns and areas for improvement",
    "certifications": "Relevant environmental certifications to look for"
  },
  "alternatives": [
    "General sustainability tip 1",
    "General sustainability tip 2"
  ]
}

IMPORTANT GUIDELINES:
1. Use realistic values based on actual product categories
2. For beverages: waterInGallons should be 0.3-3 gallons, carbonFootprint 0.1-0.5 kg
3. For food spreads: waterInGallons should be 13-132 gallons, carbonFootprint 1-5 kg
4. For snacks: waterInGallons should be 3-26 gallons, carbonFootprint 0.5-3 kg
5. For dairy: waterInGallons should be 26-264 gallons, carbonFootprint 1-8 kg
6. Provide specific, recognizable brand alternatives
7. Calculate exact environmental equivalents
8. Be realistic and data-driven

Return ONLY the JSON object, no additional text.`;
}

/**
 * Parse AI response and extract analysis
 */
function parseAIResponse(aiText) {
    try {
        // Extract JSON from the response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the analysis
        return validateAndCleanAnalysis(analysis);
        
    } catch (error) {
        console.error('❌ Error parsing AI response:', error);
        throw error;
    }
}

/**
 * Validate and clean the analysis data
 */
function validateAndCleanAnalysis(analysis) {
    // Ensure all required fields exist with default values
    const cleanedAnalysis = {
        carbonFootprint: {
            perUnit: analysis.carbonFootprint?.perUnit || 0,
            per1000Units: analysis.carbonFootprint?.per1000Units || 0,
            breakdown: {
                production: analysis.carbonFootprint?.breakdown?.production || 0,
                transportation: analysis.carbonFootprint?.breakdown?.transportation || 0,
                packaging: analysis.carbonFootprint?.breakdown?.packaging || 0,
                distribution: analysis.carbonFootprint?.breakdown?.distribution || 0
            }
        },
        waterUsage: {
            perUnit: analysis.waterUsage?.perUnit || 0,
            per1000Units: analysis.waterUsage?.per1000Units || 0,
            breakdown: {
                ingredients: analysis.waterUsage?.breakdown?.ingredients || 0,
                processing: analysis.waterUsage?.breakdown?.processing || 0,
                packaging: analysis.waterUsage?.breakdown?.packaging || 0
            }
        },
        environmentalEquivalents: {
            treesAbsorbed: analysis.environmentalEquivalents?.treesAbsorbed || 0,
            treesPer1000Units: analysis.environmentalEquivalents?.treesPer1000Units || 0,
            milesDriven: analysis.environmentalEquivalents?.milesDriven || 0,
            waterInGallons: analysis.environmentalEquivalents?.waterInGallons || 0,
            plasticBottlesEquivalent: analysis.environmentalEquivalents?.plasticBottlesEquivalent || 0
        },
        sustainabilityScore: Math.max(0, Math.min(100, analysis.sustainabilityScore || 50)),
        recommendations: analysis.recommendations || [],
        analysis: {
            keyFindings: analysis.analysis?.keyFindings || 'Environmental impact analysis completed',
            strengths: analysis.analysis?.strengths || 'Standard environmental impact for category',
            concerns: analysis.analysis?.concerns || 'Limited environmental data available',
            certifications: analysis.analysis?.certifications || 'Look for eco-friendly certifications'
        },
        alternatives: analysis.alternatives || []
    };
    
    return cleanedAnalysis;
}

/**
 * Enhance analysis with additional calculations
 */
function enhanceAnalysisWithCalculations(analysis, productData) {
    try {
        // Add calculated environmental equivalents if missing
        if (analysis.environmentalEquivalents.treesAbsorbed === 0) {
            analysis.environmentalEquivalents.treesAbsorbed = 
                Math.round(analysis.carbonFootprint.perUnit * 0.05 * 100) / 100;
        }
        
        if (analysis.environmentalEquivalents.treesPer1000Units === 0) {
            analysis.environmentalEquivalents.treesPer1000Units = 
                analysis.environmentalEquivalents.treesAbsorbed * 1000;
        }
        
        if (analysis.environmentalEquivalents.milesDriven === 0) {
            analysis.environmentalEquivalents.milesDriven = 
                Math.round(analysis.carbonFootprint.perUnit * 2.5 * 100) / 100;
        }
        
        if (analysis.environmentalEquivalents.waterInGallons === 0) {
            analysis.environmentalEquivalents.waterInGallons = 
                Math.round(analysis.waterUsage.perUnit * 0.264172 * 100) / 100;
        }
        
        if (analysis.environmentalEquivalents.plasticBottlesEquivalent === 0) {
            analysis.environmentalEquivalents.plasticBottlesEquivalent = 
                Math.round(analysis.waterUsage.perUnit / 0.5);
        }
        
        // Add metadata
        analysis.metadata = {
            source: 'Amazon Bedrock (Claude)',
            timestamp: new Date().toISOString(),
            productName: productData.name,
            confidence: 'High'
        };
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Error enhancing analysis:', error);
        return analysis; // Return original analysis if enhancement fails
    }
}

/**
 * Perform fallback analysis when AI fails
 */
function performFallbackAnalysis(productData) {
    console.log('⚠️ Using fallback analysis');
    
    const category = productData.category?.toLowerCase() || '';
    const carbonFootprint = estimateCarbonFootprint(category);
    const waterUsage = estimateWaterUsage(category);
    
    return {
        carbonFootprint: {
            perUnit: carbonFootprint,
            per1000Units: carbonFootprint * 1000,
            breakdown: {
                production: carbonFootprint * 0.6,
                transportation: carbonFootprint * 0.2,
                packaging: carbonFootprint * 0.15,
                distribution: carbonFootprint * 0.05
            }
        },
        waterUsage: {
            perUnit: waterUsage,
            per1000Units: waterUsage * 1000,
            breakdown: {
                ingredients: waterUsage * 0.7,
                processing: waterUsage * 0.2,
                packaging: waterUsage * 0.1
            }
        },
        environmentalEquivalents: {
            treesAbsorbed: Math.round(carbonFootprint * 0.05 * 100) / 100,
            treesPer1000Units: Math.round(carbonFootprint * 0.05 * 1000 * 100) / 100,
            milesDriven: Math.round(carbonFootprint * 2.5 * 100) / 100,
            waterInGallons: Math.round(waterUsage * 0.264172 * 100) / 100,
            plasticBottlesEquivalent: Math.round(waterUsage / 0.5)
        },
        sustainabilityScore: calculateSustainabilityScore(productData),
        recommendations: [
            'Look for organic alternatives',
            'Choose products with minimal packaging',
            'Consider local or regional products'
        ],
        analysis: {
            keyFindings: 'Estimated environmental impact based on product category',
            strengths: 'Standard environmental impact for category',
            concerns: 'Limited environmental data available',
            certifications: 'Look for eco-friendly certifications'
        },
        alternatives: [
            'Search for products with eco-friendly certifications',
            'Consider bulk options to reduce packaging'
        ],
        metadata: {
            source: 'Fallback Analysis',
            timestamp: new Date().toISOString(),
            productName: productData.name,
            confidence: 'Medium'
        }
    };
}

/**
 * Estimate carbon footprint based on category
 */
function estimateCarbonFootprint(category) {
    let baseFootprint = 0.5; // Default
    
    if (category.includes('meat')) baseFootprint = 2.5;
    else if (category.includes('dairy')) baseFootprint = 1.8;
    else if (category.includes('processed')) baseFootprint = 1.2;
    else if (category.includes('organic')) baseFootprint = 0.8;
    else if (category.includes('beverage')) baseFootprint = 0.3;
    
    return Math.round(baseFootprint * 100) / 100;
}

/**
 * Estimate water usage based on category
 */
function estimateWaterUsage(category) {
    let baseWater = 50; // Default liters
    
    if (category.includes('meat')) baseWater = 200;
    else if (category.includes('dairy')) baseWater = 100;
    else if (category.includes('beverage')) baseWater = 30;
    else if (category.includes('organic')) baseWater *= 0.9;
    
    return Math.round(baseWater);
}

/**
 * Calculate sustainability score
 */
function calculateSustainabilityScore(productData) {
    let score = 50; // Base score
    
    if (productData.category?.toLowerCase().includes('organic')) score += 20;
    if (productData.ingredients?.toLowerCase().includes('organic')) score += 15;
    if (productData.packaging?.toLowerCase().includes('recyclable')) score += 10;
    if (productData.packaging?.toLowerCase().includes('biodegradable')) score += 15;
    
    return Math.max(0, Math.min(100, score));
}

/**
 * Save environmental analysis to database
 */
async function saveEnvironmentalAnalysis(productId, analysis) {
    try {
        const params = {
            TableName: ENVIRONMENTAL_DATA_TABLE,
            Item: {
                productId: productId || `product_${Date.now()}`,
                dataType: 'environmental_impact',
                data: analysis,
                timestamp: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
            }
        };
        
        await dynamodb.put(params).promise();
        console.log('✅ Environmental analysis saved to database');
        
    } catch (error) {
        console.error('❌ Error saving environmental analysis:', error);
        // Don't throw error - saving is not critical
    }
}

/**
 * Update product with environmental data
 */
async function updateProductEnvironmentalData(productId, analysis) {
    try {
        const params = {
            TableName: PRODUCTS_TABLE,
            Key: { id: productId },
            UpdateExpression: 'SET environmentalData = :envData, updatedAt = :timestamp',
            ExpressionAttributeValues: {
                ':envData': analysis,
                ':timestamp': new Date().toISOString()
            }
        };
        
        await dynamodb.update(params).promise();
        console.log('✅ Product environmental data updated');
        
    } catch (error) {
        console.error('❌ Error updating product environmental data:', error);
        // Don't throw error - update is not critical
    }
}

/**
 * Create standardized API response
 */
function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
