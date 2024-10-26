import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Octicons, Ionicons, MaterialIcons, Entypo, FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultImage from '@/assets/images/default-profile.png';
import { FACULTY_PROFILE } from '@/constants/async-store-keys';
import { useGetFacultyProfile } from '@/api/faculty/profile';

const FacultyProfile = () => {

  const router = useRouter();
  const [localProfile, setLocalProfile] = useState<any>(null);
  const { data: facultyProfile, isLoading, isError } = useGetFacultyProfile();

  // Fetch the local profile data on component mount
  useEffect(() => {
    const fetchLocalProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(FACULTY_PROFILE);
        if (storedProfile) {
          setLocalProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error("Error fetching stored profile:", error);
      }
    };
    fetchLocalProfile();
  }, []);

  // Decide whether to use local profile or fetched profile
  const profile = facultyProfile || localProfile;

  const onSignOut = () => {
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('role');
    // clear whole async store
    AsyncStorage.clear();
    router.replace('/');
  }

  // Render placeholder if no profile data (first-time load)
  const renderPlaceholderName = () => "User";

  return (
    <ScrollView className="flex bg-[#1E1E1E] ">
      {/* Header with the background color and name */}
      <View className="bg-[#3b3e44] pt-12 pb-6 h-40 rounded-b-2xl shadow-lg">
        <Text className="text-[#9DBDFF] text-2xl text-center font-NunitoExtraBold">
          Hi, {profile ? `${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}` : renderPlaceholderName()} !
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="mt-[-50px] flex items-center">
        <View className="bg-[#7694d0] p-1 rounded-full">
          {profile?.personalInfo?.photoUrl ? (
            <Image
              source={profile.personalInfo.photoUrl ? { uri: profile.personalInfo.photoUrl } : defaultImage}
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
      <View className="mt-9 px-8">
        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#54a178]"
          onPress={() => router.push('/faculty/(tabs)/profile/profile-info')}
        >
          <Octicons name="person" size={24} color="#54a178" />
          <Text className="text-[#54a178] text-lg ml-4 font-NunitoBold">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#f6ff90]"
          onPress={() => router.push('/faculty/(tabs)/profile/queued-attendances')}
        >
          <Entypo name="time-slot" size={24} color="#f6ff90" />
          <Text className="text-[#f6ff90] text-lg ml-4 font-NunitoBold">Queued Attendances</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#ff9f19]"
          onPress={() => router.push('/faculty/(tabs)/profile/previous-structure')}
        >
          <FontAwesome name="history" size={24} color="#ff9f19" />
          <Text className="text-[#ff9f19] text-lg ml-4 font-NunitoBold">Previous Subjects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#FF6B6B]"
          onPress={() => router.push('/faculty/(tabs)/profile/reset-password')}
        >
          <Ionicons name="key" size={24} color="#FF6B6B" />
          <Text className="text-[#FF6B6B] text-lg ml-4 font-NunitoBold">Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#9DBDFF]">
          <Ionicons name="document-text" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] text-lg ml-4 font-NunitoBold">Form</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View className='flex items-center mt-4 mb-24'>
        <TouchableOpacity
          className="flex-row justify-center items-center py-2 bg-[#FF6B6B] rounded-3xl w-1/2"
          onPress={onSignOut}
        >
          <MaterialIcons name="logout" size={24} color="white" />
          <Text className="text-white text-center text-lg font-NunitoExtraBold ml-4">LOG OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {isLoading && <ActivityIndicator size="large" color="#9DBDFF" />}
    </ScrollView>
  );
};

export default FacultyProfile;