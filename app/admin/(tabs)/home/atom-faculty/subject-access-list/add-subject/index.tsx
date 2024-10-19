import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminEndpoints } from '@/constants/api-endpoints';
import { ATOM_FACULTY_ADD_SUBJECT_FORM_DATA } from '@/constants/async-store-keys';

const AddSubject = () => {
  const { username } = useLocalSearchParams(); // Extract the faculty username from the query params
  const router = useRouter(); // Use router for navigation

  const [formData, setFormData] = useState({
    college: '',
    passoutYear: '',
    department: '',
    graduationLevel: '',
    branch: '',
    semester: '',
    division: '',
    subjectCode: '',
    subjectName: '',
    subjectType: '',
  });

  const [isAdding, setIsAdding] = useState(false);

  // Handle input field changes and save to AsyncStorage
  const handleInputChange = async (key: string, value: string) => {
    const updatedFormData = { ...formData, [key]: value };
    setFormData(updatedFormData);

    try {
      await AsyncStorage.setItem(ATOM_FACULTY_ADD_SUBJECT_FORM_DATA, JSON.stringify(updatedFormData));
    } catch (error) {
      console.error('Error saving form data to AsyncStorage:', error);
    }
  };

  // Load saved form data from AsyncStorage on first load
  useEffect(() => {
    const loadSavedFormData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(ATOM_FACULTY_ADD_SUBJECT_FORM_DATA);
        if (savedData) {
          setFormData(JSON.parse(savedData)); // Set form data from saved values
        }
      } catch (error) {
        console.error('Error loading saved form data from AsyncStorage:', error);
      }
    };

    loadSavedFormData();
  }, []);

  // Validate form fields
  const validateFields = () => {
    return Object.values(formData).every((field) => field !== '');
  };

  // Add Subject API call
  const handleAddSubject = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsAdding(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.patch(
        adminEndpoints.ADD_SUBJECT_TO_FACULTY_ACCESS_LIST,
        {
          username, // Pre-filled username
          ...formData, // Spread form data to match API body structure
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Clear the saved form data upon successful submission

        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => {
              router.back(); // Navigate back to the previous screen
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to add the subject.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: 20 }}>
        <Text className="text-[#9DBDFF] text-3xl font-NunitoExtraBold mt-8 mb-2 text-center">Add Subject</Text>

        {/* Username (Pre-filled and not editable) */}
        <Text className="text-[#F6F5F5] mb-2">Username</Text>
        <View className="bg-[#3b3e44] p-4 mb-4 rounded-lg">
          <Text className="text-[#9DBDFF] text-lg">{username}</Text>
        </View>

        {/* Input Fields */}
        {['college', 'passoutYear', 'department', 'graduationLevel', 'branch', 'semester', 'division', 'subjectCode', 'subjectName', 'subjectType'].map((field, index) => (
          <View key={index}>
            <Text className="text-[#F6F5F5] mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</Text>
            <TextInput
              placeholder={`Enter ${field}`}
              placeholderTextColor="#A0A0A0"
              value={formData[field as keyof typeof formData]}
              onChangeText={(text) => handleInputChange(field, text)}
              keyboardType={field === 'passoutYear' || field === 'semester' ? 'numeric' : 'default'}
              className="bg-[#3b3e44] text-[#F6F5F5] p-4 rounded-lg mb-4"
            />
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity
          className="bg-[#FF6B6B] py-3 rounded-lg mt-4"
          onPress={handleAddSubject}
          disabled={isAdding}
        >
          <Text className="text-center text-[#1E1E1E] text-lg font-NunitoExtraBold">
            {isAdding ? 'Adding...' : 'Add Subject'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddSubject;