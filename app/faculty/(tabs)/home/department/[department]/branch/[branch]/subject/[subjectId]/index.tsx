import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousAttendances } from '@/api/faculty/attendances';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { facultyEndpoints } from '@/constants/ApiEndpoints';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = (subjectId: string) => `subject-attendance-${subjectId}`;

const SubjectDetailScreen = () => {
  const { department, branch, subjectId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetPreviousAttendances(subjectId as string);

  // State for modal visibility and form input
  const [isModalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [selectedInterDivisions, setSelectedInterDivisions] = useState<string[]>([]); // To hold multiple interDivisions
  const [offlineData, setOfflineData] = useState(null); // Store offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);

  // Fetch offline data on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(STORAGE_KEY(subjectId as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [subjectId]);

  // Validation function to check API response
  const isValidApiResponse = (data: any): boolean => {
    if (!data || !data.subject || !Array.isArray(data.attendances)) {
      return false; // Invalid if subject or attendances are missing
    }
    return true;
  };

  // Save fetched API data to offline storage only if valid
  useEffect(() => {
    if (data && isValidApiResponse(data)) {
      AsyncStorage.setItem(STORAGE_KEY(subjectId as string), JSON.stringify(data));
    }
  }, [data, subjectId]);

  if (isLoading && isOfflineLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error && !offlineData) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

  const dataToShow = data || offlineData;

  // Extract subject details and attendances from the response data
  const subjectDetails = dataToShow?.subject || {};
  const attendances = dataToShow?.attendances || [];
  //@ts-ignore
  const liveAttendances = attendances.filter((attendance) => attendance.type === 'live');
  //@ts-ignore
  const closedAttendances = attendances.filter((attendance) => attendance.type !== 'live');

  // Create Attendance API Call
  const createAttendance = async () => {
    const token = await SecureStore.getItemAsync('token');
    await axios.post(
      facultyEndpoints.CREATE_ATTENDANCE,
      {
        subjectId,
        value: parseInt(value),
        interDivisions: selectedInterDivisions,
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

  // Toggle interDivision selection (multiple select functionality)
  const toggleInterDivision = (div: string) => {
    setSelectedInterDivisions((prev) => {
      if (prev.includes(div)) {
        return prev.filter((d) => d !== div); // Remove if already selected
      } else {
        return [...prev, div]; // Add if not selected
      }
    });
  };

  //@ts-ignore
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
            {liveAttendances.length > 0 &&
              // @ts-ignore  
              liveAttendances.map((attendance) => (
                <View
                  key={attendance.id}
                  className="bg-[#2D6A4F] p-2 rounded-lg mb-4 flex-row justify-between items-center border border-[#1B4332] pr-4"
                >
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
                    onPress={() =>
                      router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/live/${attendance.id}`)
                    }
                  >
                    <Ionicons name="eye-outline" size={20} color="#9DBDFF" />
                    <Text className="ml-2 text-[#F6F5F5]">View</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </>
        )}
        renderItem={renderAttendanceItem}
        contentContainerStyle={{ paddingBottom: 40 }} // Add extra space for the tab bar
        showsVerticalScrollIndicator={false} // Hide the vertical scrollbar
      />

      {/* Create Attendance Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF] w-[85%]">
            <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4 text-center">Create Attendance</Text>

            {/* Value Selector (Single Select) */}
            <Text className="text-[#F6F5F5] font-NunitoExtraBold mb-2">Select Value (Hours):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setValue(val.toString())}
                  className={`mx-2 p-4 rounded-lg ${value === val.toString() ? 'bg-[#9DBDFF]' : 'bg-[#2D2D2D]'}`}
                >
                  <Text className={`text-lg ${value === val.toString() ? 'text-white' : 'text-[#F6F5F5]'}`}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* InterDivisions Selector (Multiple Select) */}
            <Text className="text-[#F6F5F5] font-NunitoExtraBold mt-4 mb-2">Select InterDivisions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {subjectDetails.interDivisions?.map((div: any) => (
                <TouchableOpacity
                  key={div._id}
                  onPress={() => toggleInterDivision(div.interDivision)}
                  className={`mx-2 p-4 rounded-lg ${selectedInterDivisions.includes(div.interDivision) ? 'bg-[#9DBDFF]' : 'bg-[#2D2D2D]'}`}
                >
                  <Text className={`text-lg ${selectedInterDivisions.includes(div.interDivision) ? 'text-white' : 'text-[#F6F5F5]'}`}>
                    {div.interDivision}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity className="bg-red-500 p-3 rounded-lg w-[45%]" onPress={() => setModalVisible(false)}>
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-green-500 p-3 rounded-lg w-[45%]" onPress={createAttendance}>
                <Text className="text-white text-center">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubjectDetailScreen;
