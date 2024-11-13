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

const CreateStudentScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    college: '',
    department: '',
    graduationLevel: '',
    branch: '',
    passoutYear: '',
    divisionInfo: [
      { division: '', interDivision: '' } // Initial division field
    ],
  });

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    phone: false,
    firstName: false,
    lastName: false,
    address: false,
    parentFirstName: false,
    parentLastName: false,
    parentPhone: false,
    parentEmail: false,
    college: false,
    department: false,
    graduationLevel: false,
    branch: false,
    passoutYear: false,
    divisionInfo: false, // Validation for division fields
  });

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: false }); // Reset the error for the field when it starts filling
  };

  const handleDivisionChange = (index: number, key: string, value: string) => {
    const updatedDivisions = [...formData.divisionInfo];
    //@ts-ignore
    updatedDivisions[index][key] = value;
    setFormData({ ...formData, divisionInfo: updatedDivisions });
  };

  const validateFields = () => {
    const newErrors = {
      username: !formData.username,
      email: !formData.email,
      phone: !formData.phone,
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      address: !formData.address,
      parentFirstName: !formData.parentFirstName,
      parentLastName: !formData.parentLastName,
      parentPhone: !formData.parentPhone,
      parentEmail: !formData.parentEmail,
      college: !formData.college,
      department: !formData.department,
      graduationLevel: !formData.graduationLevel,
      branch: !formData.branch,
      passoutYear: !formData.passoutYear,
      divisionInfo: formData.divisionInfo.some(div => !div.division || !div.interDivision), // Validate divisionInfo
    };

    setErrors(newErrors);

    // Check if any field is missing
    const isValid = !Object.values(newErrors).some((fieldError) => fieldError);
    return isValid;
  };

  const handleCreate = async () => {
    if (!validateFields()) {
      Alert.alert('Error', 'Please fill in all required fields, including divisions.');
      return;
    }

    Alert.alert('Confirmation', 'Are you sure you want to create this student?', [
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
            const response = await axios.post(adminEndpoints.CREATE_STUDENT, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            Alert.alert('Success', 'Student created successfully!');
          } catch (error: any) {
            if (error.response?.data?.message) {
              Alert.alert('Error', error.response.data.message);
            } else {
              Alert.alert('Error', 'Failed to create student.');
            }
          } finally {
            setIsCreating(false);
          }
        },
      },
    ]);
  };

  // Add a new division field
  const handleAddDivision = () => {
    setFormData({
      ...formData,
      divisionInfo: [...formData.divisionInfo, { division: '', interDivision: '' }],
    });
  };

  // Remove a division field
  const handleRemoveDivision = (index: number) => {
    const updatedDivisions = formData.divisionInfo.filter((_, i) => i !== index);
    setFormData({ ...formData, divisionInfo: updatedDivisions });
  };

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View className="flex-1 bg-[#1E1E1E]">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="items-center mt-12 mb-8">
              <Text className="text-[#9DBDFF] font-NunitoExtraBold text-3xl">Create Student</Text>
            </View>

            {/* Input Fields */}
            <View className="flex items-center px-4">
              {Object.keys(formData).map((field, index) => {
                if (field !== 'divisionInfo') {
                  return (
                    <TextInput
                      key={index}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      placeholderTextColor="#A0A0A0"
                      // @ts-ignore 
                      value={formData[field as keyof typeof formData]}
                      onChangeText={(text) => handleInputChange(field, text)}
                      secureTextEntry={field.toLowerCase().includes('password')}
                      keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
                      className={`w-full border ${errors[field as keyof typeof formData] ? 'border-red-500' : 'border-[#9DBDFF]'
                        } bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg mb-4`}
                    />
                  );
                }
              })}

              {/* Division Fields */}
              {formData.divisionInfo.map((division, index) => (
                <View key={index} className="flex-row w-full gap-x-2 mb-4">
                  <TextInput
                    placeholder="Division"
                    placeholderTextColor="#A0A0A0"
                    value={division.division}
                    onChangeText={(text) => handleDivisionChange(index, 'division', text)}
                    className={`flex-1 border ${errors.divisionInfo ? 'border-red-500' : 'border-[#9DBDFF]'
                      } bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight`}
                  />
                  <TextInput
                    placeholder="InterDivision"
                    placeholderTextColor="#A0A0A0"
                    value={division.interDivision}
                    onChangeText={(text) => handleDivisionChange(index, 'interDivision', text)}
                    className={`flex-1 border ${errors.divisionInfo ? 'border-red-500' : 'border-[#9DBDFF]'
                      } bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight`}
                  />
                  <TouchableOpacity onPress={() => handleRemoveDivision(index)}>
                    <Text className="text-red-500">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity onPress={handleAddDivision} className="mb-4">
                <Text className="text-[#9DBDFF]">+ Add Another Division</Text>
              </TouchableOpacity>

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

export default CreateStudentScreen;