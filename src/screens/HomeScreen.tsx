import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../../App';
import { getProducts, getRecentScans } from '../services/ProductService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const recent = await getRecentScans();
      setRecentProducts(recent);
      
      // Calculate overall sustainability score
      const avgScore = recent.length > 0 
        ? recent.reduce((sum, product) => sum + product.sustainabilityScore, 0) / recent.length
        : 0;
      setSustainabilityScore(Math.round(avgScore));
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome to EcoLens</Text>
            <Text style={styles.subtitle}>Make sustainable choices with AR</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Sustainability Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Your Sustainability Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: getSustainabilityColor(sustainabilityScore) }]}>
            {sustainabilityScore}
          </Text>
          <Text style={styles.scoreLabel}>
            {getSustainabilityLabel(sustainabilityScore)}
          </Text>
        </View>
        <Text style={styles.scoreDescription}>
          Based on your recent shopping choices
        </Text>
      </View>

      {/* AR Scanner Button */}
      <TouchableOpacity
        style={styles.arButton}
        onPress={() => navigation.navigate('AR')}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.arButtonGradient}
        >
          <Icon name="camera-alt" size={32} color="#ffffff" />
          <Text style={styles.arButtonText}>Start AR Scanner</Text>
          <Text style={styles.arButtonSubtext}>Point at products to see their impact</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Recent Scans */}
      {recentProducts.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product })}
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.productScore}>
                  <Text style={[styles.productScoreText, { color: getSustainabilityColor(product.sustainabilityScore) }]}>
                    {product.sustainabilityScore}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="eco" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {recentProducts.reduce((sum, p) => sum + p.carbonFootprint, 0).toFixed(1)}kg
            </Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="water-drop" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>
              {recentProducts.reduce((sum, p) => sum + p.waterUsage, 0).toFixed(0)}L
            </Text>
            <Text style={styles.statLabel}>Water Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="local-shipping" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>
              {recentProducts.reduce((sum, p) => sum + p.foodMiles, 0).toFixed(0)}km
            </Text>
            <Text style={styles.statLabel}>Miles Reduced</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  arButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  arButtonGradient: {
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 5,
  },
  arButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  productCard: {
    width: 120,
    marginLeft: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  productScore: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HomeScreen;
