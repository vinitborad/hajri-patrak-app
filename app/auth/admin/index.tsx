import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Animated, Keyboard, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Icon from '@/assets/images/icon.png';
import { EvilIcons } from '@expo/vector-icons';
import { adminEndpoints } from '@/constants/api-endpoints';

const AdminSignInScreen = () => {
  const [role, setRole] = useState<'admin' | 'student'>('admin'); // Update roles to admin and student
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState<string>(''); // Add student username
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false); // State to track loading

  const studentUsernameHeight = useRef(new Animated.Value(0)).current; // For animation

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

  // Show/Hide animation for "Student Username" field based on role
  useEffect(() => {
    if (role === 'student') {
      Animated.timing(studentUsernameHeight, {
        toValue: 60, // Desired height for the input box
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(studentUsernameHeight, {
        toValue: 0, // Hide the input box
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [role]);

  const onClick = async () => {
    try {
      setLoading(true); // Set loading to true when the process starts
      if (role === 'student' && !studentUsername && !username && !password) {
        Alert.alert('Invalid Inputs !', 'Please enter a valid student username, admin username, and password.');
        return;
      }
      if (role === 'admin' && !username && !password) {
        Alert.alert('Invalid Inputs !', 'Please enter a valid admin username and password.');
        return;
      }
      if (role === 'admin') {
        try {
          const response = await axios.post(adminEndpoints.SIGN_IN, {
            username,
            password,
          });
          if (response.data.success && response.data.token) {
            // success working
            await SecureStore.setItemAsync('token', response.data.token);
            await SecureStore.setItemAsync('role', 'admin');
            router.replace('/');
          } else {
            Alert.alert('Invalid Credentials', 'Please enter a valid admin username and password.');
          }
        } catch (error: any) {
          if (error.response && error.response.data) {
            Alert.alert('Invalid Credentials', error.response.data.message.toString());
          } else {
            Alert.alert('Error', 'Something went wrong, please try again.');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong, please try again.');
      console.log(error);
    } finally {
      setLoading(false); // Set loading to false when the process ends
    }
  };

  return (
    <View className="bg-[#1E1E1E] flex items-center justify-start h-full w-full pt-24">
      <View className='flex items-center justify-center w-full gap-y-14'>
        <View className=' flex-col items-center justify-center w-full'>
          <Image
            source={Icon}
            className="rounded-full mb-3"
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
          <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl">
            ADMIN PANEL
          </Text>
        </View>

        <View className='flex items-center justify-center w-full gap-0 text-center'>
          {/* Role selector */}
          <View className="flex-row justify-center border-b-4 border-[#6c7382] rounded-xl">
            <TouchableOpacity
              className={`px-4 py-2 rounded-tl-lg rounded-bl-lg w-32 flex items-center justify-center ${role === 'admin' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
              onPress={() => setRole('admin')}
              disabled={loading} // Disable button when loading
            >
              <Text className={`font-NunitoBold text-lg ${role === 'admin' ? 'text-[#1E1E1E]' : 'text-[#F6F5F5]'}`}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 rounded-tr-lg rounded-br-lg w-32 flex items-center justify-center ${role === 'student' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
              onPress={() => setRole('student')}
              disabled={loading} // Disable button when loading
            >
              <Text className={`font-NunitoBold text-lg ${role === 'student' ? 'text-[#1E1E1E]' : 'text-[#F6F5F5]'}`}>Student</Text>
            </TouchableOpacity>
          </View>

          <View className="flex w-10/12 items-center gap-y-3">
            {/* Animated Student Username Input */}
            <Animated.View style={{ height: studentUsernameHeight, overflow: 'hidden', width: '100%' }}>
              <TextInput
                placeholder="Student Username"
                placeholderTextColor="#A0A0A0"
                value={studentUsername}
                onChangeText={setStudentUsername}
                keyboardType='default'
                className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
                selectionColor={'#A0A0A0'}
                editable={!loading} // Disable input when loading
              />
            </Animated.View>

            {/* Username/Email Input */}
            <TextInput
              placeholder={role === 'student' ? "Admin Username" : "Username"} // Placeholder depends on role
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              keyboardType='default'
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
              selectionColor={'#A0A0A0'}
              editable={!loading} // Disable input when loading
            />

            {/* Password Input */}
            <TextInput
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
              selectionColor={'#A0A0A0'}
              editable={!loading} // Disable input when loading
            />

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-[#9DBDFF] py-2 w-36 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg flex items-center justify-center"
              onPress={onClick}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <ActivityIndicator size="small" color="#1E1E1E" /> // Show loader if loading
              ) : (
                <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className='flex items-center justify-center pt-3'
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text className="text-[#9DBDFF] font-NunitoLight text-sm">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isKeyboardVisible && ( // Only render this when the keyboard is hidden
        <View className='absolute bottom-8 flex-col items-center gap-2'>
          <TouchableOpacity
            className='flex-row'
            onPress={() => router.replace('/auth/sign-in')}
          >
            <EvilIcons name="external-link" size={24} color="#9DBDFF" />
            <Text className="text-[#9DBDFF] font-NunitoLight text-sm">REGULAR</Text>
          </TouchableOpacity>
          <View className='flex items-center justify-center'>
            <Text className="text-[#64748B] font-NunitoLight text-xs">
              © 2024 LDCE. All Rights Reserved
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminSignInScreen;
