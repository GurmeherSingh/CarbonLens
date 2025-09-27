import { Product, SupplyChainStep } from '../../App';

// Sample product database with environmental impact data
export const PRODUCT_DATABASE: Product[] = [
  {
    id: '1',
    name: 'Organic Bananas',
    brand: 'Fresh Farm',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
    carbonFootprint: 0.8, // kg CO2 per kg
    waterUsage: 160, // liters per kg
    foodMiles: 1200, // km from Ecuador
    packagingImpact: 2, // 1-10 scale (low)
    sustainabilityScore: 85,
    barcode: '1234567890123',
    price: 2.99,
    supplyChain: [
      {
        id: 'sc1',
        name: 'Ecuador Banana Farm',
        location: { latitude: -0.1807, longitude: -78.4678, country: 'Ecuador', city: 'Quito' },
        type: 'farm',
        carbonFootprint: 0.3,
        duration: 90,
        description: 'Organic banana cultivation using sustainable farming practices'
      },
      {
        id: 'sc2',
        name: 'Processing Facility',
        location: { latitude: -0.1807, longitude: -78.4678, country: 'Ecuador', city: 'Guayaquil' },
        type: 'processing',
        carbonFootprint: 0.1,
        duration: 2,
        description: 'Washing, sorting, and packaging in eco-friendly materials'
      },
      {
        id: 'sc3',
        name: 'Ocean Transport',
        location: { latitude: 25.7617, longitude: -80.1918, country: 'USA', city: 'Miami' },
        type: 'transport',
        carbonFootprint: 0.3,
        duration: 14,
        description: 'Refrigerated container ship transport'
      },
      {
        id: 'sc4',
        name: 'Local Distribution',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'retail',
        carbonFootprint: 0.1,
        duration: 1,
        description: 'Final distribution to retail stores'
      }
    ]
  },
  {
    id: '2',
    name: 'Almond Milk',
    brand: 'EcoDairy',
    category: 'Dairy Alternatives',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    carbonFootprint: 0.7, // kg CO2 per liter
    waterUsage: 384, // liters per liter (almond production)
    foodMiles: 800, // km from California
    packagingImpact: 3, // 1-10 scale (low-medium)
    sustainabilityScore: 75,
    barcode: '1234567890124',
    price: 4.99,
    supplyChain: [
      {
        id: 'sc5',
        name: 'California Almond Orchard',
        location: { latitude: 36.7783, longitude: -119.4179, country: 'USA', city: 'Fresno' },
        type: 'farm',
        carbonFootprint: 0.4,
        duration: 120,
        description: 'Sustainable almond farming with water conservation'
      },
      {
        id: 'sc6',
        name: 'Processing Plant',
        location: { latitude: 37.7749, longitude: -122.4194, country: 'USA', city: 'San Francisco' },
        type: 'processing',
        carbonFootprint: 0.2,
        duration: 3,
        description: 'Almond processing and milk production'
      },
      {
        id: 'sc7',
        name: 'Distribution Center',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'retail',
        carbonFootprint: 0.1,
        duration: 2,
        description: 'Regional distribution to stores'
      }
    ]
  },
  {
    id: '3',
    name: 'Beef Steak',
    brand: 'GrassFed Co',
    category: 'Meat',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
    carbonFootprint: 27.0, // kg CO2 per kg
    waterUsage: 15400, // liters per kg
    foodMiles: 200, // km from local farm
    packagingImpact: 4, // 1-10 scale (medium)
    sustainabilityScore: 25,
    barcode: '1234567890125',
    price: 15.99,
    supplyChain: [
      {
        id: 'sc8',
        name: 'Grass-Fed Cattle Farm',
        location: { latitude: 40.0150, longitude: -105.2705, country: 'USA', city: 'Boulder' },
        type: 'farm',
        carbonFootprint: 20.0,
        duration: 730,
        description: 'Grass-fed cattle raising with rotational grazing'
      },
      {
        id: 'sc9',
        name: 'Processing Facility',
        location: { latitude: 39.7392, longitude: -104.9903, country: 'USA', city: 'Denver' },
        type: 'processing',
        carbonFootprint: 5.0,
        duration: 1,
        description: 'Local processing and packaging'
      },
      {
        id: 'sc10',
        name: 'Local Distribution',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'retail',
        carbonFootprint: 2.0,
        duration: 1,
        description: 'Refrigerated transport to retail'
      }
    ]
  },
  {
    id: '4',
    name: 'Quinoa',
    brand: 'Andean Gold',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
    carbonFootprint: 0.5, // kg CO2 per kg
    waterUsage: 200, // liters per kg
    foodMiles: 4000, // km from Peru
    packagingImpact: 2, // 1-10 scale (low)
    sustainabilityScore: 90,
    barcode: '1234567890126',
    price: 8.99,
    supplyChain: [
      {
        id: 'sc11',
        name: 'Peruvian Quinoa Farm',
        location: { latitude: -13.1631, longitude: -72.5450, country: 'Peru', city: 'Cusco' },
        type: 'farm',
        carbonFootprint: 0.2,
        duration: 120,
        description: 'Traditional quinoa farming in the Andes'
      },
      {
        id: 'sc12',
        name: 'Processing Center',
        location: { latitude: -12.0464, longitude: -77.0428, country: 'Peru', city: 'Lima' },
        type: 'processing',
        carbonFootprint: 0.1,
        duration: 2,
        description: 'Cleaning and packaging quinoa'
      },
      {
        id: 'sc13',
        name: 'Ocean Transport',
        location: { latitude: 25.7617, longitude: -80.1918, country: 'USA', city: 'Miami' },
        type: 'transport',
        carbonFootprint: 0.2,
        duration: 21,
        description: 'Container ship transport'
      }
    ]
  },
  {
    id: '5',
    name: 'Plastic Water Bottles',
    brand: 'AquaPure',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300',
    carbonFootprint: 0.2, // kg CO2 per bottle
    waterUsage: 1.4, // liters per bottle
    foodMiles: 50, // km from local source
    packagingImpact: 9, // 1-10 scale (very high)
    sustainabilityScore: 15,
    barcode: '1234567890127',
    price: 1.99,
    supplyChain: [
      {
        id: 'sc14',
        name: 'Water Source',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'farm',
        carbonFootprint: 0.05,
        duration: 0,
        description: 'Local water source'
      },
      {
        id: 'sc15',
        name: 'Bottling Plant',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'processing',
        carbonFootprint: 0.1,
        duration: 1,
        description: 'Plastic bottle production and filling'
      }
    ]
  },
  {
    id: '6',
    name: 'Organic Tomatoes',
    brand: 'Garden Fresh',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-5a1a0a0a0a0a?w=300',
    carbonFootprint: 0.3, // kg CO2 per kg
    waterUsage: 50, // liters per kg
    foodMiles: 100, // km from local farm
    packagingImpact: 1, // 1-10 scale (very low)
    sustainabilityScore: 95,
    barcode: '1234567890128',
    price: 3.99,
    supplyChain: [
      {
        id: 'sc16',
        name: 'Local Organic Farm',
        location: { latitude: 40.7589, longitude: -73.9851, country: 'USA', city: 'New York' },
        type: 'farm',
        carbonFootprint: 0.2,
        duration: 60,
        description: 'Local organic tomato farming'
      },
      {
        id: 'sc17',
        name: 'Farmers Market',
        location: { latitude: 40.7128, longitude: -74.0060, country: 'USA', city: 'New York' },
        type: 'retail',
        carbonFootprint: 0.1,
        duration: 0,
        description: 'Direct sale at farmers market'
      }
    ]
  }
];

// Product categories for filtering
export const PRODUCT_CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Grains',
  'Dairy Alternatives',
  'Meat',
  'Beverages',
  'Snacks',
  'Dairy'
];

// Sustainability score ranges
export const SUSTAINABILITY_RANGES = {
  excellent: { min: 80, max: 100, color: '#4CAF50', label: 'Excellent' },
  good: { min: 60, max: 79, color: '#FFC107', label: 'Good' },
  fair: { min: 40, max: 59, color: '#FF9800', label: 'Fair' },
  poor: { min: 20, max: 39, color: '#F44336', label: 'Poor' },
  veryPoor: { min: 0, max: 19, color: '#D32F2F', label: 'Very Poor' }
};

// Environmental impact benchmarks
export const ENVIRONMENTAL_BENCHMARKS = {
  carbonFootprint: {
    excellent: 1.0, // kg CO2 per unit
    good: 2.0,
    fair: 5.0,
    poor: 10.0
  },
  waterUsage: {
    excellent: 100, // liters per unit
    good: 500,
    fair: 1000,
    poor: 2000
  },
  foodMiles: {
    excellent: 100, // km
    good: 500,
    fair: 1000,
    poor: 2000
  },
  packagingImpact: {
    excellent: 2, // 1-10 scale
    good: 4,
    fair: 6,
    poor: 8
  }
};
