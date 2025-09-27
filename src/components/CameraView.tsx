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
import { RNCamera } from 'react-native-camera';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
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
      
      // Capture image from camera
      const imageUri = await captureImage();
      
      if (!imageUri) {
        Alert.alert('Capture Failed', 'Could not capture image. Please try again.');
        return;
      }
      
      console.log('Captured image for analysis:', imageUri);
      
      // Detect product using real AI service
      const detectedProduct = await detectProduct(imageUri);
      
      if (detectedProduct) {
        setDetectedProducts(prev => [...prev, detectedProduct]);
        
        // Navigate to product detail after a short delay
        setTimeout(() => {
          onProductDetected(detectedProduct);
        }, 2000);
      } else {
        Alert.alert('Detection Failed', 'Could not identify the product. Please try again.');
      }
    } catch (error) {
      console.error('Product detection error:', error);
      Alert.alert('Detection Failed', 'Could not identify the product. Please try again.');
    }
  };

  const captureImage = async (): Promise<string | null> => {
    try {
      console.log('📸 Capturing image...');
      
      return new Promise((resolve, reject) => {
        const options = {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          includeBase64: true,
          maxWidth: 1024,
          maxHeight: 1024,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
          if (response.didCancel) {
            console.log('User cancelled camera');
            resolve(null);
          } else if (response.errorMessage) {
            console.error('Camera error:', response.errorMessage);
            reject(new Error(response.errorMessage));
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              console.log('✅ Image captured successfully:', asset.uri);
              resolve(asset.uri);
            } else if (asset.base64) {
              console.log('✅ Image captured as base64');
              resolve(`data:image/jpeg;base64,${asset.base64}`);
            } else {
              console.error('No image data received');
              reject(new Error('No image data received'));
            }
          } else {
            console.error('No assets in response');
            reject(new Error('No assets in response'));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error capturing image:', error);
      return null;
    }
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const selectFromGallery = async () => {
    try {
      console.log('📁 Opening gallery...');
      
      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      launchImageLibrary(options, async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorMessage) {
          console.error('Gallery error:', response.errorMessage);
          Alert.alert('Gallery Error', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            console.log('✅ Image selected from gallery:', asset.uri);
            
            // Detect product from selected image
            const detectedProduct = await detectProduct(asset.uri);
            
            if (detectedProduct) {
              setDetectedProducts(prev => [...prev, detectedProduct]);
              setTimeout(() => {
                onProductDetected(detectedProduct);
              }, 1000);
            } else {
              Alert.alert('Detection Failed', 'Could not identify the product. Please try again.');
            }
          }
        }
      });
    } catch (error) {
      console.error('❌ Error selecting from gallery:', error);
      Alert.alert('Gallery Error', 'Could not access gallery. Please try again.');
    }
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
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#9C27B0' }]}
            onPress={selectFromGallery}
          >
            <Icon name="photo-library" size={24} color="#ffffff" />
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
              : 'Tap camera to scan or gallery to select image'
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
