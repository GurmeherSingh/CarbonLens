/**
 * CarbonLens Product Detection Lambda Function
 * Uses Amazon Rekognition for computer vision and product detection
 */

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Environment variables
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const ENVIRONMENTAL_DATA_TABLE = process.env.ENVIRONMENTAL_DATA_TABLE;
const PRODUCT_IMAGES_BUCKET = process.env.PRODUCT_IMAGES_BUCKET;
const USER_DATA_BUCKET = process.env.USER_DATA_BUCKET;

exports.handler = async (event) => {
    console.log('🔍 Product Detection Lambda triggered');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { imageData, userId, barcode } = JSON.parse(event.body);
        
        if (!imageData) {
            return createResponse(400, { error: 'Image data is required' });
        }
        
        // Step 1: Use Amazon Rekognition for product detection
        const detectedLabels = await detectProductLabels(imageData);
        console.log('🏷️ Detected labels:', detectedLabels);
        
        // Step 2: Match detected labels to products in database
        const matchedProducts = await matchProductsToLabels(detectedLabels, barcode);
        console.log('📦 Matched products:', matchedProducts);
        
        // Step 3: Get environmental data for matched products
        const productsWithEnvironmentalData = await enrichWithEnvironmentalData(matchedProducts);
        
        // Step 4: Save user scan if userId provided
        if (userId) {
            await saveUserScan(userId, productsWithEnvironmentalData);
        }
        
        // Step 5: Upload image to S3 for future reference
        const imageUrl = await uploadImageToS3(imageData, userId);
        
        return createResponse(200, {
            success: true,
            products: productsWithEnvironmentalData,
            detectedLabels: detectedLabels,
            imageUrl: imageUrl,
            metadata: {
                timestamp: new Date().toISOString(),
                userId: userId,
                detectionMethod: 'Amazon Rekognition'
            }
        });
        
    } catch (error) {
        console.error('❌ Product detection error:', error);
        return createResponse(500, { 
            error: 'Product detection failed',
            message: error.message 
        });
    }
};

/**
 * Use Amazon Rekognition to detect labels in the image
 */
async function detectProductLabels(imageData) {
    const params = {
        Image: { 
            Bytes: Buffer.from(imageData, 'base64') 
        },
        MaxLabels: 20,
        MinConfidence: 60,
        Features: ['GENERAL_LABELS', 'IMAGE_PROPERTIES']
    };
    
    try {
        const result = await rekognition.detectLabels(params).promise();
        
        // Process and filter labels
        const processedLabels = result.Labels.map(label => ({
            name: label.Name,
            confidence: label.Confidence,
            categories: label.Categories || [],
            parents: label.Parents || []
        })).filter(label => label.confidence > 60);
        
        console.log('✅ Rekognition detection completed');
        return processedLabels;
        
    } catch (error) {
        console.error('❌ Rekognition error:', error);
        throw new Error(`Rekognition detection failed: ${error.message}`);
    }
}

/**
 * Match detected labels to products in the database
 */
async function matchProductsToLabels(detectedLabels, barcode = null) {
    try {
        let products = [];
        
        // If barcode is provided, try to find exact match first
        if (barcode) {
            const barcodeMatch = await findProductByBarcode(barcode);
            if (barcodeMatch) {
                products.push(barcodeMatch);
            }
        }
        
        // If no barcode match or no barcode provided, search by labels
        if (products.length === 0) {
            const labelNames = detectedLabels.map(label => label.name.toLowerCase());
            products = await searchProductsByLabels(labelNames);
        }
        
        // If still no matches, return generic products based on food categories
        if (products.length === 0) {
            products = await getGenericProductsByCategory(detectedLabels);
        }
        
        return products.slice(0, 5); // Return max 5 products
        
    } catch (error) {
        console.error('❌ Product matching error:', error);
        return [];
    }
}

/**
 * Find product by barcode
 */
async function findProductByBarcode(barcode) {
    try {
        const params = {
            TableName: PRODUCTS_TABLE,
            IndexName: 'BarcodeIndex',
            KeyConditionExpression: 'barcode = :barcode',
            ExpressionAttributeValues: {
                ':barcode': barcode
            }
        };
        
        const result = await dynamodb.query(params).promise();
        return result.Items[0] || null;
        
    } catch (error) {
        console.error('❌ Barcode search error:', error);
        return null;
    }
}

/**
 * Search products by detected labels
 */
async function searchProductsByLabels(labelNames) {
    try {
        const products = [];
        
        // Search for each label in the products table
        for (const label of labelNames) {
            const params = {
                TableName: PRODUCTS_TABLE,
                FilterExpression: 'contains(category, :label) OR contains(name, :label) OR contains(ingredients, :label)',
                ExpressionAttributeValues: {
                    ':label': label
                },
                Limit: 10
            };
            
            const result = await dynamodb.scan(params).promise();
            products.push(...result.Items);
        }
        
        // Remove duplicates and return
        const uniqueProducts = products.filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
        );
        
        return uniqueProducts;
        
    } catch (error) {
        console.error('❌ Label search error:', error);
        return [];
    }
}

/**
 * Get generic products based on detected categories
 */
async function getGenericProductsByCategory(detectedLabels) {
    try {
        // Map common food labels to categories
        const categoryMap = {
            'food': 'Food',
            'fruit': 'Fruits',
            'vegetable': 'Vegetables',
            'meat': 'Meat',
            'dairy': 'Dairy',
            'beverage': 'Beverages',
            'snack': 'Snacks',
            'grain': 'Grains',
            'bread': 'Bakery'
        };
        
        const categories = [];
        for (const label of detectedLabels) {
            const category = categoryMap[label.name.toLowerCase()];
            if (category) {
                categories.push(category);
            }
        }
        
        if (categories.length === 0) {
            categories.push('Food'); // Default category
        }
        
        // Search for products in these categories
        const products = [];
        for (const category of categories) {
            const params = {
                TableName: PRODUCTS_TABLE,
                IndexName: 'CategoryIndex',
                KeyConditionExpression: 'category = :category',
                ExpressionAttributeValues: {
                    ':category': category
                },
                Limit: 3
            };
            
            const result = await dynamodb.query(params).promise();
            products.push(...result.Items);
        }
        
        return products.slice(0, 3);
        
    } catch (error) {
        console.error('❌ Generic product search error:', error);
        return [];
    }
}

/**
 * Enrich products with environmental data
 */
async function enrichWithEnvironmentalData(products) {
    try {
        const enrichedProducts = [];
        
        for (const product of products) {
            try {
                // Get environmental data for this product
                const envData = await getEnvironmentalData(product.id);
                
                const enrichedProduct = {
                    ...product,
                    environmental: envData || {
                        carbonFootprint: estimateCarbonFootprint(product),
                        waterUsage: estimateWaterUsage(product),
                        sustainabilityScore: calculateSustainabilityScore(product)
                    }
                };
                
                enrichedProducts.push(enrichedProduct);
                
            } catch (error) {
                console.error(`❌ Error enriching product ${product.id}:`, error);
                // Add product without environmental data
                enrichedProducts.push(product);
            }
        }
        
        return enrichedProducts;
        
    } catch (error) {
        console.error('❌ Environmental data enrichment error:', error);
        return products; // Return products without environmental data
    }
}

/**
 * Get environmental data from database
 */
async function getEnvironmentalData(productId) {
    try {
        const params = {
            TableName: ENVIRONMENTAL_DATA_TABLE,
            Key: {
                productId: productId,
                dataType: 'environmental_impact'
            }
        };
        
        const result = await dynamodb.get(params).promise();
        return result.Item?.data || null;
        
    } catch (error) {
        console.error('❌ Environmental data fetch error:', error);
        return null;
    }
}

/**
 * Save user scan to database
 */
async function saveUserScan(userId, products) {
    try {
        const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const scanData = {
            userId: userId,
            scanId: scanId,
            timestamp: new Date().toISOString(),
            products: products,
            ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
        };
        
        const params = {
            TableName: process.env.USER_SCANS_TABLE,
            Item: scanData
        };
        
        await dynamodb.put(params).promise();
        console.log('✅ User scan saved:', scanId);
        
    } catch (error) {
        console.error('❌ Error saving user scan:', error);
        // Don't throw error - scan saving is not critical
    }
}

/**
 * Upload image to S3
 */
async function uploadImageToS3(imageData, userId) {
    try {
        const key = `product-images/${userId || 'anonymous'}/${Date.now()}.jpg`;
        
        const params = {
            Bucket: PRODUCT_IMAGES_BUCKET,
            Key: key,
            Body: Buffer.from(imageData, 'base64'),
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        
        await s3.putObject(params).promise();
        
        const imageUrl = `https://${PRODUCT_IMAGES_BUCKET}.s3.amazonaws.com/${key}`;
        console.log('✅ Image uploaded to S3:', imageUrl);
        
        return imageUrl;
        
    } catch (error) {
        console.error('❌ Error uploading image to S3:', error);
        return null;
    }
}

/**
 * Estimate carbon footprint for a product
 */
function estimateCarbonFootprint(product) {
    const category = product.category?.toLowerCase() || '';
    let baseFootprint = 0.5; // Default
    
    if (category.includes('meat')) baseFootprint = 2.5;
    else if (category.includes('dairy')) baseFootprint = 1.8;
    else if (category.includes('processed')) baseFootprint = 1.2;
    else if (category.includes('organic')) baseFootprint = 0.8;
    else if (category.includes('beverage')) baseFootprint = 0.3;
    
    return Math.round(baseFootprint * 100) / 100;
}

/**
 * Estimate water usage for a product
 */
function estimateWaterUsage(product) {
    const category = product.category?.toLowerCase() || '';
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
function calculateSustainabilityScore(product) {
    let score = 50; // Base score
    
    if (product.category?.toLowerCase().includes('organic')) score += 20;
    if (product.ingredients?.toLowerCase().includes('organic')) score += 15;
    if (product.packaging?.toLowerCase().includes('recyclable')) score += 10;
    if (product.packaging?.toLowerCase().includes('biodegradable')) score += 15;
    
    return Math.max(0, Math.min(100, score));
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
