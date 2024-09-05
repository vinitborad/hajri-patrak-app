
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useGetStudentSubjects } from '@/api/student';

const Index = () => {

  const router = useRouter();

  const {
    //TODO: error and loading management
    data: subjects,
  } = useGetStudentSubjects();


  return (
    <View
      className='flex-1 items-center bg-[#1E1E1E] p-6'
    >
      <TouchableOpacity
        onPress={() => router.push('/student/qr')}
        className="mt-6 bg-[#686D76] w-full h-32 rounded-lg flex items-center justify-center border border-[#9DBDFF]"
        activeOpacity={0.7}
      >
        <View className="flex items-center justify-center">
          <FontAwesome name="qrcode" size={50} color="#9DBDFF"/>
          <Text className=' font-NunitoExtraBold text-[#9DBDFF]'>SCAN</Text>
        </View>
      </TouchableOpacity>

      <Text className="mt-8 mb-4 w-full pl-3 text-[#F6F5F5] text-xl font-NunitoExtraBold">SUBJECTS</Text>

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
      className="flex flex-row justify-between items-center bg-[#3b3e44] p-3 pl-6 mb-2 rounded-xl w-full border border-[#9DBDFF]"
      activeOpacity={0.7}
    >
      <Text className="text-xl font-NunitoBold text-fontColor">{subject.subjectName}</Text>
      <View className=" bg-[#FFD7C4] p-2 w-14 h-14 rounded-full flex items-center justify-center">
        <Text className="text-lg font-NunitoExtraBold text-[#3b3939]">{Math.round(subject.attendancePercentage)}</Text>
      </View>
    </TouchableOpacity>
  );
};