import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousAttendances } from '@/api/faculty/attendances';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { facultyEndpoints } from "@/constants/ApiEndpoints";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const SubjectDetailScreen = () => {
  const { department, branch, subjectId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetPreviousAttendances(subjectId as string);

  // State for modal visibility and form input
  const [isModalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [interDivisions, setInterDivisions] = useState('');

  if (isLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

  // Extract subject details and attendances from the response data
  const subjectDetails = data?.subject || {};
  const attendances = data?.attendances || [];
  const liveAttendances = attendances.filter(attendance => attendance.type === 'live');
  const closedAttendances = attendances.filter(attendance => attendance.type !== 'live');

  // Create Attendance API Call
  const createAttendance = async () => {
    const token = await SecureStore.getItemAsync('token');
    //TODO: handle loading and error states
    await axios.post(facultyEndpoints.CREATE_ATTENDANCE,
      {
        subjectId,
        value: parseInt(value),
        interDivisions: interDivisions.split(',').map(item => item.trim()),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setModalVisible(false);
    refetch(); // Refresh the screen after creating attendance
  };

  const renderAttendanceItem = ({ item }) => (
    <View key={item.id} className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
      <Text className="text-[#F6F5F5] text-lg mb-2">{new Date(item.createdAt).toLocaleString()}</Text>
      <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl mb-2">{item.message || 'Attendance Record'}</Text>
      <View className="flex flex-row items-center mb-2">
        <Ionicons name="people-outline" size={20} color="#9DBDFF" />
        <Text className="text-[#F6F5F5] ml-2">{item.presentStudentsCount}/{item.totalStudents} Students Present</Text>
      </View>
      <View className="flex flex-row justify-between mt-1">
        <TouchableOpacity className="bg-red-500 p-2 rounded-lg flex flex-row items-center">
          <MaterialIcons name="delete-outline" size={20} color="white" />
          <Text className="text-white ml-2">Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-blue-500 p-2 rounded-lg flex flex-row items-center">
          <MaterialIcons name="swap-horizontal-circle" size={20} color="white" />
          <Text className="text-white ml-2">Switch</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-500 p-2 rounded-lg flex flex-row items-center"
          onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/attendance/${item.id}`)}
        >
          <MaterialIcons name="visibility" size={20} color="white" />
          <Text className="text-white ml-2">View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View className="flex flex-1 bg-[#1E1E1E] p-4">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={closedAttendances}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {/* Top Card with Subject Details */}
            <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
              <Text className="text-2xl font-NunitoExtraBold text-[#9DBDFF] mb-2">{subjectDetails.subjectName}</Text>
              <View className="mb-1 flex flex-row items-center">
                <MaterialIcons name="subject" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Subject Code: {subjectDetails.subjectCode}</Text>
              </View>
              <View className="mb-1 flex flex-row items-center">
                <Ionicons name="school-outline" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Branch: {subjectDetails.branch}</Text>
              </View>
              <View className="mb-1 flex flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Semester: {subjectDetails.semester}</Text>
              </View>
              <View className="mb-1 flex flex-row items-center">
                <Ionicons name="layers-outline" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Division: {subjectDetails.division}</Text>
              </View>
              <View className="mb-1 flex flex-row items-center">
                <Ionicons name="bookmark-outline" size={16} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] ml-2">Type: {subjectDetails.subjectType}</Text>
              </View>
            </View>

            {/* Student Analyser Button */}
            <TouchableOpacity
              className="bg-[#686D76] bg-opacity-70 p-4 rounded-lg mb-4 border border-[#9DBDFF] flex flex-row items-center justify-center"
              onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/analyse`)}
            >
              <Ionicons name="analytics-outline" size={20} color="#F6F5F5" />
              <Text className="text-center text-[#F6F5F5] text-lg ml-2">Student Analyser</Text>
            </TouchableOpacity>

            {/* Create Attendance Button */}
            <TouchableOpacity
              className="bg-[#686D76] bg-opacity-70 p-4 rounded-lg mb-4 border border-[#9DBDFF] flex flex-row items-center justify-center"
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="create-outline" size={20} color="#F6F5F5" />
              <Text className="text-center text-[#F6F5F5] text-lg ml-2">Create Attendance</Text>
            </TouchableOpacity>

            {/* Display All Live Attendances */}
            {liveAttendances.length > 0 && liveAttendances.map(attendance => (
              <View key={attendance.id} className="bg-[#2D6A4F] p-2 rounded-lg mb-4 flex-row justify-between items-center border border-[#1B4332] pr-4">
                <View className="p-1 w-56 flex flex-col justify-center items-start">
                  <View className="flex flex-row items-center mb-1">
                    <Ionicons name="pulse-outline" size={20} color="#F6F5F5" />
                    <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg ml-2">Live</Text>
                  </View>
                  <View className="flex flex-row items-center mb-1">
                    <Ionicons name="time-outline" size={16} color="#F6F5F5" />
                    <Text className="text-[#F6F5F5] ml-2">Value: {attendance.value}</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#F6F5F5" />
                    <Text className="text-[#F6F5F5] ml-2">Total Students: {attendance.totalStudents}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-[#1B4332] p-2 rounded-lg flex flex-row items-center"
                  onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/live/${attendance.id}`)}
                >
                  <Ionicons name="eye-outline" size={20} color="#9DBDFF" />
                  <Text className="ml-2 text-[#F6F5F5]">View</Text>
                </TouchableOpacity>
              </View>
            ))}

          </>
        )}
        renderItem={renderAttendanceItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Create Attendance Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF]">
            <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4">Create Attendance</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4 bg-[#2D2D2D] text-[#F6F5F5] border-[#9DBDFF]"
              placeholder="Enter Value (Hours)"
              placeholderTextColor="#A0A0A0"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />
            <TextInput
              className="border p-2 rounded-lg mb-4 bg-[#2D2D2D] text-[#F6F5F5] border-[#9DBDFF]"
              placeholder="Enter InterDivisions (e.g., 1,2,3)"
              placeholderTextColor="#A0A0A0"
              value={interDivisions}
              onChangeText={setInterDivisions}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-red-500 p-2 rounded-lg"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 p-2 rounded-lg"
                onPress={createAttendance}
              >
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubjectDetailScreen;
