import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGetStudentProfile } from '@/api/profile';
import { Octicons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const Profile = () => {

  const router = useRouter();

  const { data: studentProfile } = useGetStudentProfile();

  // Handle loading state or return a placeholder
  if (!studentProfile) return null;

  const { personalInfo } = studentProfile;
  const { firstName, lastName, photoUrl } = personalInfo;

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('role');
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 bg-[#1E1E1E]">
      {/* Header with the background color and name */}
      <View className="bg-[#3b3e44] pt-12 pb-6 h-40 rounded-b-2xl shadow-lg">
        <Text className="text-[#9DBDFF] text-2xl text-center font-NunitoExtraBold">
          Hi, {firstName.charAt(0).toUpperCase() + firstName.slice(1)} {lastName.charAt(0).toUpperCase() + lastName.slice(1)} !
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="mt-[-50px] flex items-center">
        <View className="bg-[#3b3e44] p-2 rounded-full">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-[#686D76] flex items-center justify-center">
              <Ionicons name="person" size={48} color="#9DBDFF" />
            </View>
          )}
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-12 px-8">
        <TouchableOpacity className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#9DBDFF]">
          <Octicons name="person" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] text-lg ml-4 font-NunitoBold">Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#9DBDFF]">
          <Ionicons name="key" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] text-lg ml-4 font-NunitoBold">Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#9DBDFF]">
          <Ionicons name="document-text" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] text-lg ml-4 font-NunitoBold">Form</Text>
        </TouchableOpacity>
      </View>

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
  );
};

export default Profile;
