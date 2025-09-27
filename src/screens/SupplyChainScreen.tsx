import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product, SupplyChainStep } from '../../App';

type SupplyChainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SupplyChain'>;
type SupplyChainScreenRouteProp = RouteProp<RootStackParamList, 'SupplyChain'>;

const { width, height } = Dimensions.get('window');

const SupplyChainScreen: React.FC = () => {
  const navigation = useNavigation<SupplyChainScreenNavigationProp>();
  const route = useRoute<SupplyChainScreenRouteProp>();
  const { product } = route.params;
  
  const [selectedStep, setSelectedStep] = useState<SupplyChainStep | null>(null);
  const [animationProgress] = useState(new Animated.Value(0));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationProgress, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animationProgress, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'farm': return 'agriculture';
      case 'processing': return 'build';
      case 'transport': return 'local-shipping';
      case 'retail': return 'store';
      default: return 'place';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'farm': return '#4CAF50';
      case 'processing': return '#2196F3';
      case 'transport': return '#FF9800';
      case 'retail': return '#9C27B0';
      default: return '#666666';
    }
  };

  const getTotalCarbonFootprint = () => {
    return product.supplyChain.reduce((sum, step) => sum + step.carbonFootprint, 0);
  };

  const getTotalDuration = () => {
    return product.supplyChain.reduce((sum, step) => sum + step.duration, 0);
  };

  const getMapRegion = () => {
    if (product.supplyChain.length === 0) return null;
    
    const latitudes = product.supplyChain.map(step => step.location.latitude);
    const longitudes = product.supplyChain.map(step => step.location.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.1),
      longitudeDelta: Math.max(lngDelta, 0.1),
    };
  };

  const getCoordinates = () => {
    return product.supplyChain.map(step => ({
      latitude: step.location.latitude,
      longitude: step.location.longitude,
    }));
  };

  const region = getMapRegion();
  const coordinates = getCoordinates();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supply Chain Journey</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
      </View>

      {/* Map */}
      {region && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {/* Supply Chain Route */}
            {coordinates.length > 1 && (
              <Polyline
                coordinates={coordinates}
                strokeColor="#4CAF50"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
            
            {/* Supply Chain Steps */}
            {product.supplyChain.map((step, index) => (
              <Marker
                key={step.id}
                coordinate={{
                  latitude: step.location.latitude,
                  longitude: step.location.longitude,
                }}
                title={step.name}
                description={`${step.type} • ${step.duration} days`}
                onPress={() => setSelectedStep(step)}
              >
                <View style={[styles.marker, { backgroundColor: getStepColor(step.type) }]}>
                  <Icon name={getStepIcon(step.type)} size={20} color="#ffffff" />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      )}

      {/* Supply Chain Steps */}
      <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Journey Steps</Text>
        
        {product.supplyChain.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={[
              styles.stepCard,
              selectedStep?.id === step.id && styles.stepCardSelected
            ]}
            onPress={() => setSelectedStep(step)}
          >
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: getStepColor(step.type) }]}>
                <Icon name={getStepIcon(step.type)} size={20} color="#ffffff" />
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepName}>{step.name}</Text>
                <Text style={styles.stepLocation}>
                  {step.location.city}, {step.location.country}
                </Text>
              </View>
              <View style={styles.stepDuration}>
                <Text style={styles.durationText}>{step.duration} days</Text>
              </View>
            </View>
            
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.stepMetrics}>
              <View style={styles.metric}>
                <Icon name="eco" size={16} color="#4CAF50" />
                <Text style={styles.metricText}>
                  {step.carbonFootprint}kg CO₂
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Journey Summary</Text>
          <View style={styles.summaryMetrics}>
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryMetricValue}>
                {getTotalCarbonFootprint().toFixed(1)}kg
              </Text>
              <Text style={styles.summaryMetricLabel}>Total CO₂</Text>
            </View>
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryMetricValue}>
                {getTotalDuration()} days
              </Text>
              <Text style={styles.summaryMetricLabel}>Total Duration</Text>
            </View>
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryMetricValue}>
                {product.supplyChain.length}
              </Text>
              <Text style={styles.summaryMetricLabel}>Steps</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  productInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#666666',
  },
  mapContainer: {
    height: 250,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  stepCard: {
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
  stepCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  stepLocation: {
    fontSize: 14,
    color: '#666666',
  },
  stepDuration: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryMetric: {
    alignItems: 'center',
  },
  summaryMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryMetricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default SupplyChainScreen;
