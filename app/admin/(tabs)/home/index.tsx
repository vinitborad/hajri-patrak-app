import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const HomeScreen = () => {

  const router = useRouter();

  return (
    <View className='flex-1 bg-[#1E1E1E]'>

      <ScrollView className='w-full'>
        <View className='flex items-center w-full p-6 gap-y-4'>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#ffe37c] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/view-data')}
          >
            <FontAwesome name="database" size={24} color="#ffe37c" />
            <Text className="text-[#ffe37c] text-lg ml-4 font-NunitoBold">View Data Structure</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#54a178] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/atom-student')}
          >
            <Ionicons name="person" size={24} color="#54a178" />
            <Text className="text-[#54a178] text-lg ml-4 font-NunitoBold">Student Information</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#e2fa7e] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/atom-faculty')}
          >
            <Ionicons name="person" size={24} color="#e2fa7e" />
            <Text className="text-[#e2fa7e] text-lg ml-4 font-NunitoBold">Faculty Information</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#920707] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data')}
          >
            <Feather name="plus" size={24} color="#F6F5F5" />
            <Text className="text-[#F6F5F5] text-lg ml-4 font-NunitoBold">Create New Entities</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </View>
  )
}

export default HomeScreen