import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetStudentsDataStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STUDENTS_DATA_STRUCTURE, PINNED_STUDENTS_STRUCTURE_BRANCHES_ADMIN } from '@/constants/async-store-keys';

type Params = {
  college: string;
  department: string;
};

const BranchesScreen = () => {
  const { college, department } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedBranches, setPinnedBranches] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetStudentsDataStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        const cachedPinnedBranches = await AsyncStorage.getItem(PINNED_STUDENTS_STRUCTURE_BRANCHES_ADMIN(college, department));
        if (cachedPinnedBranches) {
          setPinnedBranches(JSON.parse(cachedPinnedBranches));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned branches:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
      AsyncStorage.setItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE, JSON.stringify(apiResponse.data));
    }
  }, [apiResponse]);

  const savePinnedBranches = async (newPinnedBranches: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_STUDENTS_STRUCTURE_BRANCHES_ADMIN(college, department), JSON.stringify(newPinnedBranches));
    } catch (error) {
      console.log('Error saving pinned branches:', error);
    }
  };

  const togglePinBranch = (branch: string) => {
    setPinnedBranches((prevPinnedBranches) => {
      const newPinnedBranches = prevPinnedBranches.includes(branch)
        ? prevPinnedBranches.filter((b) => b !== branch)
        : [...prevPinnedBranches, branch];

      savePinnedBranches(newPinnedBranches);
      return newPinnedBranches;
    });
  };

  const sortedBranches = useMemo(() => {
    if (!offlineData || !offlineData[college] || !offlineData[college][department]) return [];
    const branches = Object.keys(offlineData[college][department]);
    const pinned = branches.filter((branch) => pinnedBranches.includes(branch));
    const unpinned = branches.filter((branch) => !pinnedBranches.includes(branch));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, pinnedBranches]);

  if (!sortedBranches.length && !isLoading && !isOfflineLoading) {
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

  const renderBranchCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-students-data/college/${college}/department/${department}/branch/${item}`)}
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

export default BranchesScreen;