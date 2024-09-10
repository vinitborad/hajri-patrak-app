import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'subjects-structure';

const Branch = () => {
  const { department, branch } = useLocalSearchParams<{ department: string; branch: string }>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Manage offline data loading

  // Fetch the data from the API using custom hook
  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false); // Done loading offline data
      }
    };

    fetchOfflineData();
  }, []);

  // Update offline data if API returns updated data
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Determine the data to display (either offline or API)
  const dataToShow = apiResponse?.data || offlineData;

  // Conditional rendering moved outside hook logic to avoid violations of hooks order
  if (isOfflineLoading || isLoading) {
    return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  }

  if (error && !offlineData) {
    return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;
  }

  if (!dataToShow) {
    return <Text className="text-center text-[#FF6B6B] mt-4">No Data Available !</Text>;
  }

  // Extract degrees under the selected department and branch
  const degrees = dataToShow.ldce?.[department]?.[branch] || {};

  const handleDivisionPress = (gradLevel: string, sem: string, div: string) => {
    router.push(`/faculty/home/department/${department}/branch/${branch}/subject?graduationLevel=${gradLevel}&sem=${sem}&division=${div}`);
  };

  // Render a card for each division
  const renderDivisionItem = ({ sem, div, gradLevel }: { sem: string, div: string, gradLevel: string }) => (
    <TouchableOpacity
      key={sem + div}
      className="bg-[#3b3e44] p-4 rounded-lg shadow-md my-2 flex-row justify-between items-center mx-4 border border-[#9DBDFF]"
      onPress={() => handleDivisionPress(gradLevel, sem, div)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{`Sem ${sem} Div ${div}`}</Text>
    </TouchableOpacity>
  );

  // Render each degree and its respective semesters and divisions
  const renderDegreeItem = ({ item }: { item: string }) => {
    const semesters = Object.keys(degrees[item]);

    return (
      <View key={item} className="mb-4">
        <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-4 ml-4">{item}</Text>
        {semesters.map((sem) => (
          <View key={sem}>
            {Object.keys(degrees[item][sem]).map((div) => renderDivisionItem({ sem, div, gradLevel: item }))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex flex-1 justify-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={Object.keys(degrees)}
        keyExtractor={(item) => item}
        //@ts-ignore
        renderItem={renderDegreeItem}
        contentContainerStyle={{ paddingBottom: 16 }}
        className="w-full"
      />
    </View>
  );
};

export default Branch;
