import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import moment from 'moment-timezone';
import { FontAwesome5 } from '@expo/vector-icons';
import { commonEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const StudentPreviousAttendancesScreen = () => {
  const { username, id: subjectId } = useLocalSearchParams();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const response = await axios.get(commonEndpoints.GET_STUDENT_SUBJECT_PREVIOUS_ATTENDANCES, {
          headers: { Authorization: `Bearer ${token}` },
          params: { username, subjectId },
        });

        if (response.data.success) {
          setAttendanceData(response.data.data.attendanceInfo);
        } else {
          setError('Failed to fetch attendance data');
        }
      } catch (err) {
        setError('An error occurred while fetching attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [username, subjectId]);

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const dateIST = moment(item.date).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
    const isAttended = item.isPresent;

    return (
      <View className={`mb-4 rounded-2xl border-2 flex-col ${isAttended ? 'border-[#53c17b]' : 'border-[#FF6B6B]'} bg-[#3b3e44]`}>
        <View className="rounded-t-2xl bg-[#3b3e44] pt-4 pl-4">
          <Text className="text-lg font-NunitoBold text-[#F6F5F5]">
            <FontAwesome5 name="calendar-alt" size={19} color="#F6F5F5" />  {dateIST}
          </Text>
        </View>
        <View className="p-4 flex-row items-center justify-between rounded-b-xl">
          <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF]">
            <FontAwesome5 name="clock" size={16} color="#9DBDFF" /> {item.value} Hour(s)
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B] mt-4">{error}</Text>
      </View>
    );
  }

  if (attendanceData.length === 0) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B] text-lg">N / A</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1 bg-[#1E1E1E] p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item.attendance}
        renderItem={renderAttendanceItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 250 }}
      />
    </View>
  );
};

export default StudentPreviousAttendancesScreen;