import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGetStudentProfile } from '@/api/profile';
import { Octicons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const Profile = () => {

  const router = useRouter();

  const { data: studentProfile } = useGetStudentProfile();

  //TODO: handle errors and loading state
  if (!studentProfile) return null; // Handle loading state or return a placeholder

  const { personalInfo } = studentProfile;
  const { firstName, lastName, photoUrl } = personalInfo;

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('role'); 
    router.replace('/(auth)/sign-in');
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header with the background color and name */}
      <View className="bg-zinc-300 pt-12 pb-6 h-40">
        <Text className="text-zinc-900 text-2xl text-center font-bold">
          Hi, {firstName} {lastName} !
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="">
        <View className="bg-gray-100 rounded-full mx-auto mt-[-50px] p-2">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-black" />
          )}
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-12 px-8">
        <TouchableOpacity className="flex-row items-center mb-4 p-3 bg-zinc-200 rounded-lg">
          <Octicons name="person" size={24} color="black" />
          <Text className="text-zinc-900 text-lg ml-4">Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-4 p-3 bg-zinc-200 rounded-lg">
          <Ionicons name="key" size={24} color="black" />
          <Text className="text-zinc-900 text-lg ml-4">Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mb-4 p-3 bg-zinc-200 rounded-lg">
          <Ionicons name="document-text" size={24} color="black" />
          <Text className="text-zinc-900 text-lg ml-4">Form</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View className=' flex items-center mt-auto mb-8'>
        <TouchableOpacity 
          className="flex-row justify-center items-center p-2 bg-zinc-200 rounded-lg w-2/3"
          onPress={onSignOut}
        >
          <MaterialIcons name="logout" size={24} color="black" />
          <Text className="text-zinc-900 text-center text-sms font-bold ml-4">LOG OUT</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default Profile;
