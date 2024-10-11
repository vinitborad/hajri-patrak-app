import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';

const AtomStudentScreen = () => {
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

      setStudentInfo(response.data.data); // Set fetched data
      setOriginalStudentInfo(response.data.data); // Set original data to compare later
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch student information.');
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  const handleClear = () => {
    setStudentInfo(null); // Clear student data
    setOriginalStudentInfo(null); // Clear original data
    setUsername(''); // Clear input field
  };

  // Function to compare original and modified student info
  const isModified = () => {
    return (
      studentInfo?.email !== originalStudentInfo?.email ||
      studentInfo?.firstName !== originalStudentInfo?.firstName ||
      studentInfo?.lastName !== originalStudentInfo?.lastName ||
      studentInfo?.phone !== originalStudentInfo?.phone ||
      studentInfo?.address !== originalStudentInfo?.address
    );
  };

  const handleUpdate = async () => {
    if (!isModified()) {
      Alert.alert('No Changes', 'No fields have been changed.');
      return;
    }

    setIsUpdating(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const updateData = {
        username: studentInfo.username,
        email: studentInfo.email,
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        phone: studentInfo.phone,
        address: studentInfo.address,
      };

      const response = await axios.post(adminEndpoints.UPDATE_ATOM_STUDENT_PROFILE, updateData, {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to update student information.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
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
              <Text className="text-[#F6F5F5]">College: {studentInfo.educationMeta?.college || 'null'}</Text>
              <Text className="text-[#F6F5F5]">Department: {studentInfo.educationMeta?.department || 'null'}</Text>
              <Text className="text-[#F6F5F5]">Graduation Level: {studentInfo.educationMeta?.graduationLevel || 'null'}</Text>
              <Text className="text-[#F6F5F5]">Branch: {studentInfo.educationMeta?.branch || 'null'}</Text>
              <Text className="text-[#F6F5F5]">Passout Year: {studentInfo.educationMeta?.passoutYear || 'null'}</Text>
              <Text className="text-[#F6F5F5]">Current Semester: {studentInfo.educationMeta?.currentSemester || 'null'}</Text>
            </View>

            {/* Editable Fields */}
            <Text className="text-[#9DBDFF] mb-2">Email</Text>
            <TextInput
              value={studentInfo.email || 'null'}
              onChangeText={(text) => setStudentInfo({ ...studentInfo, email: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">First Name</Text>
            <TextInput
              value={studentInfo.firstName || 'null'}
              onChangeText={(text) => setStudentInfo({ ...studentInfo, firstName: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">Last Name</Text>
            <TextInput
              value={studentInfo.lastName || 'null'}
              onChangeText={(text) => setStudentInfo({ ...studentInfo, lastName: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">Phone</Text>
            <TextInput
              value={studentInfo.phone || 'null'}
              onChangeText={(text) => setStudentInfo({ ...studentInfo, phone: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">Address</Text>
            <TextInput
              value={studentInfo.address || 'null'}
              onChangeText={(text) => setStudentInfo({ ...studentInfo, address: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

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

              <TouchableOpacity className="bg-[#3b3e44] py-2 px-4 rounded-lg mb-2 border border-[#9DBDFF]">
                <Text className="text-center text-[#9DBDFF]">DIVISIONS LIST</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-red-600 py-2 px-4 rounded-lg mb-10">
                <Text className="text-center text-white">DELETE STUDENT</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AtomStudentScreen;