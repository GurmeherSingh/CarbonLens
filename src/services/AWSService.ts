import { Product } from '../../App';

// AWS SDK imports
import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

// AWS Services
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const bedrock = new AWS.BedrockRuntime();

// Environment variables
const API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;
const PRODUCTS_TABLE = process.env.AWS_PRODUCTS_TABLE;
const USER_SCANS_TABLE = process.env.AWS_USER_SCANS_TABLE;
const ENVIRONMENTAL_DATA_TABLE = process.env.AWS_ENVIRONMENTAL_DATA_TABLE;
const PRODUCT_IMAGES_BUCKET = process.env.AWS_PRODUCT_IMAGES_BUCKET;
const USER_DATA_BUCKET = process.env.AWS_USER_DATA_BUCKET;

/**
 * AWS Service for CarbonLens
 * Handles all AWS integrations including Rekognition, Bedrock, DynamoDB, and S3
 */
export class AWSService {
  private static instance: AWSService;
  private isInitialized: boolean = false;

  static getInstance(): AWSService {
    if (!AWSService.instance) {
      AWSService.instance = new AWSService();
    }
    return AWSService.instance;
  }

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      // Validate required environment variables
      if (!API_GATEWAY_URL) {
        throw new Error('AWS_API_GATEWAY_URL is required');
      }
      if (!PRODUCTS_TABLE) {
        throw new Error('AWS_PRODUCTS_TABLE is required');
      }

      this.isInitialized = true;
      console.log('✅ AWS Service initialized successfully');
    } catch (error) {
      console.error('❌ AWS Service initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Detect products in image using Amazon Rekognition
   */
  async detectProducts(imageUri: string): Promise<Product[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      console.log('🔍 Detecting products with Amazon Rekognition...');
      
      // Convert image URI to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Call API Gateway endpoint
      const response = await fetch(`${API_GATEWAY_URL}/detect-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Image,
          userId: 'current_user' // Replace with actual user ID
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Products detected successfully');
        return result.products || [];
      } else {
        throw new Error(result.error || 'Product detection failed');
      }
      
    } catch (error) {
      console.error('❌ Product detection error:', error);
      // Fallback to mock data
      return this.getMockProducts();
    }
  }

  /**
   * Analyze environmental impact using Amazon Bedrock
   */
  async analyzeEnvironmentalImpact(productData: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      console.log('🌱 Analyzing environmental impact with Amazon Bedrock...');
      
      // Call API Gateway endpoint
      const response = await fetch(`${API_GATEWAY_URL}/analyze-environmental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productData.id,
          productData: productData,
          userId: 'current_user' // Replace with actual user ID
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Environmental analysis completed');
        return result.analysis;
      } else {
        throw new Error(result.error || 'Environmental analysis failed');
      }
      
    } catch (error) {
      console.error('❌ Environmental analysis error:', error);
      // Fallback to mock analysis
      return this.getMockEnvironmentalAnalysis(productData);
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, timeframe: string = 'month'): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      console.log('📊 Getting user analytics...');
      
      // Call API Gateway endpoint
      const response = await fetch(`${API_GATEWAY_URL}/user-analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          timeframe: timeframe
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ User analytics retrieved');
        return result.analytics;
      } else {
        throw new Error(result.error || 'User analytics failed');
      }
      
    } catch (error) {
      console.error('❌ User analytics error:', error);
      // Fallback to mock analytics
      return this.getMockUserAnalytics();
    }
  }

  /**
   * Save product scan to DynamoDB
   */
  async saveProductScan(userId: string, product: Product): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      const scanData = {
        userId: userId,
        scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        product: product,
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
      };

      const params = {
        TableName: USER_SCANS_TABLE,
        Item: scanData
      };

      await dynamodb.put(params).promise();
      console.log('✅ Product scan saved to DynamoDB');
      
    } catch (error) {
      console.error('❌ Error saving product scan:', error);
      throw error;
    }
  }

  /**
   * Get user's scan history
   */
  async getUserScanHistory(userId: string, limit: number = 50): Promise<Product[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      const params = {
        TableName: USER_SCANS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false, // Most recent first
        Limit: limit
      };

      const result = await dynamodb.query(params).promise();
      
      // Extract products from scan history
      const products = result.Items?.map(item => item.product).filter(Boolean) || [];
      
      console.log(`✅ Retrieved ${products.length} scans for user ${userId}`);
      return products;
      
    } catch (error) {
      console.error('❌ Error getting scan history:', error);
      return [];
    }
  }

  /**
   * Search products in database
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      const params = {
        TableName: PRODUCTS_TABLE,
        FilterExpression: 'contains(name, :query) OR contains(category, :query) OR contains(brand, :query)',
        ExpressionAttributeValues: {
          ':query': query
        },
        Limit: limit
      };

      const result = await dynamodb.scan(params).promise();
      
      console.log(`✅ Found ${result.Items?.length || 0} products matching "${query}"`);
      return result.Items || [];
      
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return [];
    }
  }

  /**
   * Upload image to S3
   */
  async uploadImageToS3(imageUri: string, userId: string): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('AWS Service not initialized');
      }

      const base64Image = await this.convertImageToBase64(imageUri);
      const key = `product-images/${userId}/${Date.now()}.jpg`;
      
      const params = {
        Bucket: PRODUCT_IMAGES_BUCKET,
        Key: key,
        Body: Buffer.from(base64Image, 'base64'),
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
   * Convert image URI to base64
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      if (imageUri.startsWith('file://')) {
        // Handle local file URI
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else if (imageUri.startsWith('data:')) {
        // Already base64
        return imageUri.split(',')[1];
      } else {
        // Network URL
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Get mock products for fallback
   */
  private getMockProducts(): Product[] {
    return [
      {
        id: 'mock_001',
        name: 'Organic Bananas',
        brand: 'Nature\'s Best',
        category: 'Fruits',
        barcode: '1234567890123',
        ingredients: 'Organic bananas',
        packaging: 'Compostable',
        origin: 'Ecuador',
        sustainabilityScore: 85,
        environmental: {
          carbonFootprint: { perUnit: 0.3, per1000Units: 300 },
          waterUsage: { perUnit: 25, per1000Units: 25000 },
          sustainabilityScore: 85
        }
      }
    ];
  }

  /**
   * Get mock environmental analysis
   */
  private getMockEnvironmentalAnalysis(productData: any): any {
    return {
      carbonFootprint: {
        perUnit: 0.5,
        per1000Units: 500,
        breakdown: {
          production: 0.3,
          transportation: 0.1,
          packaging: 0.05,
          distribution: 0.05
        }
      },
      waterUsage: {
        perUnit: 50,
        per1000Units: 50000,
        breakdown: {
          ingredients: 35,
          processing: 10,
          packaging: 5
        }
      },
      environmentalEquivalents: {
        treesAbsorbed: 0.025,
        treesPer1000Units: 25,
        milesDriven: 1.25,
        waterInGallons: 13.2,
        plasticBottlesEquivalent: 100
      },
      sustainabilityScore: 75,
      recommendations: [
        'Choose organic alternatives',
        'Look for local products',
        'Consider bulk options'
      ],
      analysis: {
        keyFindings: 'Standard environmental impact for category',
        strengths: 'Good sustainability practices',
        concerns: 'Consider more sustainable alternatives',
        certifications: 'Look for organic certifications'
      }
    };
  }

  /**
   * Get mock user analytics
   */
  private getMockUserAnalytics(): any {
    return {
      totalScans: 15,
      environmentalMetrics: {
        totalCarbonFootprint: 7.5,
        totalWaterUsage: 750,
        totalMilesDriven: 18.75,
        totalTreesAbsorbed: 0.375,
        totalPlasticBottlesEquivalent: 1500
      },
      sustainabilityScore: {
        overall: 75,
        level: 'Eco Conscious',
        nextMilestone: 'Try to reach 80+ sustainability score'
      },
      insights: {
        insights: [
          {
            type: 'carbon',
            message: 'Your carbon footprint is 7.5 kg CO₂',
            impact: 'medium'
          }
        ],
        recommendations: [
          'Choose products with lower carbon footprints',
          'Look for organic alternatives'
        ]
      }
    };
  }

  /**
   * Check if AWS service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    initialized: boolean;
    apiGatewayUrl: string;
    region: string;
  } {
    return {
      initialized: this.isInitialized,
      apiGatewayUrl: API_GATEWAY_URL || 'Not configured',
      region: process.env.AWS_REGION || 'Not configured'
    };
  }
}

export default AWSService;
