import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../../App';
import { detectProduct, getProductByBarcode } from '../services/ProductService';
import { requestCameraPermission } from '../utils/Permissions';
import ARVisualization from '../components/ARVisualization';

type ARScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AR'>;

const { width, height } = Dimensions.get('window');

interface DetectedProduct {
  product: Product;
  position: { x: number; y: number; z: number };
  confidence: number;
}

const ARScreen: React.FC = () => {
  const navigation = useNavigation<ARScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    requestCameraPermission().then(setHasPermission);
  }, []);

  const handleProductDetected = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required for AR scanning</Text>
        <TouchableOpacity style={styles.button} onPress={() => requestCameraPermission().then(setHasPermission)}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <CameraView 
        onProductDetected={handleProductDetected}
        onClose={handleCloseCamera}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* AR Scanner Welcome Screen */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Icon name="camera-alt" size={80} color="#4CAF50" />
          <Text style={styles.welcomeTitle}>AR Scanner</Text>
          <Text style={styles.welcomeSubtitle}>
            Point your camera at products to see their environmental impact
          </Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowCamera(true)}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.startButtonGradient}
            >
              <Icon name="camera-alt" size={24} color="#ffffff" />
              <Text style={styles.startButtonText}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#666666" />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  message: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ARScreen;
