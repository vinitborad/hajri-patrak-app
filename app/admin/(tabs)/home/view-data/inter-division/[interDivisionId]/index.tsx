import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import { useGetDivisionStudentsList } from '@/api/common';
import StudentInfoModal from '@/components/custom/StudentInfoModal';

const InterDivisionStudentsListScreen = () => {
  const router = useRouter();
  const {
    interDivisionId,
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
  } = useLocalSearchParams();

  const { data, isLoading, error, refetch } = useGetDivisionStudentsList(interDivisionId as string);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data?.students || []);
  const searchInputRef = useRef<TextInput>(null);
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null);

  console.log(data);

  // Sort and filter data initially and whenever data or searchText changes
  useEffect(() => {
    if (data) {
      filterAndSortData(searchText);
    }
  }, [data, searchText]);

  const filterAndSortData = (text: string) => {
    const lowercasedText = text.toLowerCase();
    const filteredList = data
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

  const handleDelete = async (studentUsername: string) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${studentUsername} from the division?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingStudentId(studentUsername);

            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.patch(
                adminEndpoints.REMOVE_STUDENT_FROM_DIVISION,
                { studentUsername, divisionId: interDivisionId },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                Alert.alert('Success', `Student ${studentUsername} removed successfully.`);
                refetch();
              } else {
                Alert.alert('Error', response.data.message || 'Failed to remove student.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove student.');
            } finally {
              setLoadingStudentId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#1E1E1E] justify-center items-center">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#1E1E1E] justify-center items-center">
        <Text className="text-red-500">Failed to load students. Please try again.</Text>
      </View>
    );
  }

  const renderStudentItem = ({ item }: { item: any }) => (
    <View key={item.username} className="bg-[#3b3e44] mb-4 rounded-xl border border-[#9DBDFF]">
      <View className="flex-row justify-between items-center px-3 py-1 rounded-t-xl bg-[#5b5f68] relative">
        <Text className="text-[#9DBDFF] text-lg font-NunitoRegular">{item.username}</Text>
        <TouchableOpacity
          className="absolute right-3"
          onPress={() => handleDelete(item.username)}
          disabled={loadingStudentId === item.username}
        >
          {loadingStudentId === item.username ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <MaterialIcons name="delete" size={24} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-center p-2 px-3 pr-4">
        <Text className="text-[#F6F5F5] text-xl capitalize font-NunitoBold">
          {`${item.firstName} ${item.lastName}`}
        </Text>
        <TouchableOpacity onPress={() => setSelectedStudentUsername(item.username)}>
          <Ionicons name="information-circle-outline" size={28} color="#9DBDFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-[#3b3e44] p-2 rounded-lg mb-4">
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

      {/* Student List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.username}
        renderItem={renderStudentItem}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => router.push(
              // @ts-ignore
              `/admin/(tabs)/home/view-data/inter-division/${interDivisionId}/add-student?college=${college}&department=${department}&branch=${branch}&graduationLevel=${graduationLevel}&passoutYear=${passoutYear}`
            )}
            className="bg-[#9DBDFF] p-4 rounded-lg mt-2"
          >
            <Text className="text-white text-center font-NunitoExtraBold text-lg">Add Student</Text>
          </TouchableOpacity>
        }
      />

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

export default InterDivisionStudentsListScreen;