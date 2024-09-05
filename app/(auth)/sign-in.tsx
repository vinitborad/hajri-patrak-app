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

  const onClick = async () => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_ENDPOINT}/auth/${role}-signin`, {
        username,
        password,
      });
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('role', role);
      router.replace('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="bg-[#1E1E1E] flex items-center justify-center h-full">

      <Text className="text-[#9DBDFF] font-NunitoExtraBold text-3xl -mt-32 mb-32">
        LD College of Engg.
      </Text>

      <View className="flex-row justify-center mb-8 border-b-4 border-[#6c7382] rounded-xl">
        <TouchableOpacity
          className={`px-4 py-2 rounded-tl-lg rounded-bl-lg w-32 flex items-center justify-center ${role === 'student' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
          onPress={() => setRole('student')}
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

      <View className="flex gap-y-5 w-10/12 items-center">
        <TextInput
          placeholder="Username"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          keyboardType='default'
          className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
          selectionColor={'#A0A0A0'}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg mb-4"
          selectionColor={'#A0A0A0'}
        />

        <TouchableOpacity
          className="bg-[#9DBDFF] py-2 w-36 border-b-4 border-[#3b3e44] rounded-t-lg rounded-b-lg"
          onPress={onClick}
        >
          <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;
