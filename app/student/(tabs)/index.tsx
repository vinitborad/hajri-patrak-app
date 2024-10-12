import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetStudentSubjects } from '@/api/student/data/subject';
import { STUDENT_ACTIVE_SUBJECTS } from '@/constants/async-store-keys';

const Index = () => {
  const router = useRouter();
  const [offlineData, setOfflineData] = useState(null); // To hold the offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Loading state for offline data
  const { data: apiResponse, isLoading, error } = useGetStudentSubjects();

  // Fetch offline data immediately when component mounts
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(STUDENT_ACTIVE_SUBJECTS);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log("Error fetching offline data:", error);
      } finally {
        setIsOfflineLoading(false);
      }
    };
    fetchOfflineData();
  }, []);

  // If we have API data that is updated, refresh the UI
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Determine the data to show (either from API or offline)
  const dataToShow = apiResponse?.data || offlineData;

  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  return (
    <View className='flex-1 items-center bg-[#1E1E1E] p-6'>
      <Stack.Screen options={{ headerShown: true }} />

      <TouchableOpacity
        onPress={() => router.push('/student/qr')}
        className="mt-6 bg-[#686D76] w-full h-32 rounded-lg flex items-center justify-center border border-[#9DBDFF]"
        activeOpacity={0.7}
      >
        <View className="flex items-center justify-center">
          <FontAwesome name="qrcode" size={50} color="#9DBDFF" />
          <Text className='font-NunitoExtraBold text-[#9DBDFF]'>SCAN</Text>
        </View>
      </TouchableOpacity>

      <Text className="mt-8 mb-4 w-full pl-3 text-[#F6F5F5] text-xl font-NunitoExtraBold">SUBJECTS</Text>

      {/* If no subjects are found, show a message instead of the list */}
      {(!dataToShow?.subjects || dataToShow.subjects.length === 0) ? (
        <Text className="text-[#F6F5F5] text-lg">No subjects available.</Text>
      ) : (
        <FlatList
          data={dataToShow.subjects}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <SubjectItem subject={item} router={router} />}
        />
      )}
    </View>
  );
};

export default Index;

//@ts-ignore
const SubjectItem = ({ subject, router }) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/common/student/subject-info/${subject._id}`)}
      className="flex flex-row justify-between items-center bg-[#3b3e44] p-4 pl-6 mb-2 rounded-xl w-full border border-[#FFD7C4]"
      activeOpacity={0.7}
    >
      <Text className="text-xl font-NunitoBold text-white w-full">
        {subject.subjectName.toUpperCase()} ({subject.subjectCode})
      </Text>
    </TouchableOpacity>
  );
};