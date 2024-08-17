import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const profile = () => {

  const router = useRouter();

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('role'); 
    router.replace('/(auth)/sign-in');
  }

  return (
    <View
      className='flex-1 justify-center items-center bg-blue-50 p-5'
    >
      <Text>profile</Text>
      <View className='mt-3 mb-8'>
        <TouchableOpacity
          className="flex-row items-center p-2 bg-zinc-200 rounded-lg"
          onPress={onSignOut}
        >
          <MaterialIcons name="logout" size={24} color="black" />
          <Text className="text-zinc-900 text-center text-sms font-bold ml-4">LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default profile