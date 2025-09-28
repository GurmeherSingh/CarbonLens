import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PlantAnimation from './PlantAnimation';

const PlantAnimationTest: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleStartAnimation = () => {
    setShowAnimation(true);
  };

  const handleAnimationFinish = () => {
    setShowAnimation(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Animation Test</Text>
      <Text style={styles.subtitle}>Test the plant.json Lottie animation</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleStartAnimation}
      >
        <Text style={styles.buttonText}>Start Plant Animation</Text>
      </TouchableOpacity>

      <PlantAnimation
        visible={showAnimation}
        onAnimationFinish={handleAnimationFinish}
        text="Testing Plant Animation..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlantAnimationTest;
