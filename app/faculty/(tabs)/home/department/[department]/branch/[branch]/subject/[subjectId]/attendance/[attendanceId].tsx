import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAttendanceInfo } from '@/api/faculty/attendances';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ViewAttendanceScreen = () => {
  const { attendanceId } = useLocalSearchParams();

  const { data, isLoading, error } = useGetAttendanceInfo(attendanceId as string);

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Extract subject, attendance, and student details from the response data
  const attendanceDetails = data?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const allStudents = data?.allStudents || [];
  const presentStudents = data?.presentStudents || [];

  // Helper function to determine if a student was present
  const isStudentPresent = (username: string) => {
    return presentStudents.some(student => student.username === username);
  };

  // Sort students by enrollment number (username)
  const sortedStudents = allStudents.sort((a, b) => {
    return parseInt(a.username) - parseInt(b.username);
  });

  // Calculate number of students present
  const presentCount = presentStudents.length;
  const totalCount = allStudents.length;

  return (
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="p-4">
        {/* Top Card with Subject & Attendance Details */}
        <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
          <Text className="text-2xl font-NunitoExtraBold text-[#9DBDFF] mb-2">{subjectDetails.subjectName}</Text>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="git-branch-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Branch: {subjectDetails.branch}</Text>
          </View>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Semester: {subjectDetails.semester}</Text>
          </View>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="layers-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Division: {subjectDetails.division}</Text>
          </View>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="book-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Type: {subjectDetails.subjectType}</Text>
          </View>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="key-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Code: {subjectDetails.subjectCode}</Text>
          </View>
          <View className="flex flex-row items-center mb-1">
            <Ionicons name="time-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Lecture Hours: {attendanceDetails.value}</Text>
          </View>
          <View className="flex flex-row items-center mt-2">
            <Ionicons name="chatbubble-outline" size={16} color="#9DBDFF" />
            <Text className="text-[#F6F5F5] ml-2">Attendance Message: {attendanceDetails.message}</Text>
          </View>
        </View>

        {/* Present Count Summary */}
        <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
          <View className="flex flex-row items-center">
            <Ionicons name="people-outline" size={20} color="#9DBDFF" />
            <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] ml-2">Present Count : {presentCount} / {totalCount}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={sortedStudents}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item.username);
          return (
            <View
              className={`p-4 rounded-lg mb-4 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-[#2D6A4F] border-[#BEDC74]' : 'bg-[#9D0208] border-[#FF6B6B]'
                } border`}
            >
              <View>
                <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">Name: {item.firstName} {item.lastName}</Text>
                <Text className="text-[#F6F5F5]">Enrollment: {item.username}</Text>
              </View>
              <TouchableOpacity className="bg-[#1E1E1E] p-2 rounded-lg flex flex-row items-center">
                <MaterialIcons name="edit" size={20} color="#9DBDFF" />
                <Text className="ml-2 text-[#9DBDFF]">Change</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

export default ViewAttendanceScreen;
