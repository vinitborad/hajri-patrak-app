import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { adminEndpoints } from '@/constants/api-endpoints';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AntDesign } from '@expo/vector-icons';
import { useGetStudentsStrcutreStudentList } from '@/api/admin/data/students-structure';

const StudentsList = () => {
  const { college, department, branch, graduationLevel, passoutYear } = useLocalSearchParams();

  // States
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // For viewing student details
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track delete state per student

  // Fetch students list
  const { data, isLoading, error, refetch } = useGetStudentsStrcutreStudentList({
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
  });

  // Function to delete student
  const deleteStudent = async (studentId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setIsDeleting(studentId); // Set delete state
          const token = await SecureStore.getItemAsync('token');
          try {
            await axios.delete(adminEndpoints.DELETE_STUDENT, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { studentId },
            });
            Alert.alert('Success', 'Student deleted successfully.');
            refetch(); // Re-fetch the list after deletion
          } catch (error: any) {
            if (error.response) {
              Alert.alert('Error', error.response.data.message);
            } else {
              Alert.alert('Error', 'Failed to delete student.');
            }
          } finally {
            setIsDeleting(null);
          }
        },
      },
    ]);
  };

  // Function to view student details
  const viewStudent = (student: any) => {
    setSelectedStudent(student); // Set the selected student for modal display
  };

  // Close modal
  const closeModal = () => {
    setSelectedStudent(null); // Close modal
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-[#FF6B6B]">No Network</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1E1E1E]">
      <ScrollView contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: 13 }}>
        {/* Heading */}
        <Text className="text-[#F6F5F5] text-2xl font-NunitoBold mb-3 mt-5 ml-1">Student List</Text>

        {/* Student List */}
        {data?.students.map((student: any) => (
          <View key={student.username} className="bg-[#3b3e44] mb-4 rounded-xl border border-[#9DBDFF]">
            <View className="flex-row justify-between items-center px-3 py-1 rounded-t-xl bg-[#5b5f68]">
              <Text className="text-[#9DBDFF] text-lg font-NunitoRegular">{student.username}</Text>
              <TouchableOpacity
                disabled={isDeleting === student.username}
                onPress={() => deleteStudent(student._id)}
              >
                {isDeleting === student.username ? (
                  <ActivityIndicator size="small" color="#FF6B6B" />
                ) : (
                  <Text className="text-[#FF6B6B] font-NunitoExtraBold text-xs">DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center p-2 px-3 pr-4">
              <Text className="text-[#F6F5F5] text-xl capitalize font-NunitoBold">{`${student.firstName} ${student.lastName}`}</Text>
              <TouchableOpacity onPress={() => viewStudent(student)} className='mb-1'>
                <Text className="text-[#9DBDFF] font-NunitoExtraBold text-lg border-b-2 border-[#9DBDFF]">View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal for viewing student details */}
      {selectedStudent && (
        <Modal animationType="slide" transparent={true} visible={!!selectedStudent}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-[#1E1E1E] p-5 rounded-lg w-4/5">
              {/* Close button */}
              <TouchableOpacity onPress={closeModal} className="self-end">
                <AntDesign name="close" size={24} color="#9DBDFF" />
              </TouchableOpacity>

              {/* Student details */}
              <View className="items-center">
                {selectedStudent.photoUrl ? (
                  <Image source={{ uri: selectedStudent.photoUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                ) : (
                  <AntDesign name="user" size={100} color="#9DBDFF" />
                )}
                <Text className="text-[#9DBDFF] text-xl font-NunitoBold mt-4">{selectedStudent.username}</Text>
                <Text className="text-[#F6F5F5] text-lg">{`${selectedStudent.firstName} ${selectedStudent.lastName}`}</Text>
              </View>

              {/* Personal Info */}
              <View className="mt-4">
                <Text className="text-[#F6F5F5]">Email: {selectedStudent.email}</Text>
                <Text className="text-[#F6F5F5]">Phone: {selectedStudent.phone}</Text>
                <Text className="text-[#F6F5F5]">Address: {selectedStudent.address}</Text>
              </View>

              {/* Parent Info */}
              <View className="mt-4">
                <Text className="text-[#F6F5F5]">Parent Name: {`${selectedStudent.parentFirstName} ${selectedStudent.parentLastName}`}</Text>
                <Text className="text-[#F6F5F5]">Parent Email: {selectedStudent.parentEmail}</Text>
                <Text className="text-[#F6F5F5]">Parent Phone: {selectedStudent.parentPhone}</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default StudentsList;