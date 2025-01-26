import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Octicons, Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import defaultImage from '@/assets/images/default-profile.png';
import { STUDENT_PROFILE } from '@/constants/async-store-keys';
import { useGetStudentProfile } from '@/api/student/data/profile';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { studentEndpoints } from '@/constants/api-endpoints'; // Import your endpoints
import { useQueryClient } from '@tanstack/react-query';

const Profile = () => {
  const router = useRouter();
  const queryClient = useQueryClient(); // Get the QueryClient instance

  const [role, setRole] = useState<string | null>(null); // State for user role
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false); // State for showing loader on image upload
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State for showing loader on logout button
  const { data: studentProfile, isLoading, refetch } = useGetStudentProfile(); // Add refetch to refresh profile

  // Fetch the local profile data on component mount
  useEffect(() => {
    const fetchLocalProfile = async () => {
      try {
        // Fetch role from SecureStore
        const storedRole = await SecureStore.getItemAsync('role');
        if (storedRole) {
          setRole(storedRole); // Set role state
        }

        const storedProfile = await AsyncStorage.getItem(STUDENT_PROFILE);
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
  const profile = studentProfile || localProfile;

  const onSignOut = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out ?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await SecureStore.deleteItemAsync('token');
              await SecureStore.deleteItemAsync('role');
              // Clear async storage
              await AsyncStorage.clear();
              // Invalidate all queries in React Query
              queryClient.clear();
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
      Alert.alert('Try Again !');
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
      const response = await axios.post(studentEndpoints.UPDATE_PHOTO, formData, {
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
      // show error message if comming from server
      Alert.alert('Error', error.response?.data?.message || 'Unable to update photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1E1E1E]">
      {/* Header */}
      <View className="bg-[#3b3e44] pt-12 pb-6 h-40 rounded-b-2xl shadow-lg">
        <Text className="text-[#9DBDFF] text-2xl text-center font-NunitoExtraBold">
          Hi, {profile ? `${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}` : 'Loading ...'} !
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="mt-[-50px] flex items-center">
        <View className="bg-[#3b3e44] p-2 rounded-full relative">
          {isUploading ? (
            <View className='w-24 h-24 flex items-center justify-center'>
              <ActivityIndicator size="large" color="#9DBDFF" />
            </View>
          ) : (
            <Image
              source={profile?.personalInfo?.photoUrl ? { uri: profile.personalInfo.photoUrl } : defaultImage}
              className="w-24 h-24 rounded-full"
            />
          )}
          {/* Pencil Icon for editing photo */}
          {(role === 'student' || role === 'admin-student') && (
            <TouchableOpacity
              className="absolute top-0 right-0 bg-[#9DBDFF] p-2 rounded-full"
              onPress={pickImage}
              disabled={isUploading}
            >
              <Ionicons name="pencil" size={16} color="#1E1E1E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-12 px-8">
        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#54a178]"
          onPress={() => router.push('/student/(tabs)/profile/profile-info')}
        >
          <Octicons name="person" size={24} color="#54a178" />
          <Text className="text-[#54a178] text-lg ml-4 font-NunitoBold">Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#f6ff90]"
          onPress={() => router.push('/student/(tabs)/profile/previous-divisions')}
        >
          <FontAwesome name="history" size={24} color="#f6ff90" />
          <Text className="text-[#f6ff90] text-lg ml-4 font-NunitoBold">Previous Subjects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#FF6B6B]"
          onPress={() => router.push('/student/(tabs)/profile/reset-password')}
        >
          <Ionicons name="key" size={24} color="#FF6B6B" />
          <Text className="text-[#FF6B6B] text-lg ml-4 font-NunitoBold">Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center mb-4 p-4 bg-[#3b3e44] rounded-lg border border-[#9DBDFF]"
          onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_GOOGLE_FORM_LINK || '')}
        >
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
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="logout" size={24} color="white" />
              <Text className="text-white text-center text-lg font-NunitoExtraBold ml-4">LOG OUT</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {isLoading && <ActivityIndicator size="large" color="#9DBDFF" />}
    </View>
  );
};

export default Profile;