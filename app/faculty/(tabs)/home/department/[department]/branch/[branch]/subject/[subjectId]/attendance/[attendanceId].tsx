import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAttendanceInfo } from '@/api/faculty/attendances';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ATTENDANCE_INFO, DIVISION_STUDENTS_LIST } from '@/constants/async-store-keys';

const ViewAttendanceScreen = () => {
  const { attendanceId } = useLocalSearchParams();

  const [offlineData, setOfflineData] = useState(null); // Store offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Track offline loading state
  const [allStudents, setAllStudents] = useState([]); // Store combined students from divisions

  // Fetch data from the API (hook always called in the same order)
  const { data, isLoading, error } = useGetAttendanceInfo(attendanceId as string);

  // Fetch offline data on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ATTENDANCE_INFO(attendanceId as string));
        console.log('cachedData:', cachedData);
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

  // Store the fetched data in AsyncStorage
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

  // Extract data from the response
  const attendanceDetails = dataToShow?.attendance || {};
  const subjectDetails = attendanceDetails?.subject || {};
  const divisions = dataToShow?.divisions || [];
  const presentStudents = dataToShow?.presentStudents || [];

  // Function to fetch students from each division stored in AsyncStorage
  const fetchStudentsFromDivisions = async (divisionIds: string[]) => {
    let combinedStudents = [];
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

  // Fetch students once when divisions are available
  useEffect(() => {
    const getAllStudents = async () => {
      if (divisions.length > 0) {
        const students = await fetchStudentsFromDivisions(divisions);
        setAllStudents(students);
      }
    };
    getAllStudents(); // Ensuring the effect runs only once based on divisions array
  }, [divisions]);

  // Helper function to check if a student was present
  const isStudentPresent = (studentId: string) => presentStudents.includes(studentId);

  // Sort students by enrollment number (username)
  const sortedStudents = allStudents.sort((a, b) => parseInt(a.username) - parseInt(b.username));

  // Calculate present/total counts
  const presentCount = presentStudents.length;
  const totalCount = sortedStudents.length;

  if (isLoading && isOfflineLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error && !offlineData) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPresent = isStudentPresent(item.id);
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
