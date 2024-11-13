import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import defaultImage from '@/assets/images/default-profile.png';
import { STUDENT_PROFILE } from '@/constants/async-store-keys';

const ProfileInfoScreen = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      const storedProfile = await AsyncStorage.getItem(STUDENT_PROFILE);
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E] pb-8">
        <Text className="text-[#9DBDFF] text-xl font-NunitoExtraBold">No data found !</Text>
      </View>
    );
  }

  const { username, email, phone, personalInfo, educationMeta: educationInfo } = profileData || {};
  const profileImage = personalInfo?.photoUrl ? { uri: personalInfo?.photoUrl } : defaultImage;

  return (
    <ScrollView className="flex-1 bg-[#1E1E1E]" contentContainerStyle={{ paddingBottom: 80 }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Section with Profile Image */}
      <View className="items-center bg-[#3b3e44] rounded-b-[60px] pb-8 pt-8">
        <View className="bg-[#1E1E1E] p-2 rounded-full">
          <Image
            source={profileImage}
            className="w-[120px] h-[120px] rounded-full"
          />
        </View>
        <View className="mt-4">
          <Text className="text-[#9DBDFF] text-2xl font-NunitoExtraBold text-center">{username}</Text>
          <View className="flex-row justify-center items-center mt-1">
            <MaterialIcons name="email" size={20} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">{email}</Text>
          </View>
          <View className="flex-row justify-center items-center mt-1">
            <Ionicons name="call-outline" size={20} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">{phone}</Text>
          </View>
        </View>
      </View>

      {/* Personal Info Section */}
      <Animated.View entering={FadeIn.delay(100).duration(600)} className="bg-[#3b3e44] mx-4 mt-6 p-6 rounded-lg">
        <Text className="text-[#9DBDFF] text-xl font-NunitoExtraBold mb-4">Personal Information</Text>
        <View className="flex-row items-center mb-4">
          <Ionicons name="person-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{personalInfo?.firstName} {personalInfo?.lastName}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="location-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{personalInfo?.address}</Text>
        </View>
      </Animated.View>

      {/* Educational Info Section */}
      <Animated.View entering={FadeIn.delay(200).duration(600)} className="bg-[#3b3e44] mx-4 mt-6 p-6 rounded-lg">
        <Text className="text-[#9DBDFF] text-xl font-NunitoExtraBold mb-4">Educational Information</Text>
        <View className="flex-row items-center mb-4">
          <FontAwesome5 name="university" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{educationInfo?.college}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="school-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{educationInfo?.department} - {educationInfo?.branch}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Ionicons name="hourglass-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">Passout Year: {educationInfo?.passoutYear}</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default ProfileInfoScreen;
