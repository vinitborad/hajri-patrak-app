import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { commonEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

interface StudentInfoModalProps {
  username: string | null;
  onClose: () => void;
}

const StudentInfoModal: React.FC<StudentInfoModalProps> = ({ username, onClose }) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false); // State to control photo modal visibility

  useEffect(() => {
    if (username) {
      fetchStudentData();
    }
  }, [username]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(commonEndpoints.GET_STUDENT_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { username },
      });
      if (response.data.success) {
        setStudentData(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  if (!username) return null;

  return (
    <Modal animationType="slide" transparent visible={!!username}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-[#1E1E1E] p-5 rounded-lg w-4/5">
          <TouchableOpacity onPress={onClose} className="self-end">
            <AntDesign name="close" size={24} color="#9DBDFF" />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#9DBDFF" />
          ) : studentData ? (
            <View className="flex-col items-center">
              {/* Profile Photo */}
              <TouchableOpacity onPress={() => setIsPhotoModalVisible(true)}>
                {studentData.personalInfo.photoUrl ? (
                  <Image source={{ uri: studentData.personalInfo.photoUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                ) : (
                  <AntDesign name="user" size={100} color="#9DBDFF" />
                )}
              </TouchableOpacity>

              {/* Fullscreen Photo Modal */}
              <Modal visible={isPhotoModalVisible} transparent animationType="fade">
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setIsPhotoModalVisible(false)}>
                  <Image
                    source={{ uri: studentData.personalInfo.photoUrl }}
                    style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
                  />
                </TouchableOpacity>
              </Modal>

              {/* Student Details */}
              <Text className="text-[#9DBDFF] text-xl font-NunitoBold mt-4">{studentData.username}</Text>
              <Text className="text-[#F6F5F5] text-lg">{`${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`}</Text>

              {/* Additional Info */}
              <View className="mt-4 flex-col items-start w-full">
                <Text>
                  <Text className="text-[#9DBDFF]">Email: </Text>
                  <Text className="text-[#F6F5F5]">{studentData.email}</Text>
                </Text>
                <Text>
                  <Text className="text-[#9DBDFF]">Phone: </Text>
                  <Text className="text-[#F6F5F5]">{studentData.phone}</Text>
                </Text>
                <Text>
                  <Text className="text-[#9DBDFF]">Address: </Text>
                  <Text className="text-[#F6F5F5]">{studentData.personalInfo.address}</Text>
                </Text>
              </View>

              {/* Parent Info */}
              <View className="mt-4 flex-col items-start w-full">
                <Text>
                  <Text className="text-[#9DBDFF]">Parent Name: </Text>
                  <Text className="text-[#F6F5F5]">{`${studentData.parentInfo.firstName} ${studentData.parentInfo.lastName}`}</Text>
                </Text>
                <Text>
                  <Text className="text-[#9DBDFF]">Parent Phone: </Text>
                  <Text className="text-[#F6F5F5]">{studentData.parentInfo.phone}</Text>
                </Text>
                <Text>
                  <Text className="text-[#9DBDFF]">Parent Email: </Text>
                  <Text className="text-[#F6F5F5]">{studentData.parentInfo.email}</Text>
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-red-500">Failed to load student data.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StudentInfoModal;