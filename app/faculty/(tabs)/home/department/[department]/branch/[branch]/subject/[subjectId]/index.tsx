import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousAttendances } from '@/api/faculty/attendances';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { facultyEndpoints } from "@/constants/ApiEndpoints";

const SubjectDetailScreen = () => {
  const { department, branch, subjectId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetPreviousAttendances(subjectId as string);

  // State for modal visibility and form input
  const [isModalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [interDivisions, setInterDivisions] = useState('');

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Extract subject details and attendances from the response data
  const subjectDetails = data?.subject || {};
  const attendances = data?.attendances || [];
  //@ts-ignore
  const liveAttendances = attendances.filter(attendance => attendance.type === 'live');
  //@ts-ignore
  const closedAttendances = attendances.filter(attendance => attendance.type !== 'live');

  // Create Attendance API Call
  const createAttendance = async () => {
    const token = await SecureStore.getItemAsync('token');
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

  return (
    <View className="flex flex-1 bg-gray-900 p-4">
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
            <View className="bg-slate-300 p-4 rounded-lg mb-4">
              <Text className="text-2xl font-semibold text-gray-800 mb-2">{subjectDetails.subjectName}</Text>
              <Text className="text-gray-700">Code: {subjectDetails.subjectCode}</Text>
              <Text className="text-gray-700">Department: {subjectDetails.department}</Text>
              <Text className="text-gray-700">Branch: {subjectDetails.branch}</Text>
              <Text className="text-gray-700">Semester: {subjectDetails.semester}</Text>
              <Text className="text-gray-700">Division: {subjectDetails.division}</Text>
              <Text className="text-gray-700">Passout Year: {subjectDetails.passoutYear}</Text>
              <Text className="text-gray-700">Type: {subjectDetails.subjectType}</Text>
            </View>

            {/* Student Analyser Button */}
            <TouchableOpacity
              className="bg-gray-700 p-4 rounded-lg mb-4"
              onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/analyse`)}
            >
              <Text className="text-center text-white text-lg">Student Analyser</Text>
            </TouchableOpacity>

            {/* Create Attendance Button */}
            <TouchableOpacity
              className="bg-gray-700 p-4 rounded-lg mb-4"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-center text-white text-lg">Create Attendance</Text>
            </TouchableOpacity>

            {/* Display All Live Attendances */}
            {/* @ts-ignore */}
            {liveAttendances.length > 0 && liveAttendances.map(attendance => (
              <View key={attendance.id} className="bg-yellow-600 p-4 rounded-lg mb-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-bold text-lg">- Live</Text>
                  <Text className="text-white">Value: {attendance.value}</Text>
                  <Text className="text-white">Time: {new Date(attendance.createdAt).toLocaleTimeString()}</Text>
                  <Text className="text-white">Total Students: {attendance.totalStudents}</Text>
                </View>
                <TouchableOpacity 
                  className="bg-blue-500 p-2 rounded-lg"
                  onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/live/${attendance.id}`)}
                >
                  <Text className="text-white">View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        renderItem={({ item }) => (
          <View key={item.id} className="bg-gray-800 p-4 rounded-lg mb-4">
            <Text className="text-gray-400">{new Date(item.createdAt).toLocaleString()}</Text>
            <Text className="text-white font-bold text-lg mb-2">{item.message}</Text>
            <Text className="text-gray-300 mb-2">
              {item.presentStudentsCount}/{item.totalStudents} Students Present
            </Text>
            <View className="flex flex-row justify-between">
              <TouchableOpacity 
                className="bg-red-500 p-2 rounded-lg"
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 p-2 rounded-lg"
              >
                <Text className="text-white">Switch</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-green-500 p-2 rounded-lg"
                onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/attendance/${item.id}`)}
              >
                <Text className="text-white">View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Create Attendance Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg">
            <Text className="text-lg font-semibold mb-4">Create Attendance</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              placeholder="Enter Value (Hours)"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />
            <TextInput
              className="border p-2 rounded-lg mb-4"
              placeholder="Enter InterDivisions (e.g., 1,2,3)"
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
