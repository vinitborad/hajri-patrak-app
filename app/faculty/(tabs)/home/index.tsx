import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/faculty/data/structure';
import { ACTIVE_SUBJECTS_STRUCTURE, PINNED_COLLEGES } from '@/constants/async-store-keys';

const CollegesScreen = () => {
  const router = useRouter();
  
  const [offlineData, setOfflineData] = useState<any>(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage loading state for offline data
  const [pinnedColleges, setPinnedColleges] = useState<string[]>([]); // Array for pinned colleges

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned colleges on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ACTIVE_SUBJECTS_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }

        const cachedPinnedColleges = await AsyncStorage.getItem(PINNED_COLLEGES);
        if (cachedPinnedColleges) {
          setPinnedColleges(JSON.parse(cachedPinnedColleges)); // Load pinned colleges from AsyncStorage
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned colleges:', error);
      } finally {
        setIsOfflineLoading(false); // Done loading offline data
      }
    };

    fetchOfflineData();
  }, []);

  // If we have API data that is updated, refresh the UI and store it offline
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
      AsyncStorage.setItem(ACTIVE_SUBJECTS_STRUCTURE, JSON.stringify(apiResponse.data)); // Save updated data to AsyncStorage
    }
  }, [apiResponse]);

  // Persist pinned colleges in AsyncStorage whenever updated
  const savePinnedColleges = async (newPinnedColleges: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_COLLEGES, JSON.stringify(newPinnedColleges));
    } catch (error) {
      console.log('Error saving pinned colleges:', error);
    }
  };

  // Handle pinning and unpinning of colleges
  const togglePinCollege = (college: string) => {
    setPinnedColleges((prevPinnedColleges) => {
      const newPinnedColleges = prevPinnedColleges.includes(college)
        ? prevPinnedColleges.filter((c) => c !== college) // Unpin
        : [...prevPinnedColleges, college]; // Pin

      savePinnedColleges(newPinnedColleges); // Save updated pinned colleges
      return newPinnedColleges;
    });
  };

  // Memoized sorting for performance optimization
  const sortedColleges = useMemo(() => {
    if (!offlineData) return [];
    const colleges = Object.keys(offlineData); // Extract college keys (ldce, ldce2, etc.)
    const pinned = colleges.filter((college) => pinnedColleges.includes(college));
    const unpinned = colleges.filter((college) => !pinnedColleges.includes(college));
    return [...pinned, ...unpinned];
  }, [offlineData, pinnedColleges]);

  // Redirect if only one college exists
  useEffect(() => {
    if (sortedColleges.length === 1) {
      const college = sortedColleges[0];
      router.replace(`/faculty/(tabs)/home/college/${college}`);
    }
  }, [sortedColleges]);

  // Handle no colleges case
  if (!sortedColleges.length && !isLoading && !isOfflineLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error && !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const renderCollegeCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/faculty/(tabs)/home/college/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
      </View>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinCollege(item)}>
        <AntDesign
          name={pinnedColleges.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedColleges.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedColleges}
        keyExtractor={(item) => item}
        renderItem={renderCollegeCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default CollegesScreen;