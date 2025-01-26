import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIVE_ATTENDANCE, DIVISION_STUDENTS_LIST } from '@/constants/async-store-keys';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import StudentInfoModal from '@/components/custom/StudentInfoModal';

// Reusable StudentCard component with React.memo
const StudentCard = memo(({ item, isPresent, toggleAttendance, showInfo }: any) => {
  return (
    <TouchableOpacity
      onPress={() => toggleAttendance(item.id)}
      className={`p-2 pl-4 rounded-lg mb-2 mx-4 flex-row justify-between items-center ${isPresent ? 'bg-[#2D6A4F]' : 'bg-[#c33f43]'
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
      <TouchableOpacity onPress={() => showInfo(item.username)}>
        <Ionicons name="information-circle-outline" size={35} color="#9DBDFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const ManualMarkScreen = () => {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  const [students, setStudents] = useState<any[]>([]); // List of all students
  const [liveAttendance, setLiveAttendance] = useState<any>(null); // Live attendance data
  const [markedPresentStudents, setMarkedPresentStudents] = useState<Set<string>>(new Set()); // Use Set for better performance
  const [markMode, setMarkMode] = useState<'present' | 'absent'>('present'); // Mode: present or absent
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null); // For StudentInfoModal

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch live attendance from AsyncStorage
        const liveData = await AsyncStorage.getItem(LIVE_ATTENDANCE(id as string));
        if (liveData) {
          const parsedLiveData = JSON.parse(liveData);

          // Fetch students from each division
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

          // Initialize present students if in "present" mode
          setMarkedPresentStudents(new Set(parsedLiveData.presentStudentsList || []));
          setLiveAttendance(parsedLiveData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  // const handleModeChange = (newMode: 'present' | 'absent') => {
  //   Alert.alert(
  //     'Confirm Mode Change',
  //     `Are you sure you want to switch to ${newMode === 'present' ? 'Present' : 'Absent'} mode?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Yes',
  //         onPress: () => {
  //           setMarkMode(newMode);

  //           if (newMode === 'present') {
  //             // In "present" mode, only keep students already present in live attendance's presentStudentList
  //             setMarkedPresentStudents(liveAttendance?.presentStudentsList || []);
  //           } else if (newMode === 'absent') {
  //             // In "absent" mode, mark all students as present by default
  //             setMarkedPresentStudents(students.map((s) => s.id));
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  // Handle mode change with memoization
  const handleModeChange = useCallback(
    (newMode: 'present' | 'absent') => {
      Alert.alert(
        'Confirm Mode Change',
        `Are you sure you want to switch to ${newMode === 'present' ? 'Present' : 'Absent'} mode?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              setMarkMode(newMode);
              if (newMode === 'present') {
                setMarkedPresentStudents(new Set(liveAttendance?.presentStudentsList || []));
              } else {
                setMarkedPresentStudents(new Set(students.map((s) => s.id)));
              }
            },
          },
        ]
      );
    },
    [liveAttendance, students]
  );

  // Memoized functions
  const toggleStudentAttendance = useCallback((studentId: string) => {
    setMarkedPresentStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const showStudentInfo = useCallback((username: string) => {
    setSelectedStudentUsername(username);
  }, []);

  const handleSubmit = () => {
    try {
      Alert.alert(
        'Confirm Submission',
        'Are you sure you want to submit the attendance?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              // Update live attendance presentStudentList
              const updatedLiveAttendance = {
                ...liveAttendance,
                presentStudentsList: Array.from(markedPresentStudents), // Convert Set to Array
              };

              // Save updated live attendance back to AsyncStorage
              await AsyncStorage.setItem(LIVE_ATTENDANCE(id as string), JSON.stringify(updatedLiveAttendance));

              // Navigate back one screen
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const isStudentPresent = useCallback(
    (studentId: string) => markedPresentStudents.has(studentId),
    [markedPresentStudents]
  );

  const renderItem = useCallback(
    //@ts-ignore
    ({ item }) => (
      <StudentCard
        item={item}
        isPresent={isStudentPresent(item.id)}
        toggleAttendance={toggleStudentAttendance}
        showInfo={showStudentInfo}
      />
    ),
    [isStudentPresent, toggleStudentAttendance, showStudentInfo]
  );

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

      {/* Mode Buttons: Presents & Absents */}
      <View className="flex-row justify-around p-4">
        <TouchableOpacity
          className={`flex-1 p-2 rounded-lg mr-2 ${markMode === 'present' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
          onPress={() => handleModeChange('present')}
        >
          <Text className="text-center text-[#F6F5F5] text-lg font-NunitoMedium">Presents</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-2 rounded-lg ml-2 ${markMode === 'absent' ? 'bg-[#9DBDFF]' : 'bg-[#3b3e44]'}`}
          onPress={() => handleModeChange('absent')}
        >
          <Text className="text-center text-[#F6F5F5] text-lg font-NunitoMedium">Absents</Text>
        </TouchableOpacity>
      </View>

      <View className=' px-4 mb-2 flex-row justify-start items-center'>
        <Text className='text-[#9DBDFF] text-xl font-NunitoExtraBold'>
          Students :
        </Text>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 300 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Submit Button */}
      <View className="absolute bottom-24 w-full flex items-center justify-center">
        <TouchableOpacity className="bg-[#9DBDFF] rounded-t-full p-1 px-8" onPress={handleSubmit}>
          <Text className="text-center text-[#1E1E1E] text-base font-NunitoExtraBold">Submit</Text>
        </TouchableOpacity>
      </View>

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

export default ManualMarkScreen;