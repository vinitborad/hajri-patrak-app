import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Icon from '@/assets/images/icon.png';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import { CustomCheckBox } from '@/components/custom/CheckBox';

const SignInScreen = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'faculty' | 'student' | 'parent'>('student');
  const [isParentLogin, setIsParentLogin] = useState<boolean>(false); // Track if login as parent is selected
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState(false); // State for loading

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

  const onClick = async () => {
    try {
      setLoading(true); // Set loading to true when the process starts
      if (!username || !password) {
        Alert.alert('Invalid Inputs !', 'Please enter a valid username and password.');
        return;
      }
      try {
        const finalRole = isParentLogin ? 'parent' : role; // Determine if login is as a parent
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/${finalRole}/auth/signin`, {
          username,
          password,
        });
        if (response.data.success && response.data.token) {
          await SecureStore.setItemAsync('token', response.data.token);
          await SecureStore.setItemAsync('role', finalRole);
          router.replace('/');
        } else {
          Alert.alert('Invalid Credentials', 'Please enter a valid username and password.');
        }
      } catch (error: any) {
        if (error.response && error.response.data) {
          Alert.alert('Invalid Credentials', error.response.data.message.toString());
        } else {
          Alert.alert('Error', 'Something went wrong, please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong, please try again.');
      console.log(error);
    } finally {
      setLoading(false); // Set loading to false when the process ends
    }
  };

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-[#1E1E1E] flex items-center justify-start h-full w-full pt-24">
              <View className='flex items-center justify-center w-full gap-y-14'>
                <View className=' flex-col items-center justify-center w-full'>
                  <Image
                    source={Icon}
                    className="rounded-full mb-3"
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                  />
                  <Text className="text-[#9DBDFF] font-NunitoExtraBold text-xl">
                    LD COLLEGE OF ENGG.
                  </Text>
                </View>

                <View className='flex items-center justify-center w-full gap-0 text-center'>
                  <View className="flex-row justify-center border-b-4 border-[#6c7382] rounded-xl">
                    <TouchableOpacity
                      className={`px-4 py-2 rounded-tl-lg rounded-bl-lg w-32 flex items-center justify-center ${role === 'student' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
                      onPress={() => { setRole('student'); setIsParentLogin(false); }} // Reset parent checkbox when switching roles
                    >
                      <Text className={`font-NunitoBold text-lg ${role === 'student' ? 'text-[#1E1E1E]' : 'text-[#F6F5F5]'}`}>Student</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`px-4 py-2 rounded-tr-lg rounded-br-lg w-32 flex items-center justify-center ${role === 'faculty' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
                      onPress={() => setRole('faculty')}
                    >
                      <Text className={`font-NunitoBold text-lg ${role === 'faculty' ? 'text-[#1E1E1E]' : 'text-[#F6F5F5]'}`}>Faculty</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex w-10/12 items-center gap-y-3">
                    <TextInput
                      placeholder="Username"
                      placeholderTextColor="#A0A0A0"
                      value={username}
                      onChangeText={setUsername}
                      keyboardType='default'
                      className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
                      selectionColor={'#A0A0A0'}
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

                    {/* Custom CheckBox for Parent Login (only visible for students) */}
                    {role === 'student' && (
                      <View className="flex-row items-center gap-x-2">
                        <CustomCheckBox
                          value={isParentLogin}
                          onValueChange={() => setIsParentLogin(!isParentLogin)}
                        />
                        <Text className="text-[#9DBDFF] font-NunitoLight text-xs">Login as parent</Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      className="bg-[#9DBDFF] py-2 w-36 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg flex items-center justify-center"
                      onPress={onClick}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#1E1E1E" />
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
                      Forgot Password ?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Links - Always Stick to Bottom */}
              {!isKeyboardVisible && (
                <View className='absolute bottom-8 flex-col items-center gap-2'>
                  <TouchableOpacity
                    className='flex-row'
                    onPress={() => router.replace('/auth/admin')}
                  >
                    <EvilIcons name="external-link" size={24} color="#9DBDFF" />
                    <Text className="text-[#9DBDFF] font-NunitoLight text-sm">ADMIN</Text>
                  </TouchableOpacity>
                  <View className='flex items-center justify-center'>
                    <Text className="text-[#64748B] font-NunitoLight text-xs">
                      © 2024 LDCE. All Rights Reserved
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;