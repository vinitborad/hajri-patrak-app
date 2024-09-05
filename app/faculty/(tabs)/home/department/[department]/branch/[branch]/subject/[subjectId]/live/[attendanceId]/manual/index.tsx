import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetLiveAttendanceInfo, useManualMarkAttendance } from '@/api/faculty/attendances';
import { ActivityIndicator } from 'react-native';

const ManualAttendanceScreen = () => {
  const { department, branch, subjectId, attendanceId } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error } = useGetLiveAttendanceInfo(attendanceId as string);
  const markAttendanceMutation = useManualMarkAttendance();

  const [markMode, setMarkMode] = useState<'present' | 'absent'>('present');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  if (isLoading) return <ActivityIndicator size="large" color="#00ff00" />;
  if (error) return <Text className="text-center text-red-500 mt-4">Error loading data</Text>;

  const allStudents = data?.allStudentLists || [];
  //@ts-ignore
  const sortedStudents = allStudents.sort((a, b) => a.username.localeCompare(b.username));

  const toggleAttendance = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = async () => {
    const presentStudents =
      //@ts-ignore
      markMode === 'present' ? selectedStudents : sortedStudents.map((s) => s.id).filter((id) => !selectedStudents.includes(id));

    markAttendanceMutation.mutate(
      {
        attendanceId: attendanceId as string,
        studentIdLists: presentStudents,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err) => {
          console.error('Error marking attendance:', err);
        },
      }
    );
  };

  return (
    <View className="flex flex-1 bg-gray-900 p-4">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Marking Mode Selector */}
      <View className="flex flex-row justify-around mb-4">
        <TouchableOpacity onPress={() => setMarkMode('present')}>
          <Text className={`text-lg ${markMode === 'present' ? 'text-blue-500' : 'text-white'}`}>Mark - Present</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMarkMode('absent')}>
          <Text className={`text-lg ${markMode === 'absent' ? 'text-blue-500' : 'text-white'}`}>Mark - Absent</Text>
        </TouchableOpacity>
      </View>

      {/* Student List */}
      <FlatList
        data={sortedStudents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedStudents.includes(item.id);
          const isPresent = markMode === 'present' ? isSelected : !isSelected;
          return (
            <TouchableOpacity
              onPress={() => toggleAttendance(item.id)}
              className={`p-4 rounded-lg mb-4 ${isPresent ? 'bg-green-500' : 'bg-red-500'}`}
            >
              <Text className="text-white font-bold">{`${item.personalInfo.firstName} ${item.personalInfo.lastName}`}</Text>
              <Text className="text-gray-300">Enrollment: {item.username}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Submit Button */}
      <View className="mt-4">
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default ManualAttendanceScreen;
