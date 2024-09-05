import { View, Text, ScrollView, FlatList } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetStudentSubjectInfo } from '@/api/student';
import { Calendar } from 'react-native-calendars';
import moment from 'moment-timezone';
import { FontAwesome5 } from '@expo/vector-icons';

const SubjectDetail = () => {
  const { id } = useLocalSearchParams();

  const subjectId = Array.isArray(id) ? id[0] : id;

  const { data: subjectInfo } = useGetStudentSubjectInfo({ subjectId });

  if (!subjectInfo) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#F6F5F5]">Loading...</Text>
      </View>
    );
  }

  const markedDates = {};

  let totalLecsCount = 0;
  let attendedLecsCount = 0;

  subjectInfo.totalLectures.forEach((lec) => {
    const date = lec.date.split('T')[0];
    const attended = subjectInfo.attendedLectures.some(att => att.date === lec.date);

    totalLecsCount += lec.value;

    if (attended) {
      attendedLecsCount += lec.value;
    }

    markedDates[date] = {
      selected: true,
      selectedColor: attended ? '#9DBDFF' : '#FF6B6B',
      selectedTextColor: 'white',
    };
  });

  const renderAttendanceItem = ({ item }) => {
    const dateIST = moment(item.date).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
    const isAttended = subjectInfo.attendedLectures.some(att => att.date === item.date);

    return (
      <View className={`mb-4 rounded-2xl border-2 flex-col ${isAttended ? 'border-[#BEDC74]' : 'border-[#FF6B6B]'} bg-[#3b3e44]`}>
        <View className=" rounded-t-2xl bg-[#3b3e44] pt-4 pl-4">
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
            title: `${subjectInfo.subjectName}`,
            headerShown: true,
            headerStyle: { backgroundColor: '#3b3e44' },
            headerTitleStyle: { color: '#9DBDFF', fontFamily: 'NunitoExtraBold' },
          }}
        />

        <View className="bg-[#3b3e44] rounded-2xl p-6 mb-6 border border-[#9DBDFF] shadow-lg">
          <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] mb-2">
            {subjectInfo.subjectName} ({subjectInfo.subjectCode})
          </Text>
          <Text className="text-lg font-NunitoBold text-[#F6F5F5]">
            Type: <Text className="text-[#FFD7C4]">{subjectInfo.subjectType}</Text>
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

        <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-6 mb-2">Attendance Details</Text>

        <FlatList
          data={subjectInfo.totalLectures}
          keyExtractor={(item) => item._id || item.date}
          renderItem={renderAttendanceItem}
          scrollEnabled={false} // Disable internal scroll, we'll rely on the ScrollView
        />
      </View>
    </ScrollView>
  );
};

export default SubjectDetail;
