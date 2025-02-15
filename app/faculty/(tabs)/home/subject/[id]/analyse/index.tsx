import React, { useState, useEffect, useTransition } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Modal
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useGetAnalyseAttendance } from '@/api/faculty/attendances';
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANALYSIS } from '@/constants/async-store-keys';
import { calculateAttendanceLevel } from '@/utils/attendances/helper-functions';
import StudentInfoModal from '@/components/custom/StudentInfoModal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { commonEndpoints, facultyEndpoints } from '@/constants/api-endpoints';

// Component to render each student item
// @ts-ignore
const RenderStudentItem = ({ item, onPressInfo, onPressHistory, calculatePercentage }) => {
  const attendanceLevel = calculateAttendanceLevel(calculatePercentage(item.attendedLecs, item.totalLecs));

  return (
    <View
      className={`p-2 pl-4 pr-3 rounded-lg mb-2 mx-4 flex-row justify-between items-center bg-[#2D6A4F] border border-[#1B4332] ${attendanceLevel === 'Good'
        ? 'bg-[#2D6A4F]'
        : attendanceLevel === 'Medium'
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
          <TouchableOpacity onPress={() => onPressInfo(item.student.username)}>
            <Ionicons name="information-circle-outline" size={24} color="#9DBDFF" />
          </TouchableOpacity>
        </View>
        <Text className="text-[#F6F5F5]">
          <FontAwesome name="user" size={18} color="#F6F5F5" /> Name: {item.student.personalInfo.firstName} {item.student.personalInfo.lastName}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          className="mr-1"
          onPress={() => onPressHistory(item.student.username)}
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
};

const AnalyseAttendanceScreen = () => {
  console.log('AnalyseAttendanceScreen');
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // --- New state for Faculty Filter ---
  // Holds the applied faculty filter (array of faculty IDs); empty means all faculties.
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  // Temporary state for modal selection.
  const [tempSelectedFacultyIds, setTempSelectedFacultyIds] = useState<string[]>([]);
  // Controls the visibility of the faculty selection modal.
  const [isFacultyModalVisible, setFacultyModalVisible] = useState(false);
  // Faculty list fetched from backend.
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [isFacultyListLoading, setFacultyListLoading] = useState(false);
  // ---------------------------------------

  const { data, isLoading, error, refetch } = useGetAnalyseAttendance(id as string, selectedFacultyIds);
  const [filter, setFilter] = useState(''); // Sorting filter state (asc, desc)
  const [offlineData, setOfflineData] = useState(null); // State for offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Offline loading state
  const [isSearchActive, setIsSearchActive] = useState(false); // Whether search is active
  const [searchText, setSearchText] = useState(''); // Search input text
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal
  const [isSheetLoading, setIsSheetLoading] = useState(false); // Loading state for the sheet link

  const searchWidth = new Animated.Value(40); // Initial width for search button
  const [animatedWidth, setAnimatedWidth] = useState(searchWidth); // Animated width control

  const [isPending, startTransition] = useTransition();

  // --- Fetch offline data ---
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ANALYSIS(id as string));
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.error('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };
    fetchOfflineData();
  }, [id]);

  // --- Store fresh API data offline ---
  useEffect(() => {
    if (data) {
      AsyncStorage.setItem(ANALYSIS(id as string), JSON.stringify(data));
    }
  }, [data]);

  // Call refetch() automatically when selectedFacultyIds changes
  useEffect(() => {
    // This will run whenever selectedFacultyIds changes, ensuring fresh data is fetched.
    refetch();
  }, [selectedFacultyIds]);

  // --- Loading and error states ---
  if (isOfflineLoading) {
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

  const dataToShow = data || offlineData;
  if (!dataToShow || dataToShow.length === 0) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-20">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-center text-red-500 mt-4">No analysis data available</Text>
      </View>
    );
  }

  // --- Calculate attendance percentage for each student ---
  const calculatePercentage = (attendedLecs: number, totalLecs: number) => {
    if (totalLecs === 0) return 0;
    return ((attendedLecs / totalLecs) * 100).toFixed(0);
  };

  // --- Filter and sort data ---
  const filteredData = dataToShow
    //@ts-ignore
    ?.filter((item) => {
      const fullName = `${item.student.personalInfo.firstName.toLowerCase()} ${item.student.personalInfo.lastName.toLowerCase()}`;
      if (isSearchActive) {
        return (
          item.student.username.includes(searchText) ||
          fullName.includes(searchText.toLowerCase())
        );
      }
      return true;
    })
    //@ts-ignore
    ?.sort((a, b) => {
      if (filter === 'asc') {
        return Number(calculatePercentage(a.attendedLecs, a.totalLecs)) - Number(calculatePercentage(b.attendedLecs, b.totalLecs));
      } else if (filter === 'desc') {
        return Number(calculatePercentage(b.attendedLecs, b.totalLecs)) - Number(calculatePercentage(a.attendedLecs, a.totalLecs));
      } else {
        return Number(a.student.username) - Number(b.student.username);
      }
    });

  // --- Sorting and search UI handlers ---
  const toggleSorting = (mode: 'asc' | 'desc') => {
    startTransition(() => {
      if (filter === mode) {
        setFilter('');
      } else {
        setFilter(mode);
      }
    });
  };

  const toggleSearch = () => {
    Animated.timing(animatedWidth, {
      toValue: isSearchActive ? 40 : 250,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      startTransition(() => {
        setIsSearchActive(!isSearchActive);
        if (!isSearchActive) setSearchText('');
      });
    });
  };

  // --- Open Google Sheet ---
  const openSheet = async () => {
    setIsSheetLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(commonEndpoints.GET_ANALYSE_ATTENDANCE_SHEET_LINK, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { subjectId: id },
      });

      const { data } = response;
      if (data.success && data.data) {
        Linking.openURL(data.data);
      } else {
        Alert.alert('Error', 'Failed to retrieve the sheet link.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong !');
    } finally {
      setIsSheetLoading(false);
    }
  };

  // --- New: Fetch faculty list for the subject ---
  const fetchFacultyList = async () => {
    try {
      setFacultyListLoading(true);
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_FACULTY_LIST_OF_SUBJECT, {
        params: { subjectId: id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setFacultyList(response.data.data.facultyList);
      }
    } catch (error) {
      console.log('Error fetching faculty list:', error);
    } finally {
      setFacultyListLoading(false);
    }
  };

  // --- New: Open Faculty Modal ---
  const openFacultyModal = () => {
    // Reset temporary selection to empty (i.e. all faculties)
    setTempSelectedFacultyIds([]);
    setFacultyModalVisible(true);
    fetchFacultyList();
  };

  // --- New: Toggle faculty selection in modal ---
  const toggleFacultySelection = (facultyId: string) => {
    setTempSelectedFacultyIds((prev) => {
      if (prev.includes(facultyId)) {
        return prev.filter((id) => id !== facultyId);
      } else {
        return [...prev, facultyId];
      }
    });
  };

  // --- New: Apply faculty filter ---
  const applyFacultyFilter = () => {
    // If no faculty is selected in modal, then we consider that as "all" (empty array)
    setSelectedFacultyIds(tempSelectedFacultyIds);
    setFacultyModalVisible(false);
  };

  return (
    <View className="flex flex-1 bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Sorting, Sheet & Faculty Filter Buttons --- */}
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

            {/* --- New Faculty Filter Icon --- */}
            <TouchableOpacity className="bg-[#3b3e44] p-2 rounded-lg" onPress={openFacultyModal}>
              <Ionicons name="person-circle-outline" size={24} color="#9DBDFF" />
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

        {/* Search Button / Close Button */}
        <TouchableOpacity className="bg-[#3b3e44] p-2 rounded-full" onPress={toggleSearch}>
          {isSearchActive ? (
            <Ionicons name="close" size={24} color="#9DBDFF" />
          ) : (
            <Ionicons name="search" size={24} color="#9DBDFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* --- Student List --- */}
      {isPending ? (
        <ActivityIndicator size="small" color="#9DBDFF" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.student.username}
          renderItem={({ item }) => (
            <RenderStudentItem
              item={item}
              onPressInfo={(username: string) => setSelectedStudentUsername(username)}
              onPressHistory={(username: string) =>
                router.push(`/faculty/(tabs)/home/subject/${id}/analyse/student-previous-attendances?username=${username}`)
              }
              calculatePercentage={calculatePercentage}
            />
          )}
          contentContainerStyle={{ paddingBottom: 250 }}
        />
      )}

      {/* --- Student Info Modal --- */}
      {selectedStudentUsername && (
        <StudentInfoModal
          username={selectedStudentUsername}
          onClose={() => setSelectedStudentUsername(null)}
        />
      )}

      {/* --- New Faculty Filter Modal --- */}
      <Modal visible={isFacultyModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF] w-[85%]">
            <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4 text-center">Select Faculties</Text>
            {isFacultyListLoading ? (
              <ActivityIndicator size="large" color="#9DBDFF" />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {facultyList.map((faculty) => (
                  <TouchableOpacity
                    key={faculty.id}
                    onPress={() => toggleFacultySelection(faculty.id)}
                    className="p-3 border-b border-gray-500 flex-row items-center justify-between"
                  >
                    <Text className="text-white">
                      {faculty.firstName} {faculty.lastName} ({faculty.username})
                    </Text>
                    {tempSelectedFacultyIds.includes(faculty.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#9DBDFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity className="bg-red-500 p-2 rounded-lg mr-2" onPress={() => setFacultyModalVisible(false)}>
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-green-500 p-2 rounded-lg" onPress={applyFacultyFilter}>
                <Text className="text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* --- End of Faculty Filter Modal --- */}
    </View>
  );
};

export default AnalyseAttendanceScreen;