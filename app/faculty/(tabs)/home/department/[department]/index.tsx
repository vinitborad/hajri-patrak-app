import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBJECT_STRUCTURE, PINNED_BRANCHES } from '@/constants/async-store-keys';
import { AntDesign } from '@expo/vector-icons';

const Department = () => {
  const { department } = useLocalSearchParams();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage loading state for offline data
  const [pinnedBranches, setPinnedBranches] = useState<string[]>([]); // Array for pinned branches

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned branches on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(SUBJECT_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }

        const cachedPinnedBranches = await AsyncStorage.getItem(PINNED_BRANCHES);
        if (cachedPinnedBranches) {
          setPinnedBranches(JSON.parse(cachedPinnedBranches)); // Load pinned branches from AsyncStorage
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned branches:', error);
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

  // Persist pinned branches in AsyncStorage whenever updated
  const savePinnedBranches = async (newPinnedBranches: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_BRANCHES, JSON.stringify(newPinnedBranches));
    } catch (error) {
      console.log('Error saving pinned branches:', error);
    }
  };

  // Handle pinning and unpinning
  const togglePinBranch = (branch: string) => {
    setPinnedBranches((prevPinnedBranches) => {
      const newPinnedBranches = prevPinnedBranches.includes(branch)
        ? prevPinnedBranches.filter((b) => b !== branch) // Unpin
        : [...prevPinnedBranches, branch]; // Pin

      savePinnedBranches(newPinnedBranches); // Save updated pinned branches
      return newPinnedBranches;
    });
  };

  // Memoized sorting for performance optimization
  const sortedBranches = useMemo(() => {
    if (!offlineData || !department) return [];
    const branches = Object.keys(offlineData.ldce[department as keyof typeof offlineData.ldce]);
    const pinned = branches.filter((branch) => pinnedBranches.includes(branch));
    const unpinned = branches.filter((branch) => !pinnedBranches.includes(branch));
    return [...pinned, ...unpinned];
  }, [offlineData, department, pinnedBranches]);

  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    )
  }

  if (error && !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    )
  }

  if (!sortedBranches.length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    )
  }

  const renderBranchCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/faculty/home/department/${department}/branch/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
      </View>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinBranch(item)}>
        <AntDesign
          name={pinnedBranches.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedBranches.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={sortedBranches}
        keyExtractor={(item) => item}
        renderItem={renderBranchCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default Department;
