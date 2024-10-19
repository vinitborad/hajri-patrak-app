import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetStudentsDataStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STUDENTS_DATA_STRUCTURE, PINNED_STUDENTS_STRUCTURE_PASSOUT_YEARS_ADMIN } from '@/constants/async-store-keys';

type Params = {
  college: string;
  department: string;
  branch: string;
  graduationLevel: string;
};

const PassoutYearScreen = () => {
  const { college, department, branch, graduationLevel } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedPassoutYears, setPinnedPassoutYears] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetStudentsDataStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        const cachedPinnedPassoutYears = await AsyncStorage.getItem(PINNED_STUDENTS_STRUCTURE_PASSOUT_YEARS_ADMIN(college, department, branch, graduationLevel));
        if (cachedPinnedPassoutYears) {
          setPinnedPassoutYears(JSON.parse(cachedPinnedPassoutYears));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned passout years:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department, branch, graduationLevel]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
      AsyncStorage.setItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE, JSON.stringify(apiResponse.data));
    }
  }, [apiResponse]);

  const savePinnedPassoutYears = async (newPinnedPassoutYears: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_STUDENTS_STRUCTURE_PASSOUT_YEARS_ADMIN(college, department, branch, graduationLevel), JSON.stringify(newPinnedPassoutYears));
    } catch (error) {
      console.log('Error saving pinned passout years:', error);
    }
  };

  const togglePinPassoutYear = (passoutYear: string) => {
    setPinnedPassoutYears((prevPinnedPassoutYears) => {
      const newPinnedPassoutYears = prevPinnedPassoutYears.includes(passoutYear)
        ? prevPinnedPassoutYears.filter((y) => y !== passoutYear)
        : [...prevPinnedPassoutYears, passoutYear];

      savePinnedPassoutYears(newPinnedPassoutYears);
      return newPinnedPassoutYears;
    });
  };

  const sortedPassoutYears = useMemo(() => {
    if (
      !offlineData ||
      !offlineData[college] ||
      !offlineData[college][department] ||
      !offlineData[college][department][branch] ||
      !offlineData[college][department][branch][graduationLevel]
    ) {
      return [];
    }

    const passoutYears = Object.keys(offlineData[college][department][branch][graduationLevel]);
    const pinned = passoutYears.filter((year) => pinnedPassoutYears.includes(year));
    const unpinned = passoutYears.filter((year) => !pinnedPassoutYears.includes(year));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, branch, graduationLevel, pinnedPassoutYears]);

  if (!sortedPassoutYears.length && !isLoading && !isOfflineLoading) {
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

  const renderPassoutYearCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-students-data/students-list?college=${college}&department=${department}&branch=${branch}&graduationLevel=${graduationLevel}&passoutYear=${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{`Passout Year ${item}`}</Text>
      </View>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinPassoutYear(item)}>
        <AntDesign
          name={pinnedPassoutYears.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedPassoutYears.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedPassoutYears}
        keyExtractor={(item) => item}
        renderItem={renderPassoutYearCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default PassoutYearScreen;