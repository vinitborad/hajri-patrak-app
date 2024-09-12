import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousAttendances } from '@/api/faculty/attendances';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { facultyEndpoints } from '@/constants/ApiEndpoints';
import { AntDesign, FontAwesome, Foundation, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { DIVISION_STUDENTS_LIST, DIVISION_STUDENTS_LIST_KEY, LIVE_ATTENDANCE, PREV_ATTENDANCES } from '@/constants/async-store-keys';
import { getQueuedAttendances } from '@/utils/attendance-queue';


const SubjectDetailScreen = () => {
  const { department, branch, subjectId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error } = useGetPreviousAttendances(subjectId as string);

  // State for modal visibility and form input
  const [isModalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [selectedInterDivisions, setSelectedInterDivisions] = useState<any[]>([]); // To hold objects with _id and interDivision
  const [offlineData, setOfflineData] = useState(null); // Store offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  //TODO: very later : declare type structure for liveAttendance
  const [liveAttendance, setLiveAttendance] = useState<any>(null); // New State for live attendance
  const [queuedAttendances, setQueuedAttendances] = useState<any[]>([]); // State for queued attendances
  const queryClient = useQueryClient(); // Use query client for fetching division students data

  // Fetch offline data on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        // Fetch previous attendances from AsyncStorage
        const cachedData = await AsyncStorage.getItem(PREV_ATTENDANCES(subjectId as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        // Fetch live attendance from AsyncStorage
        const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(subjectId as string));
        if (liveData) {
          setLiveAttendance(JSON.parse(liveData));
        }

        // Fetch queued attendances from AsyncStorage
        const queued = await getQueuedAttendances(subjectId as string);
        setQueuedAttendances(queued?.data || []);

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
      AsyncStorage.setItem(PREV_ATTENDANCES(subjectId as string), JSON.stringify(data));

      // Fetch division students list for each interDivision
      if (data.subject.interDivisions && data.subject.interDivisions.length > 0) {
        data.subject.interDivisions.forEach(async (div: any) => {
          try {
            //TODO: check for this, exactly kai key avshe, and is it needed even or not ?
            const queryKey = ['previous-attendances', subjectId];
            // Check if data is already in the cache
            const cachedData = queryClient.getQueryData(queryKey);

            if (!cachedData) {
              // Manually fetch the division student list and cache it
              const token = await SecureStore.getItemAsync('token');
              const contentKey = await AsyncStorage.getItem(DIVISION_STUDENTS_LIST_KEY(div._id));

              const response = await axios.get(facultyEndpoints.GET_DIVISION_STUDENTS_LIST, {
                headers: { Authorization: `Bearer ${token}` },
                params: { divisionId: div._id, contentKey },
              });

              const { data: divisionData, success, isUpdated, contentKey: newContentKey } = response.data;

              if (isUpdated && divisionData && newContentKey && success) {
                // Cache the new data
                await AsyncStorage.setItem(DIVISION_STUDENTS_LIST_KEY(div._id), newContentKey);
                await AsyncStorage.setItem(DIVISION_STUDENTS_LIST(div._id), JSON.stringify(divisionData));
              }
            }
          } catch (error) {
            console.log('Error fetching division students list:', error);
          }
        });
      }
    }
  }, [data, subjectId]);

  if (isLoading && isOfflineLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error && !offlineData) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

  const dataToShow = data || offlineData;
  // Extract subject details and attendances from the response data
  const subjectDetails = dataToShow?.subject || {};
  const attendances = dataToShow?.attendances || [];
  //@ts-ignore
  const closedAttendances = attendances.filter((attendance) => attendance.type !== 'live');

  // Create Attendance API Call
  const createAttendance = async () => {
    // create attendance and store into async-storage
    try {
      if (!value || !selectedInterDivisions.length) {
        return;
      }
      const attendanceData: any = {
        subjectId: subjectId,
        value: parseInt(value),
        interDivisions: selectedInterDivisions,
        presentStudentsList: [],
        message: '',
        retry: false,
      }
      await AsyncStorage.setItem(LIVE_ATTENDANCE(subjectId as string), JSON.stringify(attendanceData));
      setLiveAttendance(attendanceData); // Set live attendance state
      setModalVisible(false);
    } catch (error) {
      console.log('Error creating attendance:', error);
    }
  };

  // Toggle interDivision selection (multiple select functionality)
  const toggleInterDivision = (div: { _id: string, interDivision: string }) => {
    setSelectedInterDivisions((prev) => {
      const exists = prev.some(item => item._id === div._id);
      if (exists) {
        return prev.filter(item => item._id !== div._id);
      } else {
        return [...prev, div];
      }
    });
  };

  const isSelected = (interDivision: string) => {
    return selectedInterDivisions.some(item => item.interDivision === interDivision);
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
    <View className="flex flex-1 bg-[#1E1E1E] px-4">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={closedAttendances}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View>
            {/* Top Card with Subject Details */}
            <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 mt-3 border border-[#9DBDFF]">
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

            {/* Show live attendance from AsyncStorage if it exists */}
            {liveAttendance ? (
              <View className="bg-[#2D6A4F] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
                <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">Live Attendance</Text>
                <Text className="text-[#F6F5F5] mt-2">Value: {liveAttendance.value}</Text>
                <Text className="text-[#F6F5F5] mt-2">
                  Inter divisions: {liveAttendance.interDivisions.map((div: any) => div.interDivision).join(', ')}
                </Text>
                <TouchableOpacity
                  className="bg-[#1B4332] p-2 mt-4 rounded-lg flex flex-row items-center justify-center"
                  onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${subjectId}/live/`)}
                >
                  <Ionicons name="eye-outline" size={20} color="#9DBDFF" />
                  <Text className="ml-2 text-[#F6F5F5]">View Live Attendance</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Show create attendance button only if there's no live attendance
              <TouchableOpacity
                className="bg-[#686D76] bg-opacity-70 p-4 rounded-lg mb-4 border border-[#9DBDFF] flex flex-row items-center justify-center"
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="create-outline" size={20} color="#F6F5F5" />
                <Text className="text-center text-[#F6F5F5] text-lg ml-2">Create Attendance</Text>
              </TouchableOpacity>
            )}

            {queuedAttendances.length > 0 && (
              <View className="mb-2 flex-row justify-start items-center pl-2 gap-2">
                <Ionicons name="timer" size={24} color="#e5eb95" />
                <Text className="text-[#e5eb95] text-xl font-NunitoExtraBold">Pending Attendances</Text>
              </View>
            )}

            {/* Show queued attendances */}
            {queuedAttendances.length > 0 && (
              queuedAttendances.map((item, index) => (
                <View key={index} className="bg-[#3b3e44] p-2 rounded-lg mb-2 border border-[#e5eb95]">
                  {/* Message Input */}
                  <View className="bg-[#1E1E1E] p-2 pl-3 rounded-lg mb-2">
                    <Text className="text-[#e5eb95]">{item.message || 'No Message'}</Text>
                  </View>

                  {/* Hours and Divisions */}
                  <View className="flex-row justify-between items-center mb-2 px-2">
                    <View className="flex-row items-center">
                      <AntDesign name="clockcircle" size={20} color="#9DBDFF" />
                      <Text className="text-[#c5d4f3] ml-2 font-NunitoLight"> {item.value} Hour</Text>
                    </View>

                    <View className="flex-row items-center">
                      <MaterialIcons name="people-alt" size={22} color="#9DBDFF" />
                      <Text className="text-[#c5d4f3] ml-2 font-NunitoMedium">{item.interDivisions.map((div: any) => div.interDivision).join(', ')}</Text>
                    </View>
                  </View>

                  {/* Present Students */}
                  <View className="flex-row items-center justify-start gap-2 px-2">
                    <Foundation name="list-number" size={24} color="#c5d4f3" />
                    <Text className="text-[#9DBDFF] text-base font-NunitoExtraBold">
                      Present Count : {item.presentStudentsList.length}
                    </Text>
                  </View>

                </View>
              ))
            )}

            <View className="mb-2 pt-3 flex-row justify-start items-center pl-2 gap-2">
              <FontAwesome name="history" size={24} color="#9DBDFF" />
              <Text className="text-[#9DBDFF] text-xl font-NunitoExtraBold">Previous Attendances</Text>
            </View>

          </View>
        )}
        renderItem={renderAttendanceItem}
        contentContainerStyle={{ paddingBottom: 80 }} // Add extra space for the tab bar
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
                  onPress={() => toggleInterDivision(div)}
                  className={`mx-2 p-4 rounded-lg ${isSelected(div.interDivision) ? 'bg-[#9DBDFF]' : 'bg-[#2D2D2D]'}`}
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
