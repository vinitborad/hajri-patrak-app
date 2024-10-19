import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import { useRouter } from 'expo-router';

const AtomStudentScreen = () => {
  const router = useRouter();

  const [username, setUsername] = useState(''); // Store username input
  const [studentInfo, setStudentInfo] = useState<any>(null); // Store fetched student info
  const [originalStudentInfo, setOriginalStudentInfo] = useState<any>(null); // Store original student info
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update

  const handleSearch = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setIsLoading(true); // Show loading
    setStudentInfo(null); // Reset student info

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_ATOM_STUDENT_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username, // Send the typed username
        },
      });

      const data = response.data.data;
      setStudentInfo({
        ...data,
        email: data?.email || '',
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        phone: data?.phone || '',
        address: data?.address || '',
        parentFirstName: data?.parentFirstName || '',  // New parent field
        parentLastName: data?.parentLastName || '',    // New parent field
        parentEmail: data?.parentEmail || '',          // New parent field
        parentPhone: data?.parentPhone || ''           // New parent field
      });

      setOriginalStudentInfo(data); // Set original data to compare later
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to add the subject.');
      }
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  const handleClear = () => {
    setStudentInfo(null); // Clear student data
    setOriginalStudentInfo(null); // Clear original data
    setUsername(''); // Clear input field
  };

  // Function to compare original and modified student info and return only modified fields
  const getModifiedFields = () => {
    const updatedFields: any = {};

    if (studentInfo?.email !== originalStudentInfo?.email) {
      updatedFields.email = studentInfo.email;
    }
    if (studentInfo?.firstName !== originalStudentInfo?.firstName) {
      updatedFields.firstName = studentInfo.firstName;
    }
    if (studentInfo?.lastName !== originalStudentInfo?.lastName) {
      updatedFields.lastName = studentInfo.lastName;
    }
    if (studentInfo?.phone !== originalStudentInfo?.phone) {
      updatedFields.phone = studentInfo.phone;
    }
    if (studentInfo?.address !== originalStudentInfo?.address) {
      updatedFields.address = studentInfo.address;
    }

    // New: Check for parent info changes
    if (studentInfo?.parentFirstName !== originalStudentInfo?.parentFirstName) {
      updatedFields.parentFirstName = studentInfo.parentFirstName;
    }
    if (studentInfo?.parentLastName !== originalStudentInfo?.parentLastName) {
      updatedFields.parentLastName = studentInfo.parentLastName;
    }
    if (studentInfo?.parentEmail !== originalStudentInfo?.parentEmail) {
      updatedFields.parentEmail = studentInfo.parentEmail;
    }
    if (studentInfo?.parentPhone !== originalStudentInfo?.parentPhone) {
      updatedFields.parentPhone = studentInfo.parentPhone;
    }

    return updatedFields;
  };

  const handleUpdate = async () => {
    const updatedFields = getModifiedFields();

    if (Object.keys(updatedFields).length === 0) {
      Alert.alert('No Changes', 'No fields have been changed.');
      return;
    }

    setIsUpdating(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const updateData = {
        username: studentInfo.username,
        ...updatedFields, // Send only modified fields
      };

      const response = await axios.patch(adminEndpoints.UPDATE_ATOM_STUDENT_PROFILE, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Update original data with the new values
        setOriginalStudentInfo({ ...studentInfo });

        Alert.alert('Success', 'Student profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update student profile.');
      }
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to update student profile.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to delete student
  const deleteStudent = async (username: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this student ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const token = await SecureStore.getItemAsync('token');
          try {
            await axios.delete(adminEndpoints.DELETE_STUDENT, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { username },
            });
            Alert.alert('Success', 'Student deleted successfully.');
          } catch (error: any) {
            if (error.response) {
              Alert.alert('Error', error.response.data.message);
            } else {
              Alert.alert('Error', 'Failed to delete student.');
            }
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjust for iOS
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Push content up to avoid keyboard overlap
    >
      <View className="flex-1 bg-[#1E1E1E] p-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header and Search Bar */}
          <View className="flex-row items-center mb-4">
            <TextInput
              placeholder="Enter Username"
              placeholderTextColor="#A0A0A0"
              value={username}
              editable={!isLoading && !studentInfo} // Disable input when loading or data is shown
              onChangeText={setUsername}
              className="flex-1 border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight"
            />
            {studentInfo && (
              <TouchableOpacity onPress={handleClear} className="ml-2">
                <Ionicons name="pencil" size={24} color="#9DBDFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search button */}
          {!studentInfo && (
            <TouchableOpacity
              className="bg-[#9DBDFF] py-2 px-4 rounded-lg mb-6"
              onPress={handleSearch}
              disabled={!username || isLoading} // Disable if username is empty or loading
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#1E1E1E" /> // Show loader while fetching data
              ) : (
                <Text className="text-center text-[#1E1E1E] text-lg font-NunitoBold">Search</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Student Info Section (Editable fields) */}
          {studentInfo && (
            <>
              <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF]">
                <Text className="text-[#9DBDFF] mb-2">EDUCATIONAL INFO</Text>
                <Text className="text-[#F6F5F5]">College: {studentInfo.educationMeta?.college || ''}</Text>
                <Text className="text-[#F6F5F5]">Department: {studentInfo.educationMeta?.department || ''}</Text>
                <Text className="text-[#F6F5F5]">Graduation Level: {studentInfo.educationMeta?.graduationLevel || ''}</Text>
                <Text className="text-[#F6F5F5]">Branch: {studentInfo.educationMeta?.branch || ''}</Text>
                <Text className="text-[#F6F5F5]">Passout Year: {studentInfo.educationMeta?.passoutYear || ''}</Text>
                <Text className="text-[#F6F5F5]">Current Semester: {studentInfo.educationMeta?.currentSemester || ''}</Text>
              </View>

              {/* Editable Fields */}
              <Text className="text-[#9DBDFF] mb-2">Email</Text>
              <TextInput
                value={studentInfo.email || ''}
                onChangeText={(text) => setStudentInfo({ ...studentInfo, email: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">First Name</Text>
              <TextInput
                value={studentInfo.firstName || ''}
                onChangeText={(text) => setStudentInfo({ ...studentInfo, firstName: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">Last Name</Text>
              <TextInput
                value={studentInfo.lastName || ''}
                onChangeText={(text) => setStudentInfo({ ...studentInfo, lastName: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">Phone</Text>
              <TextInput
                value={studentInfo.phone || ''}
                onChangeText={(text) => setStudentInfo({ ...studentInfo, phone: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">Address</Text>
              <TextInput
                value={studentInfo.address || ''}
                onChangeText={(text) => setStudentInfo({ ...studentInfo, address: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              {/* Parent Info Section */}
              <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF] mt-6">
                <Text className="text-[#9DBDFF] mb-2">PARENT INFO</Text>

                <Text className="text-[#9DBDFF] mb-2 mt-4">Parent First Name</Text>
                <TextInput
                  value={studentInfo.parentFirstName || ''}
                  onChangeText={(text) => setStudentInfo({ ...studentInfo, parentFirstName: text })}
                  className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
                />

                <Text className="text-[#9DBDFF] mb-2 mt-4">Parent Last Name</Text>
                <TextInput
                  value={studentInfo.parentLastName || ''}
                  onChangeText={(text) => setStudentInfo({ ...studentInfo, parentLastName: text })}
                  className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
                />

                <Text className="text-[#9DBDFF] mb-2 mt-4">Parent Email</Text>
                <TextInput
                  value={studentInfo.parentEmail || ''}
                  onChangeText={(text) => setStudentInfo({ ...studentInfo, parentEmail: text })}
                  className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
                />

                <Text className="text-[#9DBDFF] mb-2 mt-4">Parent Phone</Text>
                <TextInput
                  value={studentInfo.parentPhone || ''}
                  onChangeText={(text) => setStudentInfo({ ...studentInfo, parentPhone: text })}
                  className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
                />
              </View>

              {/* Action Buttons */}
              <View className="mt-6">
                <TouchableOpacity
                  className="bg-green-600 py-2 px-4 rounded-lg mb-2"
                  onPress={handleUpdate}
                  disabled={isUpdating} // Disable button while updating
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text className="text-center text-white">UPDATE</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity className="bg-[#3b3e44] py-2 px-4 rounded-lg mb-2 border border-[#9DBDFF]">
                  <Text className="text-center text-[#9DBDFF]">UNHOOK DEVICE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-[#3b3e44] py-2 px-4 rounded-lg mb-2 border border-[#9DBDFF]"
                  onPress={() => router.push(`/admin/(tabs)/home/atom-student/divisions-list?username=${studentInfo.username}`)}
                >
                  <Text className="text-center text-[#9DBDFF]">DIVISIONS LIST</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-600 py-2 px-4 rounded-lg mb-10"
                  onPress={() => deleteStudent(username)}
                >
                  <Text className="text-center text-white">DELETE STUDENT</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AtomStudentScreen;