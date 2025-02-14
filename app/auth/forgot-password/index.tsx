import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Animated, Keyboard, ScrollView } from 'react-native';
import { EvilIcons, Ionicons } from '@expo/vector-icons'; // For dropdown icon
import axios from 'axios';
import { useRouter } from 'expo-router';
import Icon from '@/assets/images/icon.png';
import { authEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

const ForgotPasswordScreen = () => {
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [username, setUsername] = useState<string>('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownHeight = useRef(new Animated.Value(0)).current; // Control dropdown height animation

  const router = useRouter();

  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Toggle dropdown animation
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    Animated.timing(dropdownHeight, {
      toValue: dropdownVisible ? 0 : 150, // Adjusted height for scrollable dropdown
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onClick = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter a valid username.');
      return;
    }
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.post(authEndpoints.FORGOT_PASSWORD(role),
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const message = response.data?.message || 'Password reset email sent successfully.';
      Alert.alert('Success', message);
    } catch (error: any) {
      console.log(error);
      const errorMessage = error.response?.data?.message || 'Something went wrong, please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View className="bg-[#1E1E1E] flex items-center justify-start h-full w-full pt-44">
      <View className='flex items-center justify-center w-full gap-y-14'>
        <View className='flex-col items-center justify-center w-full'>
          <Image
            source={Icon}
            className="rounded-full mb-3"
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
          <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl">
            FORGOT PASSWORD
          </Text>
        </View>

        <View className='flex items-center justify-center w-full gap-1 text-center'>
          {/* Dropdown for Role Selection */}
          <View className="w-10/12">
            <TouchableOpacity
              onPress={toggleDropdown}
              className="flex-row items-center justify-between border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3"
            >
              <Text className="text-[#F6F5F5] font-NunitoLight text-lg">
                {role.charAt(0).toUpperCase() + role.slice(1)} {/* Capitalize first letter */}
              </Text>
              <EvilIcons name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={24} color="#F6F5F5" />
            </TouchableOpacity>

            {/* Animated Dropdown Options */}
            <Animated.View
              style={{ height: dropdownHeight, overflow: 'hidden', marginTop: 8, borderRadius: 10 }}
            >
              <ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    setRole('student');
                    toggleDropdown();
                  }}
                  className={`py-2 px-4 bg-[#3b3e44] border-b border-[#6c7382] w-full ${role === 'student' && 'bg-[#9DBDFF]'}`}
                >
                  <Text className="text-[#F6F5F5] font-NunitoLight text-lg">Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setRole('faculty');
                    toggleDropdown();
                  }}
                  className={`py-2 px-4 bg-[#3b3e44] border-b border-[#6c7382] w-full ${role === 'faculty' && 'bg-[#9DBDFF]'}`}
                >
                  <Text className="text-[#F6F5F5] font-NunitoLight text-lg">Faculty</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setRole('admin');
                    toggleDropdown();
                  }}
                  className={`py-2 px-4 bg-[#3b3e44] w-full ${role === 'admin' && 'bg-[#9DBDFF]'}`}
                >
                  <Text className="text-[#F6F5F5] font-NunitoLight text-lg">Admin</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>

          <View className="flex w-10/12 items-center gap-y-3">
            {/* Username Input */}
            <TextInput
              placeholder={role === 'student' ? 'Roll Number' : 'Username'}
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              keyboardType='default'
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg mb-5"
              selectionColor={'#A0A0A0'}
            />

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-[#9DBDFF] py-2 w-36 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg"
              onPress={onClick}
            >
              <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!isKeyboardVisible && ( // Only render this when the keyboard is hidden
        <View className='absolute bottom-8 flex-col items-center gap-2'>
          <TouchableOpacity
            className='flex-row gap-2'
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#9DBDFF" />
            <Text className="text-[#9DBDFF] font-NunitoLight text-sm">BACK</Text>
          </TouchableOpacity>
          <View className='flex items-center justify-center'>
            <Text className="text-[#64748B] font-NunitoLight text-xs">
              © 2025 LDCE. All Rights Reserved
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ForgotPasswordScreen;