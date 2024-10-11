import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { Feather, FontAwesome } from '@expo/vector-icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const icon: { [key: string]: (props: any) => JSX.Element } = {
  home: (props: any) => <Feather name='home' size={24} {...props} />,
  material: (props: any) => <FontAwesome name='files-o' size={24} {...props} />,
  profile: (props: any) => <Feather name='user' size={24} {...props} />
};

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName, color, label }:
  {
    onPress: (event: GestureResponderEvent) => void,
    onLongPress: (event: GestureResponderEvent) => void,
    isFocused: boolean,
    routeName: string,
    color: string,
    label: string
  }) => {

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused, { duration: 350 });
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.3]);
    const top = interpolate(scale.value, [0, 1], [0, 12]);
    return {
      transform: [{
        scale: scaleValue
      }],
      top
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return {
      opacity
    }
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle} className="flex items-center justify-center">
        {icon[routeName]({
          color: isFocused ? '#FFF' : '#DCE6EC'
        })}
        <Animated.Text style={[{ color: isFocused ? '#673ab7' : '#DCE6EC', fontSize: 12 }, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default TabBarButton;

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})