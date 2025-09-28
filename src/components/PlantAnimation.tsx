import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import plantAnimation from '../assets/animations/plant.json';

interface PlantAnimationProps {
  visible: boolean;
  onAnimationFinish?: () => void;
  text?: string;
}

const { width, height } = Dimensions.get('window');

const PlantAnimation: React.FC<PlantAnimationProps> = ({
  visible,
  onAnimationFinish,
  text = 'Analyzing...',
}) => {
  const animationRef = useRef<LottieView>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  React.useEffect(() => {
    if (visible && animationRef.current) {
      setAnimationComplete(false);
      animationRef.current.play();
    }
  }, [visible]);

  const handleAnimationFinish = () => {
    setAnimationComplete(true);
    if (onAnimationFinish) {
      onAnimationFinish();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={plantAnimation}
              autoPlay={true}
              loop={true}
              speed={0.35}
              onAnimationFinish={handleAnimationFinish}
              style={styles.animation}
            />
          </View>
          <Text style={styles.analyzingText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animationContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    textAlign: 'center',
  },
});

export default PlantAnimation;
