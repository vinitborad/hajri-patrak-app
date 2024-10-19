import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useGetStudentDivisionsList } from '@/api/admin/atom-student/divisions-list';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const DivisionsListScreen = () => {
  const { username } = useLocalSearchParams(); // Extract username from query params

  const [loadingDivisions, setLoadingDivisions] = useState<string[]>([]); // Track which divisions are being deleted

  // Fetching the student's division list
  const { data, isLoading, error, refetch } = useGetStudentDivisionsList(username as string);

  // Delete button handler
  const handleDelete = (divisionId: string, divisionInfo: string) => {
    Alert.alert(
      'Delete Division',
      `Are you sure you want to delete division ${divisionInfo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingDivisions((prev) => [...prev, divisionId]); // Add divisionId to the loading state

            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.patch(
                adminEndpoints.REMOVE_STUDENT_FROM_DIVISION,
                {
                  studentUsername: username,
                  divisionId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              Alert.alert('Success', `Division ${divisionInfo} deleted successfully.`);

              // Refresh the division list
              refetch();
            } catch (error: any) {
              if (error.response) {
                Alert.alert('Error', error.response.data.message);
              } else {
                Alert.alert('Error', 'Failed to delete the division.');
              }
            } finally {
              setLoadingDivisions((prev) => prev.filter((id) => id !== divisionId)); // Remove the divisionId from loading state
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <AntDesign name="disconnect" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">No Network</Text>
      </View>
    );
  }

  if (!data?.data.length) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <AntDesign name="inbox" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">No Divisions Available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1E1E1E]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 13 }}>
        {/* Header */}
        <Text className="text-[#9DBDFF] text-2xl font-NunitoBold capitalize mt-3 mb-2 ml-1">{`Division List ( ${username} )`}</Text>

        {/* Divisions List */}
        {data?.data.map((division: any) => (
          <View
            key={division._id}
            className={`p-4 mb-4 rounded-lg border ${division.isActive ? 'border-green-600 bg-[#212F1D]' : 'border-red-600 bg-[#3A2020]'
              }`}
          >
            {/* Division Info */}
            <View className="mb-2">
              <Text className={`text-lg ${division.isActive ? 'text-green-500' : 'text-red-500'} font-NunitoBold`}>
                {`SEM ${division.semester} DIV ${division.division}${division.interDivision}`}
              </Text>
            </View>

            {/* Delete Button */}
            <View className="flex-row justify-end mt-2">
              {loadingDivisions.includes(division._id) ? (
                <ActivityIndicator size="small" color={division.isActive ? '#FF6B6B' : '#9DBDFF'} />
              ) : (
                <TouchableOpacity
                  onPress={() => handleDelete(division._id, `SEM ${division.semester} DIV ${division.division}${division.interDivision}`)}
                  className="flex-row items-center"
                >
                  <Text className="text-[#FF6B6B] text-lg">DELETE</Text>
                  <MaterialIcons name="delete" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
};

export default DivisionsListScreen;