import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBJECT_STRUCTURE } from '@/constants/async-store-keys';

interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
}

const SubjectsList: React.FC = () => {
  const { department, branch, graduationLevel, sem, division } = useLocalSearchParams();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Manage offline data loading

  // Fetching data using the custom hook
  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data on component mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(SUBJECT_STRUCTURE);
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

  //@ts-ignore
  // Extract subjects from the data based on department, branch, graduationLevel, sem, and division
  const subjects: Subject[] = dataToShow?.ldce?.[department]?.[branch]?.[graduationLevel]?.[sem]?.[division] || [];

  // Conditional rendering to avoid hooks violation
  if (isOfflineLoading || isLoading) {
    return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  }

  if (error && !offlineData) {
    return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;
  }

  if (subjects.length === 0) {
    return (
      <Text className="bg-[#3b3e44] p-4 rounded-lg shadow-md mt-7 mx-4 text-center text-lg font-NunitoBold text-[#F6F5F5]">
        No subjects available.
      </Text>
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
            router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${item.subjectId}`)
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
        contentContainerStyle={{ paddingBottom: 16 }}
        className="w-full mt-4"
      />
    </View>
  );
};

export default SubjectsList;
