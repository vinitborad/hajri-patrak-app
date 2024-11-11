import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome, FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
import { useGetStudentsListForPreviousAttendance } from '@/api/admin/data/subject';
import StudentInfoModal from '@/components/custom/StudentInfoModal';

const AttendanceStudentsListScreen = () => {
  const { attendanceId } = useLocalSearchParams();
  const { data, isLoading, error } = useGetStudentsListForPreviousAttendance(attendanceId as string);
  const [searchText, setSearchText] = useState('');
  const [sortedFilteredData, setSortedFilteredData] = useState<any>([]);
  const searchInputRef = useRef<TextInput>(null);
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal

  useEffect(() => {
    if (data) {
      // Sort data by username as a number initially
      const sortedData = [...data].sort((a, b) => parseInt(a.username) - parseInt(b.username));
      setSortedFilteredData(sortedData);
    }
  }, [data]);

  // Filter and sort data based on search input
  useEffect(() => {
    if (data) {
      const filteredData = data
        .filter((student: any) => {
          const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
          return (
            student.username.includes(searchText) ||
            fullName.includes(searchText.toLowerCase())
          );
        })
        // @ts-ignore
        .sort((a, b) => parseInt(a.username) - parseInt(b.username)); // Sort after filtering
      setSortedFilteredData(filteredData);
    }
  }, [searchText, data]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <AntDesign name="disconnect" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">Network Error</Text>
      </View>
    );
  }

  const renderStudentItem = ({ item }: { item: any }) => {
    const backgroundColor = item.isPresent ? 'bg-[#2D6A4F]' : 'bg-[#c33f43]';

    return (
      <View className={`p-2 pl-4 pr-3 rounded-lg mb-2 flex-row justify-between items-center ${backgroundColor}`}>
        {/* Student Info */}
        <View className="flex-col items-start">
          <View className='flex-row items-center gap-x-1'>
            <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
              <FontAwesome5 name="id-badge" size={18} color="#F6F5F5" /> {item.username}
            </Text>
            <TouchableOpacity onPress={() => setSelectedStudentUsername(item.username)}>
              <Ionicons name="information-circle-outline" size={24} color="#9DBDFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-[#F6F5F5]">
            <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item.firstName} {item.lastName}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 items-center bg-[#1E1E1E] px-4">
      <Text className="text-2xl text-white mb-2 font-NunitoExtraBold mt-4">Attendance Students List</Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-[#3b3e44] p-2 rounded-lg mb-4">
        <Ionicons name="search" size={20} color="#9DBDFF" />
        <TextInput
          ref={searchInputRef}
          placeholder="Search by enrollment or name"
          placeholderTextColor="#9DBDFF"
          value={searchText}
          onChangeText={setSearchText}
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
        data={sortedFilteredData}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        contentContainerStyle={{ paddingBottom: 200, paddingTop: 0 }}
        className='w-full'
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

export default AttendanceStudentsListScreen;