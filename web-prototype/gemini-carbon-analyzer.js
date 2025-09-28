/**
 * Gemini AI Carbon Footprint Analyzer
 * Integrates with Google's Gemini AI for environmental impact analysis
 */

class GeminiCarbonAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.model = 'gemini-2.0-flash-exp';
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    }

    /**
     * Analyze product for carbon footprint using Gemini AI
     * @param {Object} productData - Product information
     * @returns {Promise<Object>} Carbon analysis results
     */
    async analyzeCarbonFootprint(productData) {
        try {
            console.log('🤖 Analyzing carbon footprint with Gemini AI...');
            
            const prompt = this.buildAnalysisPrompt(productData);
            const response = await this.callGeminiAPI(prompt);
            
            return this.parseGeminiResponse(response, productData);
            
        } catch (error) {
            console.error('❌ Gemini analysis failed:', error);
            return this.getFallbackAnalysis(productData);
        }
    }

    /**
     * Build comprehensive analysis prompt for Gemini
     * @param {Object} productData - Product data
     * @returns {string} Analysis prompt
     */
    buildAnalysisPrompt(productData) {
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

Return this exact JSON structure with REALISTIC estimates within the ranges above. Use exactly 3 decimal places for all carbon footprint values:
{
  "carbonFootprint": {
    "perUnit": 0.000,
    "per1000Units": 0,
    "breakdown": {
      "production": 0.000,
      "transportation": 0.000,
      "packaging": 0.000,
      "distribution": 0.000
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

    /**
     * Call Gemini API with the analysis prompt
     * @param {string} prompt - Analysis prompt
     * @returns {Promise<Object>} Gemini API response
     */
    async callGeminiAPI(prompt) {
        // Validate API key
        if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here' || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('Gemini API key not configured. Please add your API key to the .env file.');
        }

        console.log('🤖 Calling Gemini API...');
        
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
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
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API error response:', errorText);
                
                if (response.status === 401) {
                    throw new Error('Gemini API key is invalid or expired. Please check your API key.');
                } else if (response.status === 429) {
                    throw new Error('Gemini API rate limit exceeded. Please try again later.');
                } else if (response.status === 400) {
                    throw new Error('Gemini API request format error. Please contact support.');
                } else {
                    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('✅ Gemini API response received');
            return data;
            
        } catch (networkError) {
            if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
                throw new Error('Network error: Unable to reach Gemini API. Check your internet connection.');
            }
            throw networkError;
        }
    }

    /**
     * Parse Gemini response and extract analysis
     * @param {Object} response - Gemini API response
     * @param {Object} productData - Original product data
     * @returns {Object} Parsed analysis results
     */
    parseGeminiResponse(response, productData) {
        try {
            const content = response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                throw new Error('No content in Gemini response');
            }

            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Gemini response');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Add metadata
            analysis.metadata = {
                source: 'Gemini AI',
                timestamp: new Date().toISOString(),
                productBarcode: productData.barcode,
                confidence: 'High'
            };

            return analysis;

        } catch (error) {
            console.error('❌ Failed to parse Gemini response:', error);
            return this.getFallbackAnalysis(productData);
        }
    }

    /**
     * Get fallback analysis when Gemini fails
     * @param {Object} productData - Product data
     * @returns {Object} Fallback analysis
     */
    getFallbackAnalysis(productData) {
        console.log('⚠️ Using fallback analysis');
        
        return {
            carbonFootprint: {
                perUnit: this.estimateCarbonFootprint(productData),
                per1000Units: this.estimateCarbonFootprint(productData) * 1000,
                breakdown: {
                    production: this.estimateCarbonFootprint(productData) * 0.6,
                    transportation: this.estimateCarbonFootprint(productData) * 0.2,
                    packaging: this.estimateCarbonFootprint(productData) * 0.15,
                    distribution: this.estimateCarbonFootprint(productData) * 0.05
                }
            },
            waterUsage: {
                perUnit: this.estimateWaterUsage(productData),
                per1000Units: this.estimateWaterUsage(productData) * 1000,
                breakdown: {
                    ingredients: this.estimateWaterUsage(productData) * 0.7,
                    processing: this.estimateWaterUsage(productData) * 0.2,
                    packaging: this.estimateWaterUsage(productData) * 0.1
                }
            },
            environmentalEquivalents: {
                treesAbsorbed: Math.round(this.estimateCarbonFootprint(productData) * 0.05 * 1000) / 1000,
                treesPer1000Units: Math.round(this.estimateCarbonFootprint(productData) * 0.05 * 1000 * 1000) / 1000,
                milesDriven: Math.round(this.estimateCarbonFootprint(productData) * 2.5 * 1000) / 1000,
                waterInGallons: Math.round(this.estimateWaterUsage(productData) * 0.264172 * 1000) / 1000,
                plasticBottlesEquivalent: Math.round(this.estimateWaterUsage(productData) / 0.5)
            },
            sustainabilityScore: this.calculateSustainabilityScore(productData),
            recommendations: [
                'Organic Valley Brand - saves 150 kg carbon per 1000 units',
                'Local Store Brand - saves 200 kg carbon per 1000 units',
                'Nature Valley Brand - saves 100 kg carbon per 1000 units'
            ],
            alternatives: [
                'Search for products with eco-friendly certifications',
                'Consider bulk options to reduce packaging'
            ],
            analysis: {
                keyFindings: 'Estimated environmental impact based on product category',
                strengths: 'Product appears to be standard for its category',
                concerns: 'Limited environmental data available',
                certifications: 'Check product packaging for environmental labels'
            },
            metadata: {
                source: 'Fallback Analysis',
                timestamp: new Date().toISOString(),
                productBarcode: productData.barcode,
                confidence: 'Medium'
            }
        };
    }

    /**
     * Estimate carbon footprint based on product data
     * @param {Object} productData - Product data
     * @returns {number} Estimated carbon footprint (kg CO2)
     */
    estimateCarbonFootprint(productData) {
        const category = productData.category?.toLowerCase() || '';
        const ingredients = productData.ingredients?.toLowerCase() || '';
        
        // Base estimates by category
        let baseFootprint = 0.5; // Default
        
        if (category.includes('meat') || category.includes('dairy')) {
            baseFootprint = 2.5;
        } else if (category.includes('processed') || category.includes('snack')) {
            baseFootprint = 1.2;
        } else if (category.includes('organic') || category.includes('local')) {
            baseFootprint = 0.8;
        } else if (category.includes('beverage')) {
            baseFootprint = 0.3;
        }
        
        // Adjust based on ingredients
        if (ingredients.includes('palm oil')) baseFootprint += 0.5;
        if (ingredients.includes('beef')) baseFootprint += 1.5;
        if (ingredients.includes('organic')) baseFootprint *= 0.8;
        
        return Math.round(baseFootprint * 1000) / 1000;
    }

    /**
     * Estimate water usage based on product data
     * @param {Object} productData - Product data
     * @returns {number} Estimated water usage (liters)
     */
    estimateWaterUsage(productData) {
        const category = productData.category?.toLowerCase() || '';
        
        let baseWater = 50; // Default
        
        if (category.includes('meat')) {
            baseWater = 200;
        } else if (category.includes('dairy')) {
            baseWater = 100;
        } else if (category.includes('beverage')) {
            baseWater = 30;
        } else if (category.includes('organic')) {
            baseWater *= 0.9;
        }
        
        return Math.round(baseWater);
    }

    /**
     * Calculate sustainability score
     * @param {Object} productData - Product data
     * @returns {number} Sustainability score (0-100)
     */
    calculateSustainabilityScore(productData) {
        let score = 50; // Base score
        
        // Positive factors
        if (productData.environmental?.sustainability === 'A') score += 20;
        if (productData.environmental?.sustainability === 'B') score += 15;
        if (productData.ingredients?.includes('organic')) score += 10;
        if (productData.packaging?.includes('recyclable')) score += 5;
        
        // Negative factors
        if (productData.environmental?.palmOil?.length > 0) score -= 15;
        if (productData.environmental?.deforestation?.length > 0) score -= 20;
        if (productData.ingredients?.includes('artificial')) score -= 5;
        
        return Math.max(0, Math.min(100, score));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiCarbonAnalyzer;
} else {
    window.GeminiCarbonAnalyzer = GeminiCarbonAnalyzer;
}
