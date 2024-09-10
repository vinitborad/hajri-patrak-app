import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import defaultImage from '@/assets/images/default-profile.png';
import { Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

const FacultyProfileInfoScreen = () => {
  const [facultyProfile, setFacultyProfile] = useState<any>(null);

  useEffect(() => {
    const loadFacultyProfile = async () => {
      const profile = await AsyncStorage.getItem('facultyProfile');
      if (profile) {
        setFacultyProfile(JSON.parse(profile));
      }
    };

    loadFacultyProfile();
  }, []);

  if (!facultyProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#F6F5F5]">Loading...</Text>
      </View>
    );
  }

  const { personalInfo } = facultyProfile;

  return (

    <ScrollView className="flex-1 bg-[#1E1E1E]" contentContainerStyle={{ paddingBottom: 80 }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Section with Profile Image */}
      <View className="items-center bg-[#3b3e44] rounded-b-[60px] pb-8 pt-8">
        <View className="bg-[#1E1E1E] p-2 rounded-full">
          <Image
            source={personalInfo.photoUrl ? { uri: personalInfo.photoUrl } : defaultImage}
            className="w-[120px] h-[120px] rounded-full"
          />
        </View>
        <View className="mt-4">
          <Text className="text-[#c4cad4] text-2xl font-NunitoExtraBold text-center">{personalInfo?.firstName} {personalInfo?.lastName}</Text>
        </View>
      </View>

      {/* Personal Info Section */}
      <Animated.View entering={FadeIn.delay(100).duration(600)} className="bg-[#3b3e44] mx-4 mt-6 p-6 rounded-lg">
        <Text className="text-[#9DBDFF] text-xl font-NunitoExtraBold mb-4">Personal Information</Text>
        <View className="flex-row items-center mb-4">
          <MaterialIcons name="email" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{personalInfo?.email}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Entypo name="phone" size={24} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-3">{personalInfo?.phone}</Text>
        </View>
      </Animated.View>

    </ScrollView>
  );
};

export default FacultyProfileInfoScreen;
