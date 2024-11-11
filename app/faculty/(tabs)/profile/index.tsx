import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Octicons, Ionicons, MaterialIcons, Entypo, FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultImage from '@/assets/images/default-profile.png';
import { FACULTY_PROFILE } from '@/constants/async-store-keys';
import { useGetFacultyProfile } from '@/api/faculty/profile';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { facultyEndpoints } from '@/constants/api-endpoints';

const FacultyProfile = () => {
  const router = useRouter();
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false); // State for showing loader on image upload
  const { data: facultyProfile, isLoading, refetch } = useGetFacultyProfile();

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

  const onSignOut = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('role');
    // Clear async storage
    await AsyncStorage.clear();
    router.replace('/');
  };

  const pickImage = async () => {
    try {
      // Ask for permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission denied", "You need to allow access to the photo library to upload a photo.");
        return;
      }

      // Open the image picker
      const pickerResult: any = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1], // 1:1 ratio crop
        quality: 1, // Max quality
      });

      if (!pickerResult.cancelled) {
        // Check file size (image size is in bytes)
        const fileSizeInMB = pickerResult.assets[0].fileSize / (1024 * 1024);
        if (fileSizeInMB > 1) {
          Alert.alert("File too large", "Please select an image smaller than 1MB.");
          return;
        }

        await uploadImage(pickerResult.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Try Again!');
    }
  };

  const uploadImage = async (imageUri: string) => {
    setIsUploading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const formData: any = new FormData();
      formData.append('photo', {
        uri: imageUri,
        name: 'profile.jpg', // Name of the file
        type: 'image/jpeg', // Image type
      });

      // Upload image to the server
      const response = await axios.post(facultyEndpoints.UPDATE_PHOTO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        refetch(); // Refresh profile data after successful upload
      } else {
        Alert.alert('Error', 'Unable to update photo.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Unable to update photo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Render placeholder if no profile data (first-time load)
  const renderPlaceholderName = () => "User";

  return (
    <ScrollView className="flex bg-[#1E1E1E]">
      {/* Header with the background color and name */}
      <View className="bg-[#3b3e44] pt-12 pb-6 h-40 rounded-b-2xl shadow-lg">
        <Text className="text-[#9DBDFF] text-2xl text-center font-NunitoExtraBold">
          Hi, {profile ? `${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}` : renderPlaceholderName()}!
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="mt-[-50px] flex items-center">
        <View className="bg-[#3b3e44] p-2 rounded-full relative">
          {isUploading ? (
            <View className="w-24 h-24 flex items-center justify-center">
              <ActivityIndicator size="large" color="#9DBDFF" />
            </View>
          ) : (
            <Image
              source={profile?.personalInfo?.photoUrl ? { uri: profile.personalInfo.photoUrl } : defaultImage}
              className="w-24 h-24 rounded-full"
            />
          )}
          {/* Pencil Icon for editing photo */}
          <TouchableOpacity
            className="absolute top-0 right-0 bg-[#9DBDFF] p-2 rounded-full"
            onPress={pickImage}
            disabled={isUploading}
          >
            <Ionicons name="pencil" size={16} color="#1E1E1E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-12 px-8">
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
      <View className="flex items-center mt-4 mb-24">
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