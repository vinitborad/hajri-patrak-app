import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Icon from '@/assets/images/icon.png'
import { EvilIcons } from '@expo/vector-icons';

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

            <TextInput
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full border border-[#9DBDFF] bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg"
              selectionColor={'#A0A0A0'}
            />

            <TouchableOpacity
              className="bg-[#9DBDFF] py-2 w-36 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg"
              onPress={onClick}
            >
              <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">Log In</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className='flex items-center justify-center pt-3'>
            <Text className="text-[#9DBDFF] font-NunitoLight text-sm">
              Forgot Password ?
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      <View className='absolute bottom-8 flex-col items-center gap-2'>
        <TouchableOpacity 
          className=' flex-row items-center justify-center'
          onPress={() => Alert.alert('Admin panel is under construction !')}
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

    </View>
  );
};

export default SignIn;
