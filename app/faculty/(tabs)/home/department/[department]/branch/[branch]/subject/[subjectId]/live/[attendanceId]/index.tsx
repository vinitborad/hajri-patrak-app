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

  if (isLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  const attendanceDetails = data?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const presentStudents = data?.presentStudentLists || [];
  const allStudents = data?.allStudentLists || [];

  const isStudentPresent = (studentId: string) => {
    return presentStudents.some(student => student._id === studentId);
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
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={allStudents}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => (
          <View className="p-4">
            {/* Top Card with Attendance Details */}
            <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
              <Text className="text-2xl font-NunitoExtraBold text-[#9DBDFF] mb-2">{subjectDetails.subjectName}</Text>
              <View className="flex flex-row items-center mb-1">
                <FontAwesome name="book" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Code: {subjectDetails.subjectCode}</Text>
              </View>
              <View className="flex flex-row items-center mb-1">
                <FontAwesome name="code" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Branch: {subjectDetails.branch}</Text>
              </View>
              <View className="flex flex-row items-center mb-1">
                <FontAwesome name="calendar" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Semester: {subjectDetails.semester}</Text>
              </View>
              <View className="flex flex-row items-center mb-1">
                <FontAwesome name="users" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Division: {subjectDetails.division}</Text>
              </View>
              <View className="flex flex-row items-center mb-1">
                <FontAwesome name="hourglass-half" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Lecture Hours: {attendanceDetails.value}</Text>
              </View>
            </View>

            {/* Buttons for QR and Manual */}
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="flex-1 bg-[#9DBDFF] p-4 rounded-lg mr-2 flex-row justify-center items-center"
                onPress={() => Alert.alert('QR Code', 'Coming soon! 🔥')}
              >
                <FontAwesome name="qrcode" size={24} color="#1E1E1E" />
                <Text className="text-center text-[#1E1E1E] text-lg ml-2">QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#9DBDFF] p-4 rounded-lg ml-2 flex-row justify-center items-center"
                onPress={() => router.push(`/faculty/(tabs)/home/department/[department]/branch/[branch]/subject/[subjectId]/live/${attendanceId}/manual`)}
              >
                <FontAwesome name="pencil" size={24} color="#1E1E1E" />
                <Text className="text-center text-[#1E1E1E] text-lg ml-2">Manual</Text>
              </TouchableOpacity>
            </View>

            {/* Input for adding a message */}
            <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
              <TextInput
                className="text-[#F6F5F5] bg-[#1E1E1E] p-2 rounded-lg"
                placeholder="Add message..."
                placeholderTextColor="#9DBDFF"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <Text className="text-[#F6F5F5] text-lg font-NunitoExtraBold mb-2">Live Status</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item._id);
          return (
            <View
              className={`p-4 rounded-lg mb-4 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-[#2D6A4F]' : 'bg-[#9D0208]'
                } border border-[#1B4332]`}
            >
              <View>
                <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">Enrollment: {item.username}</Text>
                <Text className="text-[#F6F5F5]">Name: {item.personalInfo.firstName} {item.personalInfo.lastName}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 250 }}
      />

      {/* Fixed buttons at the bottom */}
      <View className=' w-full flex items-center'>
        <View className="flex-row absolute bottom-24 w-8/12 ">
          <TouchableOpacity
            className="bg-[#FF6B6B] p-2 flex-1 flex-row justify-center items-center rounded-l-full"
            onPress={handleCloseAttendance}
          >
            <FontAwesome name="times-circle" size={20} color="white" />
            <Text className="text-center text-white text-lg ml-2">Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#3b3e44] p-2 flex-1 flex-row justify-center items-center rounded-r-full"
            //@ts-ignore
            onPress={refetch}
          >
            <Text className="text-center text-[#9DBDFF] text-lg mr-2">Refresh</Text>
            <FontAwesome name="refresh" size={20} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LiveAttendanceScreen;
