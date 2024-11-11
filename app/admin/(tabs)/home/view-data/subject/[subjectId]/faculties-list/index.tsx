import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { useGetAccessedFacultiesList } from '@/api/admin/data/subject';
import axios from 'axios';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';
import FacultyInfoModal from '@/components/custom/FacultyInfoModal';

const FacultiesListScreen = () => {
  const { subjectId } = useLocalSearchParams();
  const { data, isLoading, error, refetch } = useGetAccessedFacultiesList(subjectId as string);

  const [loadingFacultyId, setLoadingFacultyId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data?.facultyAccessList || []);
  const searchInputRef = useRef<TextInput>(null);
  const [selectedFacultyUsername, setSelectedFacultyUsername] = useState<string | null>(null); // For FacultyInfoModal

  useEffect(() => {
    if (data?.facultyAccessList) {
      filterData(searchText); // Initially set filtered data when data is available
    }
  }, [data, searchText]);

  const filterData = (text: string) => {
    const lowercasedText = text.toLowerCase();
    const filteredList = data?.facultyAccessList.filter((faculty: any) => {
      const fullName = `${faculty.personalInfo.firstName} ${faculty.personalInfo.lastName}`.toLowerCase();
      return (
        faculty.username.toLowerCase().includes(lowercasedText) ||
        fullName.includes(lowercasedText)
      );
    });
    setFilteredData(filteredList);
  };

  const handleDelete = async (facultyId: string, username: string) => {
    Alert.alert(
      'Delete Faculty',
      `Are you sure you want to remove faculty ${username} from this subject?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            setLoadingFacultyId(facultyId);
            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.patch(
                adminEndpoints.REMOVE_SUBJECT_FROM_FACULTY_ACCESS_LIST,
                { username, subjectId },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                refetch();
                Alert.alert('Success', `Faculty ${username} removed successfully.`);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to remove faculty.');
              }
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to remove faculty.');
            } finally {
              setLoadingFacultyId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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

  const renderFacultyItem = ({ item }: { item: any }) => (
    <View className="bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF] flex-row justify-between items-center">
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{item.username}</Text>
        <View className='flex-row items-center gap-x-1'>
          <Text className="text-xl font-NunitoExtraBold text-white">
            {item.personalInfo.firstName} {item.personalInfo.lastName}
          </Text>
          <TouchableOpacity onPress={() => setSelectedFacultyUsername(item.username)}>
            <Ionicons name="information-circle-outline" size={30} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item._id, item.username)}
        className="bg-[#FF6B6B] p-2 rounded-full"
        disabled={loadingFacultyId === item._id}
      >
        {loadingFacultyId === item._id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="delete" size={24} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] p-4">
      <Text className="text-2xl text-white mb-4 font-NunitoExtraBold">Faculty Access List:</Text>

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
            filterData(text);
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

      {filteredData?.length === 0 ? (
        <Text className="text-lg text-center text-[#FF6B6B]">No faculty matches your search.</Text>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderFacultyItem}
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Faculty Info Modal */}
      {selectedFacultyUsername && (
        <FacultyInfoModal
          username={selectedFacultyUsername}
          onClose={() => setSelectedFacultyUsername(null)}
        />
      )}

    </View>
  );
};

export default FacultiesListScreen;