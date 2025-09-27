import { Product } from '../../App';
import { PRODUCT_DATABASE } from '../data/ProductDatabase';

// Mock Google Cloud Vision API service
export class GoogleCloudVisionService {
  private static instance: GoogleCloudVisionService;
  private apiKey: string = '';

  static getInstance(): GoogleCloudVisionService {
    if (!GoogleCloudVisionService.instance) {
      GoogleCloudVisionService.instance = new GoogleCloudVisionService();
    }
    return GoogleCloudVisionService.instance;
  }

  // Initialize with API key
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('Google Cloud Vision API initialized');
  }

  // Detect products in image using Google Cloud Vision API
  async detectProducts(imageUri: string): Promise<Product[]> {
    try {
      console.log('Detecting products in image:', imageUri);
      
      if (!this.validateApiKey()) {
        throw new Error('Google Cloud Vision API key not configured');
      }

      // Convert image URI to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Call Google Cloud Vision API
      const visionResult = await this.callVisionAPI(base64Image);
      
      // Process the results and match to products
      const detectedProducts = this.matchProductsFromVisionResult(visionResult);
      
      return detectedProducts;
    } catch (error) {
      console.error('Error detecting products:', error);
      // Fallback to mock data if API fails
      console.log('Falling back to mock data');
      return this.getMockDetectedProducts();
    }
  }

  // Detect text in image (for barcode scanning)
  async detectText(imageUri: string): Promise<string[]> {
    try {
      console.log('Detecting text in image:', imageUri);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock implementation - in real app, this would call Google Cloud Vision API
      const mockTexts = [
        '1234567890123',
        '1234567890124',
        '1234567890125',
      ];
      
      return mockTexts;
    } catch (error) {
      console.error('Error detecting text:', error);
      throw error;
    }
  }

  // Detect labels in image (for product categorization)
  async detectLabels(imageUri: string): Promise<Array<{ label: string; confidence: number }>> {
    try {
      console.log('Detecting labels in image:', imageUri);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Mock implementation - in real app, this would call Google Cloud Vision API
      const mockLabels = [
        { label: 'Food', confidence: 0.95 },
        { label: 'Fruit', confidence: 0.87 },
        { label: 'Banana', confidence: 0.82 },
        { label: 'Organic', confidence: 0.76 },
        { label: 'Grocery', confidence: 0.91 },
      ];
      
      return mockLabels;
    } catch (error) {
      console.error('Error detecting labels:', error);
      throw error;
    }
  }

  // Detect objects in image (for product recognition)
  async detectObjects(imageUri: string): Promise<Array<{ object: string; confidence: number; boundingBox: any }>> {
    try {
      console.log('Detecting objects in image:', imageUri);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      // Mock implementation - in real app, this would call Google Cloud Vision API
      const mockObjects = [
        {
          object: 'Banana',
          confidence: 0.89,
          boundingBox: { x: 100, y: 150, width: 80, height: 120 }
        },
        {
          object: 'Milk Carton',
          confidence: 0.76,
          boundingBox: { x: 200, y: 100, width: 60, height: 100 }
        }
      ];
      
      return mockObjects;
    } catch (error) {
      console.error('Error detecting objects:', error);
      throw error;
    }
  }

  // Analyze product packaging for sustainability
  async analyzePackaging(imageUri: string): Promise<{
    isRecyclable: boolean;
    packagingType: string;
    sustainabilityScore: number;
  }> {
    try {
      console.log('Analyzing packaging in image:', imageUri);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1600));
      
      // Mock implementation - in real app, this would use advanced image analysis
      const mockAnalysis = {
        isRecyclable: Math.random() > 0.3,
        packagingType: ['Cardboard', 'Plastic', 'Glass', 'Metal'][Math.floor(Math.random() * 4)],
        sustainabilityScore: Math.floor(Math.random() * 40) + 60,
      };
      
      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing packaging:', error);
      throw error;
    }
  }

  // Convert image URI to base64
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // For React Native, we need to handle different URI formats
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
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  // Call Google Cloud Vision API
  private async callVisionAPI(base64Image: string): Promise<any> {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: base64Image
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'TEXT_DETECTION', maxResults: 5 }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    return result.responses[0];
  }

  // Match products from Vision API results
  private matchProductsFromVisionResult(visionResult: any): Product[] {
    const labels = visionResult.labelAnnotations?.map((label: any) => label.description.toLowerCase()) || [];
    const objects = visionResult.localizedObjectAnnotations?.map((obj: any) => obj.name.toLowerCase()) || [];
    const text = visionResult.textAnnotations?.[0]?.description || '';
    
    console.log('Vision API detected labels:', labels);
    console.log('Vision API detected objects:', objects);
    console.log('Vision API detected text:', text);
    
    // Find matching products based on detected content
    const matchedProducts: Product[] = [];
    
    // Check for specific product matches
    for (const product of PRODUCT_DATABASE) {
      let matchScore = 0;
      
      // Check name matches
      const productNameWords = product.name.toLowerCase().split(' ');
      for (const word of productNameWords) {
        if (labels.some(label => label.includes(word)) || 
            objects.some(obj => obj.includes(word))) {
          matchScore += 2;
        }
      }
      
      // Check category matches
      const categoryWords = product.category.toLowerCase().split(' ');
      for (const word of categoryWords) {
        if (labels.some(label => label.includes(word)) || 
            objects.some(obj => obj.includes(word))) {
          matchScore += 1;
        }
      }
      
      // Check for specific food items
      if (labels.some(label => label.includes('banana') || label.includes('fruit')) && 
          product.name.toLowerCase().includes('banana')) {
        matchScore += 3;
      }
      
      if (labels.some(label => label.includes('milk') || label.includes('dairy')) && 
          product.name.toLowerCase().includes('milk')) {
        matchScore += 3;
      }
      
      if (labels.some(label => label.includes('meat') || label.includes('beef')) && 
          product.name.toLowerCase().includes('beef')) {
        matchScore += 3;
      }
      
      if (labels.some(label => label.includes('vegetable') || label.includes('tomato')) && 
          product.name.toLowerCase().includes('tomato')) {
        matchScore += 3;
      }
      
      if (labels.some(label => label.includes('grain') || label.includes('quinoa')) && 
          product.name.toLowerCase().includes('quinoa')) {
        matchScore += 3;
      }
      
      if (labels.some(label => label.includes('bottle') || label.includes('water')) && 
          product.name.toLowerCase().includes('water')) {
        matchScore += 3;
      }
      
      // If we have a good match, add the product
      if (matchScore >= 2) {
        matchedProducts.push(product);
      }
    }
    
    // If no specific matches, return the most likely products based on general categories
    if (matchedProducts.length === 0) {
      if (labels.some(label => label.includes('fruit') || label.includes('banana'))) {
        matchedProducts.push(PRODUCT_DATABASE[0]); // Organic Bananas
      } else if (labels.some(label => label.includes('milk') || label.includes('dairy'))) {
        matchedProducts.push(PRODUCT_DATABASE[1]); // Almond Milk
      } else if (labels.some(label => label.includes('meat') || label.includes('beef'))) {
        matchedProducts.push(PRODUCT_DATABASE[2]); // Beef Steak
      } else if (labels.some(label => label.includes('vegetable') || label.includes('tomato'))) {
        matchedProducts.push(PRODUCT_DATABASE[5]); // Organic Tomatoes
      } else if (labels.some(label => label.includes('bottle') || label.includes('water'))) {
        matchedProducts.push(PRODUCT_DATABASE[4]); // Plastic Water Bottles
      } else {
        // Default fallback
        matchedProducts.push(PRODUCT_DATABASE[0]); // Organic Bananas
      }
    }
    
    return matchedProducts.slice(0, 3); // Return max 3 products
  }

  // Get mock detected products for demo
  private getMockDetectedProducts(): Product[] {
    // Randomly select 1-3 products from database
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...PRODUCT_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numProducts);
  }

  // Validate API key
  private validateApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  // Get API usage statistics
  async getUsageStatistics(): Promise<{
    requestsToday: number;
    requestsThisMonth: number;
    quotaRemaining: number;
  }> {
    try {
      // Mock implementation - in real app, this would fetch from Google Cloud Console
      return {
        requestsToday: Math.floor(Math.random() * 100) + 50,
        requestsThisMonth: Math.floor(Math.random() * 2000) + 1000,
        quotaRemaining: Math.floor(Math.random() * 1000) + 500,
      };
    } catch (error) {
      console.error('Error fetching usage statistics:', error);
      throw error;
    }
  }

  // Batch process multiple images
  async batchDetectProducts(imageUris: string[]): Promise<Product[][]> {
    try {
      console.log(`Batch processing ${imageUris.length} images`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock implementation - in real app, this would process multiple images
      const results: Product[][] = [];
      for (const imageUri of imageUris) {
        results.push(this.getMockDetectedProducts());
      }
      
      return results;
    } catch (error) {
      console.error('Error batch processing images:', error);
      throw error;
    }
  }

  // Detect product freshness (for fruits/vegetables)
  async detectProductFreshness(imageUri: string): Promise<{
    freshness: 'fresh' | 'good' | 'fair' | 'poor';
    confidence: number;
    daysRemaining?: number;
  }> {
    try {
      console.log('Detecting product freshness in image:', imageUri);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      // Mock implementation - in real app, this would use computer vision for freshness detection
      const freshnessLevels: Array<'fresh' | 'good' | 'fair' | 'poor'> = ['fresh', 'good', 'fair', 'poor'];
      const randomFreshness = freshnessLevels[Math.floor(Math.random() * freshnessLevels.length)];
      
      return {
        freshness: randomFreshness,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        daysRemaining: randomFreshness === 'fresh' ? Math.floor(Math.random() * 5) + 3 : 
                      randomFreshness === 'good' ? Math.floor(Math.random() * 3) + 1 : 0,
      };
    } catch (error) {
      console.error('Error detecting product freshness:', error);
      throw error;
    }
  }
}

export default GoogleCloudVisionService;
