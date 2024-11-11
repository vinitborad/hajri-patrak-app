import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAttendanceInfo } from '@/api/faculty/attendances';
import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ATTENDANCE_INFO, DIVISION_STUDENTS_LIST } from '@/constants/async-store-keys';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { facultyEndpoints } from '@/constants/api-endpoints';
import StudentInfoModal from '@/components/custom/StudentInfoModal';

const ViewAttendanceScreen = () => {
  const { attendanceId } = useLocalSearchParams();

  const [offlineData, setOfflineData] = useState(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput>(null); // Reference to control TextInput focus

  const { data, isLoading, error, refetch } = useGetAttendanceInfo(attendanceId as string);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ATTENDANCE_INFO(attendanceId as string));
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
  }, [attendanceId]);

  useEffect(() => {
    if (data) {
      try {
        AsyncStorage.setItem(ATTENDANCE_INFO(attendanceId as string), JSON.stringify(data));
      } catch (error) {
        console.log('Error saving offline data:', error);
      }
    }
  }, [data, attendanceId]);

  const dataToShow = data || offlineData;

  const attendanceDetails = dataToShow?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const divisions = dataToShow?.divisions || [];
  const presentStudents = dataToShow?.presentStudents || [];

  const fetchStudentsFromDivisions = async (divisionIds: string[]) => {
    let combinedStudents: any = [];
    for (const divisionId of divisionIds) {
      try {
        const storedDivisionData = await AsyncStorage.getItem(DIVISION_STUDENTS_LIST(divisionId));
        const parsedData = storedDivisionData ? JSON.parse(storedDivisionData).students || [] : [];
        combinedStudents = combinedStudents.concat(parsedData);
      } catch (error) {
        console.log('Error fetching students from offline data:', error);
      }
    }
    return combinedStudents;
  };

  useEffect(() => {
    const getAllStudents = async () => {
      if (divisions.length > 0) {
        const students = await fetchStudentsFromDivisions(divisions);
        setAllStudents(students);
      }
    };
    getAllStudents();
  }, [divisions]);

  const isStudentPresent = (studentId: string) => presentStudents.includes(studentId);

  const sortedStudents = allStudents.sort((a: any, b: any) => parseInt(a.username) - parseInt(b.username));
  const presentCount = presentStudents.length;
  const totalCount = sortedStudents.length;

  const confirmStudentSwitch = (studentId: string, isPresent: boolean) => {
    const newStatus = isPresent ? 'absent' : 'present';
    Alert.alert(
      'Confirm Update',
      `Are you sure you want to mark this student as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => handleStudentSwitch(studentId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleStudentSwitch = async (studentId: string) => {
    setLoadingStudentId(studentId);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.patch(
        facultyEndpoints.CHANGE_STUDENT_STATUS,
        { studentId, attendanceId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await refetch();
    } catch (error: any) {
      if (error.response.data.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setLoadingStudentId(null);
    }
  };

  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error && !offlineData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <View className="px-4">
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

      <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
        <View className="flex flex-row items-center">
          <Ionicons name="people-outline" size={20} color="#9DBDFF" />
          <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] ml-2">Present Count : {presentCount} / {totalCount}</Text>
        </View>
      </View>
    </View>
  );

  // Filter students based on searchText
  const filteredStudents = sortedStudents.filter((student: any) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      student.username.includes(searchText) || fullName.includes(searchText.toLowerCase())
    );
  });

  return (
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Search Bar */}
      <View className="flex-row items-center bg-[#3b3e44] p-2 rounded-lg mt-2 mb-2 ml-4 mr-4">
        <Ionicons name="search" size={20} color="#9DBDFF" />
        <TextInput
          ref={searchInputRef} // Attach ref to TextInput
          placeholder="Search by enrollment or name"
          placeholderTextColor="#9DBDFF"
          value={searchText}
          onChangeText={setSearchText}
          className="ml-2 flex-1 text-white"
        />
        {searchText ? (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              searchInputRef.current?.blur(); // Remove focus when clearing
            }}
          >
            <Ionicons name="close" size={20} color="#9DBDFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item.id);
          return (
            <View
              className={`p-2 pl-4 pr-5 rounded-lg mb-2 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-[#2D6A4F]' : 'bg-[#c33f43]'
                } border border-[#1B4332}`}
            >
              <View>
                <View className='flex-row items-center gap-x-1'>
                  <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
                    <FontAwesome5 name="id-badge" size={18} color="#F6F5F5" /> {item.username}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedStudentUsername(item.username)}>
                    <Ionicons name="information-circle-outline" size={24} color="#9DBDFF" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[#F6F5F5]">
                  <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item?.firstName} {item?.lastName}
                </Text>
              </View>
              <TouchableOpacity
                className={`p-3 rounded-full ${isPresent ? 'bg-[#A7C957]' : 'bg-[#FF6B6B]'}`}
                onPress={() => confirmStudentSwitch(item.id, isPresent)}
                disabled={loadingStudentId === item.id}
              >
                {loadingStudentId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="edit" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListHeaderComponent={ListHeaderComponent}
      />

      {/* Student Info Modal */}
      {selectedStudentUsername && (
        <StudentInfoModal
          username={selectedStudentUsername}
          onClose={() => setSelectedStudentUsername(null)}
        />
      )}

    </View>
  );
};

export default ViewAttendanceScreen;