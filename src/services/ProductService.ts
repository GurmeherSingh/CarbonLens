import { Product } from '../../App';
import { PRODUCT_DATABASE } from '../data/ProductDatabase';

// Mock Google Cloud Vision API integration
export const detectProduct = async (imageUri: string): Promise<Product | null> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock product detection - in real implementation, this would use Google Cloud Vision API
    const mockDetectedProducts = [
      PRODUCT_DATABASE[0], // Organic Bananas
      PRODUCT_DATABASE[1], // Almond Milk
      PRODUCT_DATABASE[2], // Beef Steak
      PRODUCT_DATABASE[3], // Quinoa
      PRODUCT_DATABASE[4], // Plastic Water Bottles
      PRODUCT_DATABASE[5], // Organic Tomatoes
    ];
    
    // Randomly select a product for demo purposes
    const randomIndex = Math.floor(Math.random() * mockDetectedProducts.length);
    return mockDetectedProducts[randomIndex];
  } catch (error) {
    console.error('Product detection error:', error);
    return null;
  }
};

// Get product by barcode
export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const product = PRODUCT_DATABASE.find(p => p.barcode === barcode);
    return product || null;
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return null;
  }
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    return PRODUCT_DATABASE;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    if (category === 'All') {
      return PRODUCT_DATABASE;
    }
    return PRODUCT_DATABASE.filter(product => product.category === category);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const lowercaseQuery = query.toLowerCase();
    return PRODUCT_DATABASE.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Get recent scans (mock implementation)
export const getRecentScans = async (): Promise<Product[]> => {
  try {
    // In a real app, this would fetch from local storage or backend
    return PRODUCT_DATABASE.slice(0, 3); // Return first 3 products as recent scans
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    return [];
  }
};

// Save product scan (mock implementation)
export const saveProductScan = async (product: Product): Promise<void> => {
  try {
    // In a real app, this would save to local storage or backend
    console.log('Product scan saved:', product.name);
  } catch (error) {
    console.error('Error saving product scan:', error);
  }
};

// Get sustainability recommendations
export const getSustainabilityRecommendations = async (currentProduct: Product): Promise<Product[]> => {
  try {
    // Find more sustainable alternatives in the same category
    const alternatives = PRODUCT_DATABASE.filter(product => 
      product.category === currentProduct.category && 
      product.sustainabilityScore > currentProduct.sustainabilityScore
    );
    
    // Sort by sustainability score (highest first)
    return alternatives.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

// Calculate environmental impact comparison
export const calculateImpactComparison = (product1: Product, product2: Product) => {
  const carbonSavings = product1.carbonFootprint - product2.carbonFootprint;
  const waterSavings = product1.waterUsage - product2.waterUsage;
  const milesSavings = product1.foodMiles - product2.foodMiles;
  
  return {
    carbonSavings: Math.round(carbonSavings * 100) / 100,
    waterSavings: Math.round(waterSavings),
    milesSavings: Math.round(milesSavings),
    scoreImprovement: product2.sustainabilityScore - product1.sustainabilityScore
  };
};

// Get environmental impact summary
export const getEnvironmentalImpactSummary = (products: Product[]) => {
  const totalCarbon = products.reduce((sum, product) => sum + product.carbonFootprint, 0);
  const totalWater = products.reduce((sum, product) => sum + product.waterUsage, 0);
  const totalMiles = products.reduce((sum, product) => sum + product.foodMiles, 0);
  const avgScore = products.length > 0 
    ? products.reduce((sum, product) => sum + product.sustainabilityScore, 0) / products.length
    : 0;
  
  return {
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    totalWater: Math.round(totalWater),
    totalMiles: Math.round(totalMiles),
    averageScore: Math.round(avgScore),
    productCount: products.length
  };
};
