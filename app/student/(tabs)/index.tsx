import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetStudentSubjects } from '@/api/student/data/subject';
import { STUDENT_ACTIVE_SUBJECTS } from '@/constants/async-store-keys';
import * as SecureStore from 'expo-secure-store';

const Index = () => {
  const router = useRouter();
  const [offlineData, setOfflineData] = useState(null); // To hold the offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Loading state for offline data
  const [role, setRole] = useState<string | null>(null); // State for user role
  const { data: apiResponse, isLoading, error } = useGetStudentSubjects();

  // Fetch role and offline data when component mounts
  useEffect(() => {
    const fetchOfflineDataAndRole = async () => {
      try {
        // Fetch role from SecureStore
        const storedRole = await SecureStore.getItemAsync('role');

        const cachedData = await AsyncStorage.getItem(STUDENT_ACTIVE_SUBJECTS);

        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
        if (storedRole) {
          setRole(storedRole); // Set role state
        }
      } catch (error) {
        console.log("Error fetching offline data or role:", error);
      } finally {
        setIsOfflineLoading(false);
      }
    };
    fetchOfflineDataAndRole();
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
    <View className='flex-1 items-center bg-[#1E1E1E] px-6'>
      <Stack.Screen options={{ headerShown: true }} />

      {/* If no subjects are found, show a message instead of the list */}
      {(!dataToShow?.subjects || dataToShow.subjects.length === 0) ? (
        <Text className="text-[#F6F5F5] text-lg">No subjects available.</Text>
      ) : (
        <FlatList
          data={dataToShow.subjects}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <SubjectItem subject={item} router={router} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
          ListHeaderComponent={() => (
            <>
              <TouchableOpacity
                onPress={() => role === 'student' ? router.push('/student/qr') : null} // Disable navigation for non-students
                className={`mt-6 w-full h-32 rounded-lg flex items-center justify-center border border-[#9DBDFF] bg-[#686D76] ${role !== 'student' ? 'opacity-50' : ''}`}
                activeOpacity={role === 'student' ? 0.7 : 1} // Disable button press for non-students
                disabled={role !== 'student'} // Disable TouchableOpacity for non-student roles
              >
                {role === 'student' ? (
                  <View className="flex items-center justify-center">
                    <FontAwesome name="qrcode" size={50} color="#9DBDFF" />
                    <Text className='font-NunitoExtraBold text-[#9DBDFF]'>SCAN</Text>
                  </View>
                ) : (
                  <View className="flex items-center justify-center">
                    <FontAwesome name="user-times" size={50} color="#FF6B6B" />
                    <Text className='font-NunitoExtraBold text-[#FF6B6B]'>You Can't Scan QR !</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text className="mt-8 mb-4 w-full pl-3 text-[#F6F5F5] text-xl font-NunitoExtraBold">SUBJECTS</Text>
            </>
          )}
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
      activeOpacity={0.5}
    >
      <Text className="text-xl font-NunitoBold text-white w-full">
        {subject.subjectName.toUpperCase()} ({subject.subjectCode})
      </Text>
    </TouchableOpacity>
  );
};