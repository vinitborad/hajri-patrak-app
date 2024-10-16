import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

const CreateDataScreen = () => {

  const router = useRouter();

  return (
    <View className='flex-1 bg-[#1E1E1E]'>

      <ScrollView className='w-full'>
        <View className='flex items-center w-full p-6 gap-y-4'>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#54a178] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data/create-faculty')}
          >
            <Feather name="plus" size={24} color="#54a178" />
            <Text className="text-[#54a178] text-lg ml-4 font-NunitoBold">Create Faculty</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#FF6B6B] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data/create-division')}
          >
            <Feather name="plus" size={24} color="#FF6B6B" />
            <Text className="text-[#FF6B6B] text-lg ml-4 font-NunitoBold">Create Division</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#e2fa7e] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data/create-subject')}
          >
            <Feather name="plus" size={24} color="#e2fa7e" />
            <Text className="text-[#e2fa7e] text-lg ml-4 font-NunitoBold">Create Subject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#9DBDFF] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data/create-student')}
          >
            <Feather name="plus" size={24} color="#9DBDFF" />
            <Text className="text-[#9DBDFF] text-lg ml-4 font-NunitoBold">Create Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='flex-row justify-center items-center border border-[#9DBDFF] py-4 rounded-lg bg-[#3b3e44] gap-x-2 w-full'
            onPress={() => router.push('/admin/(tabs)/home/create-data/create-students-sheet')}
          >
            <MaterialCommunityIcons name="google-spreadsheet" size={24} color="#9DBDFF" />
            <Text className="text-[#9DBDFF] text-lg ml-4 font-NunitoBold">Students Sheet</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </View>
  )
}

export default CreateDataScreen