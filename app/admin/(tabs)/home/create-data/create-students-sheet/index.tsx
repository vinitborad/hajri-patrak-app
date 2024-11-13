import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { STUDENTS_SHEET_DATA } from '@/constants/async-store-keys';

const CreateStudentsScreen = () => {
  const [sheetUrl, setSheetUrl] = useState(''); // State for the sheet URL
  const [isFetching, setIsFetching] = useState(false); // Track API fetching
  const [dataFetched, setDataFetched] = useState(false); // Toggle UI after data fetch

  const [formData, setFormData] = useState({
    college: '',
    department: '',
    graduationLevel: '',
    branch: '',
    passoutYear: '',
    divisionInfo: [{ division: '', interDivision: '' }],
  });

  const [errors, setErrors] = useState({
    college: false,
    department: false,
    graduationLevel: false,
    branch: false,
    passoutYear: false,
    divisionInfo: false,
  });

  const router = useRouter();

  // Handle input change for education details
  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: false });
  };

  // Handle division change
  const handleDivisionChange = (index: number, key: string, value: string) => {
    const updatedDivisions: any = [...formData.divisionInfo];
    updatedDivisions[index][key] = value;
    setFormData({ ...formData, divisionInfo: updatedDivisions });
  };

  // Add division field
  const handleAddDivision = () => {
    setFormData({
      ...formData,
      divisionInfo: [...formData.divisionInfo, { division: '', interDivision: '' }],
    });
  };

  // Remove division field
  const handleRemoveDivision = (index: number) => {
    const updatedDivisions = formData.divisionInfo.filter((_, i) => i !== index);
    setFormData({ ...formData, divisionInfo: updatedDivisions });
  };

  // Validate fields before creating students
  const validateFields = async () => {
    const fetchedStudents = await AsyncStorage.getItem(STUDENTS_SHEET_DATA);
    const newErrors = {
      college: !formData.college,
      department: !formData.department,
      graduationLevel: !formData.graduationLevel,
      branch: !formData.branch,
      passoutYear: !formData.passoutYear,
      divisionInfo: formData.divisionInfo.some((div) => !div.division || !div.interDivision),
    };

    setErrors(newErrors);

    // Check if any field is missing and if students data exists
    const isValid = !Object.values(newErrors).some((fieldError) => fieldError) && fetchedStudents;
    return isValid;
  };

  // Fetch students from the Google Sheet
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
        params: { sheetUrl },
      });

      if (response.data.success) {
        await AsyncStorage.removeItem(STUDENTS_SHEET_DATA);
        await AsyncStorage.setItem(STUDENTS_SHEET_DATA, JSON.stringify(response.data.data.students));
        Alert.alert('Success', response.data.message);
        setDataFetched(true); // Toggle the UI to show 'Show Data' button
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to fetch student data.');
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Handle deleting the stored data and resetting the UI
  const handleDeleteData = async () => {
    await AsyncStorage.removeItem(STUDENTS_SHEET_DATA);
    setDataFetched(false);
    setSheetUrl(''); // Reset the URL
  };

  // Redirect to view fetched data
  const handleViewData = () => {
    router.push('/admin/(tabs)/home/create-data/create-students-sheet/view-data');
  };

  // Create students API call
  const handleCreate = async () => {
    if (!(await validateFields())) {
      Alert.alert('Error', 'Please fill in all required fields and make sure student data is fetched.');
      return;
    }

    const fetchedStudents = await AsyncStorage.getItem(STUDENTS_SHEET_DATA);

    Alert.alert(
      'Confirmation',
      'Are you sure you want to create students? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.post(adminEndpoints.CREATE_STUDENTS_FROM_SHEET, {
                ...formData,
                studentsArray: JSON.parse(fetchedStudents || '[]'),
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.data.success) {
                Alert.alert('Success', 'Students created successfully!');
              } else {
                Alert.alert('Error', response.data.message);
              }
            } catch (error: any) {
              if (error.response?.data?.message) {
                Alert.alert('Error', error.response.data.message);
              } else {
                Alert.alert('Error', 'Failed to create student.');
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1E1E1E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-[#1E1E1E]">
          {/* Header */}
          <View className="items-center mt-12 mb-8 w-full">
            <Text className="text-[#9DBDFF] font-NunitoExtraBold text-2xl">Create Students (Sheet)</Text>
          </View>

          {/* Input Fields */}
          <View className="px-4">
            {['college', 'department', 'graduationLevel', 'branch', 'passoutYear'].map(
              (field, index) => (
                <TextInput
                  key={index}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  placeholderTextColor="#A0A0A0"
                  // @ts-ignore
                  value={formData[field as keyof typeof formData]}
                  onChangeText={(text) => handleInputChange(field, text)}
                  className={`w-full border ${errors[field as keyof typeof formData] ? 'border-red-500' : 'border-[#9DBDFF]'} bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight text-lg mb-4`}
                />
              )
            )}

            {/* Division Fields */}
            {formData.divisionInfo.map((division, index) => (
              <View key={index} className="flex-row w-full gap-x-2 mb-4">
                <TextInput
                  placeholder="Division"
                  placeholderTextColor="#A0A0A0"
                  value={division.division}
                  onChangeText={(text) => handleDivisionChange(index, 'division', text)}
                  className={`flex-1 border ${errors.divisionInfo ? 'border-red-500' : 'border-[#9DBDFF]'} bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight`}
                />
                <TextInput
                  placeholder="InterDivision"
                  placeholderTextColor="#A0A0A0"
                  value={division.interDivision}
                  onChangeText={(text) => handleDivisionChange(index, 'interDivision', text)}
                  className={`flex-1 border ${errors.divisionInfo ? 'border-red-500' : 'border-[#9DBDFF]'} bg-[#3b3e44] rounded-lg px-4 py-3 text-[#F6F5F5] font-NunitoLight`}
                />
                <TouchableOpacity onPress={() => handleRemoveDivision(index)}>
                  <Text className="text-red-500">Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={handleAddDivision}>
              <Text className="text-[#9DBDFF] mb-4">+ Add Another Division</Text>
            </TouchableOpacity>

            {/* URL Input or Show Data */}
            {!dataFetched ? (
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
            ) : (
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
            )}

            {/* Create Button */}
            <TouchableOpacity
              className="bg-[#FF6B6B] py-2 px-6 border-b-4 border-[#6c7382] rounded-t-lg rounded-b-lg mt-4"
              onPress={handleCreate}
              disabled={isFetching}
            >
              <Text className="text-center font-NunitoBold text-xl text-[#1E1E1E]">
                {isFetching ? 'Creating...' : 'CREATE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateStudentsScreen;