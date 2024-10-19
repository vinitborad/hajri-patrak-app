import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetStudentsDataStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STUDENTS_DATA_STRUCTURE, PINNED_STUDENTS_STRUCTURE_GRADUATION_LEVELS_ADMIN } from '@/constants/async-store-keys';

type Params = {
  college: string;
  department: string;
  branch: string;
};

const GraduationLevelScreen = () => {
  const { college, department, branch } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedGraduationLevels, setPinnedGraduationLevels] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetStudentsDataStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        const cachedPinnedGraduationLevels = await AsyncStorage.getItem(PINNED_STUDENTS_STRUCTURE_GRADUATION_LEVELS_ADMIN(college, department, branch));
        if (cachedPinnedGraduationLevels) {
          setPinnedGraduationLevels(JSON.parse(cachedPinnedGraduationLevels));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned graduation levels:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department, branch]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
      AsyncStorage.setItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE, JSON.stringify(apiResponse.data));
    }
  }, [apiResponse]);

  const savePinnedGraduationLevels = async (newPinnedGraduationLevels: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_STUDENTS_STRUCTURE_GRADUATION_LEVELS_ADMIN(college, department, branch), JSON.stringify(newPinnedGraduationLevels));
    } catch (error) {
      console.log('Error saving pinned graduation levels:', error);
    }
  };

  const togglePinGraduationLevel = (graduationLevel: string) => {
    setPinnedGraduationLevels((prevPinnedGraduationLevels) => {
      const newPinnedGraduationLevels = prevPinnedGraduationLevels.includes(graduationLevel)
        ? prevPinnedGraduationLevels.filter((g) => g !== graduationLevel)
        : [...prevPinnedGraduationLevels, graduationLevel];

      savePinnedGraduationLevels(newPinnedGraduationLevels);
      return newPinnedGraduationLevels;
    });
  };

  const sortedGraduationLevels = useMemo(() => {
    if (!offlineData || !offlineData[college] || !offlineData[college][department] || !offlineData[college][department][branch]) return [];
    const graduationLevels = Object.keys(offlineData[college][department][branch]);
    const pinned = graduationLevels.filter((level) => pinnedGraduationLevels.includes(level));
    const unpinned = graduationLevels.filter((level) => !pinnedGraduationLevels.includes(level));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, branch, pinnedGraduationLevels]);

  if (!sortedGraduationLevels.length && !isLoading && !isOfflineLoading) {
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

  const renderGraduationLevelCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-students-data/college/${college}/department/${department}/branch/${branch}/graduationLevel/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
      </View>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinGraduationLevel(item)}>
        <AntDesign
          name={pinnedGraduationLevels.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedGraduationLevels.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedGraduationLevels}
        keyExtractor={(item) => item}
        renderItem={renderGraduationLevelCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default GraduationLevelScreen;