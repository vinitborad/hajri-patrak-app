import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT_PREVIOUS_DIVISIONS } from '@/constants/async-store-keys'; // Async storage keys
import { useGetPreviousDivisions } from '@/api/student/data/subject';
import { useRouter } from 'expo-router';

const PreviousDivisionsScreen = () => {
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null); // To store offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Loading state for offline data
  const { data: apiResponse, isLoading, error } = useGetPreviousDivisions(); // API Hook

  // Fetch offline data from AsyncStorage on component mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(STUDENT_PREVIOUS_DIVISIONS);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Load offline data
        }
      } catch (err) {
        console.log('Error fetching offline data:', err);
      } finally {
        setIsOfflineLoading(false); // Loading complete
      }
    };

    fetchOfflineData();
  }, []);

  // Update the cached data if the API response is available and updated
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Update state with new data
    }
  }, [apiResponse]);

  const dataToShow = apiResponse?.data || offlineData; // Use API data or fallback to offline data

  // Sorting logic
  const sortDivisions = (divisions: any[]) => {
    return divisions.sort((a, b) => {
      // Sort by semester in reverse order (descending)
      if (a.semester !== b.semester) {
        return b.semester - a.semester;
      }

      // Sort by division alphabetically
      if (a.division.toLowerCase() !== b.division.toLowerCase()) {
        return a.division.toLowerCase() > b.division.toLowerCase() ? 1 : -1;
      }

      // Sort by interDivision alphabetically
      if (a.interDivision && b.interDivision && a.interDivision !== b.interDivision) {
        return a.interDivision.toLowerCase() > b.interDivision.toLowerCase() ? 1 : -1;
      }

      return 0;
    });
  };

  const sortedDivisions = dataToShow?.divisions ? sortDivisions([...dataToShow.divisions]) : [];

  if (isLoading || isOfflineLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (!sortedDivisions.length) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#F6F5F5]">No previous divisions available.</Text>
      </View>
    );
  }

  // Render individual division card
  const renderDivisionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-[#3b3e44] p-4 mb-4 rounded-lg border border-[#9DBDFF]"
      onPress={() => router.push(`/student/(tabs)/profile/previous-divisions/${item._id}/subjects`)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{`Sem ${item.semester} Div ${item.division}${item.interDivision}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <FlatList
        data={sortedDivisions}
        keyExtractor={(item) => item._id}
        renderItem={renderDivisionItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text className="text-2xl text-[#F6F5F5] mb-4 font-NunitoExtraBold">Previous Divisions</Text>}
        contentContainerStyle={{ paddingBottom: 100 }} // To avoid content being cut off at the bottom
      />
    </View>
  );
};

export default PreviousDivisionsScreen;