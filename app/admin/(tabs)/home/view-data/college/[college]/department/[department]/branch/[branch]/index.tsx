import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE, PINNED_GRADUATION_LEVELS_ADMIN } from '@/constants/async-store-keys';

const GraduationLevelScreen = () => {
  const { college, department, branch } = useLocalSearchParams(); // Extract the params
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedGradLevels, setPinnedGradLevels] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned graduation levels
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        // @ts-ignore
        const cachedPinnedGradLevels = await AsyncStorage.getItem(PINNED_GRADUATION_LEVELS_ADMIN(college, department, branch));
        if (cachedPinnedGradLevels) {
          setPinnedGradLevels(JSON.parse(cachedPinnedGradLevels));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned grad levels:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department, branch]);

  // Handle API response data update
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); 
    }
  }, [apiResponse]);

  // Save pinned graduation levels
  const savePinnedGradLevels = async (newPinnedGradLevels: string[]) => {
    try {
      // @ts-ignore
      await AsyncStorage.setItem(PINNED_GRADUATION_LEVELS_ADMIN(college, department, branch), JSON.stringify(newPinnedGradLevels));
    } catch (error) {
      console.log('Error saving pinned grad levels:', error);
    }
  };

  // Toggle pin for graduation level
  const togglePinGradLevel = (gradLevel: string) => {
    setPinnedGradLevels((prevPinnedGradLevels) => {
      const newPinnedGradLevels = prevPinnedGradLevels.includes(gradLevel)
        ? prevPinnedGradLevels.filter((g) => g !== gradLevel)
        : [...prevPinnedGradLevels, gradLevel];

      savePinnedGradLevels(newPinnedGradLevels);
      return newPinnedGradLevels;
    });
  };

  // Sort and filter graduation levels
  const sortedGradLevels = useMemo(() => {
    // @ts-ignore
    if (!offlineData || !offlineData[college] || !offlineData[college][department] || !offlineData[college][department][branch]) {
      return [];
    }
    // Access the graduation levels (such as 'be' in the example)
    // @ts-ignore
    const gradLevels = Object.keys(offlineData[college][department][branch]);
    const pinned = gradLevels.filter((gradLevel) => pinnedGradLevels.includes(gradLevel));
    const unpinned = gradLevels.filter((gradLevel) => !pinnedGradLevels.includes(gradLevel));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, branch, pinnedGradLevels]);

  // Loading indicator
  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  // Error state
  if (error && !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  // No data found state
  if (!sortedGradLevels.length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  // Render each graduation level card
  const renderGradLevelCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-data/college/${college}/department/${department}/branch/${branch}/graduationLevel/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
      </View>
      <TouchableOpacity onPress={() => togglePinGradLevel(item)}>
        <AntDesign
          name={pinnedGradLevels.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedGradLevels.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedGradLevels}
        keyExtractor={(item) => item}
        renderItem={renderGradLevelCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default GraduationLevelScreen;
