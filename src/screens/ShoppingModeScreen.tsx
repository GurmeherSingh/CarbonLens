import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../../App';
import { getProductByBarcode } from '../services/ProductService';

type ShoppingModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ShoppingMode'>;

interface ShoppingItem {
  id: string;
  product: Product;
  addedAt: Date;
}

const ShoppingModeScreen: React.FC = () => {
  const navigation = useNavigation<ShoppingModeScreenNavigationProp>();
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addItemByBarcode = async (barcode: string) => {
    try {
      // First try to get product by barcode
      let product = await getProductByBarcode(barcode);
      
      if (!product) {
        // If not found in database, create a mock product for the barcode
        product = {
          id: `barcode-${barcode}`,
          name: `Product ${barcode.slice(-4)}`, // Use last 4 digits as identifier
          brand: 'Scanned Item',
          category: 'Unknown',
          image: 'https://via.placeholder.com/150x150?text=Barcode+Product',
          carbonFootprint: Math.random() * 5 + 0.5, // Random between 0.5-5.5 kg CO2
          waterUsage: Math.random() * 500 + 50, // Random between 50-550 liters
          foodMiles: Math.random() * 1000 + 100, // Random between 100-1100 km
          packagingImpact: Math.floor(Math.random() * 10) + 1, // Random 1-10
          sustainabilityScore: Math.floor(Math.random() * 40) + 40, // Random 40-80
          supplyChain: [],
          barcode: barcode,
          price: Math.random() * 50 + 5 // Random $5-55
        };
      }
      
      const newItem: ShoppingItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        addedAt: new Date(),
      };
      setShoppingList(prev => [...prev, newItem]);
      setShowScanner(false);
      
      // Show success message
      Alert.alert('Item Added', `Added ${product.name} to your shopping list!`);
    } catch (error) {
      console.error('Error adding product by barcode:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    }
  };


  const removeItem = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const totalCarbon = shoppingList.reduce((sum, item) => sum + item.product.carbonFootprint, 0);
    const totalWater = shoppingList.reduce((sum, item) => sum + item.product.waterUsage, 0);
    const totalMiles = shoppingList.reduce((sum, item) => sum + item.product.foodMiles, 0);
    const avgScore = shoppingList.length > 0 
      ? shoppingList.reduce((sum, item) => sum + item.product.sustainabilityScore, 0) / shoppingList.length
      : 0;

    return {
      totalCarbon: Math.round(totalCarbon * 100) / 100,
      totalWater: Math.round(totalWater),
      totalMiles: Math.round(totalMiles),
      averageScore: Math.round(avgScore),
      itemCount: shoppingList.length
    };
  };

  const getTreesEquivalent = (carbonKg: number) => {
    // Approximate: 1 mature tree absorbs ~21 kg CO2 per year
    return Math.round(carbonKg / 21 * 100) / 100;
  };

  const handleCheckout = () => {
    if (shoppingList.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your shopping list first.');
      return;
    }
    setShowCheckout(true);
  };

  const handleBackToShopping = () => {
    setShowCheckout(false);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setShoppingList([]) }
      ]
    );
  };

  if (showCheckout) {
    const totals = calculateTotals();
    const treesEquivalent = getTreesEquivalent(totals.totalCarbon);

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToShopping}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout Summary</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Environmental Impact Summary</Text>
            <Text style={styles.summarySubtitle}>
              Based on {totals.itemCount} item{totals.itemCount !== 1 ? 's' : ''}
            </Text>

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Icon name="eco" size={32} color="#4CAF50" />
                <Text style={styles.metricValue}>{totals.totalCarbon} kg</Text>
                <Text style={styles.metricLabel}>Total CO₂ Footprint</Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="park" size={32} color="#66BB6A" />
                <Text style={styles.metricValue}>{treesEquivalent}</Text>
                <Text style={styles.metricLabel}>Trees Required</Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="local-shipping" size={32} color="#FF9800" />
                <Text style={styles.metricValue}>{totals.totalMiles} km</Text>
                <Text style={styles.metricLabel}>Total Miles</Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="water-drop" size={32} color="#2196F3" />
                <Text style={styles.metricValue}>{totals.totalWater} L</Text>
                <Text style={styles.metricLabel}>Water Usage</Text>
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Average Sustainability Score</Text>
              <Text style={[styles.scoreValue, { 
                color: totals.averageScore >= 80 ? '#4CAF50' : 
                       totals.averageScore >= 60 ? '#FFC107' : '#F44336' 
              }]}>
                {totals.averageScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            <Text style={styles.itemsTitle}>Items in Cart</Text>
            {shoppingList.map((item) => (
              <View key={item.id} style={styles.checkoutItem}>
                <Image source={{ uri: item.product.image }} style={styles.checkoutImage} />
                <View style={styles.checkoutItemInfo}>
                  <Text style={styles.checkoutItemName}>{item.product.name}</Text>
                  <Text style={styles.checkoutItemBrand}>{item.product.brand}</Text>
                  {item.product.barcode && (
                    <Text style={styles.checkoutItemBarcode}>Barcode: {item.product.barcode}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.checkoutActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowCheckout(false);
              setShoppingList([]);
              navigation.navigate('Home');
            }}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.actionButtonGradient}
            >
              <Icon name="check" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Complete Purchase</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Mode</Text>
        {shoppingList.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Icon name="clear-all" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {shoppingList.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="barcode" size={64} color="#cccccc" />
            <Text style={styles.emptyTitle}>Start Adding Items</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to manually enter product barcodes and build your shopping list
            </Text>
            <View style={styles.emptyInfo}>
              <Text style={styles.emptyInfoText}>📝 Enter any product barcode manually</Text>
              <Text style={styles.emptyInfoText}>🏷️ EAN-13, UPC-A, Code 128 supported</Text>
              <Text style={styles.emptyInfoText}>🌱 Get environmental impact summary</Text>
            </View>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>
              Shopping List ({shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''})
            </Text>
            {shoppingList.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemBrand}>{item.product.brand}</Text>
                  <Text style={styles.itemCategory}>{item.product.category}</Text>
                  {item.product.barcode && (
                    <View style={styles.barcodeContainer}>
                      <Icon name="barcode" size={14} color="#666666" />
                      <Text style={styles.barcodeText}>{item.product.barcode}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Icon name="close" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowScanner(true)}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.addButtonGradient}
          >
            <Icon name="add" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </LinearGradient>
        </TouchableOpacity>

        {shoppingList.length > 0 && (
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.checkoutButtonGradient}
            >
              <Icon name="shopping-cart" size={20} color="#ffffff" />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Scanner Modal */}
      <Modal
        visible={showScanner}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.scannerModal}>
            <Text style={styles.scannerTitle}>Add Product</Text>
            <Text style={styles.scannerSubtitle}>Enter a product barcode to add to your shopping list</Text>

            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => {
                Alert.prompt(
                  'Enter Barcode',
                  'Type the product barcode (EAN-13, UPC, etc.)',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Add Item', onPress: addItemByBarcode }
                  ],
                  'plain-text',
                  '',
                  'number-pad'
                );
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.manualEntryGradient}
              >
                <Icon name="barcode" size={48} color="#ffffff" />
                <Text style={styles.manualEntryText}>Enter Barcode Manually</Text>
                <Text style={styles.manualEntrySubtext}>Type any product barcode</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.barcodeInfo}>
              <Text style={styles.barcodeInfoTitle}>Manual Entry Instructions:</Text>
              <Text style={styles.barcodeInfoText}>• Type any product barcode number</Text>
              <Text style={styles.barcodeInfoText}>• EAN-13 (13 digits), UPC-A (12 digits)</Text>
              <Text style={styles.barcodeInfoText}>• Any numeric barcode will work</Text>
              <Text style={styles.barcodeInfoText}>• Environmental data will be generated automatically</Text>
            </View>

            <TouchableOpacity
              style={styles.closeScannerButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.closeScannerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyInfo: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  emptyInfoText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 6,
    textAlign: 'center',
  },
  itemsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  itemCard: {
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999999',
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  barcodeText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  addButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkoutButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  manualEntryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  manualEntryGradient: {
    padding: 32,
    alignItems: 'center',
  },
  manualEntryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 6,
  },
  manualEntrySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  closeScannerButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  closeScannerText: {
    fontSize: 16,
    color: '#666666',
  },
  barcodeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  barcodeInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  barcodeInfoText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  checkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkoutImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  checkoutItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checkoutItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  checkoutItemBrand: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  checkoutItemBarcode: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  checkoutActions: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default ShoppingModeScreen;
