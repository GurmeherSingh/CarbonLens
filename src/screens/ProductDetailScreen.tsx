import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../../App';
import { getSustainabilityRecommendations, calculateImpactComparison, saveProductScan } from '../services/ProductService';

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product } = route.params;
  
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
    saveProductScan(product);
  }, [product]);

  const loadRecommendations = async () => {
    try {
      const recs = await getSustainabilityRecommendations(product);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getImpactColor = (value: number, type: 'carbon' | 'water' | 'miles' | 'packaging') => {
    const thresholds = {
      carbon: { good: 1, fair: 3, poor: 5 },
      water: { good: 200, fair: 500, poor: 1000 },
      miles: { good: 200, fair: 500, poor: 1000 },
      packaging: { good: 3, fair: 5, poor: 7 }
    };
    
    const threshold = thresholds[type];
    if (value <= threshold.good) return '#4CAF50';
    if (value <= threshold.fair) return '#FFC107';
    if (value <= threshold.poor) return '#FF9800';
    return '#F44336';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this product's environmental impact: ${product.name} - Sustainability Score: ${product.sustainabilityScore}/100`,
        title: 'EcoLens Product Impact',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSupplyChain = () => {
    navigation.navigate('SupplyChain', { product });
  };

  const handleRecommendation = (recommendedProduct: Product) => {
    const comparison = calculateImpactComparison(product, recommendedProduct);
    Alert.alert(
      'Better Choice!',
      `By choosing ${recommendedProduct.name} instead:\n\n` +
      `• Save ${comparison.carbonSavings}kg CO₂\n` +
      `• Save ${comparison.waterSavings}L water\n` +
      `• Reduce ${comparison.milesSavings}km food miles\n` +
      `• Improve score by ${comparison.scoreImprovement} points`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => navigation.navigate('ProductDetail', { product: recommendedProduct }) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[getSustainabilityColor(product.sustainabilityScore), getSustainabilityColor(product.sustainabilityScore) + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Product Image and Basic Info */}
      <View style={styles.productSection}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          {product.price && (
            <Text style={styles.productPrice}>${product.price}</Text>
          )}
        </View>
      </View>

      {/* Sustainability Score */}
      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Sustainability Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: getSustainabilityColor(product.sustainabilityScore) }]}>
            {product.sustainabilityScore}
          </Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
        <Text style={[styles.scoreDescription, { color: getSustainabilityColor(product.sustainabilityScore) }]}>
          {getSustainabilityLabel(product.sustainabilityScore)}
        </Text>
      </View>

      {/* Environmental Impact Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="eco" size={24} color={getImpactColor(product.carbonFootprint, 'carbon')} />
            <Text style={styles.metricTitle}>Carbon Footprint</Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.carbonFootprint, 'carbon') }]}>
            {product.carbonFootprint} kg CO₂
          </Text>
          <Text style={styles.metricDescription}>per unit</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="water-drop" size={24} color={getImpactColor(product.waterUsage, 'water')} />
            <Text style={styles.metricTitle}>Water Usage</Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.waterUsage, 'water') }]}>
            {product.waterUsage} L
          </Text>
          <Text style={styles.metricDescription}>per unit</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="local-shipping" size={24} color={getImpactColor(product.foodMiles, 'miles')} />
            <Text style={styles.metricTitle}>Food Miles</Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.foodMiles, 'miles') }]}>
            {product.foodMiles} km
          </Text>
          <Text style={styles.metricDescription}>distance traveled</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Icon name="inventory" size={24} color={getImpactColor(product.packagingImpact, 'packaging')} />
            <Text style={styles.metricTitle}>Packaging Impact</Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.packagingImpact, 'packaging') }]}>
            {product.packagingImpact}/10
          </Text>
          <Text style={styles.metricDescription}>environmental impact</Text>
        </View>
      </View>

      {/* Supply Chain Button */}
      <TouchableOpacity style={styles.supplyChainButton} onPress={handleSupplyChain}>
        <LinearGradient
          colors={['#2196F3', '#1976D2']}
          style={styles.supplyChainGradient}
        >
          <Icon name="public" size={24} color="#ffffff" />
          <Text style={styles.supplyChainText}>View Supply Chain Journey</Text>
          <Icon name="arrow-forward" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Better Alternatives</Text>
          <Text style={styles.recommendationsSubtitle}>
            More sustainable options in the same category
          </Text>
          
          {recommendations.slice(0, 3).map((recommendation) => (
            <TouchableOpacity
              key={recommendation.id}
              style={styles.recommendationCard}
              onPress={() => handleRecommendation(recommendation)}
            >
              <Image source={{ uri: recommendation.image }} style={styles.recommendationImage} />
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationName}>{recommendation.name}</Text>
                <Text style={styles.recommendationBrand}>{recommendation.brand}</Text>
                <View style={styles.recommendationScore}>
                  <Text style={[styles.recommendationScoreText, { color: getSustainabilityColor(recommendation.sustainabilityScore) }]}>
                    {recommendation.sustainabilityScore}/100
                  </Text>
                </View>
              </View>
              <Icon name="arrow-forward" size={20} color="#666666" />
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 24,
    color: '#666666',
    marginLeft: 4,
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: '#666666',
  },
  supplyChainButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  supplyChainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  supplyChainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 8,
  },
  recommendationsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  recommendationsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  recommendationBrand: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  recommendationScore: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  recommendationScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
