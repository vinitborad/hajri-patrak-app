import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const SemesterUpgradeScreen = () => {
  const [formData, setFormData] = useState({
    college: '',
    passoutYear: '',
    department: '',
    graduationLevel: '',
    branch: '',
    semester: '',
    division: '',
  });
  const [isUpgrading, setIsUpgrading] = useState(false); // Track if upgrade is in progress

  // Handle input field changes
  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  // Handle upgrade action with double confirmation
  const handleUpgrade = () => {
    Alert.alert(
      'Confirm Upgrade !',
      'Are you sure you want to upgrade the semester ?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This action will upgrade the semester. Do you want to proceed ?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Upgrade',
                  onPress: submitUpgradeRequest,
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Submit upgrade request
  const submitUpgradeRequest = async () => {
    setIsUpgrading(true);
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.post(adminEndpoints.UPGRADE_DIVISIONS, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success || response.data.message) {
        Alert.alert('Success', response.data.message);
      } else {
        Alert.alert('Error', response.data.message || 'Upgrade failed.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while upgrading.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: 20 }}>
        <Text className="text-[#9DBDFF] text-3xl font-NunitoExtraBold mt-8 mb-6 text-center">Semester Upgrade</Text>

        {/* Input Fields */}
        {Object.keys(formData).map((field, index) => (
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

        {/* Upgrade Button */}
        <TouchableOpacity
          className="bg-[#FF6B6B] py-3 rounded-lg mt-4"
          onPress={handleUpgrade}
          disabled={isUpgrading} // Disable button while request is in progress
        >
          <Text className="text-center text-[#1E1E1E] text-lg font-NunitoExtraBold">
            {isUpgrading ? 'Upgrading...' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SemesterUpgradeScreen;