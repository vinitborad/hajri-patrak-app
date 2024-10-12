import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const CreateSubjectScreen = () => {
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

  const [errors, setErrors] = useState({
    college: false,
    passoutYear: false,
    department: false,
    graduationLevel: false,
    branch: false,
    semester: false,
    division: false,
    subjectCode: false,
    subjectName: false,
    subjectType: false,
  });

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: false }); // Reset the error for the field when it starts filling
  };

  const validateFields = () => {
    const newErrors = {
      college: !formData.college,
      passoutYear: !formData.passoutYear,
      department: !formData.department,
      graduationLevel: !formData.graduationLevel,
      branch: !formData.branch,
      semester: !formData.semester,
      division: !formData.division,
      subjectCode: !formData.subjectCode,
      subjectName: !formData.subjectName,
      subjectType: !formData.subjectType,
    };

    setErrors(newErrors);

    // Check if any field is missing
    const isValid = !Object.values(newErrors).some((fieldError) => fieldError);
    return isValid;
  };

  const handleCreate = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    Alert.alert('Confirmation', 'Are you sure you want to create this subject?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          setIsCreating(true);
          try {
            const token = await SecureStore.getItemAsync('token');
            const response = await axios.post(adminEndpoints.CREATE_SUBJECT, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            Alert.alert('Success', 'Subject created successfully!');
            router.replace('/admin/home'); // Navigate back to the home screen after success
          } catch (error: any) {
            if (error.response?.data?.message) {
              Alert.alert('Error', error.response.data.message);
            } else {
              Alert.alert('Error', 'Failed to create subject.');
            }
          } finally {
            setIsCreating(false);
          }
        },
      },
    ]);
  };

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjust for iOS
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Push content up to avoid keyboard overlap
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1 bg-[#1E1E1E]">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="items-center mt-12 mb-8">
              <Text className="text-[#9DBDFF] font-NunitoExtraBold text-3xl">Create Subject</Text>
            </View>

            {/* Input Fields */}
            <View className="flex items-center px-4">
              {Object.keys(formData).map((field, index) => (
                <TextInput
                  key={index}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalize the field name
                  placeholderTextColor="#A0A0A0"
                  value={formData[field as keyof typeof formData]}
                  onChangeText={(text) => handleInputChange(field, text)}
                  keyboardType={field === 'passoutYear' || field === 'semester' ? 'numeric' : 'default'}
                  className={`w-full border ${
                    errors[field as keyof typeof formData] ? 'border-red-500' : 'border-[#9DBDFF]'
                  } bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg mb-4`}
                />
              ))}

              {/* Create Button */}
              <TouchableOpacity
                className="bg-[#FF6B6B] py-2 px-6 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg mt-4"
                onPress={handleCreate}
                disabled={isCreating}
              >
                <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">
                  {isCreating ? 'Creating...' : 'CREATE'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateSubjectScreen;