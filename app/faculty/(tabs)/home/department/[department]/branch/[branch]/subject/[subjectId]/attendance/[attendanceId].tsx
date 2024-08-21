import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAttendanceInfo } from '@/api/faculty/attendances';

const ViewAttendanceScreen = () => {
  const { department, branch, subjectId, attendanceId } = useLocalSearchParams();

  const { data, isLoading, error } = useGetAttendanceInfo(attendanceId as string);

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Extract subject, attendance, and student details from the response data
  const attendanceDetails = data?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const allStudents = data?.allStudents || [];
  const presentStudents = data?.presentStudents || [];

  // Helper function to determine if a student was present
  const isStudentPresent = (studentId: string) => {
    //@ts-ignore
    return presentStudents.some(student => student.id === studentId);
  };

  // Sort students by enrollment number (username)
  //@ts-ignore
  const sortedStudents = allStudents.sort((a, b) => {
    return parseInt(a.username) - parseInt(b.username);
  });

  return (
    <View className="flex flex-1 bg-gray-900">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={sortedStudents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View className="p-4">
            {/* Top Card with Subject & Attendance Details */}
            <View className="bg-slate-300 p-4 rounded-lg mb-4">
              <Text className="text-2xl font-semibold text-gray-800 mb-2">{subjectDetails.subjectName}</Text>
              <Text className="text-gray-700">Code: {subjectDetails.subjectCode}</Text>
              <Text className="text-gray-700">Department: {subjectDetails.department}</Text>
              <Text className="text-gray-700">Branch: {subjectDetails.branch}</Text>
              <Text className="text-gray-700">Semester: {subjectDetails.semester}</Text>
              <Text className="text-gray-700">Division: {subjectDetails.division}</Text>
              <Text className="text-gray-700">Passout Year: {subjectDetails.passoutYear}</Text>
              <Text className="text-gray-700 mt-4">Attendance Message: {attendanceDetails.message}</Text>
              <Text className="text-gray-700">Lecture Hours: {attendanceDetails.value}</Text>
              <Text className="text-gray-700">Created At: {new Date(attendanceDetails.createdAt).toLocaleString()}</Text>
              <Text className="text-gray-700">Updated At: {new Date(attendanceDetails.updatedAt).toLocaleString()}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item.id);
          return (
            <View 
              className={`p-4 rounded-lg mb-4 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-green-700' : 'bg-red-700'}`}
            >
              <View>
                <Text className="text-white font-bold text-lg">Name: {item.personalInfo.firstName} {item.personalInfo.lastName}</Text>
                <Text className="text-gray-300">Enrollment: {item.username}</Text>
              </View>
              <TouchableOpacity className="bg-blue-500 p-2 rounded-lg">
                <Text className="text-white">Change</Text>
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
