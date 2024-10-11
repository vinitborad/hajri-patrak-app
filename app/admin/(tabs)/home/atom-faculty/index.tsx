import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';

const AtomFacultyScreen = () => {
  const [username, setUsername] = useState(''); // Store username input
  const [facultyInfo, setFacultyInfo] = useState<any>(null); // Store fetched faculty info
  const [originalFacultyInfo, setOriginalFacultyInfo] = useState<any>(null); // Store original faculty info
  const [isLoading, setIsLoading] = useState(false); // Loading state for search
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update

  const handleSearch = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setIsLoading(true); // Show loading
    setFacultyInfo(null); // Reset faculty info

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_ATOM_FACULTY_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username, // Send the typed username
        },
      });

      setFacultyInfo(response.data.data); // Set fetched data
      setOriginalFacultyInfo(response.data.data); // Set original data to compare later
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch faculty information.');
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  const handleClear = () => {
    setFacultyInfo(null); // Clear faculty data
    setOriginalFacultyInfo(null); // Clear original data
    setUsername(''); // Clear input field
  };

  // Function to compare original and modified faculty info
  const getModifiedFields = () => {
    const updatedFields: any = {};
    
    if (facultyInfo?.email !== originalFacultyInfo?.email) {
      updatedFields.email = facultyInfo.email;
    }
    if (facultyInfo?.firstName !== originalFacultyInfo?.firstName) {
      updatedFields.firstName = facultyInfo.firstName;
    }
    if (facultyInfo?.lastName !== originalFacultyInfo?.lastName) {
      updatedFields.lastName = facultyInfo.lastName;
    }
    if (facultyInfo?.phone !== originalFacultyInfo?.phone) {
      updatedFields.phone = facultyInfo.phone;
    }
    if (facultyInfo?.college !== originalFacultyInfo?.college) {
      updatedFields.college = facultyInfo.college;
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
        username: facultyInfo.username,
        ...updatedFields, // Send only modified fields
      };

      const response = await axios.post(adminEndpoints.UPDATE_ATOM_FACULTY_PROFILE, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Update original data with the new values
        setOriginalFacultyInfo({ ...facultyInfo });

        Alert.alert('Success', 'Faculty profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update faculty profile.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update faculty information.');
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
            editable={!isLoading && !facultyInfo} // Disable input when loading or data is shown
            onChangeText={setUsername}
            className="flex-1 border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight"
          />
          {facultyInfo && (
            <TouchableOpacity onPress={handleClear} className="ml-2">
              <Ionicons name="pencil" size={24} color="#9DBDFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search button */}
        {!facultyInfo && (
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

        {/* Faculty Info Section (Editable fields) */}
        {facultyInfo && (
          <>
            {/* Editable College Info */}
            <Text className="text-[#9DBDFF] mb-2">College</Text>
            <TextInput
              value={facultyInfo.college || 'null'}
              onChangeText={(text) => setFacultyInfo({ ...facultyInfo, college: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            {/* Editable Fields */}
            <Text className="text-[#9DBDFF] mb-2 mt-4">Email</Text>
            <TextInput
              value={facultyInfo.email || 'null'}
              onChangeText={(text) => setFacultyInfo({ ...facultyInfo, email: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">First Name</Text>
            <TextInput
              value={facultyInfo.firstName || 'null'}
              onChangeText={(text) => setFacultyInfo({ ...facultyInfo, firstName: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">Last Name</Text>
            <TextInput
              value={facultyInfo.lastName || 'null'}
              onChangeText={(text) => setFacultyInfo({ ...facultyInfo, lastName: text })}
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
            />

            <Text className="text-[#9DBDFF] mb-2 mt-4">Phone</Text>
            <TextInput
              value={facultyInfo.phone || 'null'}
              onChangeText={(text) => setFacultyInfo({ ...facultyInfo, phone: text })}
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
                <Text className="text-center text-white">DELETE FACULTY</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AtomFacultyScreen;