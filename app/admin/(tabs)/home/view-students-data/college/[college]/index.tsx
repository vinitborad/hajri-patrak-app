import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetStudentsDataStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STUDENTS_DATA_STRUCTURE, PINNED_STUDENTS_STRUCTURE_DEPARTMENTS_ADMIN } from '@/constants/async-store-keys';

type Params = {
  college: string;
};

const DepartmentsScreen = () => {
  const { college } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedDepartments, setPinnedDepartments] = useState<string[]>([]);

  const { data: apiResponse, isLoading, error } = useGetStudentsDataStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }

        const cachedPinnedDepartments = await AsyncStorage.getItem(PINNED_STUDENTS_STRUCTURE_DEPARTMENTS_ADMIN(college));
        if (cachedPinnedDepartments) {
          setPinnedDepartments(JSON.parse(cachedPinnedDepartments));
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned departments:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, [college]);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
      AsyncStorage.setItem(ADMIN_DATA_STUDENTS_DATA_STRUCTURE, JSON.stringify(apiResponse.data));
    }
  }, [apiResponse]);

  const savePinnedDepartments = async (newPinnedDepartments: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_STUDENTS_STRUCTURE_DEPARTMENTS_ADMIN(college), JSON.stringify(newPinnedDepartments));
    } catch (error) {
      console.log('Error saving pinned departments:', error);
    }
  };

  const togglePinDepartment = (department: string) => {
    setPinnedDepartments((prevPinnedDepartments) => {
      const newPinnedDepartments = prevPinnedDepartments.includes(department)
        ? prevPinnedDepartments.filter((d) => d !== department)
        : [...prevPinnedDepartments, department];

      savePinnedDepartments(newPinnedDepartments);
      return newPinnedDepartments;
    });
  };

  const sortedDepartments = useMemo(() => {
    if (!offlineData || !offlineData[college]) return [];
    const departments = Object.keys(offlineData[college]);
    const pinned = departments.filter((department) => pinnedDepartments.includes(department));
    const unpinned = departments.filter((department) => !pinnedDepartments.includes(department));
    return [...pinned, ...unpinned];
  }, [offlineData, college, pinnedDepartments]);

  if (!sortedDepartments.length && !isLoading && !isOfflineLoading) {
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

  const renderDepartmentCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/(tabs)/home/view-students-data/college/${college}/department/${item}`)}
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