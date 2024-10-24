import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useGetStudentsListForPreviousAttendance } from '@/api/admin/data/subject';

const AttendanceStudentsListScreen = () => {
  const { attendanceId } = useLocalSearchParams(); // Extract attendance-id from params
  const { data, isLoading, error } = useGetStudentsListForPreviousAttendance(attendanceId as string);

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

  const renderStudentItem = ({ item }: { item: any }) => {
    // Background color based on presence
    const backgroundColor = item.isPresent ? 'bg-[#2D6A4F]' : 'bg-[#c33f43]';

    return (
      <View className={`p-2 pl-4 pr-3 rounded-lg mb-2 flex-row justify-between items-center ${backgroundColor} border border-[#1B4332]`}>
        {/* Student Info */}
        <View className="flex-col items-start">
          <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
            <FontAwesome5 name="id-badge" size={18} color="#F6F5F5" /> {item.username}
          </Text>
          <Text className="text-[#F6F5F5]">
            <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item.firstName} {item.lastName}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#1E1E1E] px-4">
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        ListHeaderComponent={
          <Text className="text-2xl text-white mb-4 font-NunitoExtraBold">Attendance Students List</Text>
        }
        contentContainerStyle={{ paddingBottom: 200, paddingTop: 20 }}
      />
    </View>
  );
};

export default AttendanceStudentsListScreen;