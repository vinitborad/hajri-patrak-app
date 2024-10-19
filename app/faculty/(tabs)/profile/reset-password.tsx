import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import axios from 'axios';
import { facultyEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const ResetPasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');

  const handleChangePassword = async () => {
    // Check if any fields are empty
    if (!currentPassword || !newPassword || !repeatNewPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }

    // Check if new password and repeat password are the same
    if (newPassword !== repeatNewPassword) {
      return Alert.alert('Error', 'New password and repeat password must match.');
    }

    if (currentPassword === newPassword) {
      return Alert.alert('Error', 'New password cannot be the same as the current password.');
    }

    // Make API request to change password
    try {
      console.log('Changing password...');
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(facultyEndpoints.CHANGE_PASSWORD, {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: repeatNewPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('response:', response.data);

      if (response.data.success === true) {
        Alert.alert('Success', 'Password changed successfully.');
      } else {
        if (response.data.message) {
          Alert.alert('Error', response.data.message);
        } else {
          Alert.alert('Error', 'An error occurred. Please try again.');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response.data.message);
    }
  };

  return (
    <View className="flex-1 bg-[#1E1E1E] p-6 pt-11">
      <Stack.Screen options={{ headerShown: false }} />

      <Text className="text-white text-2xl font-NunitoLight mb-6 text-center bg-[#879ecb] p-2 rounded-lg">CHANGE PASSWORD</Text>

      {/* Current Password */}
      <TextInput
        className="bg-[#3b3e44] text-white p-4 mb-4 rounded-lg"
        placeholder="Current Password"
        placeholderTextColor="#9DBDFF"
        // secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      {/* New Password */}
      <TextInput
        className="bg-[#3b3e44] text-white p-4 mb-4 rounded-lg"
        placeholder="New Password"
        placeholderTextColor="#9DBDFF"
        // secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      {/* Repeat New Password */}
      <TextInput
        className="bg-[#3b3e44] text-white p-4 mb-4 rounded-lg"
        placeholder="Repeat New Password"
        placeholderTextColor="#9DBDFF"
        // secureTextEntry
        value={repeatNewPassword}
        onChangeText={setRepeatNewPassword}
      />

      {/* Change Password Button */}
      <TouchableOpacity
        className="bg-[#FF6B6B] p-4 rounded-lg items-center"
        onPress={handleChangePassword}
      >
        <Text className="text-white text-lg font-NunitoExtraBold">Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;
