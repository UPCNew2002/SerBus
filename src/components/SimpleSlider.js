// src/components/SimpleSlider.js
// Slider simple sin dependencias externas
 
import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
 
export default function SimpleSlider({
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  minimumTrackTintColor = '#dc2626',
  maximumTrackTintColor = '#444',
  thumbTintColor = '#dc2626',
  style = {},
}) {
  const pan = useRef(new Animated.Value(0)).current;
  const sliderWidth = useRef(0);
 
  // Calcular posición del thumb basado en el valor
  const getThumbPosition = () => {
    const percentage = (value - minimumValue) / (maximumValue - minimumValue);
    return percentage * sliderWidth.current;
  };
 
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (e, gestureState) => {
        const position = Math.max(0, Math.min(sliderWidth.current, gestureState.moveX - gestureState.x0 + getThumbPosition()));
        const percentage = position / sliderWidth.current;
        const newValue = minimumValue + percentage * (maximumValue - minimumValue);
 
        if (onValueChange) {
          onValueChange(Math.round(newValue));
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;
 
  const handleLayout = (event) => {
    sliderWidth.current = event.nativeEvent.layout.width - 20; // 20 para el thumb
  };
 
  const thumbPosition = getThumbPosition();
 
  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View style={styles.track}>
        {/* Minimum track */}
        <View
          style={[
            styles.trackFill,
            {
              width: thumbPosition,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        {/* Maximum track */}
        <View
          style={[
            styles.trackRemaining,
            { backgroundColor: maximumTrackTintColor },
          ]}
        />
      </View>
 
      {/* Thumb */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            left: thumbPosition,
            backgroundColor: thumbTintColor,
            borderColor: thumbTintColor,
          },
        ]}
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#444',
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
  },
  trackRemaining: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
});