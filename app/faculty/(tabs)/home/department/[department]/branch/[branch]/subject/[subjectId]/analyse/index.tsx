import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGetAnalyseAttendance } from '@/api/faculty/attendances';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANALYSIS } from '@/constants/async-store-keys';

const AnalyseAttendanceScreen = () => {
  const { subjectId } = useLocalSearchParams();
  const { data, isLoading, error } = useGetAnalyseAttendance(subjectId as string);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filter, setFilter] = useState(''); // Filter state
  const [offlineData, setOfflineData] = useState(null); // State for offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage offline data loading state

  // Fetch offline data when the component mounts
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ANALYSIS(subjectId as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Load offline data
        }
      } catch (error) {
        console.error('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false); // Stop loading
      }
    };
    fetchOfflineData();
  }, [subjectId]);

  // Store fresh API data offline
  useEffect(() => {
    if (data) {
      AsyncStorage.setItem(ANALYSIS(subjectId as string), JSON.stringify(data));
    }
  }, [data]);

  // Handling loading and error states
  if (isLoading && isOfflineLoading) {
    return <Text className="text-center text-white mt-4">Loading...</Text>;
  }
  if (error && !offlineData) {
    return <Text className="text-center text-red-500 mt-4">No Data Available !</Text>;
  }

  const dataToShow = data || offlineData; // Choose data from API or offline storage

  // Check if there's no data to show
  if (!dataToShow || dataToShow.length === 0) {
    return <Text className="text-center text-red-500 mt-4">No analysis data available</Text>;
  }

  // Calculate attendance percentage for each student
  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return '0%';
    return `${((attendedLecs / totalLecs) * 100).toFixed(2)}%`;
  };

  // Handle filtering logic based on percentage ranges
  const filteredData = dataToShow
    //@ts-ignore
    .filter((item) => {
      const percentage = parseFloat(calculatePercentage(item.attendedLecs, item.totalLecs));
      if (filter === 'below25') return percentage < 25;
      if (filter === 'below50') return percentage >= 25 && percentage < 50;
      if (filter === 'below75') return percentage >= 50 && percentage < 75;
      if (filter === 'below100') return percentage >= 75 && percentage < 100;
      return true; // No filter
    })
    //@ts-ignore
    .sort((a, b) => a.student.username.localeCompare(b.student.username)); // Sort by username (roll number)

  return (
    <View className="flex flex-1 bg-[#1E1E1E] p-4">
      <Stack.Screen options={{ headerShown: false }} />

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
            <View>
              <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
                {item.student.personalInfo.firstName} {item.student.personalInfo.lastName}
              </Text>
              <Text className="text-[#9DBDFF] text-sm">Roll No: {item.student.username}</Text>
              <Text className="text-[#9DBDFF] text-sm">Inter-Division: {item.interDivision}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[#9DBDFF] font-bold text-lg mr-2">
                {item.attendedLecs} / {item.totalLecs}
              </Text>
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
            <TouchableOpacity className="bg-red-500 p-2 rounded-lg mt-4" onPress={() => setFilterModalVisible(false)}>
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal >
    </View >
  );
};

export default AnalyseAttendanceScreen;
