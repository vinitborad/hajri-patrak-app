import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousAttendances } from '@/api/faculty/attendances';
import { AntDesign, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIVE_ATTENDANCE, PREV_ATTENDANCES } from '@/constants/async-store-keys';
import { isConnected } from '@/utils/network';
import { callCreateAttendance } from '@/utils/attendances/helper-functions';
import axios from 'axios';
import { facultyEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import { useAttendanceStore } from '@/stores/attendance-store';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const SubjectDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetPreviousAttendances(id as string);
  const setRefetch = useAttendanceStore((state) => state.setRefetch);
  const shouldRefresh = useAttendanceStore((state) => state.shouldRefresh);
  const setShouldRefresh = useAttendanceStore((state) => state.setShouldRefresh);

  // State for Create Attendance Modal (existing)
  const [isModalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [selectedInterDivisions, setSelectedInterDivisions] = useState<any[]>([]);
  const [offlineData, setOfflineData] = useState(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [liveAttendance, setLiveAttendance] = useState<any>(null);
  const [loadingAttendanceId, setLoadingAttendanceId] = useState<string | null>(null); // For showing loader on delete

  // ---- New state for "Edit Faculty" modal ----
  const [isFacultyModalVisible, setFacultyModalVisible] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [isFacultyListLoading, setFacultyListLoading] = useState(false);
  // ----------------------------------------------

  // ---- New state for DateTime Picker modal ----
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [editingAttendanceTimeId, setEditingAttendanceTimeId] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  // ----------------------------------------------

  useEffect(() => {
    // Set the refetch function in the store
    setRefetch(refetch);
  }, [refetch]);

  useEffect(() => {
    if (shouldRefresh) {
      setLiveAttendance(null); // Reset the live attendance
      refetch(); // Refetch the data
      setShouldRefresh(false); // Reset the flag
    }
  }, [shouldRefresh, refetch, setShouldRefresh]);

  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(PREV_ATTENDANCES(id as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchPreviousData();
  }, [id]);

  const isValidApiResponse = (data: any): boolean => {
    if (!data || !data.subject || !Array.isArray(data.attendances)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (data && isValidApiResponse(data)) {
      AsyncStorage.setItem(PREV_ATTENDANCES(id as string), JSON.stringify(data));
    }
    const fetchLiveAttendanceData = async () => {
      const liveAttendanceData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
      if (liveAttendanceData) {
        setLiveAttendance(JSON.parse(liveAttendanceData));
      }
    };
    fetchLiveAttendanceData();
  }, [data, id]);

  if (isOfflineLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error && !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const dataToShow = data || offlineData;
  const subjectDetails = dataToShow?.subject || {};
  const attendances = dataToShow?.attendances || [];
  // Sort closed attendances by createdAt in descending order (newest first)
  const closedAttendances = attendances
    .filter((attendance: any) => attendance.type !== 'live')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const createAttendance = async () => {
    try {
      if (!value || !selectedInterDivisions.length) {
        return;
      }
      const attendanceData: any = {
        subjectId: id,
        subjectName: subjectDetails.subjectName,
        value: parseInt(value),
        interDivisions: selectedInterDivisions,
        presentStudentsList: [],
        message: '',
        retry: 0,
        close: false,
      };
      await AsyncStorage.setItem(LIVE_ATTENDANCE(id as string), JSON.stringify(attendanceData));
      setLiveAttendance(attendanceData);

      const networkStatus = await isConnected();
      if (networkStatus) {
        await callCreateAttendance(id as string);
      }

      setModalVisible(false);
    } catch (error) {
      console.log('Error creating attendance:', error);
    }
  };

  const toggleInterDivision = (div: { _id: string; interDivision: string }) => {
    setSelectedInterDivisions((prev) => {
      const exists = prev.some((item) => item._id === div._id);
      if (exists) {
        return prev.filter((item) => item._id !== div._id);
      } else {
        return [...prev, div];
      }
    });
  };

  const isSelected = (interDivision: string) => {
    return selectedInterDivisions.some((item) => item.interDivision === interDivision);
  };

  const confirmDeleteAttendance = (attendanceId: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this attendance?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => handleDeleteAttendance(attendanceId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    setLoadingAttendanceId(attendanceId);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.delete(`${facultyEndpoints.DELETE_ATTENDANCE}?attendanceId=${attendanceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refetch the updated attendances
      await refetch();
    } catch (error: any) {
      if (error.response.data.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setLoadingAttendanceId(null);
    }
  };

  const handleDeleteLiveAttendance = async () => {
    try {
      // ask for confirmation
      Alert.alert(
        'Confirm Deletion ?',
        'Are you sure you want to delete this live attendance ?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes !',
            onPress: async () => {
              await AsyncStorage.removeItem(LIVE_ATTENDANCE(id as string));
              setLiveAttendance(null);
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong !');
    }
  };

  // ---- New function to open the "Edit Faculty" modal ----
  const handleOpenFacultyModal = (attendanceId: string) => {
    setEditingAttendanceId(attendanceId);
    setFacultyModalVisible(true);
    fetchFacultyList();
  };

  // Function to fetch the faculty list for the subject
  const fetchFacultyList = async () => {
    try {
      setFacultyListLoading(true);
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_FACULTY_LIST_OF_SUBJECT, {
        params: { subjectId: id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setFacultyList(response.data.data.facultyList);
      }
    } catch (error) {
      console.error('Error fetching faculty list:', error);
    } finally {
      setFacultyListLoading(false);
    }
  };

  // Function to call the patch API to change the faculty for an attendance record
  const handleChangeFaculty = async (newFacultyUsername: string) => {
    if (!editingAttendanceId) return;
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.patch(
        facultyEndpoints.CHANGE_ATTENDANCE_FACULTY,
        {
          attendanceId: editingAttendanceId,
          newFacultyUsername,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        setFacultyModalVisible(false);
        setEditingAttendanceId(null);
        // Refetch updated attendance data
        await refetch();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };
  // ---------------------------------------------------------

  // ---- New function to open the DateTime Picker modal ----
  const openDateTimePicker = (attendanceId: string, currentTime: string) => {
    setEditingAttendanceTimeId(attendanceId);
    setSelectedDateTime(new Date(currentTime));
    setIsDateTimePickerVisible(true);
  };

  // ---- New: Handle DateTime selection ----
  const handleConfirmDateTime = async (newDate: Date) => {
    // Call patch endpoint to update attendance time
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.patch(
        facultyEndpoints.CHANGE_ATTENDANCE_TIME,
        {
          attendanceId: editingAttendanceTimeId,
          newTime: newDate.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        // Refresh the data after updating
        await refetch();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsDateTimePickerVisible(false);
      setEditingAttendanceTimeId(null);
    }
  };

  //@ts-ignore
  const renderAttendanceItem = ({ item }) => {
    // Format date, day, and time from createdAt
    const dt = new Date(item.createdAt);
    const dateStr = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayStr = dt.toLocaleDateString('en-GB', { weekday: 'long' });
    const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
      <View key={item.id} className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
        {/* Date, Day, Time with Edit Icon */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => openDateTimePicker(item.id, item.createdAt)}>
            <Ionicons name="create-outline" size={16} color="#9DBDFF" />
          </TouchableOpacity>
          <Text className="text-[#F6F5F5] text-lg ml-2">
            {dateStr} ({dayStr}) : {timeStr}
          </Text>
        </View>
        {/* Message */}
        <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl mb-2">{item.message || 'N / A'}</Text>
        {/* Present Students */}
        <View className="flex flex-row items-center mb-2">
          <Ionicons name="people-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-2">{item.presentStudentsCount}/{item.totalStudents} Students Present</Text>
        </View>
        {/* Faculty Info with Edit Icon */}
        <View className="flex flex-row items-center mb-2">
          <Ionicons name="person-outline" size={20} color="#9DBDFF" />
          <Text className="text-[#F6F5F5] ml-2">
            Created By: {item.faculty.personalInfo.firstName + ' ' + item.faculty.personalInfo.lastName || 'N / A'}
          </Text>
          <TouchableOpacity className="ml-1" onPress={() => handleOpenFacultyModal(item.id)}>
            <AntDesign name="edit" size={20} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
        {/* Actions */}
        <View className="flex flex-row justify-between mt-1">
          <TouchableOpacity
            className="bg-red-500 p-2 rounded-lg flex flex-row items-center"
            onPress={() => confirmDeleteAttendance(item.id)}
            disabled={loadingAttendanceId === item.id}
          >
            {loadingAttendanceId === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="delete-outline" size={20} color="white" />
                <Text className="text-white ml-2">Delete</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-lg flex flex-row items-center">
            <MaterialIcons name="swap-horizontal-circle" size={20} color="white" />
            <Text className="text-white ml-2">Switch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 p-2 rounded-lg flex flex-row items-center"
            onPress={() => router.push(`/faculty/(tabs)/home/subject/${id}/attendance/${item.id}`)}
          >
            <MaterialIcons name="visibility" size={20} color="white" />
            <Text className="text-white ml-2">View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex flex-1 bg-[#1E1E1E] px-4">
      <Stack.Screen options={{ headerShown: false }} />

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
              className="bg-opacity-70 p-4 rounded-lg mb-4 border border-[#9DBDFF] flex flex-row items-center justify-center bg-transparent"
              onPress={() => router.push(`/faculty/(tabs)/home/subject/${id}/analyse`)}
            >
              <Ionicons name="analytics-outline" size={20} color="#F6F5F5" />
              <Text className="text-center text-[#9DBDFF] text-lg ml-2">Student Analyser</Text>
            </TouchableOpacity>

            {/* Show live attendance from AsyncStorage if it exists */}
            {liveAttendance ? (
              <View className="bg-[#2D6A4F] p-4 rounded-lg mb-1 border border-[#9DBDFF]">
                <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">Live Attendance</Text>
                <Text className="text-[#F6F5F5] mt-2">Value: {liveAttendance.value}</Text>
                <Text className="text-[#F6F5F5] mt-2">
                  Inter divisions: {liveAttendance.interDivisions.map((div: any) => div.interDivision).join(', ')}
                </Text>
                <TouchableOpacity
                  className="bg-[#1B4332] p-2 mt-4 rounded-lg flex flex-row items-center justify-center"
                  onPress={() => router.push(`/faculty/(tabs)/home/subject/${id}/live`)}
                >
                  <Ionicons name="eye-outline" size={20} color="#9DBDFF" />
                  <Text className="ml-2 text-[#F6F5F5]">Open Live Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-[#f63d3d] p-2 mt-2 rounded-lg flex flex-row items-center justify-center"
                  onPress={() => handleDeleteLiveAttendance()}
                >
                  <AntDesign name="delete" size={20} color="#9DBDFF" />
                  <Text className="ml-2 text-[#F6F5F5]">Delete Attendance !</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Show create attendance button only if there's no live attendance
              <TouchableOpacity
                className="bg-[#686D76] bg-opacity-70 p-4 rounded-lg mb-2 border border-[#9DBDFF] flex flex-row items-center justify-center"
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="create-outline" size={20} color="#F6F5F5" />
                <Text className="text-center text-[#F6F5F5] text-lg ml-2">Create Attendance</Text>
              </TouchableOpacity>
            )}

            <View className="mb-2 pt-3 flex-row justify-start items-center pl-2 gap-2">
              <FontAwesome name="history" size={24} color="#ffab62" />
              <Text className="text-[#ffab62] text-xl font-NunitoExtraBold">Previous Attendances</Text>
            </View>
          </View>
        )}
        renderItem={renderAttendanceItem}
        contentContainerStyle={{ paddingBottom: 150 }} // Extra space for tab bar
        showsVerticalScrollIndicator={false} // Hide scrollbar
      />

      {/* ----- Create Attendance Modal (existing) ----- */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF] w-[85%]">
            <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4 text-center">Create Attendance</Text>
            {/* Value Selector */}
            <Text className="text-[#F6F5F5] font-NunitoExtraBold mb-2">Select Value (Hours):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setValue(val.toString())}
                  className={`mx-2 p-4 rounded-lg ${value === val.toString() ? 'bg-[#9DBDFF]' : 'bg-[#2D2D2D]'}`}
                >
                  <Text className={`text-lg ${value === val.toString() ? 'text-white' : 'text-[#F6F5F5]'}`}>{val}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* InterDivisions Selector */}
            <Text className="text-[#F6F5F5] font-NunitoExtraBold mt-4 mb-2">Select InterDivisions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {subjectDetails.interDivisions?.map((div: any) => (
                <TouchableOpacity
                  key={div._id}
                  onPress={() => toggleInterDivision(div)}
                  className={`mx-2 p-4 rounded-lg ${isSelected(div.interDivision) ? 'bg-[#9DBDFF]' : 'bg-[#2D2D2D]'}`}
                >
                  <Text className={`text-lg ${isSelected(div.interDivision) ? 'text-white' : 'text-[#F6F5F5]'}`}>
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
      {/* ----- End of Create Attendance Modal ----- */}

      {/* ----- New Edit Faculty Modal ----- */}
      <Modal visible={isFacultyModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF] w-[85%]">
            <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4 text-center">Select Faculty</Text>
            {isFacultyListLoading ? (
              <ActivityIndicator size="large" color="#9DBDFF" />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {facultyList.map((faculty) => (
                  <TouchableOpacity
                    key={faculty.id}
                    onPress={() => handleChangeFaculty(faculty.username)}
                    className="p-3 border-b border-gray-500"
                  >
                    <Text className="text-white">
                      {faculty.firstName} {faculty.lastName} ({faculty.username})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity className="bg-red-500 p-2 rounded-lg" onPress={() => setFacultyModalVisible(false)}>
                <Text className="text-white">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ----- End of Edit Faculty Modal ----- */}

      {/* ----- New DateTime Picker Modal ----- */}
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        date={selectedDateTime}
        onConfirm={handleConfirmDateTime}
        onCancel={() => setIsDateTimePickerVisible(false)}
      />
      {/* ----- End of DateTime Picker Modal ----- */}

    </View>
  );
};

export default SubjectDetailScreen;