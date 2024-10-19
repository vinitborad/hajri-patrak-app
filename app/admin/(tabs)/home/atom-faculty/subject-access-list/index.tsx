import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useGetFacultySubjectAccessList } from '@/api/admin/atom-faculty/subject-access-list';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const SubjectAccessList = () => {
  const { username } = useLocalSearchParams(); // Extract username from URL params

  const [loadingSubjects, setLoadingSubjects] = useState<string[]>([]); // Track which subjects are being deleted

  // Fetching the subject access list
  const { data, isLoading, error, refetch } = useGetFacultySubjectAccessList(username as string);

  // Delete button handler
  const handleDelete = (subjectId: string, subjectName: string) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete subject ${subjectName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingSubjects((prev) => [...prev, subjectId]); // Add subjectId to the loading state

            try {
              const token = await SecureStore.getItemAsync('token');
              await axios.patch(
                adminEndpoints.REMOVE_SUBJECT_FROM_FACULTY_ACCESS_LIST,
                {
                  username,
                  subjectId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              Alert.alert('Success', `Subject ${subjectName} deleted successfully.`);

              // Refresh the subject list
              refetch();
            } catch (error: any) {
              if (error.response) {
                Alert.alert('Error', error.response.data.message);
              } else {
                Alert.alert('Error', 'Failed to delete the subject.');
              }
            } finally {
              setLoadingSubjects((prev) => prev.filter((id) => id !== subjectId)); // Remove the subjectId from loading state
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-[#1E1E1E]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 13 }}>
        {/* Header */}
        <Text className="text-[#9DBDFF] text-2xl font-NunitoBold capitalize mt-3 mb-2 ml-1">{`Access List ( ${username} )`}</Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
            <ActivityIndicator size="large" color="#9DBDFF" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
            <AntDesign name="disconnect" size={80} color="gray" />
            <Text className="text-[#FF6B6B] mt-4">No Network</Text>
          </View>
        ) : !data?.data.length ? (
          <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
            <AntDesign name="inbox" size={80} color="gray" />
            <Text className="text-[#FF6B6B] mt-4">No Subjects Available</Text>
          </View>
        ) : (
          data?.data.map((subject: any) => (
            <View key={subject._id} className="bg-[#3b3e44] p-4 mb-4 rounded-lg border border-[#9DBDFF]">
              {/* Subject Information */}
              <View className="mb-2">
                <Text className="text-[#9DBDFF] text-lg">{subject.subjectName}</Text>
                <Text className="text-[#F6F5F5] text-sm">Code: {subject.subjectCode}</Text>
                <Text className="text-[#F6F5F5] text-sm">Type: {subject.subjectType}</Text>
              </View>

              {/* Meta Information */}
              <View className="border-t border-[#9DBDFF] pt-2">
                <Text className="text-[#F6F5F5] text-sm">{`College: ${subject.metaInfo.college}`}</Text>
                <Text className="text-[#F6F5F5] text-sm">{`Department: ${subject.metaInfo.department}`}</Text>
                <Text className="text-[#F6F5F5] text-sm">{`Branch: ${subject.metaInfo.branch}`}</Text>
                <Text className="text-[#F6F5F5] text-sm">{`Graduation Level: ${subject.metaInfo.graduationLevel}`}</Text>
                <Text className="text-[#F6F5F5] text-sm">{`Semester: ${subject.metaInfo.semester}`}</Text>
                <Text className="text-[#F6F5F5] text-sm">{`Division: ${subject.metaInfo.division}`}</Text>
              </View>

              {/* Delete Button */}
              <View className="flex-row justify-end mt-2">
                {loadingSubjects.includes(subject._id) ? (
                  <ActivityIndicator size="small" color="#FF6B6B" />
                ) : (
                  <TouchableOpacity onPress={() => handleDelete(subject._id, subject.subjectName)} className="flex-row items-center">
                    <Text className="text-[#FF6B6B] text-lg">DELETE</Text>
                    <MaterialIcons name="delete" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Add Button */}
        <View className="items-center mt-6">
          <TouchableOpacity
            onPress={() => router.push(`/admin/(tabs)/home/atom-faculty/subject-access-list/add-subject?username=${username}`)}
            className="bg-[#9DBDFF] py-3 px-10 rounded-lg shadow-md"
            style={{ marginBottom: 20 }} // Add extra bottom padding to prevent clipping
          >
            <Text className="text-[#1E1E1E] text-lg">Add Subject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubjectAccessList;