import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieAnimationProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: any;
  onAnimationFinish?: () => void;
  onAnimationStart?: () => void;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
  onAnimationStart,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  const handleAnimationFinish = () => {
    if (onAnimationFinish) {
      onAnimationFinish();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={handleAnimationFinish}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LottieAnimation;
