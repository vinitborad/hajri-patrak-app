import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty/data/structure';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_SUBJECTS_STRUCTURE } from '@/constants/async-store-keys';

interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
}

const SubjectsScreen: React.FC = () => {
  const { college, department, branch, graduationLevel, sem, division, passoutYear } = useLocalSearchParams(); // Extract params from URL
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Manage offline data loading

  // Fetching data using the custom hook
  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data on component mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ACTIVE_SUBJECTS_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false); // Done loading offline data
      }
    };

    fetchOfflineData();
  }, []);

  // Update offline data if API returns updated data
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Determine the data to show (either from API or offline)
  const dataToShow = apiResponse?.data || offlineData;

  // Extract subjects from the data based on college, department, branch, graduationLevel, sem, division, and passoutYear
  const subjects: Subject[] =
    //@ts-ignore
    dataToShow?.[college]?.[department]?.[branch]?.[graduationLevel]?.[passoutYear]?.[sem]?.[division].subjects || [];

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

  if (subjects.length === 0) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-20">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="bg-[#3b3e44] p-4 rounded-lg shadow-md mt-7 mx-4 text-center text-lg font-NunitoBold text-[#F6F5F5]">
          No subjects available
        </Text>
      </View>
    );
  }

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <View key={item.subjectId} className="bg-[#3b3e44] rounded-lg shadow-md my-2 mx-4 border border-[#9DBDFF]">
      <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] p-3 rounded-t-lg bg-[#3b3e44]">
        {item.subjectName}
      </Text>
      <View className="flex flex-row justify-between items-center bg-[#2D2D2D] p-3 rounded-b-lg">
        <Text className="text-[#F6F5F5] text-base font-NunitoBold">{item.subjectType}</Text>
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/faculty/(tabs)/home/subject/${item.subjectId}`
            )
          }
        >
          <Text className="text-[#9DBDFF] border-b border-[#9DBDFF]">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex flex-1 justify-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.subjectId}
        renderItem={renderSubjectItem}
        contentContainerStyle={{ paddingBottom: 250 }}
        className="w-full mt-4"
      />
    </View>
  );
};

export default SubjectsScreen;