import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE, PINNED_DIVISIONS_ADMIN } from '@/constants/async-store-keys';
import { useQueryClient } from '@tanstack/react-query';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

type Params = {
  college: string;
  department: string;
  branch: string;
  graduationLevel: string;
  passoutYear: string;
  semester: string;
};

const DivisionScreen = () => {
  const { college, department, branch, graduationLevel, passoutYear, semester } = useLocalSearchParams<Params>();
  const router = useRouter();
  const queryClient = useQueryClient(); // Initialize QueryClient

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [pinnedDivisions, setPinnedDivisions] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<{ [key: string]: boolean }>({});
  const [loadingStatuses, setLoadingStatuses] = useState<{ [key: string]: boolean }>({}); // Track loading state for each division

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

  const fetchDivisionStatus = async (division: string) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_DIVISION_ACTIVE_STATUS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          college,
          department,
          branch,
          graduationLevel,
          passoutYear,
          semester,
          division
        }
      });

      if (response.data?.success) {
        setActiveStatuses((prev) => ({ ...prev, [division]: response.data.data.isActive }));
      } else {
        setActiveStatuses((prev) => ({ ...prev, [division]: false }));
      }
    } catch (error) {
      // @ts-ignore
      setActiveStatuses((prev) => ({ ...prev, [division]: null })); // Indicate error state
    }
  };

  // Fetch active status for each division when component mounts
  useEffect(() => {
    sortedDivisions.forEach(fetchDivisionStatus);
  }, [sortedDivisions]);

  // Handle toggle activation/deactivation
  const handleToggleActivation = async (division: string, isActive: boolean) => {
    const confirmationMessage = isActive
      ? 'Are you sure you want to deactivate this division?'
      : 'Are you sure you want to activate this division?';

    Alert.alert('Confirmation', confirmationMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            setLoadingStatuses((prev) => ({ ...prev, [division]: true })); // Set loading state
            const token = await SecureStore.getItemAsync('token');
            const endpoint = isActive
              ? adminEndpoints.MARK_DIVISION_INACTIVE
              : adminEndpoints.MARK_DIVISION_ACTIVE;

            await axios.patch(endpoint, {
              college,
              department,
              branch,
              graduationLevel,
              passoutYear,
              semester,
              division
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // Refresh the status by refetching
            fetchDivisionStatus(division);
          } catch (error) {
            Alert.alert('Error', 'Failed to update division status.');
          } finally {
            setLoadingStatuses((prev) => ({ ...prev, [division]: false })); // Remove loading state
          }
        },
      },
    ]);
  };

  const renderDivisionCard = ({ item }: { item: string }) => {
    const isActive = activeStatuses[item];
    const isLoading = loadingStatuses[item];

    return (
      <TouchableOpacity
        className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
        onPress={() => router.push(`/admin/(tabs)/home/view-data/college/${college}/department/${department}/branch/${branch}/graduationLevel/${graduationLevel}/passoutYear/${passoutYear}/semester/${semester}/division/${item}`)}
      >
        <View>
          <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{`Division ${item}`}</Text>
        </View>
        <View className='flex-row gap-x-1 items-center'>
          {isActive === null ? (
            <TouchableOpacity onPress={() => Alert.alert('No internet connection')}>
              <MaterialIcons name="cloud-off" size={24} color="gray" />
            </TouchableOpacity>
          ) : isLoading ? (
            <ActivityIndicator size="small" color="#9DBDFF" />
          ) : (
            <TouchableOpacity onPress={() => handleToggleActivation(item, isActive)}>
              <MaterialIcons
                name="published-with-changes"
                size={24}
                color={isActive ? 'green' : 'red'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => togglePinDivision(item)}>
            <AntDesign
              name={pinnedDivisions.includes(item) ? 'pushpin' : 'pushpino'}
              size={24}
              color={pinnedDivisions.includes(item) ? '#FF6B6B' : '#9DBDFF'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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