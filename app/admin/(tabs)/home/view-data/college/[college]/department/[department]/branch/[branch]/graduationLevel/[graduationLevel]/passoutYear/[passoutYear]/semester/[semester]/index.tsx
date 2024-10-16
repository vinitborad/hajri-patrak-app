import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE, PINNED_DIVISIONS_ADMIN } from '@/constants/async-store-keys';

type Params = {
  college: string;
  department: string;
  branch: string;
  graduationLevel: string;
  passoutYear: string;
  semester: string;
};

const DivisionScreen = () => {
  const { college, department, branch, graduationLevel, passoutYear, semester } = useLocalSearchParams<Params>(); // Extract params with types
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedDivisions, setPinnedDivisions] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        const cachedPinnedDivisions = await AsyncStorage.getItem(PINNED_DIVISIONS_ADMIN(college, department, branch, graduationLevel, passoutYear, semester));
        if (cachedPinnedDivisions) {
          setPinnedDivisions(JSON.parse(cachedPinnedDivisions));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned divisions:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college, department, branch, graduationLevel, passoutYear, semester]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
    }
  }, [apiResponse]);

  const savePinnedDivisions = async (newPinnedDivisions: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_DIVISIONS_ADMIN(college, department, branch, graduationLevel, passoutYear, semester), JSON.stringify(newPinnedDivisions));
    } catch (error) {
      console.log('Error saving pinned divisions:', error);
    }
  };

  const togglePinDivision = (division: string) => {
    setPinnedDivisions((prevPinnedDivisions) => {
      const newPinnedDivisions = prevPinnedDivisions.includes(division)
        ? prevPinnedDivisions.filter((d) => d !== division)
        : [...prevPinnedDivisions, division];

      savePinnedDivisions(newPinnedDivisions);
      return newPinnedDivisions;
    });
  };

  const sortedDivisions = useMemo(() => {
    if (
      !offlineData ||
      !offlineData[college] ||
      !offlineData[college][department] ||
      !offlineData[college][department][branch] ||
      !offlineData[college][department][branch][graduationLevel] ||
      !offlineData[college][department][branch][graduationLevel][passoutYear] ||
      !offlineData[college][department][branch][graduationLevel][passoutYear][semester]
    ) {
      return [];
    }

    const divisions = Object.keys(offlineData[college][department][branch][graduationLevel][passoutYear][semester]);
    const pinned = divisions.filter((div) => pinnedDivisions.includes(div));
    const unpinned = divisions.filter((div) => !pinnedDivisions.includes(div));
    return [...pinned, ...unpinned];
  }, [offlineData, college, department, branch, graduationLevel, passoutYear, semester, pinnedDivisions]);

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

  if (!sortedDivisions.length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const renderDivisionCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-data/college/${college}/department/${department}/branch/${branch}/graduationLevel/${graduationLevel}/passoutYear/${passoutYear}/semester/${semester}/division/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{`Division ${item}`}</Text>
      </View>
      <TouchableOpacity onPress={() => togglePinDivision(item)}>
        <AntDesign
          name={pinnedDivisions.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedDivisions.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedDivisions}
        keyExtractor={(item) => item}
        renderItem={renderDivisionCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default DivisionScreen;