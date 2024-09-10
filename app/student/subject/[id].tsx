import { View, Text, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetStudentSubjectInfo } from '@/api/student';
import { Calendar } from 'react-native-calendars';
import moment from 'moment-timezone';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubjectDetail = () => {
  const { id } = useLocalSearchParams();
  const subjectId = Array.isArray(id) ? id[0] : id;

  const [offlineData, setOfflineData] = useState(null);  // To hold the offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Loading state for offline data
  const { data: subjectInfo, error } = useGetStudentSubjectInfo({ subjectId });

  // Fetch offline data immediately when component mounts
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(`subject-info-${subjectId}`);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log("Error fetching offline data:", error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [subjectId]);

  // When we receive API data, update the offline data with the new data
  useEffect(() => {
    if (subjectInfo && !error) {
      AsyncStorage.setItem(`subject-info-${subjectId}`, JSON.stringify(subjectInfo)).catch(err =>
        console.log("Error saving data to AsyncStorage:", err)
      );
    }
  }, [subjectInfo]);

  // Show offline data while loading
  const dataToShow = subjectInfo || offlineData;

  if (isOfflineLoading && !dataToShow) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#F6F5F5]">Loading data...</Text>
      </View>
    );
  }

  if (error && !offlineData) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#FF6B6B]">No Data Available</Text>
      </View>
    );
  }

  const { subjectName, subjectCode, subjectType, attendanceInfo } = dataToShow || {};

  const markedDates = {};
  let totalLecsCount = 0;
  let attendedLecsCount = 0;

  //@ts-ignore
  attendanceInfo?.forEach((lec) => {
    const date = lec.date.split('T')[0];

    totalLecsCount += lec.value;

    if (lec.isPresent) {
      attendedLecsCount += lec.value;
    }

    //@ts-ignore
    markedDates[date] = {
      selected: true,
      selectedColor: lec.isPresent ? '#44965d' : '#FF6B6B',
      selectedTextColor: 'white',
    };
  });

  const attendancePercentage = totalLecsCount > 0 ? ((attendedLecsCount / totalLecsCount) * 100).toFixed(0) : '0.00';

  //@ts-ignore
  const renderAttendanceItem = ({ item }) => {
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

  return (
    <ScrollView className="flex-1 bg-[#1E1E1E]">
      <View className="p-5">
        <Stack.Screen
          options={{
            title: `${subjectName}`,
            headerShown: true,
            headerStyle: { backgroundColor: '#3b3e44' },
            headerTitleStyle: { color: '#9DBDFF', fontFamily: 'NunitoExtraBold' },
          }}
        />

        <View className="bg-[#3b3e44] rounded-2xl p-6 mb-6 border border-[#9DBDFF] shadow-lg">
          <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] mb-2">
            {subjectName} ({subjectCode})
          </Text>
          <Text className="text-lg font-NunitoBold text-[#F6F5F5]">
            Type: <Text className="text-[#FFD7C4]">{subjectType}</Text>
          </Text>
        </View>

        <Calendar
          markedDates={markedDates}
          style={{ borderRadius: 10, overflow: 'hidden', borderColor: '#9DBDFF', borderWidth: 4, padding: 10, backgroundColor: '#2D2D2D' }}
          theme={{
            backgroundColor: '#2D2D2D',
            calendarBackground: '#2D2D2D',
            todayTextColor: '#9DBDFF',
            dayTextColor: '#F6F5F5',
            textDisabledColor: '#3E3E3E',
            arrowColor: '#9DBDFF',
            monthTextColor: '#9DBDFF',
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 16,
          }}
        />

        {/* Attendance Summary Section */}
        <View className="bg-[#2D2D2D] rounded-2xl p-4 mt-4 border border-[#FF8800] shadow-lg flex-row justify-between items-center">
          {/* Text Information */}
          <View>
            <Text className="text-lg font-NunitoExtraBold text-[#FF8800]">
              Total Lecs : <Text className="font-NunitoBold">{totalLecsCount}</Text>
            </Text>
            <Text className="text-lg font-NunitoExtraBold text-[#FF8800]">
              Attended : <Text className="font-NunitoBold">{attendedLecsCount}</Text>
            </Text>
          </View>

          {/* Circle for Percentage */}
          <View className="flex items-center justify-center w-16 h-16 border-2 border-[#FF8800] rounded-full">
            <Text className="text-lg font-NunitoExtraBold text-[#FF8800]">
              {attendancePercentage}
            </Text>
          </View>
        </View>


        <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-6 mb-2">Attendance Details</Text>

        <FlatList
          data={attendanceInfo}
          keyExtractor={(item) => item.date}
          renderItem={renderAttendanceItem}
          scrollEnabled={false} // Disable internal scroll, we'll rely on the ScrollView
        />
      </View>
    </ScrollView>
  );
};

export default SubjectDetail;
