import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Animated, ActivityIndicator, Alert, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetAnalyseAttendance } from '@/api/faculty/attendances';
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANALYSIS } from '@/constants/async-store-keys';
import { calculateAttendanceLevel } from '@/utils/attendances/helper-functions';
import StudentInfoModal from '@/components/custom/StudentInfoModal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { commonEndpoints } from '@/constants/api-endpoints';

const AnalyseAttendanceScreen = () => {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  const { data, isLoading, error } = useGetAnalyseAttendance(id as string);

  const [filter, setFilter] = useState(''); // Filter state (asc, desc)
  const [offlineData, setOfflineData] = useState(null); // State for offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage offline data loading state
  const [isSearchActive, setIsSearchActive] = useState(false); // Track if search is active
  const [searchText, setSearchText] = useState(''); // For search input
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal
  const [isSheetLoading, setIsSheetLoading] = useState(false); // Loading state for the sheet link

  const searchWidth = new Animated.Value(40); // Initial width for search button
  const [animatedWidth, setAnimatedWidth] = useState(searchWidth); // Control the width

  // Fetch offline data when the component mounts
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ANALYSIS(id as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Load offline data
        }
      } catch (error) {
        console.error('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false); // Stop loading
      }
    };
    fetchOfflineData();
  }, [id]);

  // Store fresh API data offline
  useEffect(() => {
    if (data) {
      AsyncStorage.setItem(ANALYSIS(id as string), JSON.stringify(data));
    }
  }, [data]);

  // Handling loading and error states
  if (isOfflineLoading || isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error && !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  const dataToShow = data || offlineData; // Choose data from API or offline storage

  // Check if there's no data to show
  if (!dataToShow || dataToShow.length === 0) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-20">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-red-500 mt-4">No analysis data available</Text>
      </View>
    );
  }

  // Calculate attendance percentage for each student
  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return 0;
    return ((attendedLecs / totalLecs) * 100).toFixed(0); // Return as number
  };

  // Handle sorting and search logic
  const filteredData = dataToShow
    //@ts-ignore
    ?.filter((item) => {
      const fullName = `${item.student.personalInfo.firstName.toLowerCase()} ${item.student.personalInfo.lastName.toLowerCase()}`;
      if (isSearchActive) {
        return (
          item.student.username.includes(searchText) ||
          fullName.includes(searchText.toLowerCase()) // Search by full name (first + last name)
        );
      }
      return true; // No filter
    })
    //@ts-ignore
    ?.sort((a, b) => {
      // Sort by attendance percentage
      if (filter === 'asc') {
        return Number(calculatePercentage(a.attendedLecs, a.totalLecs)) - Number(calculatePercentage(b.attendedLecs, b.totalLecs));
      } else if (filter === 'desc') {
        return Number(calculatePercentage(b.attendedLecs, b.totalLecs)) - Number(calculatePercentage(a.attendedLecs, a.totalLecs));
      } else {
        // Sort by username as a number (fix for 1010 and 103 issue)
        return Number(a.student.username) - Number(b.student.username);
      }
    });

  // Toggle Sorting
  const toggleSorting = (mode: 'asc' | 'desc') => {
    if (filter === mode) {
      setFilter(''); // Remove sorting if already selected
    } else {
      setFilter(mode); // Apply sorting
    }
  };

  // Animate Search bar expansion and collapse
  const toggleSearch = () => {
    if (isSearchActive) {
      // Close search
      Animated.timing(animatedWidth, {
        toValue: 40, // Back to icon size
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchActive(false); // Turn off search mode
        setSearchText(''); // Reset search text
      });
    } else {
      // Open search
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
        params: { subjectId: id },
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

  return (
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sorting Buttons and Search Bar */}
      <View className="p-4 flex-row justify-between items-center">
        {!isSearchActive ? (
          <View className="flex-row gap-3">
            {/* ASC Button */}
            <TouchableOpacity
              className={`bg-[#3b3e44] p-2 rounded-lg ${filter === 'asc' ? 'border border-[#9DBDFF]' : ''}`}
              onPress={() => toggleSorting('asc')}
            >
              <Text className="text-white">ASC</Text>
            </TouchableOpacity>

            {/* DESC Button */}
            <TouchableOpacity
              className={`bg-[#3b3e44] p-2 rounded-lg ${filter === 'desc' ? 'border border-[#9DBDFF]' : ''}`}
              onPress={() => toggleSorting('desc')}
            >
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
            <TextInput
              className="bg-[#3b3e44] p-2 rounded-lg text-white"
              placeholder="Search ..."
              placeholderTextColor="#9DBDFF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </Animated.View>
        )}

        {/* Search Button or Close Button */}
        <TouchableOpacity className="bg-[#3b3e44] p-2 rounded-full" onPress={toggleSearch}>
          {isSearchActive ? (
            <Ionicons name="close" size={24} color="#9DBDFF" />
          ) : (
            <Ionicons name="search" size={24} color="#9DBDFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* List of Students */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.student.username}
        renderItem={({ item }) => (
          <View
            className={`p-2 pl-4 pr-3 rounded-lg mb-2 mx-4 flex-row justify-between items-center bg-[#2D6A4F] border border-[#1B4332] ${
              // @ts-ignore 
              calculateAttendanceLevel(calculatePercentage(item.attendedLecs, item.totalLecs)) === 'Good'
                ? 'bg-[#2D6A4F]'
                // @ts-ignore
                : calculateAttendanceLevel(calculatePercentage(item.attendedLecs, item.totalLecs)) === 'Medium'
                  ? 'bg-[#8b9e36]'
                  : 'bg-[#c33f43]'
              }`}
          >
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
                // @ts-ignore
                onPress={() => router.push(`/faculty/(tabs)/home/subject/${id}/analyse/student-previous-attendances?username=${item.student.username}`)}
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
        )}
        contentContainerStyle={{ paddingBottom: 250 }}
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

export default AnalyseAttendanceScreen;