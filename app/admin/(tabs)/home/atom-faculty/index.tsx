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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import { router } from 'expo-router';

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

      const data = response.data.data;
      setFacultyInfo({
        ...data,
        college: data?.college || '', // If null, set it to empty string
        email: data?.email || '',
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        phone: data?.phone || '',
      }); // Set fetched data

      setOriginalFacultyInfo(data); // Store original data to compare later
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Internal Error.');
      }
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

  // Function to delete faculty
  const deleteFaculty = async (username: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this faculty ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const token = await SecureStore.getItemAsync('token');
          try {
            await axios.delete(adminEndpoints.DELETE_FACULTY, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { username },
            });
            Alert.alert('Success', 'Faculty deleted successfully.');
          } catch (error: any) {
            if (error.response) {
              Alert.alert('Error', error.response.data.message);
            } else {
              Alert.alert('Error', 'Failed to delete faculty.');
            }
          }
        },
      },
    ], { cancelable: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjust for iOS
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Push content up to avoid keyboard overlap
    >
      <View className="flex-1 bg-[#1E1E1E] p-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header  */}
          <Text className="text-[#9DBDFF] text-2xl font-NunitoBold mb-4">Faculty Profile</Text>
          {/* Search Bar */}
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
                value={facultyInfo.college || ''}
                onChangeText={(text) => setFacultyInfo({ ...facultyInfo, college: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              {/* Editable Fields */}
              <Text className="text-[#9DBDFF] mb-2 mt-4">Email</Text>
              <TextInput
                value={facultyInfo.email || ''}
                onChangeText={(text) => setFacultyInfo({ ...facultyInfo, email: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">First Name</Text>
              <TextInput
                value={facultyInfo.firstName || ''}
                onChangeText={(text) => setFacultyInfo({ ...facultyInfo, firstName: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">Last Name</Text>
              <TextInput
                value={facultyInfo.lastName || ''}
                onChangeText={(text) => setFacultyInfo({ ...facultyInfo, lastName: text })}
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5]"
              />

              <Text className="text-[#9DBDFF] mb-2 mt-4">Phone</Text>
              <TextInput
                value={facultyInfo.phone || ''}
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

                <TouchableOpacity
                  className="bg-[#3b3e44] py-2 px-4 rounded-lg mb-2 border border-[#9DBDFF]"
                  onPress={() => router.push(`/admin/(tabs)/home/atom-faculty/subject-access-list?username=${facultyInfo.username}`)}
                >
                  <Text className="text-center text-[#9DBDFF]">SUBJECT ACCESS LIST</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-600 py-2 px-4 rounded-lg mb-10"
                  onPress={() => deleteFaculty(facultyInfo.username)}
                >
                  <Text className="text-center text-white">DELETE FACULTY</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AtomFacultyScreen;