import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'subjects-structure';

const Department = () => {
  const { department } = useLocalSearchParams();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage loading state for offline data

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

  // If we have API data that is updated, refresh the UI
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Combine data from API or offline source
  const dataToShow = apiResponse?.data || offlineData;

  // Conditional rendering moved outside hook logic to avoid violations of hooks order
  if (isOfflineLoading || isLoading) {
    return <Text className="text-[#F6F5F5]">Loading...</Text>;
  }

  if (error && !offlineData) {
    return <Text className="text-[#FF6B6B]">Error loading data</Text>;
  }

  if (!dataToShow || !department) {
    return <Text className="text-[#FF6B6B]">No data available</Text>;
  }

  // Extract branches under the selected department
  const branches = Object.keys(dataToShow.ldce[department as keyof typeof dataToShow.ldce]);

  const renderBranchCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="bg-[#3b3e44] p-4 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/faculty/home/department/${department}/branch/${item}`)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={branches}
        keyExtractor={(item) => item}
        renderItem={renderBranchCard}
        contentContainerStyle={{ padding: 16 }}
        className="w-full"
      />
    </View>
  );
};

export default Department;
