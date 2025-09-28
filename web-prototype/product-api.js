/**
 * Product Data API Integration
 * Handles barcode lookup and product metadata fetching
 */

class ProductDataAPI {
    constructor() {
        this.openFoodFactsBase = 'https://world.openfoodfacts.org/api/v0';
        this.upcDatabaseKey = null; // Add your UPC Database API key if needed
    }

    /**
     * Fetch product data from Open Food Facts
     * @param {string} barcode - Product barcode (UPC/EAN)
     * @returns {Promise<Object>} Product data
     */
    async fetchFromOpenFoodFacts(barcode) {
        try {
            console.log(`🔍 Fetching from Open Food Facts: ${barcode}`);
            
            const response = await fetch(`${this.openFoodFactsBase}/product/${barcode}.json`);
            const data = await response.json();
            
            if (data.status === 1 && data.product) {
                return this.normalizeOpenFoodFactsData(data.product);
            } else {
                throw new Error(`Product not found: ${data.status_verbose || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Open Food Facts fetch failed:', error);
            throw error;
        }
    }

    /**
     * Normalize Open Food Facts data to standard format
     * @param {Object} product - Raw product data
     * @returns {Object} Normalized product data
     */
    normalizeOpenFoodFactsData(product) {
        return {
            barcode: product.code,
            name: product.product_name || product.generic_name || 'Unknown Product',
            brand: product.brands || 'Unknown Brand',
            category: product.categories || 'Unknown Category',
            ingredients: product.ingredients_text || 'No ingredients listed',
            nutrition: {
                energy: product.nutriments?.energy_100g || null,
                fat: product.nutriments?.fat_100g || null,
                carbs: product.nutriments?.carbohydrates_100g || null,
                protein: product.nutriments?.proteins_100g || null,
                sugar: product.nutriments?.sugars_100g || null,
                salt: product.nutriments?.salt_100g || null,
                fiber: product.nutriments?.fiber_100g || null
            },
            packaging: product.packaging || 'Unknown',
            origin: product.origins || 'Unknown',
            manufacturing: product.manufacturing_places || 'Unknown',
            labels: product.labels_tags || [],
            additives: product.additives_tags || [],
            allergens: product.allergens_tags || [],
            environmental: {
                palmOil: product.ingredients_from_palm_oil_tags || [],
                deforestation: product.ingredients_that_may_be_from_palm_oil_tags || [],
                sustainability: product.ecoscore_grade || 'Unknown'
            },
            images: {
                front: product.image_front_url || null,
                nutrition: product.image_nutrition_url || null,
                ingredients: product.image_ingredients_url || null
            },
            lastModified: product.last_modified_t || null,
            dataQuality: product.data_quality_tags || []
        };
    }

    /**
     * Fetch product data from UPC Database (fallback)
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Product data
     */
    async fetchFromUPCDatabase(barcode) {
        if (!this.upcDatabaseKey) {
            throw new Error('UPC Database API key not configured');
        }

        try {
            console.log(`🔍 Fetching from UPC Database: ${barcode}`);
            
            const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return this.normalizeUPCDatabaseData(data.items[0]);
            } else {
                throw new Error('Product not found in UPC Database');
            }
        } catch (error) {
            console.error('❌ UPC Database fetch failed:', error);
            throw error;
        }
    }

    /**
     * Normalize UPC Database data to standard format
     * @param {Object} item - Raw UPC Database item
     * @returns {Object} Normalized product data
     */
    normalizeUPCDatabaseData(item) {
        return {
            barcode: item.upc,
            name: item.title || 'Unknown Product',
            brand: item.brand || 'Unknown Brand',
            category: item.category || 'Unknown Category',
            description: item.description || '',
            images: {
                front: item.images?.[0] || null
            },
            source: 'UPC Database'
        };
    }

    /**
     * Get comprehensive product data with fallbacks
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Complete product data
     */
    async getProductData(barcode) {
        console.log(`📦 Fetching product data for barcode: ${barcode}`);
        
        try {
            // Try Open Food Facts first (best for food products)
            const productData = await this.fetchFromOpenFoodFacts(barcode);
            productData.source = 'Open Food Facts';
            return productData;
            
        } catch (openFoodFactsError) {
            console.warn('⚠️ Open Food Facts failed, trying UPC Database...');
            
            try {
                // Fallback to UPC Database
                const productData = await this.fetchFromUPCDatabase(barcode);
                return productData;
                
            } catch (upcError) {
                console.error('❌ All product data sources failed');
                
                // Return minimal data structure
                return {
                    barcode: barcode,
                    name: 'Unknown Product',
                    brand: 'Unknown Brand',
                    category: 'Unknown Category',
                    source: 'None',
                    error: 'Product not found in any database'
                };
            }
        }
    }

    /**
     * Enrich product data with additional metadata
     * @param {Object} productData - Base product data
     * @returns {Object} Enriched product data
     */
    enrichProductData(productData) {
        // Add calculated fields
        const enriched = {
            ...productData,
            metadata: {
                hasNutritionData: !!(productData.nutrition?.energy),
                hasIngredients: !!(productData.ingredients),
                hasImages: !!(productData.images?.front),
                dataCompleteness: this.calculateDataCompleteness(productData),
                lastUpdated: new Date().toISOString()
            }
        };

        return enriched;
    }

    /**
     * Calculate data completeness score
     * @param {Object} productData - Product data
     * @returns {number} Completeness score (0-100)
     */
    calculateDataCompleteness(productData) {
        let score = 0;
        const fields = [
            'name', 'brand', 'category', 'ingredients', 
            'nutrition', 'packaging', 'images'
        ];
        
        fields.forEach(field => {
            if (productData[field] && productData[field] !== 'Unknown') {
                score += 100 / fields.length;
            }
        });
        
        return Math.round(score);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDataAPI;
} else {
    window.ProductDataAPI = ProductDataAPI;
}
