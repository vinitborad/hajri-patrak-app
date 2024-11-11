import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Alert, Modal, ScrollView, TextInput, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { adminEndpoints } from '@/constants/api-endpoints';
import { useGetStudentsStrcutreStudentList } from '@/api/admin/data/students-structure';
import StudentInfoModal from '@/components/custom/StudentInfoModal';

const AddStudentScreen = () => {
  const router = useRouter();
  const {
    interDivisionId,
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
  } = useLocalSearchParams();

  const { data, isLoading, error } = useGetStudentsStrcutreStudentList({
    college,
    department,
    graduationLevel,
    branch,
    passoutYear,
  });

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [failedStudents, setFailedStudents] = useState<any[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (data?.students) {
      filterAndSortData(searchText);
    }
  }, [data, searchText]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const filterAndSortData = (text: string) => {
    const lowercasedText = text.toLowerCase();
    const filteredList = data?.students
      .filter((student: any) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          student.username.includes(lowercasedText) ||
          fullName.includes(lowercasedText)
        );
      })
      .sort((a: any, b: any) => parseInt(a.username) - parseInt(b.username));
    setFilteredData(filteredList);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  const showStudentInfo = (student: any) => {
    setCurrentStudent(student);
    setModalVisible(true);
  };

  const addStudentsToDivision = async () => {
    setIsAdding(true);
    setFailedStudents([]);

    const token = await SecureStore.getItemAsync('token');
    const failed = [];

    for (const studentId of selectedStudents) {
      try {
        const student = data?.students.find((s: any) => s._id === studentId);
        const response = await axios.patch(
          adminEndpoints.ADD_STUDENT_TO_DIVISION,
          {
            studentUsername: student.username,
            divisionId: interDivisionId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data.success) {
          failed.push(student);
        }
      } catch (err) {
        const student = data?.students.find((s: any) => s._id === studentId);
        failed.push(student);
      }
    }

    setIsAdding(false);
    setFailedStudents(failed);

    if (failed.length > 0) {
      Alert.alert(
        'Error',
        `The following students could not be added:\n${failed.map(
          (s) => `${s.username} (${s.firstName} ${s.lastName})`
        ).join('\n')}`
      );
    } else {
      router.back();
    }
  };

  const confirmAddStudents = () => {
    Alert.alert(
      'Confirm Addition',
      'Are you sure you want to add the selected students to the division?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: addStudentsToDivision },
      ],
      { cancelable: true }
    );
  };

  const renderStudentItem = ({ item }: { item: any }) => {
    const isSelected = selectedStudents.includes(item._id);
    return (
      <View
        key={item.username}
        className={`bg-[#3b3e44] mb-4 w-full rounded-xl border ${isSelected ? 'border-green-500' : 'border-[#9DBDFF]'}`}
      >
        <View className="flex-row w-full justify-between items-center px-3 py-1 rounded-t-xl bg-[#5b5f68] relative">
          <Text className="text-[#9DBDFF] text-lg font-NunitoRegular">{item.username}</Text>
          <TouchableOpacity onPress={() => setSelectedStudentUsername(item.username)}>
            <Ionicons name="information-circle-outline" size={24} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => toggleStudentSelection(item._id)}
          className="p-2 px-3 pr-4 w-full"
        >
          <Text className="text-[#F6F5F5] text-xl capitalize font-NunitoBold">{`${item.firstName} ${item.lastName}`}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load students. Please try again.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4 items-center w-full">
      {/* Search Bar */}
      <View className="flex-row items-center bg-[#3b3e44] p-2 rounded-lg mb-4 w-full">
        <Ionicons name="search" size={20} color="#9DBDFF" />
        <TextInput
          ref={searchInputRef}
          placeholder="Search by username or name"
          placeholderTextColor="#9DBDFF"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            filterAndSortData(text);
          }}
          className="ml-2 flex-1 text-white"
        />
        {searchText ? (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              searchInputRef.current?.blur();
            }}
          >
            <Ionicons name="close" size={20} color="#9DBDFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        contentContainerStyle={{ paddingBottom: 100, width: '100%' }}
      />

      {!keyboardVisible && (
        <TouchableOpacity
          className="bg-[#9DBDFF] rounded-lg absolute bottom-20 w-fit px-4"
          onPress={confirmAddStudents}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center font-NunitoExtraBold text-xl">Add</Text>
          )}
        </TouchableOpacity>
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

export default AddStudentScreen;