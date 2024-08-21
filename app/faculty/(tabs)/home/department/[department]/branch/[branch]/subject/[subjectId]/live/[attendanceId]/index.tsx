import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetLiveAttendanceInfo, useCloseAttendance } from '@/api/faculty/attendances';
import { FontAwesome } from '@expo/vector-icons';

const LiveAttendanceScreen = () => {

  const { attendanceId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetLiveAttendanceInfo(attendanceId as string);
  const [message, setMessage] = useState('');
  const closeAttendanceMutation = useCloseAttendance();

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  const attendanceDetails = data?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const presentStudents = data?.presentStudentLists || [];
  const allStudents = data?.allStudentLists || [];

  const isStudentPresent = (studentId: string) => {
    //@ts-ignore
    return presentStudents.some(student => student.id === studentId);
  };

  const handleCloseAttendance = () => {
    closeAttendanceMutation.mutate(
      {
        attendanceId: attendanceId as string,
        message,
      },
      {
        onSuccess: () => {
          router.back(); // Navigate back in the stack
        },
        onError: (err) => {
          console.error('Error closing attendance:', err);
          Alert.alert('Error', 'Failed to close attendance.');
        },
      }
    );
  };

  return (
    <View className="flex flex-1 bg-gray-900">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={allStudents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View className="p-4">
            {/* Top Card with Attendance Details */}
            <View className="bg-slate-300 p-4 rounded-lg mb-4">
              <Text className="text-2xl font-semibold text-gray-800 mb-2">{subjectDetails.subjectName}</Text>
              <Text className="text-gray-700">Code: {subjectDetails.subjectCode}</Text>
              <Text className="text-gray-700">Department: {subjectDetails.department}</Text>
              <Text className="text-gray-700">Branch: {subjectDetails.branch}</Text>
              <Text className="text-gray-700">Semester: {subjectDetails.semester}</Text>
              <Text className="text-gray-700">Division: {subjectDetails.division}</Text>
              <Text className="text-gray-700">Passout Year: {subjectDetails.passoutYear}</Text>
              <Text className="text-gray-700 mt-4">Lecture Hours: {attendanceDetails.value}</Text>
              <Text className="text-gray-700">Created At: {new Date(attendanceDetails.createdAt).toLocaleString()}</Text>
              <Text className="text-gray-700">Updated At: {new Date(attendanceDetails.updatedAt).toLocaleString()}</Text>
            </View>

            {/* Buttons for QR and Manual */}
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="flex-1 bg-gray-700 p-4 rounded-lg mr-2 flex-row justify-center items-center"
                onPress={() => Alert.alert('QR Code', 'Coming soon! 🔥')}
              >
                <FontAwesome name="qrcode" size={24} color="white" />
                <Text className="text-center text-white text-lg ml-2">QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-700 p-4 rounded-lg ml-2 flex-row justify-center items-center"
                onPress={() => router.push(`/faculty/(tabs)/home/department/[department]/branch/[branch]/subject/[subjectId]/live/${attendanceId}/manual`)}
              >
                <FontAwesome name="pencil" size={24} color="white" />
                <Text className="text-center text-white text-lg ml-2">Manual</Text>
              </TouchableOpacity>
            </View>

            {/* Input for adding a message */}
            <View className="flex-row justify-between items-center bg-gray-800 p-4 rounded-lg mb-4">
              <TextInput
                className="flex-1 text-white bg-gray-900 p-2 rounded-lg"
                placeholder="Add message ..."
                placeholderTextColor="#ccc"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <Text className="text-white text-lg font-semibold mb-2">Live Status</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item.id);
          return (
            <View
              className={`p-4 rounded-lg mb-4 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-green-700' : 'bg-red-700'}`}
            >
              <View>
                <Text className="text-white font-bold text-lg">Enrollment: {item.username}</Text>
                <Text className="text-gray-300">Name: {item.personalInfo.firstName} {item.personalInfo.lastName}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Fixed buttons at the bottom */}
      <View className="flex-row justify-between bg-gray-900 p-2">
        <TouchableOpacity
          className="bg-red-500 p-3 rounded-lg flex-1 mr-2 flex-row justify-center items-center"
          onPress={handleCloseAttendance}
        >
          <FontAwesome name="times-circle" size={20} color="white" />
          <Text className="text-center text-white text-lg ml-2">Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-700 p-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
          //@ts-ignore
          onPress={refetch}
        >
          <FontAwesome name="refresh" size={20} color="white" />
          <Text className="text-center text-white text-lg ml-2">Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LiveAttendanceScreen;
