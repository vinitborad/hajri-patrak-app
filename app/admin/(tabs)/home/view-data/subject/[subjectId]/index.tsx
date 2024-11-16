import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Animated, ActivityIndicator, Linking, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCommonGetSubjectAnalyse } from '@/api/common';
import { calculateAttendanceLevel } from '@/utils/attendances/helper-functions';
import StudentInfoModal from '@/components/custom/StudentInfoModal';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { commonEndpoints } from '@/constants/api-endpoints';

const SubjectDetailScreen = () => {
  const router = useRouter();
  const {
    subjectId,
    subjectName,
    subjectCode,
    subjectType,
    college,
    department,
    branch,
    graduationLevel,
    passoutYear,
    semester,
    division
  } = useLocalSearchParams(); // Extract params
  const { data, isLoading, error } = useCommonGetSubjectAnalyse(subjectId as string);

  const [filter, setFilter] = useState(''); // ASC/DESC filter
  const [isSearchActive, setIsSearchActive] = useState(false); // Search input active state
  const [searchText, setSearchText] = useState(''); // Search input text state
  const searchWidth = new Animated.Value(40); // Initial width for search button
  const [animatedWidth, setAnimatedWidth] = useState(searchWidth); // Control width animation for search
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal
  const [isSheetLoading, setIsSheetLoading] = useState(false); // Google Sheet loading state

  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return 0;
    return ((attendedLecs / totalLecs) * 100).toFixed(0); // Return percentage
  };

  // Sorting and search filtering
  const filteredData = data
    ?.filter((item: any) => {
      const fullName = `${item.student.personalInfo.firstName.toLowerCase()} ${item.student.personalInfo.lastName.toLowerCase()}`;
      if (isSearchActive) {
        return (
          item.student.username.includes(searchText) ||
          fullName.includes(searchText.toLowerCase())
        );
      }
      return true; // No filter
    })
    ?.sort((a: any, b: any) => {
      if (filter === 'asc') {
        return Number(calculatePercentage(a.attendedLecs, a.totalLecs)) - Number(calculatePercentage(b.attendedLecs, b.totalLecs));
      } else if (filter === 'desc') {
        return Number(calculatePercentage(b.attendedLecs, b.totalLecs)) - Number(calculatePercentage(a.attendedLecs, a.totalLecs));
      } else {
        return Number(a.student.username) - Number(b.student.username); // Default sorting by username
      }
    });

  // Toggle Sorting
  const toggleSorting = (mode: 'asc' | 'desc') => {
    setFilter(filter === mode ? '' : mode); // Apply sorting
  };

  // Animate Search bar expansion and collapse
  const toggleSearch = () => {
    if (isSearchActive) {
      Animated.timing(animatedWidth, {
        toValue: 40, // Back to icon size
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchActive(false); // Turn off search mode
        setSearchText(''); // Reset search text
      });
    } else {
      setIsSearchActive(true); // Activate search mode
      Animated.timing(animatedWidth, {
        toValue: 250, // Full width of search bar
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // Open Google Sheet
  const openSheet = async () => {
    setIsSheetLoading(true); // Start loading
    try {
      const token = await SecureStore.getItemAsync('token'); // Get the JWT token
      const response = await axios.get(commonEndpoints.GET_ANALYSE_ATTENDANCE_SHEET_LINK, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { subjectId: subjectId },
      });

      const { data } = response;
      if (data.success && data.data) {
        Linking.openURL(data.data); // Open the Google Sheets link
      } else {
        Alert.alert('Error', 'Failed to retrieve the sheet link.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong !');
    } finally {
      setIsSheetLoading(false); // Stop loading
    }
  };

  // Network error handling
  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <AntDesign name="disconnect" size={80} color="gray" />
        <Text className="text-[#FF6B6B] mt-4">Network Error</Text>
      </View>
    );
  }

  return (
    <View className='flex flex-1 bg-[#1E1E1E]'>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.student.username}
        style={{
          backgroundColor: '#1E1E1E',
          padding: 10,
          paddingTop: 15,
          flex: 1,
        }}
        ListHeaderComponent={() => (
          <View className='flex justify-center items-center pt-2'>
            {/* Subject Info */}
            <View className="flex gap-y-2 bg-[#3b3e44] p-4 rounded-lg mb-4 border border-[#9DBDFF] w-full">
              <Text className="text-[#F6F5F5] capitalize">
                <FontAwesome5 name="book" size={18} color="#F6F5F5" /> {subjectName} ({subjectCode})
              </Text>
              <Text className="text-[#F6F5F5] capitalize">
                <FontAwesome name="institution" size={18} color="#F6F5F5" /> {college} - {department} - {branch}
              </Text>
              <Text className="text-[#F6F5F5] capitalize">
                <FontAwesome name="graduation-cap" size={18} color="#F6F5F5" />
                {passoutYear} - {graduationLevel} - Sem {semester} - Div {division}
              </Text>
            </View>

            {/* Buttons Section */}
            <View className="flex-row justify-around mb-4 w-full">
              <TouchableOpacity
                className="bg-[#3b3e44] p-4 rounded-lg w-[45%] items-center flex-row justify-center"
                onPress={() => router.push(`/admin/(tabs)/home/view-data/subject/${subjectId}/attendances`)}
              >
                <Ionicons name="list-outline" size={24} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] text-lg ml-2">Attendances</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#3b3e44] p-4 rounded-lg w-[45%] items-center flex-row justify-center"
                onPress={() => router.push(`/admin/(tabs)/home/view-data/subject/${subjectId}/faculties-list`)}
              >
                <MaterialIcons name="supervised-user-circle" size={24} color="#9DBDFF" />
                <Text className="text-[#F6F5F5] text-lg ml-2">Faculties</Text>
              </TouchableOpacity>
            </View>

            {/* Sorting and Search */}
            <View className="py-4 px-2 flex-row justify-between items-center w-full">
              {!isSearchActive ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity className={`bg-[#3b3e44] p-2 rounded-lg ${filter === 'asc' ? 'border border-[#9DBDFF]' : ''}`} onPress={() => toggleSorting('asc')}>
                    <Text className="text-white">ASC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className={`bg-[#3b3e44] p-2 rounded-lg ${filter === 'desc' ? 'border border-[#9DBDFF]' : ''}`} onPress={() => toggleSorting('desc')}>
                    <Text className="text-white">DESC</Text>
                  </TouchableOpacity>
                  {/* Google Sheet Button */}
                  <TouchableOpacity className="bg-[#3b3e44] p-2 rounded-lg" onPress={openSheet}>
                    {isSheetLoading ? (
                      <ActivityIndicator size="small" color="#9DBDFF" />
                    ) : (
                      <MaterialCommunityIcons name="google-spreadsheet" size={24} color="black" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <Animated.View style={{ width: animatedWidth }}>
                  <TextInput className="bg-[#3b3e44] p-2 rounded-lg text-white" placeholder="Search ..." placeholderTextColor="#9DBDFF" value={searchText} onChangeText={setSearchText} />
                </Animated.View>
              )}

              <TouchableOpacity className="bg-[#3b3e44] p-2 rounded-full" onPress={toggleSearch}>
                {isSearchActive ? <Ionicons name="close" size={24} color="#9DBDFF" /> : <Ionicons name="search" size={24} color="#9DBDFF" />}
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const attendanceLevel = calculateAttendanceLevel(calculatePercentage(item.attendedLecs, item.totalLecs));
          const backgroundColor = attendanceLevel === 'Good' ? 'bg-[#2D6A4F]' : attendanceLevel === 'Medium' ? 'bg-[#8b9e36]' : 'bg-[#c33f43]';

          return (
            <View className={`p-2 pl-4 pr-3 rounded-lg mb-2 flex-row justify-between items-center ${backgroundColor} border border-[#1B4332]`}>

              <View className="flex-col items-start">
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-[#F6F5F5] font-NunitoExtraBold text-lg">
                    <FontAwesome5 name="id-badge" size={18} color="#F6F5F5" /> {item.student.username}
                  </Text>
                  <View className="bg-white border border-[#9DBDFF] rounded-full p-1 flex items-center justify-center aspect-square">
                    <Text className="text-[black] -mt-2">{item.interDivision}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedStudentUsername(item.student.username)}>
                    <Ionicons name="information-circle-outline" size={24} color="#9DBDFF" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[#F6F5F5]">
                  <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item.student.personalInfo.firstName}{' '}
                  {item.student.personalInfo.lastName}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="mr-1"
                  onPress={() => router.push(`/admin/(tabs)/home/view-data/subject/${subjectId}/student-previous-attendances?username=${item.student.username}`)}
                >
                  <FontAwesome name="history" size={24} color="#9DBDFF" />
                </TouchableOpacity>
                <View className="mr-1">
                  <Text className="text-white font-NunitoMedium">
                    {item.attendedLecs}/{item.totalLecs}
                  </Text>
                </View>
                <View className="bg-white p-2 rounded-full">
                  <Text className="font-NunitoExtraBold text-base">{calculatePercentage(item.attendedLecs, item.totalLecs)}</Text>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{
          paddingBottom: 200
        }}
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

export default SubjectDetailScreen;