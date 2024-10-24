import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Alert, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { adminEndpoints } from '@/constants/api-endpoints'; // Import your API endpoint
import { useGetStudentsStrcutreStudentList } from '@/api/admin/data/students-structure';

const AddStudentScreen = () => {
  const router = useRouter();

  const {
    interDivisionId,
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
  } = useLocalSearchParams(); // Extract params

  const { data, isLoading, error } = useGetStudentsStrcutreStudentList({
    college,
    department,
    graduationLevel,
    branch,
    passoutYear,
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Track selected students
  const [modalVisible, setModalVisible] = useState(false); // Control modal visibility for student info
  const [currentStudent, setCurrentStudent] = useState<any>(null); // Hold current student info
  const [isAdding, setIsAdding] = useState(false); // To track adding process
  const [failedStudents, setFailedStudents] = useState<any[]>([]); // To track failed additions

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  // Show student info in modal
  const showStudentInfo = (student: any) => {
    setCurrentStudent(student);
    setModalVisible(true);
  };

  // Function to add selected students one by one
  const addStudentsToDivision = async () => {
    setIsAdding(true);
    setFailedStudents([]);

    const token = await SecureStore.getItemAsync('token');
    const failed = [];

    for (const studentId of selectedStudents) {
      try {
        const student = data?.students.find((s: any) => s._id === studentId);
        const response = await axios.patch(
          adminEndpoints.ADD_STUDENT_TO_DIVISION,
          {
            studentUsername: student.username,
            divisionId: interDivisionId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data.success) {
          failed.push(student); // Add failed student to list
        }
      } catch (err) {
        const student = data?.students.find((s: any) => s._id === studentId);
        failed.push(student); // Add failed student to list
      }
    }

    setIsAdding(false);
    setFailedStudents(failed);

    if (failed.length > 0) {
      Alert.alert(
        'Error',
        `The following students could not be added:\n${failed.map(
          (s) => `${s.username} (${s.firstName} ${s.lastName})`
        ).join('\n')}`
      );
    } else {
      // If all students were successfully added, navigate back and refresh the previous screen
      router.back();
    }
  };

  // Function to ask for confirmation before adding students
  const confirmAddStudents = () => {
    Alert.alert(
      'Confirm Addition',
      'Are you sure you want to add the selected students to the division?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: addStudentsToDivision }, // Proceed if user confirms
      ],
      { cancelable: true }
    );
  };

  // Render individual student card
  const renderStudentItem = ({ item }: { item: any }) => {
    const isSelected = selectedStudents.includes(item._id);
    return (
      <View
        key={item.username}
        className={`bg-[#3b3e44] mb-4 w-full rounded-xl border ${
          isSelected ? 'border-green-500' : 'border-[#9DBDFF]'
        }`}
      >
        <View className="flex-row w-full justify-between items-center px-3 py-1 rounded-t-xl bg-[#5b5f68] relative">
          <Text className="text-[#9DBDFF] text-lg font-NunitoRegular">{item.username}</Text>
          <TouchableOpacity onPress={() => showStudentInfo(item)}>
            <MaterialIcons name="info-outline" size={24} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => toggleStudentSelection(item._id)}
          className="p-2 px-3 pr-4 w-full"
        >
          <Text className="text-[#F6F5F5] text-xl capitalize font-NunitoBold">{`${item.firstName} ${item.lastName}`}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // If data is loading, show loading indicator
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  // If there's an error, display it
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load students. Please try again.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4 items-center w-full">
      {/* Student List */}
      <FlatList
        data={data?.students}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        contentContainerStyle={{ paddingBottom: 100, width: '100%' }}
      />

      {/* Add Button Stuck at the Bottom */}
      <TouchableOpacity
        className="bg-[#9DBDFF] rounded-lg absolute bottom-20 w-fit px-4"
        onPress={confirmAddStudents} // Call confirmation dialog before adding students
        disabled={isAdding} // Disable the button while adding students
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white text-center font-NunitoExtraBold text-xl">Add</Text>
        )}
      </TouchableOpacity>

      {/* Modal for Student Info */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg w-[85%]">
            <Text className="text-xl text-[#9DBDFF] font-NunitoExtraBold mb-4">
              {currentStudent?.firstName} {currentStudent?.lastName}'s Info
            </Text>
            <ScrollView>
              <Text className="text-[#F6F5F5]">Username: {currentStudent?.username}</Text>
              <Text className="text-[#F6F5F5]">Email: {currentStudent?.email}</Text>
              <Text className="text-[#F6F5F5]">Phone: {currentStudent?.phone}</Text>
              <Text className="text-[#F6F5F5]">Address: {currentStudent?.address}</Text>
              <Text className="text-[#F6F5F5]">Parent Info: {currentStudent?.parentFirstName} {currentStudent?.parentLastName}</Text>
              <Text className="text-[#F6F5F5]">Parent Email: {currentStudent?.parentEmail}</Text>
              <Text className="text-[#F6F5F5]">Parent Phone: {currentStudent?.parentPhone}</Text>
            </ScrollView>
            <TouchableOpacity
              className="bg-[#9DBDFF] p-3 mt-4 rounded-lg"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center font-NunitoExtraBold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddStudentScreen;