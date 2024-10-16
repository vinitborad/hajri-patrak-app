import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const CreateStudentsScreen = () => {
  const [sheetUrl, setSheetUrl] = useState(''); // State for the sheet URL
  const [isFetching, setIsFetching] = useState(false); // Track API fetching
  const [dataFetched, setDataFetched] = useState(false); // Toggle UI after data fetch
  const router = useRouter();

  // Fetch students from the sheet
  const handleFetchData = async () => {
    if (!sheetUrl) {
      Alert.alert('Error', 'Please enter a valid sheet URL.');
      return;
    }

    setIsFetching(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_STUDENT_SHEET_DATA, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sheetUrl,
        },
      });

      if (response.data.success) {
        // clear async storage
        await AsyncStorage.removeItem('fetched_students');
        // Store the fetched students in AsyncStorage
        await AsyncStorage.setItem('fetched_students', JSON.stringify(response.data.data.students));
        Alert.alert('Success', response.data.message);
        setDataFetched(true); // Toggle the UI
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle deleting the stored data and re-enabling input
  const handleDeleteData = async () => {
    await AsyncStorage.removeItem('fetched_students');
    setDataFetched(false);
    setSheetUrl(''); // Reset the URL
  };

  // Redirect to view data
  const handleViewData = () => {
    router.push('/admin/(tabs)/home/create-data/create-students-sheet/view-data');
  };

  return (
    <View className="flex-1 bg-[#1E1E1E] justify-center items-center px-6">
      {/* Header */}
      <Text className="text-[#9DBDFF] font-NunitoExtraBold text-2xl mb-6">Create Students (Sheet)</Text>

      {/* Input or Button depending on state */}
      {!dataFetched ? (
        <>
          {/* URL Input */}
          <View className="w-full flex-row items-center bg-[#3b3e44] p-3 rounded-lg mb-4 border border-[#9DBDFF]">
            <TextInput
              value={sheetUrl}
              onChangeText={setSheetUrl}
              placeholder="Enter Google Sheets URL"
              placeholderTextColor="#A0A0A0"
              editable={!isFetching}
              className="flex-1 text-[#F6F5F5] font-NunitoLight text-lg"
            />
            <TouchableOpacity onPress={handleFetchData} disabled={isFetching}>
              {isFetching ? (
                <ActivityIndicator size="small" color="#9DBDFF" />
              ) : (
                <MaterialIcons name="cloud-download" size={24} color="#9DBDFF" />
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View className="w-full flex-row items-center bg-[#3b3e44] p-3 rounded-lg mb-4 border border-[#9DBDFF]">
            <TouchableOpacity
              className="bg-[#3b3e44] flex-1 p-4 rounded-lg border border-[#9DBDFF] w-full"
              onPress={handleViewData}
            >
              <Text className="text-[#9DBDFF] font-NunitoExtraBold text-lg text-center">Show Data</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteData} disabled={isFetching}>
              {isFetching ? (
                <ActivityIndicator size="small" color="#9DBDFF" />
              ) : (
                <Ionicons name="close-circle-outline" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CreateStudentsScreen;