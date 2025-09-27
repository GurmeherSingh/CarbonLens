import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../App';

interface EnvironmentalImpactCardProps {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
}

const EnvironmentalImpactCard: React.FC<EnvironmentalImpactCardProps> = ({
  product,
  onPress,
  compact = false,
}) => {
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
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

  const sustainabilityColor = getSustainabilityColor(product.sustainabilityScore);

  const CardContent = () => (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, compact && styles.compactTitle]}>
            Environmental Impact
          </Text>
          <View style={[styles.scoreBadge, { backgroundColor: sustainabilityColor }]}>
            <Text style={styles.scoreText}>{product.sustainabilityScore}/100</Text>
          </View>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={[styles.metricsGrid, compact && styles.compactMetricsGrid]}>
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Icon 
              name="eco" 
              size={compact ? 16 : 20} 
              color={getImpactColor(product.carbonFootprint, 'carbon')} 
            />
            <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>
              Carbon Footprint
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.carbonFootprint, 'carbon') }]}>
            {product.carbonFootprint}kg CO₂
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Icon 
              name="water-drop" 
              size={compact ? 16 : 20} 
              color={getImpactColor(product.waterUsage, 'water')} 
            />
            <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>
              Water Usage
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.waterUsage, 'water') }]}>
            {product.waterUsage}L
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Icon 
              name="local-shipping" 
              size={compact ? 16 : 20} 
              color={getImpactColor(product.foodMiles, 'miles')} 
            />
            <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>
              Food Miles
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.foodMiles, 'miles') }]}>
            {product.foodMiles}km
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Icon 
              name="inventory" 
              size={compact ? 16 : 20} 
              color={getImpactColor(product.packagingImpact, 'packaging')} 
            />
            <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>
              Packaging
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getImpactColor(product.packagingImpact, 'packaging') }]}>
            {product.packagingImpact}/10
          </Text>
        </View>
      </View>

      {/* Sustainability Rating */}
      <View style={styles.ratingContainer}>
        <LinearGradient
          colors={[sustainabilityColor, sustainabilityColor + '80']}
          style={styles.ratingGradient}
        >
          <Icon name="star" size={16} color="#ffffff" />
          <Text style={styles.ratingText}>
            {product.sustainabilityScore >= 80 ? 'Excellent' :
             product.sustainabilityScore >= 60 ? 'Good' :
             product.sustainabilityScore >= 40 ? 'Fair' : 'Poor'}
          </Text>
        </LinearGradient>
      </View>

      {!compact && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap to view detailed supply chain information
          </Text>
          <Icon name="arrow-forward" size={16} color="#666666" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactContainer: {
    padding: 16,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  compactTitle: {
    fontSize: 16,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  compactMetricsGrid: {
    marginBottom: 12,
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    flex: 1,
  },
  compactMetricLabel: {
    fontSize: 10,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginBottom: 12,
  },
  ratingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
});

export default EnvironmentalImpactCard;
