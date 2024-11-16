import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIVE_ATTENDANCE, DIVISION_STUDENTS_LIST } from '@/constants/async-store-keys';
import { isConnected } from '@/utils/network';
import { callCreateAttendance, closeAttendance } from '@/utils/attendances/helper-functions';
import axios from 'axios';
import { facultyEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import StudentInfoModal from '@/components/custom/StudentInfoModal';
import { useAttendanceStore } from '@/stores/attendanceStore';

const LiveAttendanceScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const setShouldRefresh = useAttendanceStore((state) => state.setShouldRefresh);

  const [liveAttendance, setLiveAttendance] = useState<any>(null); // Live attendance data from AsyncStorage
  const [students, setStudents] = useState<any[]>([]); // List of students from all divisions
  const [qrStudents, setQrStudents] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // To track keyboard visibility
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal

  // Listen for keyboard events to track if it's visible or not
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const createCallHandling = async () => {
    try {
      const networkStatus = await isConnected();
      if (networkStatus) {
        const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
        if (liveData) {
          const parsedLiveData = JSON.parse(liveData);
          if (!parsedLiveData._id) {
            await callCreateAttendance(id as string);
          }
        }
      }
    } catch (error) {
      console.error('Error creating call handling:', error);
    }
  }

  // Fetch live attendance data and students list from AsyncStorage
  const fetchData = async () => {
    try {
      // Fetch live attendance data from AsyncStorage
      const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
      if (liveData) {
        const parsedLiveData = JSON.parse(liveData);

        // Fetch students data from all divisions
        let allStudents: any[] = [];
        for (const div of parsedLiveData.interDivisions) {
          const divisionData = await AsyncStorage.getItem(DIVISION_STUDENTS_LIST(div._id));
          if (divisionData) {
            const parsedDivisionData = JSON.parse(divisionData);
            allStudents = [...allStudents, ...parsedDivisionData.students];
          }
        }

        // Sort students by username
        allStudents.sort((a, b) => a.username.localeCompare(b.username));
        setStudents(allStudents);
        setLiveAttendance(parsedLiveData);
      }

      // If possible fetch data from server also
      const networkStatus = await isConnected();
      if (networkStatus) {
        createCallHandling();
        const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
        if (liveData) {
          const parsedLiveData = JSON.parse(liveData);
          if (parsedLiveData && parsedLiveData._id) {
            const token = await SecureStore.getItemAsync("token");
            const response = await axios.get(facultyEndpoints.GET_LIVE_ATTENDANCE_INFO,
              {
                params: { attendanceId: parsedLiveData._id },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.success && response.data.data) {
              const data = response.data.data.presentStudentLists;
              setQrStudents(data);
            }
          }
        }

      }
    } catch (error) {
      console.error('Error fetching live attendance or students:', error);
    }
  };

  // Fetch live attendance data and students list from AsyncStorage
  useEffect(() => {
    fetchData();
  }, []);

  // Check if student is present
  const isStudentPresent = (studentId: string) => {
    return liveAttendance?.presentStudentsList?.some((student: string) => student === studentId);
  };

  const isQrPresent = (studentId: string) => {
    return qrStudents.some((student: any) => student === studentId);
  }

  const handleCloseAttendance = () => {
    try {
      Alert.alert(
        'Confirm Closing ?',
        'Are you sure you want to close the attendance?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                const { success, message: comingMessage } = await closeAttendance(id as string, message);
                if (success) {
                  Alert.alert('Success', comingMessage);
                  setShouldRefresh(true); // Notify parent to refresh
                  router.back();
                } else {
                  Alert.alert('Error', comingMessage);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to close attendance');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const handleQRClick = async () => {
    try {
      const networkStatus = await isConnected();
      if (networkStatus) {
        createCallHandling();
        const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
        if (liveData) {
          const parsedLiveData = JSON.parse(liveData);
          if (parsedLiveData && parsedLiveData._id) {
            const token = await SecureStore.getItemAsync("token");
            const response = await axios.post(facultyEndpoints.GET_QR_CODE,
              { attendanceId: parsedLiveData._id },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              }
            );
            if (response.data.success && response.data.passCode) {
              Alert.alert('Secret Passcode !', response.data.passCode);
            }
          }
        }
      } else {
        Alert.alert('Network issue', 'Please check your internet connection.');
      }
    } catch (error) {
      console.log('Error handling QR code:', error);
    }
  }

  //TODO: add some toast or show to attendace has been refreshed
  const handleRefresh = () => {
    // Refresh attendance logic here
    fetchData();
  };

  if (!liveAttendance) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    )
  }

  return (
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* QR and Manual Buttons */}
      <View className="flex-row justify-between p-4">
        <TouchableOpacity
          className="flex-1 bg-[#9DBDFF] p-4 rounded-lg mr-2 flex-row justify-center items-center"
          onPress={() => handleQRClick()}
        >
          {/* Alert.alert('QR Code', 'Coming soon! 🔥')  */}
          <FontAwesome name="qrcode" size={24} color="#1E1E1E" />
          <Text className="text-center text-[#1E1E1E] text-lg ml-2 -mt-1">QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#9DBDFF] p-4 rounded-lg ml-2 flex-row justify-center items-center"
          onPress={() => router.push(`/faculty/(tabs)/home/subject/${id}/live/manual`)}
        >
          <FontAwesome name="pencil" size={24} color="#1E1E1E" />
          <Text className="text-center text-[#1E1E1E] text-lg ml-2">Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Message Input */}
      <View className="bg-[#3b3e44] p-1 rounded-lg mb-4 border border-[#1a3a78] mx-4">
        <TextInput
          className="text-[#F6F5F5] bg-[#1E1E1E] p-2 rounded-lg"
          placeholder="Add message ..."
          placeholderTextColor="#9DBDFF"
          value={message}
          onChangeText={setMessage}
        />
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isQr = isQrPresent(item.id);
          const isPresent = isStudentPresent(item.id) || isQr;
          return (
            <View
              className={`p-2 pl-4 pr-3 rounded-lg mb-2 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-[#2D6A4F]' : 'bg-[#c33f43]'
                } border border-[#1B4332]`}
            >
              <View>
                <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
                  <FontAwesome5 name="id-badge" size={18} color="#F6F5F5" /> Enroll: {item.username}
                </Text>
                <Text className="text-[#F6F5F5]">
                  <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item.firstName} {item.lastName}
                </Text>
              </View>
              <View className="flex-row items-center gap-x-2">
                {isQr && (
                  <MaterialCommunityIcons name="qrcode-scan" size={35} color="#9DBDFF" />
                )}
                <TouchableOpacity onPress={() => setSelectedStudentUsername(item.username)}>
                  <Ionicons name="information-circle-outline" size={35} color="#9DBDFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 250 }}
      />

      {/* Conditionally render Close and Refresh buttons if keyboard is hidden */}
      {!isKeyboardVisible && (
        <View className="w-full flex items-center">
          <View className="flex-row absolute bottom-24 w-7/12">
            <TouchableOpacity
              className="bg-[#b92f2f] p-1 flex-1 flex-row justify-center items-center rounded-l-full"
              onPress={handleCloseAttendance}
            >
              <FontAwesome name="times-circle" size={20} color="white" />
              <Text className="text-center text-white text-lg ml-2 -mt-1">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#3b3e44] p-1 flex-1 flex-row justify-center items-center rounded-r-full"
              onPress={handleRefresh}
            >
              <Text className="text-center text-[#9DBDFF] text-lg mr-2 -mt-1">Refresh</Text>
              <FontAwesome name="refresh" size={20} color="#9DBDFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Student Info Modal */}
      {selectedStudentUsername && (
        <StudentInfoModal
          username={selectedStudentUsername}
          onClose={() => setSelectedStudentUsername(null)}
        />
      )}

    </View>
  );
};

export default LiveAttendanceScreen;