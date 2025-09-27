import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ARScreen from './src/screens/ARScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import SupplyChainScreen from './src/screens/SupplyChainScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Types
export type RootStackParamList = {
  Home: undefined;
  AR: undefined;
  ProductDetail: { product: Product };
  SupplyChain: { product: Product };
  Profile: undefined;
};

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  carbonFootprint: number; // kg CO2 per unit
  waterUsage: number; // liters per unit
  foodMiles: number; // kilometers
  packagingImpact: number; // 1-10 scale
  sustainabilityScore: number; // 1-100
  supplyChain: SupplyChainStep[];
  barcode?: string;
  price?: number;
}

export interface SupplyChainStep {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
  };
  type: 'farm' | 'processing' | 'transport' | 'retail';
  carbonFootprint: number;
  duration: number; // days
  description: string;
}

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'EcoLens' }}
          />
          <Stack.Screen 
            name="AR" 
            component={ARScreen} 
            options={{ title: 'AR Scanner' }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen} 
            options={{ title: 'Product Impact' }}
          />
          <Stack.Screen 
            name="SupplyChain" 
            component={SupplyChainScreen} 
            options={{ title: 'Supply Chain' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
