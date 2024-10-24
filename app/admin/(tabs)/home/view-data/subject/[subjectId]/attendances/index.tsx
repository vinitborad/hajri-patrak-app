import React, { useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectPreviousAttendances } from '@/api/admin/data/subject';

const PreviousAllAttendancesScreen = () => {
  const router = useRouter();

  const { subjectId } = useLocalSearchParams(); // Extract subjectId from params
  const { data, isLoading, error } = useGetSubjectPreviousAttendances(subjectId as string);

  // Handle loading and error states
  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <AntDesign name="disconnect" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">Network Error</Text>
      </View>
    );
  }

  const renderAttendanceItem = ({ item }: { item: any }) => (
    <View key={item._id} className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
      {/* Attendance Date and Time */}
      <Text className="text-[#F6F5F5] text-lg mb-2">
        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {/* Attendance Message */}
      <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl mb-2">{item.message || 'N / A'}</Text>

      {/* Faculty Info */}
      <View className="flex flex-row items-center mb-2">
        <Ionicons name="person-outline" size={20} color="#9DBDFF" />
        <Text className="text-[#F6F5F5] ml-2">{item.faculty.firstName} {item.faculty.lastName}</Text>
      </View>

      {/* Attendance Details */}
      <View className="flex flex-row items-center mb-2">
        <Ionicons name="people-outline" size={20} color="#9DBDFF" />
        <Text className="text-[#F6F5F5] ml-2">{item.presentStudents}/{item.totalStudents} Students Present</Text>
      </View>

      {/* View Button */}
      <View className="flex-row justify-end">
        <TouchableOpacity
          className="bg-green-500 p-2 rounded-lg flex flex-row items-center"
          onPress={() => router.push(`/admin/(tabs)/home/view-data/subject/${subjectId}/attendances/students-list/${item._id}`)}
        >
          <MaterialIcons name="visibility" size={20} color="white" />
          <Text className="text-white ml-2">View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <Text className="text-2xl text-white mb-4 font-NunitoExtraBold">Previous Attendances:</Text>
      <FlatList
        data={data?.attendances}
        keyExtractor={(item) => item._id}
        renderItem={renderAttendanceItem}
        contentContainerStyle={{ paddingBottom: 200 }}
      />
    </View>
  );
};

export default PreviousAllAttendancesScreen;