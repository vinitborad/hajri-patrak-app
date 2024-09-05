import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAnalyseAttendance } from '@/api/faculty/attendances';
import { Ionicons } from '@expo/vector-icons';

const AnalyseAttendanceScreen = () => {
  const { subjectId } = useLocalSearchParams();
  const { data, isLoading, error } = useGetAnalyseAttendance(subjectId as string);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filter, setFilter] = useState(''); // '' for no filter, or filter type

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Calculate attendance percentage for each student
  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return '0%';
    return `${((attendedLecs / totalLecs) * 100).toFixed(2)}%`;
  };

  // Handle filtering logic
  const filteredData = data.filter(item => {
    const percentage = parseFloat(calculatePercentage(item.attendedLecs, item.totalLecs));
    if (filter === 'below25') return percentage < 25;
    if (filter === 'below50') return percentage >= 25 && percentage < 50;
    if (filter === 'below75') return percentage >= 50 && percentage < 75;
    if (filter === 'below100') return percentage >= 75 && percentage < 100;
    return true; // No filter
  });

  return (
    <View className="flex flex-1 bg-[#1E1E1E] p-4">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Filter Options */}
      <TouchableOpacity
        className="bg-[#3b3e44] p-4 rounded-lg mb-4 flex-row items-center justify-between border border-[#9DBDFF]"
        onPress={() => setFilterModalVisible(true)}
      >
        <Text className="text-white text-lg">Filter Options</Text>
        <Ionicons name="options-outline" size={24} color="#9DBDFF" />
      </TouchableOpacity>

      {/* List of Students */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.student.username}
        renderItem={({ item }) => (
          <View key={item.student.username} className="bg-[#3b3e44] p-4 rounded-lg mb-4 flex-row justify-between items-center border border-[#9DBDFF]">
            <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">{item.student.personalInfo.firstName} {item.student.personalInfo.lastName}</Text>
            <View className="flex-row items-center">
              <Text className="text-[#9DBDFF] font-bold text-lg mr-2">{item.attendedLecs} / {item.totalLecs}</Text>
              <Text className="text-[#F6F5F5] font-bold text-lg">{calculatePercentage(item.attendedLecs, item.totalLecs)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg w-80">
            <Text className="text-white text-lg font-bold mb-4">Sort by Attendance Percentage</Text>
            <TouchableOpacity className="p-2 mb-2 rounded-lg bg-[#1E1E1E]" onPress={() => setFilter('')}>
              <Text className="text-white">Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 mb-2 rounded-lg bg-[#1E1E1E]" onPress={() => setFilter('below25')}>
              <Text className="text-white">Below 25%</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 mb-2 rounded-lg bg-[#1E1E1E]" onPress={() => setFilter('below50')}>
              <Text className="text-white">Below 50%</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 mb-2 rounded-lg bg-[#1E1E1E]" onPress={() => setFilter('below75')}>
              <Text className="text-white">Below 75%</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 mb-2 rounded-lg bg-[#1E1E1E]" onPress={() => setFilter('below100')}>
              <Text className="text-white">Below 100%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-2 rounded-lg mt-4"
              onPress={() => setFilterModalVisible(false)}
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AnalyseAttendanceScreen;
