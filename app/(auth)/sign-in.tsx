import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const SignIn = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'faculty' | 'student'>('student');

  const router = useRouter();

  const onCLick = async () => {
    try {
      const respose = await axios.post(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/auth/${role}-signin`, {
        username,
        password,
      });
      console.log(respose.data.token);
      await SecureStore.setItem('token', respose.data.token);
      await SecureStore.setItem('role', role);
      router.replace('/');
    } catch (error) {
      //TODO: error is not showing proper messages which backend is sending
      console.log(error);
    }
  }
 
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">

      <Text className="text-2xl font-bold mb-8 bg-blue-200 p-2 rounded-2xl">Sign In</Text>

      <View className="flex-row mb-4">
        <TouchableOpacity
          className={`px-4 py-2 rounded-l-full ${role === 'student' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          onPress={() => setRole('student')}
        >
          <Text>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-r-full ${role === 'faculty' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          onPress={() => setRole('faculty')}
        >
          <Text>Faculty</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        keyboardType='number-pad'
        className="border border-gray-300 rounded-full px-4 py-2 mb-4 w-full"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        className="border border-gray-300 rounded-full px-4 py-2 mb-4 w-full"
      />

      <TouchableOpacity className="bg-blue-500 rounded-full px-4 py-2 w-full" onPress={onCLick}>
        <Text className="text-white text-center">Verify</Text>
      </TouchableOpacity>

    </View>
  );
};

export default SignIn;
