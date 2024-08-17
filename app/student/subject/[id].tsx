import { View, Text } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetStudentSubjectInfo } from '@/api/student';
import { Calendar } from 'react-native-calendars';

const SubjectDetail = () => {
  const { id } = useLocalSearchParams();

  // Ensure id is a string
  const subjectId = Array.isArray(id) ? id[0] : id;

  const { data: subjectInfo } = useGetStudentSubjectInfo({ subjectId });

  if (!subjectInfo) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Create an object to hold marked dates
  const markedDates = {};

  // Variables to track total lectures and attended lectures
  let totalLecsCount = 0;
  let attendedLecsCount = 0;

  // Iterate over total lectures to populate markedDates with green or red background
  //@ts-ignore
  subjectInfo.totalLecs.forEach((lec) => {
    const date = lec.date.split('T')[0]; // Extract the date part
    //@ts-ignore
    const attended = subjectInfo.attendedLecs.some(att => att.date === lec.date);

    // Increment total lectures count
    totalLecsCount += lec.value;

    // Increment attended lectures count if attended
    if (attended) {
      attendedLecsCount += lec.value;
    }
    //@ts-ignore
    markedDates[date] = {
      selected: true,
      selectedColor: attended ? 'green' : 'red',
      selectedTextColor: 'white', // Optional: Makes the text color white for better contrast
    };
  });

  return (
    <View className="flex-1 p-5">
      <Stack.Screen
        options={{
          title: `${subjectInfo.subjectName}`,
          headerShown: true,
        }}
      />

      <Calendar
        markedDates={markedDates}
        // Additional customization options can be added here
        style={{ borderRadius: 10, overflow: 'hidden' }} // Apply rounded corners to the calendar
        theme={{
          todayTextColor: 'blue',
          arrowColor: 'black',
          monthTextColor: 'black',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 16,
        }}
      />

      <View className="bg-gray-100 rounded-2xl p-6 mt-6 shadow-lg">
        <View className="bg-zinc-300 rounded-t-2xl -m-6 p-4">
          <Text className="text-zinc-900 text-xl font-semibold">{subjectInfo.subjectName}</Text>
        </View>
        <View className="pt-10">
          <Text className="text-lg text-gray-700">
            Total Lectures: <Text className="font-bold">{totalLecsCount}</Text>
          </Text>
          <Text className="text-lg text-gray-700 mt-1">
            Attended Lectures: <Text className="font-bold">{attendedLecsCount}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SubjectDetail;
