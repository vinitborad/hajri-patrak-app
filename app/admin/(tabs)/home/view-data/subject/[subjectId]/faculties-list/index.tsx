import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useGetAccessedFacultiesList } from '@/api/admin/data/subject';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const FacultiesListScreen = () => {
  const { subjectId } = useLocalSearchParams(); // Extract params
  const { data, isLoading, error, refetch } = useGetAccessedFacultiesList(subjectId as string);

  const [loadingFacultyId, setLoadingFacultyId] = useState<string | null>(null); // Track which faculty is being deleted

  // Handle faculty deletion
  const handleDelete = async (facultyId: string, username: string) => {
    Alert.alert(
      'Delete Faculty',
      `Are you sure you want to remove faculty ${username} from this subject?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingFacultyId(facultyId); // Set loading state

            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.patch(
                adminEndpoints.REMOVE_SUBJECT_FROM_FACULTY_ACCESS_LIST,
                {
                  username, // faculty username
                  subjectId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                refetch(); // Refetch the faculty list to update the UI
                Alert.alert('Success', `Faculty ${username} removed successfully.`);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to remove faculty.');
              }
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to remove faculty.');
            } finally {
              setLoadingFacultyId(null); // Reset loading state
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Show loading spinner if data is being fetched
  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  // Show error message if there was an issue fetching the data
  if (error) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <AntDesign name="disconnect" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">Network Error</Text>
      </View>
    );
  }

  // Render individual faculty card
  const renderFacultyItem = ({ item }: { item: any }) => (
    <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF] flex-row justify-between items-center">
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{item.username}</Text>
        <Text className="text-xl font-NunitoExtraBold text-white">
          {item.personalInfo.firstName} {item.personalInfo.lastName}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => handleDelete(item._id, item.username)} // Pass faculty id and username for deletion
        className="bg-[#FF6B6B] p-2 rounded-full"
        disabled={loadingFacultyId === item._id} // Disable button if it's currently loading
      >
        {loadingFacultyId === item._id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="delete" size={24} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <Text className="text-2xl text-white mb-4 font-NunitoExtraBold">Faculty Access List:</Text>

      {data?.facultyAccessList?.length === 0 ? (
        <Text className="text-lg text-center text-[#FF6B6B]">No faculty has access to this subject.</Text>
      ) : (
        <FlatList
          data={data?.facultyAccessList}
          keyExtractor={(item) => item._id}
          renderItem={renderFacultyItem}
          contentContainerStyle={{ paddingBottom: 200 }}
        />
      )}
    </View>
  );
};

export default FacultiesListScreen;