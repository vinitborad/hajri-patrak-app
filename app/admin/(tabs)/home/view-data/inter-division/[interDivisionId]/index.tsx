import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import { useGetDivisionStudentsList } from '@/api/common';

const InterDivisionStudentsListScreen = () => {
  const router = useRouter();
  const {
    interDivisionId,
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
    semester,
    division,
    interDivision,
  } = useLocalSearchParams(); // Extract params

  const { data, isLoading, error, refetch } = useGetDivisionStudentsList(interDivisionId as string); // Fetch students
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null); // Track loading state for student removal

  // Function to handle student removal
  const handleDelete = async (studentUsername: string) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${studentUsername} from the division?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingStudentId(studentUsername); // Show loader for the student being deleted

            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.patch(
                adminEndpoints.REMOVE_STUDENT_FROM_DIVISION,
                {
                  studentUsername,
                  divisionId: interDivisionId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert('Success', `Student ${studentUsername} removed successfully.`);
                refetch(); // Refresh the list after successful removal
              } else {
                Alert.alert('Error', response.data.message || 'Failed to remove student.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove student.');
            } finally {
              setLoadingStudentId(null); // Remove loader after completion
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // If data is loading, show loading indicator
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  // If there's an error, display it
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load students. Please try again.</Text>
      </View>
    );
  }

  // Render individual student card
  const renderStudentItem = ({ item }: { item: any }) => (
    <View key={item.username} className="bg-[#3b3e44] mb-4 rounded-xl border border-[#9DBDFF]">
      <View className="flex-row justify-between items-center px-3 py-1 rounded-t-xl bg-[#5b5f68] relative">
        <Text className="text-[#9DBDFF] text-lg font-NunitoRegular">{item.username}</Text>
        <TouchableOpacity
          className="absolute right-3"
          onPress={() => handleDelete(item.username)} // Handle delete action
          disabled={loadingStudentId === item.username} // Disable if currently deleting
        >
          {loadingStudentId === item.username ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <MaterialIcons name="delete" size={24} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-center p-2 px-3 pr-4">
        <Text className="text-[#F6F5F5] text-xl capitalize font-NunitoBold">{`${item.firstName} ${item.lastName}`}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <FlatList
        data={data?.students}
        keyExtractor={(item) => item.username}
        renderItem={renderStudentItem}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => router.push(`/admin/(tabs)/home/view-data/inter-division/${interDivisionId}/add-student?college=${college}&department=${department}&branch=${branch}&graduationLevel=${graduationLevel}&passoutYear=${passoutYear}`)}
            className="bg-[#9DBDFF] p-4 rounded-lg mt-2"
          >
            <Text className="text-white text-center font-NunitoExtraBold text-lg">Add Student</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

export default InterDivisionStudentsListScreen;