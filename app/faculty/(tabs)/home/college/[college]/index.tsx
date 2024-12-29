import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/faculty/data/structure';
import { ACTIVE_SUBJECTS_STRUCTURE, PINNED_DEPARTMENTS } from '@/constants/async-store-keys';

const DepartmentsScreen = () => {
  const { college } = useLocalSearchParams(); // Extract the college parameter
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage loading state for offline data
  const [pinnedDepartments, setPinnedDepartments] = useState<string[]>([]); // Array for pinned departments in this college

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned departments on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ACTIVE_SUBJECTS_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }

        //@ts-ignore
        const cachedPinnedDepartments = await AsyncStorage.getItem(PINNED_DEPARTMENTS(college));
        if (cachedPinnedDepartments) {
          setPinnedDepartments(JSON.parse(cachedPinnedDepartments)); // Load pinned departments for this college
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned departments:', error);
      } finally {
        setIsOfflineLoading(false); // Done loading offline data
      }
    };

    fetchOfflineData();
  }, [college]);

  // If we have API data that is updated, refresh the UI
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Persist pinned departments in AsyncStorage whenever updated
  const savePinnedDepartments = async (newPinnedDepartments: string[]) => {
    try {
      //@ts-ignore
      await AsyncStorage.setItem(PINNED_DEPARTMENTS(college), JSON.stringify(newPinnedDepartments));
    } catch (error) {
      console.log('Error saving pinned departments:', error);
    }
  };

  // Handle pinning and unpinning of departments
  const togglePinDepartment = (department: string) => {
    setPinnedDepartments((prevPinnedDepartments) => {
      const newPinnedDepartments = prevPinnedDepartments.includes(department)
        ? prevPinnedDepartments.filter((d) => d !== department) // Unpin
        : [...prevPinnedDepartments, department]; // Pin

      savePinnedDepartments(newPinnedDepartments); // Save updated pinned departments for this college
      return newPinnedDepartments;
    });
  };

  // Memoized sorting for performance optimization
  const sortedDepartments = useMemo(() => {
    //@ts-ignore
    if (!offlineData || !offlineData[college]) return [];
    //@ts-ignore
    const departments = Object.keys(offlineData[college]); // Extract department keys for the current college
    const pinned = departments.filter((department) => pinnedDepartments.includes(department));
    const unpinned = departments.filter((department) => !pinnedDepartments.includes(department));
    return [...pinned, ...unpinned];
  }, [offlineData, college, pinnedDepartments]);

  // Redirect if only one department exists
  useEffect(() => {
    if (sortedDepartments.length === 1) {
      const department = sortedDepartments[0];
      router.replace(`/faculty/(tabs)/home/college/${college}/department/${department}`);
    }
  }, [sortedDepartments]);

  if (isOfflineLoading) {
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

  if (!sortedDepartments.length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const renderDepartmentCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/faculty/(tabs)/home/college/${college}/department/${item}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item}</Text>
      </View>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinDepartment(item)}>
        <AntDesign
          name={pinnedDepartments.includes(item) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedDepartments.includes(item) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedDepartments}
        keyExtractor={(item) => item}
        renderItem={renderDepartmentCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default DepartmentsScreen;