
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useGetStudentSubjects } from '@/api/student';

const Index = () => {

  const router = useRouter();

  const {
    //TODO: error and loading management
    data: subjects,
  } = useGetStudentSubjects();

  const handlePress = () => {
    Alert.alert("Coming Soon...");
  };


  return (
    <View
      className='flex-1 items-center bg-gray-100 p-4'
    >
      <TouchableOpacity
        onPress={handlePress}
        className="mt-6 bg-zinc-200 w-full h-32 rounded-lg flex items-center justify-center"
        activeOpacity={0.7}
      >
        <View className="flex items-center justify-center">
          <FontAwesome name="qrcode" size={40} color="black" />
          <Text className="mt-2 text-sm font-semibold">SCAN CODE</Text>
        </View>
      </TouchableOpacity>

      <Text className="mt-6 mb-2 text-lg font-bold">SUBJECTS</Text>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.subjectId}
        renderItem={({ item }) => <SubjectItem subject={item} router={router}/>}
      />

    </View>
  )
}

export default Index

//@ts-ignore
const SubjectItem = ({ subject, router }) => {

  const handleSubjectPress = () => {
    router.push(`/student/subject/${subject.subjectId}`);
  };

  return (
    <TouchableOpacity
      onPress={handleSubjectPress}
      className="flex flex-row justify-between items-center bg-white p-4 mb-2 rounded-lg shadow w-full"
      activeOpacity={0.7}
    >
      <Text className="text-lg font-semibold">{subject.subjectName}</Text>
      <View className="bg-gray-200 p-2 w-12 h-12 rounded-full flex items-center justify-center">
        <Text className="text-xs font-semibold">{Math.round(subject.attendancePercentage)}</Text>
      </View>
    </TouchableOpacity>
  );
};