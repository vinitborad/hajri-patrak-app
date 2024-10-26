import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetPreviousDivisionSubjects } from '@/api/student/data/subject';

const PreviousDivisionSubjectsScreen = () => {
  const router = useRouter();

  const { id: divisionId } = useLocalSearchParams(); // Extract division ID from the params
  const { data, isLoading, error } = useGetPreviousDivisionSubjects({ divisionId: divisionId as string }); // Fetch subjects

  // Display a loading indicator while data is being fetched
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load subjects. Please try again.</Text>
      </View>
    );
  }

  // If no subjects are available, display a message
  if (!data?.subjects || data.subjects.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-[#F6F5F5]">No subjects available for this division.</Text>
      </View>
    );
  }

  // Render individual subject card
  const renderSubjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-[#3b3e44] p-4 mb-4 rounded-lg border border-[#9DBDFF]"
      onPress={() => router.push(`/common/student/subject-info/${item._id}`)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">
        {item.subjectName} ({item.subjectCode})
      </Text>
      <Text className="text-sm font-NunitoLight text-[#F6F5F5]">{item.subjectType}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <FlatList
        data={data.subjects}
        keyExtractor={(item) => item._id}
        renderItem={renderSubjectItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-2xl text-[#F6F5F5] mb-4 font-NunitoExtraBold">Previous Division Subjects</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default PreviousDivisionSubjectsScreen;