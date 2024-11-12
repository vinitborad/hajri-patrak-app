import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'
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
            className='flex-row justify-center items-center border border-[#5871ff] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/view-students-data')}
          >
            <FontAwesome name="database" size={24} color="#5871ff" />
            <Text className="text-[#5871ff] text-lg ml-4 font-NunitoBold">View Students Data</Text>
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
            className='flex-row justify-center items-center border border-[#f19640] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data')}
          >
            <Feather name="plus" size={24} color="#f19640" />
            <Text className="text-[#f19640] text-lg ml-4 font-NunitoBold">Create New Entities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#be4040] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/upgrade-divisions')}
          >
            <MaterialIcons name="upgrade" size={24} color="#be4040" />
            <Text className="text-[#be4040] text-lg ml-4 font-NunitoBold">Semester Upgrades</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </View>
  )
}

export default HomeScreen