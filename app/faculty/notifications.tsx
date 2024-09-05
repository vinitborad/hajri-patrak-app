import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';

const NotificationsScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-[#1E1E1E] p-5">
      <FontAwesome name="rocket" size={80} color="#6c63ff" />
      <Text className="text-3xl font-bold text-[#6c63ff] my-5">Coming Soon...</Text>
    </View>
  );
};

export default NotificationsScreen;
