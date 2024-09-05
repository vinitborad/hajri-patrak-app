import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
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

  if (isLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

  // Safely accessing the subjects based on the query parameters
  const subjects: Subject[] = subjectsStructure?.ldce?.[department]?.[branch]?.[graduationLevel]?.[sem]?.[division] || [];

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <View key={item.subjectId} className="bg-[#3b3e44] rounded-lg shadow-md my-2 mx-4 border border-[#9DBDFF]">
      <Text className="text-xl font-NunitoExtraBold text-[#9DBDFF] p-3 rounded-t-lg bg-[#3b3e44]">
        {item.subjectName}
      </Text>
      <View className="flex flex-row justify-between items-center bg-[#2D2D2D] p-3 rounded-b-lg">
        <Text className="text-[#F6F5F5] text-base font-NunitoBold">
          {item.subjectType}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/faculty/(tabs)/home/department/${department}/branch/${branch}/subject/${item.subjectId}`)}
        >
          <Text className="text-[#9DBDFF] border-b border-[#9DBDFF]">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex flex-1 justify-center bg-[#1E1E1E]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {subjects.length === 0 && (
        <Text
          className="bg-[#3b3e44] p-4 rounded-lg shadow-md mt-7 mx-4 text-center text-lg font-NunitoBold text-[#F6F5F5]"
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
