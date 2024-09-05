import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';

interface DivisionItemProps {
  sem: string;
  div: string;
}

interface DegreeItemProps {
  item: string;
}

const Branch = () => {
  // Extract the department and branch from the URL parameters
  const { department, branch } = useLocalSearchParams<{ department: string; branch: string }>();

  const router = useRouter();

  // Fetch the data using your custom hook
  const { data: subjectsStructure, isLoading, error } = useGetSubjectsStructure();

  // Handle loading and error states
  if (isLoading) return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  if (error) return <Text className="text-center text-[#FF6B6B] mt-4">Error loading data</Text>;

  if (!department || !branch || !subjectsStructure) {
    return <Text className="text-center text-[#FF6B6B] mt-4">Invalid department or branch</Text>;
  }

  // Extract the degrees (e.g., B.Tech, M.Tech, MCA)
  const degrees = subjectsStructure.ldce[department]?.[branch] ?? {};

  const handleDivisionPress = (gradLevel: string, sem: string, div: string) => {
    router.push(`/faculty/home/department/${department}/branch/${branch}/subject?graduationLevel=${gradLevel}&sem=${sem}&division=${div}`);
  };

  // Render a card for each division
  const renderDivisionItem: React.FC<any> = ({ sem, div, gradLevel }) => (
    <TouchableOpacity
      key={sem + div}
      className="bg-[#3b3e44] p-4 rounded-lg shadow-md my-2 flex-row justify-between items-center mx-4 border border-[#9DBDFF]"
      onPress={() => handleDivisionPress(gradLevel, sem, div)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{`Sem ${sem} Div ${div}`}</Text>
    </TouchableOpacity>
  );

  // Render each degree and its respective semesters and divisions
  const renderDegreeItem: React.FC<DegreeItemProps> = ({ item }) => {
    const semesters = Object.keys(degrees[item]);

    return (
      <View key={item} className="mb-4">
        <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-4 ml-4">
          {item}
        </Text>
        {semesters.map((sem) => (
          <View key={sem}>
            {Object.keys(degrees[item][sem]).map((div) => (
              renderDivisionItem({ sem, div, gradLevel: item })
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex flex-1 justify-center bg-[#1E1E1E]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <FlatList
        data={Object.keys(degrees)}
        keyExtractor={(item) => item}
        //@ts-ignore
        renderItem={renderDegreeItem}
        contentContainerStyle={{ paddingBottom: 16 }}
        className="w-full"
      />
    </View>
  );
};

export default Branch;
