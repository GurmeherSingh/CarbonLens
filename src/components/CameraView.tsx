import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Product } from '../../App';
import { detectProduct } from '../services/ProductService';

const { width, height } = Dimensions.get('window');

interface CameraViewProps {
  onProductDetected: (product: Product) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onProductDetected, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState<Product[]>([]);
  const [scanningMode, setScanningMode] = useState<'camera' | 'barcode'>('camera');
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      // Start pulsing animation
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
      ).start();
    }
  }, [isScanning]);

  const handleProductDetection = async () => {
    if (!isScanning) return;
    
    try {
      setIsScanning(false);
      
      // Simulate product detection with mock data
      const mockProducts = [
        {
          id: '1',
          name: 'Organic Bananas',
          brand: 'Fresh Farm',
          category: 'Fruits',
          image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
          carbonFootprint: 0.8,
          waterUsage: 160,
          foodMiles: 1200,
          packagingImpact: 2,
          sustainabilityScore: 85,
          supplyChain: []
        },
        {
          id: '2',
          name: 'Almond Milk',
          brand: 'EcoDairy',
          category: 'Dairy Alternatives',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
          carbonFootprint: 0.7,
          waterUsage: 384,
          foodMiles: 800,
          packagingImpact: 3,
          sustainabilityScore: 75,
          supplyChain: []
        }
      ];
      
      // Randomly select a product
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      
      setDetectedProducts(prev => [...prev, randomProduct]);
      
      // Navigate to product detail after a short delay
      setTimeout(() => {
        onProductDetected(randomProduct);
      }, 2000);
    } catch (error) {
      console.error('Product detection error:', error);
      Alert.alert('Detection Failed', 'Could not identify the product. Please try again.');
    }
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      {/* Camera Background */}
      <View style={styles.cameraBackground}>
        {/* Mock Camera Feed */}
        <View style={styles.cameraFeed}>
          <Text style={styles.cameraText}>📷 Camera Feed</Text>
          <Text style={styles.cameraSubtext}>Point at products to scan</Text>
        </View>

        {/* Scanning Frame */}
        <Animated.View 
          style={[
            styles.scanningFrame,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        >
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>

        {/* Detected Products AR Elements */}
        {detectedProducts.map((product, index) => (
          <View
            key={product.id}
            style={[
              styles.arProduct,
              {
                left: 50 + (index * 20),
                top: 200 + (index * 30),
              }
            ]}
          >
            <LinearGradient
              colors={[getSustainabilityColor(product.sustainabilityScore), getSustainabilityColor(product.sustainabilityScore) + '80']}
              style={styles.arProductGradient}
            >
              <Text style={styles.arProductName}>{product.name}</Text>
              <Text style={styles.arProductScore}>
                {product.sustainabilityScore}/100
              </Text>
            </LinearGradient>
          </View>
        ))}

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isScanning ? '#F44336' : '#4CAF50' }]}
            onPress={isScanning ? stopScanning : startScanning}
          >
            <Icon 
              name={isScanning ? 'stop' : 'camera-alt'} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#2196F3' }]}
            onPress={handleProductDetection}
            disabled={!isScanning}
          >
            <Icon name="photo-camera" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanningMode === 'camera' && styles.modeButtonActive
            ]}
            onPress={() => setScanningMode('camera')}
          >
            <Text style={[
              styles.modeButtonText,
              scanningMode === 'camera' && styles.modeButtonTextActive
            ]}>
              Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanningMode === 'barcode' && styles.modeButtonActive
            ]}
            onPress={() => setScanningMode('barcode')}
          >
            <Text style={[
              styles.modeButtonText,
              scanningMode === 'barcode' && styles.modeButtonTextActive
            ]}>
              Barcode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isScanning 
              ? 'Point camera at product and tap capture' 
              : 'Tap the camera button to start scanning'
            }
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraBackground: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cameraFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    margin: 20,
    borderRadius: 16,
  },
  cameraText: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
  },
  cameraSubtext: {
    fontSize: 16,
    color: '#cccccc',
  },
  scanningFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginTop: -100,
    marginLeft: -100,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  arProduct: {
    position: 'absolute',
    width: 120,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  arProductGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  arProductName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arProductScore: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 2,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modeToggle: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraView;
