import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAnalyseAttendance } from '@/api/faculty/attendances';

const AnalyseAttendanceScreen = () => {

  const { subjectId } = useLocalSearchParams();

  const { data, isLoading, error } = useGetAnalyseAttendance(subjectId as string);

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Calculate attendance percentage for each student
  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return '0%';
    return `${((attendedLecs / totalLecs) * 100).toFixed(2)}%`;
  };

  return (
    <View className="flex flex-1 bg-gray-900 p-4">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Top Card with Subject Details (You can adjust this as needed) */}
      <View className="bg-slate-300 p-4 rounded-lg mb-4">
        <Text className="text-2xl font-semibold text-gray-800 mb-2">Subject & Other Details</Text>
      </View>

      {/* Filter Options (Placeholder) */}
      <TouchableOpacity className="bg-gray-700 p-4 rounded-lg mb-4">
        <Text className="text-center text-white text-lg">Filter Options</Text>
      </TouchableOpacity>

      {/* List of Students using FlatList */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.studentId}
        renderItem={({ item }) => (
          <View key={item.studentId} className="bg-gray-800 p-4 rounded-lg mb-4 flex-row justify-between items-center">
            <Text className="text-white font-bold text-lg">{item.student.personalInfo.firstName} {item.student.personalInfo.lastName}</Text>
            <View className="flex-row items-center">
              <Text className="text-blue-500 font-bold text-lg mr-2">{item.attendedLecs} / {item.totalLecs}</Text>
              <Text className="text-gray-300 font-bold text-lg">{calculatePercentage(item.attendedLecs, item.totalLecs)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

    </View>
  );
};

export default AnalyseAttendanceScreen;
