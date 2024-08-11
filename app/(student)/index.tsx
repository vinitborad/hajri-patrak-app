
import { View, Text, Button, FlatList } from 'react-native'
import React from 'react'
import * as SecureStore from 'expo-secure-store'
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { studentProfileApi } from '@/api/profile';

const index = () => {

  const router = useRouter();

  const { data: profileData } = studentProfileApi(SecureStore.getItem('token') as string);

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    router.navigate('/(auth)/sign-in');
  }

  return (
    <View
      className='flex-1 justify-center items-center bg-gray-100 p-4'
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />

      <Button title="Sign Out" onPress={onSignOut} />

      <View>
        <Text>{profileData?.personalInfo.firstName}</Text>
        <Text>{profileData?.personalInfo.lastName}</Text>
      </View>

      <FlatList
        data={profileData?.allSubjects}
        renderItem={({ item }) => (
          <View className='bg-white p-4 m-2 rounded-lg shadow-md w-screen'>
            <Text className='text-lg font-semibold text-gray-800'>
              {item.subjectName}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

    </View>
  )
}

export default index