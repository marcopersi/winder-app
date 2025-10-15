import { useRef, useCallback } from 'react';
import { Dimensions, Animated } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface UseSwipeGesturesProps {
  onSwipe: (direction: 'left' | 'right') => void;
}

interface SwipeGestureHandlers {
  handleTouchStart: (event: any) => void;
  handleTouchMove: (event: any) => void;
  handleTouchEnd: () => void;
  animatedStyle: any;
  resetAnimation: () => void;
}

export const useSwipeGestures = ({ onSwipe }: UseSwipeGesturesProps): SwipeGestureHandlers => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((event: any) => {
    const touch = event.nativeEvent.touches[0];
    startX.current = touch.pageX;
    currentX.current = touch.pageX;
    isDragging.current = true;

    // Scale down slightly on touch
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handleTouchMove = useCallback((event: any) => {
    if (!isDragging.current) return;

    const touch = event.nativeEvent.touches[0];
    currentX.current = touch.pageX;
    const distance = currentX.current - startX.current;
    
    // Update translation
    translateX.setValue(distance);
    
    // Update opacity based on distance
    const progress = Math.abs(distance) / SCREEN_WIDTH;
    opacity.setValue(Math.max(0.7, 1 - progress * 0.3));
  }, [translateX, opacity]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    
    const distance = currentX.current - startX.current;
    const shouldSwipe = Math.abs(distance) > SWIPE_THRESHOLD;

    if (shouldSwipe) {
      const direction = distance > 0 ? 'right' : 'left';
      const endX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      
      // Animate out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: endX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onSwipe(direction);
      });
    } else {
      // Snap back
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }

    isDragging.current = false;
  }, [translateX, opacity, scale, onSwipe]);

  const resetAnimation = useCallback(() => {
    translateX.setValue(0);
    opacity.setValue(1);
    scale.setValue(1);
    isDragging.current = false;
  }, [translateX, opacity, scale]);

  const animatedStyle = {
    transform: [
      { translateX },
      { scale },
      {
        rotate: translateX.interpolate({
          inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          outputRange: ['-15deg', '0deg', '15deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
    opacity,
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    animatedStyle,
    resetAnimation,
  };
};