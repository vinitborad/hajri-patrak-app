import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

const ProfileScreen = () => {

  const router = useRouter();

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('role');
    router.replace('/');
  };

  return (
    <View>
      <Text>ProfileScreen</Text>
            {/* Logout Button */}
            <View className='flex items-center mt-auto mb-24'>
        <TouchableOpacity
          className="flex-row justify-center items-center py-2 bg-[#FF6B6B] rounded-3xl w-1/2"
          onPress={onSignOut}
        >
          <MaterialIcons name="logout" size={24} color="white" />
          <Text className="text-white text-center text-lg font-NunitoExtraBold ml-4">LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProfileScreen