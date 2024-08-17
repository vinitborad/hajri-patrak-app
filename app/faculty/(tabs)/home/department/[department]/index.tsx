import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';

const Department = () => {

  const { department } = useLocalSearchParams();

  const router = useRouter();

  const { data: subjectsStructure, isLoading, error } = useGetSubjectsStructure();

  // Check if loading or error
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading data</Text>;

  // Extract branches under the selected department
  const branches = Object.keys(subjectsStructure.ldce[department as keyof typeof subjectsStructure.ldce]);

  const renderBranchCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg shadow-md m-2"
      onPress={() => router.push(`/faculty/home/department/${department}/branch/${item}`)}
    >
      <Text className="text-lg font-semibold text-gray-800 capitalize">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-gray-100">

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={branches}
        keyExtractor={(item) => item}
        renderItem={renderBranchCard}
        contentContainerStyle={{ padding: 16 }}
        className='w-full'
      />
    </View>
  );
}

export default Department;
