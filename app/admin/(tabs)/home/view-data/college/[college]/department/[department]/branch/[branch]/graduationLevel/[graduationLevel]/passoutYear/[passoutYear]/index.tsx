import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE, PINNED_SEMESTERS_ADMIN } from '@/constants/async-store-keys';

const SemesterScreen = () => {
  const { college, department, branch, graduationLevel, passoutYear } = useLocalSearchParams(); // Extract params
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedSemesters, setPinnedSemesters] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        // @ts-ignore
        const cachedPinnedSemesters = await AsyncStorage.getItem(PINNED_SEMESTERS_ADMIN(college, department, branch, graduationLevel, passoutYear));
        if (cachedPinnedSemesters) {
          setPinnedSemesters(JSON.parse(cachedPinnedSemesters));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned semesters:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department, branch, graduationLevel, passoutYear]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
    }
  }, [apiResponse]);

  const savePinnedSemesters = async (newPinnedSemesters: string[]) => {
    try {
      // @ts-ignore
      await AsyncStorage.setItem(PINNED_SEMESTERS_ADMIN(college, department, branch, graduationLevel, passoutYear), JSON.stringify(newPinnedSemesters));
    } catch (error) {
      console.log('Error saving pinned semesters:', error);
    }
  };

  const togglePinSemester = (semester: string) => {
    setPinnedSemesters((prevPinnedSemesters) => {
      const newPinnedSemesters = prevPinnedSemesters.includes(semester)
        ? prevPinnedSemesters.filter((s) => s !== semester)
        : [...prevPinnedSemesters, semester];

      savePinnedSemesters(newPinnedSemesters);
      return newPinnedSemesters;
    });
  };

  const sortedSemesters = useMemo(() => {
    // @ts-ignore
    if (!offlineData || !offlineData[college] || !offlineData[college][department] || !offlineData[college][department][branch] || !offlineData[college][department][branch][graduationLevel] || !offlineData[college][department][branch][graduationLevel][passoutYear]) {
      return [];
    }

    // @ts-ignore
    const semesters = Object.keys(offlineData[college][department][branch][graduationLevel][passoutYear]);
    const pinned = semesters.filter((sem) => pinnedSemesters.includes(sem));
    const unpinned = semesters.filter((sem) => !pinnedSemesters.includes(sem));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, branch, graduationLevel, passoutYear, pinnedSemesters]);

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

  if (!sortedSemesters.length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const renderSemesterCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-data/college/${college}/department/${department}/branch/${branch}/graduationLevel/${graduationLevel}/passoutYear/${passoutYear}/semester/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{`Semester ${item}`}</Text>
      </View>
      <TouchableOpacity onPress={() => togglePinSemester(item)}>
        <AntDesign
          name={pinnedSemesters.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedSemesters.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedSemesters}
        keyExtractor={(item) => item}
        renderItem={renderSemesterCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default SemesterScreen;
