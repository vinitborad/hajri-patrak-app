import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Keyboard,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Platform
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Icon from '@/assets/images/icon.png';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import { adminEndpoints } from '@/constants/api-endpoints';

const AdminSignInScreen = () => {
  const blinkAnimation = useRef(new Animated.Value(1)).current; // Initialize animation value
  const router = useRouter();

  const [role, setRole] = useState<'admin' | 'student'>('admin'); // Update roles to admin and student
  const [username, setUsername] = useState<string>(''); // For admin username or adminUsername for student
  const [password, setPassword] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState<string>(''); // Add student username
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState(false); // State to track loading

  const studentUsernameHeight = useRef(new Animated.Value(0)).current; // For animation

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

  useEffect(() => {
    const startBlinking = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnimation, {
            toValue: 0, // Fade out
            duration: 500, // Duration of fade out
            useNativeDriver: true, // Optimize with native driver
          }),
          Animated.timing(blinkAnimation, {
            toValue: 1, // Fade in
            duration: 500, // Duration of fade in
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startBlinking();
  }, [blinkAnimation]);

  const onClick = async () => {
    try {
      setLoading(true); // Set loading to true when the process starts

      // Validation for student login
      if (role === 'student' && (!studentUsername || !username || !password)) {
        Alert.alert('Invalid Inputs !', 'Please enter valid student username, admin username, and password.');
        return;
      }

      // Validation for admin login
      if (role === 'admin' && (!username || !password)) {
        Alert.alert('Invalid Inputs !', 'Please enter a valid admin username and password.');
        return;
      }

      if (role === 'admin') {
        // Admin login flow
        try {
          const response = await axios.post(adminEndpoints.SIGN_IN, {
            username,
            password,
          });
          if (response.data.success && response.data.token) {
            await SecureStore.setItemAsync('token', response.data.token);
            await SecureStore.setItemAsync('role', 'admin');
            router.replace('/'); // Navigate to home
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
      } else if (role === 'student') {
        // Student login flow
        try {
          const response = await axios.post(adminEndpoints.STUDENT_SIGNIN, {
            studentUsername,
            adminUsername: username, // Admin username
            password,
          });

          if (response.data.success && response.data.token) {
            await SecureStore.setItemAsync('token', response.data.token);
            await SecureStore.setItemAsync('role', 'admin-student'); // Set role as admin since this is for the admin panel
            router.replace('/'); // Navigate to home
          } else {
            Alert.alert('Invalid Credentials', 'Please enter valid credentials.');
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Make this work for Android and iOS
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="bg-[#1E1E1E] flex items-center justify-start h-full w-full pt-24">
            <View className='flex items-center justify-center w-full gap-y-14'>
              <View className='flex-col items-center justify-center w-full'>
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

                <View className="flex w-10/12 items-center gap-y-3 mt-5">
                  {/* Animated Student Username Input */}
                  <Animated.View style={{ height: studentUsernameHeight, overflow: 'hidden', width: '100%', marginBottom: -6 }}>
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

                  {/* Password Input with Eye Icon */}
                  <View className="flex-row w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg items-center">
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#A0A0A0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!passwordVisible} // Toggle secure entry
                      className="flex-1 px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
                      selectionColor={'#A0A0A0'}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility} className="pr-4">
                      <Ionicons
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={24}
                        color="#9DBDFF"
                      />
                    </TouchableOpacity>
                  </View>

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
                <View className='flex-row items-center justify-center gap-x-2'>
                  {/* Blinking Red Dot */}
                  <Animated.View
                    style={{ opacity: blinkAnimation }} // Apply animated opacity
                    className='h-3 w-3 bg-green-600 rounded-full -mt-0.5'
                  />
                  <Text className="text-[#64748B] font-NunitoLight text-xs">
                    V1.0.0B10U1
                  </Text>
                </View>
                <TouchableOpacity
                  className='flex-row'
                  onPress={() => router.replace('/auth/sign-in')}
                >
                  <EvilIcons name="external-link" size={24} color="#9DBDFF" />
                  <Text className="text-[#9DBDFF] font-NunitoLight text-sm">REGULAR</Text>
                </TouchableOpacity>
                <View className='flex items-center justify-center'>
                  <Text className="text-[#64748B] font-NunitoLight text-xs">
                    © 2025 LDCE. All Rights Reserved
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AdminSignInScreen;