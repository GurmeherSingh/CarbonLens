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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getEnvironmentalImpactSummary } from '../services/ProductService';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [impactSummary, setImpactSummary] = useState({
    totalCarbon: 0,
    totalWater: 0,
    totalMiles: 0,
    averageScore: 0,
    productCount: 0
  });

  useEffect(() => {
    loadImpactSummary();
  }, []);

  const loadImpactSummary = async () => {
    try {
      // In a real app, this would fetch actual user data
      const summary = {
        totalCarbon: 15.2,
        totalWater: 2840,
        totalMiles: 3200,
        averageScore: 72,
        productCount: 24
      };
      setImpactSummary(summary);
    } catch (error) {
      console.error('Error loading impact summary:', error);
    }
  };

  const getAchievementLevel = (score: number) => {
    if (score >= 90) return { level: 'Eco Champion', color: '#4CAF50', icon: 'emoji-events' };
    if (score >= 80) return { level: 'Green Warrior', color: '#8BC34A', icon: 'eco' };
    if (score >= 70) return { level: 'Eco Explorer', color: '#FFC107', icon: 'explore' };
    if (score >= 60) return { level: 'Eco Learner', color: '#FF9800', icon: 'school' };
    return { level: 'Eco Starter', color: '#F44336', icon: 'trending-up' };
  };

  const achievement = getAchievementLevel(impactSummary.averageScore);

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality would be implemented here');
  };

  const handleAchievements = () => {
    Alert.alert('Achievements', 'Achievement system would be implemented here');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share your sustainability journey with friends!');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Icon name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: achievement.color }]}>
            <Icon name="person" size={40} color="#ffffff" />
          </View>
          <View style={[styles.achievementBadge, { backgroundColor: achievement.color }]}>
            <Icon name={achievement.icon} size={16} color="#ffffff" />
          </View>
        </View>
        
        <Text style={styles.userName}>EcoLens User</Text>
        <Text style={[styles.achievementLevel, { color: achievement.color }]}>
          {achievement.level}
        </Text>
        <Text style={styles.userDescription}>
          Making sustainable choices one scan at a time
        </Text>
      </View>

      {/* Sustainability Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Your Sustainability Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: achievement.color }]}>
            {impactSummary.averageScore}
          </Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
        <Text style={styles.scoreDescription}>
          Based on {impactSummary.productCount} product scans
        </Text>
      </View>

      {/* Impact Summary */}
      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Your Environmental Impact</Text>
        
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Icon name="eco" size={32} color="#4CAF50" />
            <Text style={styles.impactValue}>{impactSummary.totalCarbon}kg</Text>
            <Text style={styles.impactLabel}>CO₂ Tracked</Text>
          </View>
          
          <View style={styles.impactCard}>
            <Icon name="water-drop" size={32} color="#2196F3" />
            <Text style={styles.impactValue}>{impactSummary.totalWater}L</Text>
            <Text style={styles.impactLabel}>Water Tracked</Text>
          </View>
          
          <View style={styles.impactCard}>
            <Icon name="local-shipping" size={32} color="#FF9800" />
            <Text style={styles.impactValue}>{impactSummary.totalMiles}km</Text>
            <Text style={styles.impactLabel}>Miles Tracked</Text>
          </View>
          
          <View style={styles.impactCard}>
            <Icon name="inventory" size={32} color="#9C27B0" />
            <Text style={styles.impactValue}>{impactSummary.productCount}</Text>
            <Text style={styles.impactLabel}>Products Scanned</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleAchievements}>
          <View style={styles.actionContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFC107' }]}>
              <Icon name="emoji-events" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Achievements</Text>
              <Text style={styles.actionDescription}>View your sustainability badges</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#666666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleShare}>
          <View style={styles.actionContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Icon name="share" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Share Impact</Text>
              <Text style={styles.actionDescription}>Share your sustainability journey</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#666666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AR')}>
          <View style={styles.actionContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
              <Icon name="camera-alt" size={24} color="#ffffff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Start Scanning</Text>
              <Text style={styles.actionDescription}>Continue your sustainable journey</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#666666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Sustainability Tips</Text>
        
        <View style={styles.tipCard}>
          <Icon name="lightbulb" size={24} color="#FFC107" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Choose Local Products</Text>
            <Text style={styles.tipDescription}>
              Local products have lower food miles and support your community
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Icon name="recycling" size={24} color="#4CAF50" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Look for Minimal Packaging</Text>
            <Text style={styles.tipDescription}>
              Products with less packaging have lower environmental impact
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Icon name="eco" size={24} color="#8BC34A" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Choose Plant-Based Options</Text>
            <Text style={styles.tipDescription}>
              Plant-based products generally have lower carbon footprints
            </Text>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  achievementLevel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  userDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  scoreCard: {
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
  scoreTitle: {
    fontSize: 18,
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
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  impactSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default ProfileScreen;
