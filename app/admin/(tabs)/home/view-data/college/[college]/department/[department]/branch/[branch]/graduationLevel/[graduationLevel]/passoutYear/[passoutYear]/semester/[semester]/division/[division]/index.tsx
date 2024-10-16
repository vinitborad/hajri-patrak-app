import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE } from '@/constants/async-store-keys';

type Params = {
  college: string;
  department: string;
  branch: string;
  graduationLevel: string;
  passoutYear: string;
  semester: string;
  division: string;
};

const DivisionInfoScreen = () => {
  const { college, department, branch, graduationLevel, passoutYear, semester, division } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, []);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
    }
  }, [apiResponse]);

  // Get subjects and interDivisions for the specific division
  const divisionData = offlineData?.[college]?.[department]?.[branch]?.[graduationLevel]?.[passoutYear]?.[semester]?.[division];

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

  if (!divisionData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">No data available for this division</Text>
      </View>
    );
  }

  // Render Subject Card
  const renderSubjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/data/subject/${item.subjectId}`)}
    >
      <View className='flex-row items-center gap-1'>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize">{item.subjectName}</Text>
        <Text className="text-sm font-Nunito text-[#F6F5F5]">({item.subjectCode})</Text>
      </View>
    </TouchableOpacity>
  );

  // Render Inter-Division Card
  const renderInterDivisionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => router.push(`/admin/data/inter-division/${item.id}`)}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF]">Inter Div {item.interDivision}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 50, padding: 10 }} className="w-full">
        {/* Subjects Section */}
        <Text className="text-[#F6F5F5] text-xl font-NunitoExtraBold px-3 py-2">Subjects</Text>
        {divisionData.subjects.length > 0 ? (
          divisionData.subjects.map((subject: any) => renderSubjectItem({ item: subject }))
        ) : (
          <Text className="text-[#FF6B6B] text-center p-4">No subjects available</Text>
        )}

        {/* Inter-Divisions Section */}
        <Text className="text-[#F6F5F5] text-xl font-NunitoExtraBold px-3 py-2">Inter Divisions</Text>
        {divisionData.interDivisions.length > 0 ? (
          divisionData.interDivisions.map((division: any) => renderInterDivisionItem({ item: division }))
        ) : (
          <Text className="text-[#FF6B6B] text-center p-4">No inter-divisions available</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default DivisionInfoScreen;