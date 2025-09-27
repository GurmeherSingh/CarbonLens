import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../App';

interface ARVisualizationProps {
  product: Product;
  position: { x: number; y: number; z: number };
  isVisible: boolean;
  onTap?: () => void;
}

const ARVisualization: React.FC<ARVisualizationProps> = ({
  product,
  position,
  isVisible,
  onTap,
}) => {
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Entrance animation
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(scaleAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getSustainabilityGradient = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#8BC34A'];
    if (score >= 60) return ['#FFC107', '#FFEB3B'];
    if (score >= 40) return ['#FF9800', '#FFB74D'];
    return ['#F44336', '#E57373'];
  };

  const getImpactIcon = (score: number) => {
    if (score >= 80) return 'eco';
    if (score >= 60) return 'check-circle';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const sustainabilityColor = getSustainabilityColor(product.sustainabilityScore);
  const gradientColors = getSustainabilityGradient(product.sustainabilityScore);
  const impactIcon = getImpactIcon(product.sustainabilityScore);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnimation },
            { scale: pulseAnimation },
          ],
          left: position.x,
          top: position.y,
          zIndex: Math.round(position.z * 1000),
        },
      ]}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: sustainabilityColor,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Main Card */}
      <LinearGradient
        colors={gradientColors}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productBrand} numberOfLines={1}>
            {product.brand}
          </Text>
        </View>

        {/* Sustainability Score */}
        <View style={styles.scoreContainer}>
          <Icon name={impactIcon} size={16} color="#ffffff" />
          <Text style={styles.scoreText}>
            {product.sustainabilityScore}/100
          </Text>
        </View>

        {/* Environmental Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Icon name="eco" size={12} color="#ffffff" />
            <Text style={styles.metricText}>
              {product.carbonFootprint}kg CO₂
            </Text>
          </View>
          <View style={styles.metric}>
            <Icon name="water-drop" size={12} color="#ffffff" />
            <Text style={styles.metricText}>
              {product.waterUsage}L
            </Text>
          </View>
        </View>

        {/* Tap Indicator */}
        <View style={styles.tapIndicator}>
          <Icon name="touch-app" size={12} color="#ffffff" />
          <Text style={styles.tapText}>Tap for details</Text>
        </View>
      </LinearGradient>

      {/* Connection Line */}
      <View style={styles.connectionLine} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 140,
    height: 120,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 140,
    borderRadius: 20,
    top: -10,
    left: -10,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flex: 1,
    marginHorizontal: 2,
  },
  metricText: {
    fontSize: 8,
    color: '#ffffff',
    marginLeft: 2,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    paddingVertical: 2,
  },
  tapText: {
    fontSize: 8,
    color: '#ffffff',
    marginLeft: 2,
  },
  connectionLine: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    transform: [{ translateX: -1 }],
  },
});

export default ARVisualization;
