import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';

interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
}

interface Params {
  department: string;
  branch: string;
  graduationLevel: string;
  sem: string;
  division: string;
}

const SubjectsList: React.FC = () => {
  // Extracting parameters from the URL query string
  //@ts-ignore
  const { department, branch, graduationLevel, sem, division } = useLocalSearchParams<Params>();

  const router = useRouter();

  // Fetching data using your custom hook
  const { data: subjectsStructure, isLoading, error } = useGetSubjectsStructure();

  if (isLoading) return <Text className="text-center text-white mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  // Safely accessing the subjects based on the query parameters
  const subjects: Subject[] = subjectsStructure?.ldce?.[department]?.[branch]?.[graduationLevel]?.[sem]?.[division] || [];

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <View key={item.subjectId} className="bg-white rounded-lg shadow-md my-2 mx-4">
      <Text className="text-lg font-semibold text-gray-800 p-3 bg-slate-300 rounded-t-2xl">
        {item.subjectName}
      </Text>
      <View className=' flex flex-row justify-between items-center'>
        <Text className="text-gray-800 text-lg font-semibold p-2 pb-3 ml-1">
          {item.subjectType}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${item.subjectId}`)}
        >
          <Text className="text-blue-500 mr-3 border-b border-blue-400">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex flex-1 justify-center bg-gray-100">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {subjects.length === 0 && (
        <Text
          className="bg-white p-4 rounded-lg shadow-md mt-7 mx-4 text-center text-lg font-semibold text-gray-800"
        >No subjects available.</Text>
      )}

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
