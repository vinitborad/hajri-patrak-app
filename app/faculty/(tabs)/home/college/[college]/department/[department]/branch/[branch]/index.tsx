import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useGetSubjectsStructure } from '@/api/faculty/data/structure';
import { ACTIVE_SUBJECTS_STRUCTURE, PINNED_DIVISIONS } from '@/constants/async-store-keys';

const DivisionsScreen = () => {
  const { college, department, branch }: { college: string; department: string; branch: string } = useLocalSearchParams(); // Extract params
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // To manage loading state for offline data
  const [pinnedDivisions, setPinnedDivisions] = useState<{ [key: string]: string[] }>({}); // Pinned divisions by graduation level

  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned divisions on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(PINNED_DIVISIONS(college, department, branch));
        if (cachedData) {
          setPinnedDivisions(JSON.parse(cachedData)); // Load pinned divisions from AsyncStorage
        }
        const cachedSubjects = await AsyncStorage.getItem(ACTIVE_SUBJECTS_STRUCTURE);
        if (cachedSubjects) {
          setOfflineData(JSON.parse(cachedSubjects)); // Set offline data
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };
    fetchOfflineData();
  }, [college, department, branch]);

  // Refresh data if API data is updated
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
    }
  }, [apiResponse]);

  // Save pinned divisions in AsyncStorage
  const savePinnedDivisions = async (newPinnedDivisions: { [key: string]: string[] }) => {
    try {
      await AsyncStorage.setItem(PINNED_DIVISIONS(college, department, branch), JSON.stringify(newPinnedDivisions));
    } catch (error) {
      console.log('Error saving pinned divisions:', error);
    }
  };

  // Toggle pinning of divisions
  const togglePinDivision = (graduationLevel: string, divisionKey: string) => {
    setPinnedDivisions((prevPinnedDivisions) => {
      const newPinnedDivisions = { ...prevPinnedDivisions };
      if (!newPinnedDivisions[graduationLevel]) {
        newPinnedDivisions[graduationLevel] = [];
      }

      if (newPinnedDivisions[graduationLevel].includes(divisionKey)) {
        newPinnedDivisions[graduationLevel] = newPinnedDivisions[graduationLevel].filter((d) => d !== divisionKey); // Unpin
      } else {
        newPinnedDivisions[graduationLevel].push(divisionKey); // Pin
      }

      savePinnedDivisions(newPinnedDivisions); // Save updated pinned divisions
      return newPinnedDivisions;
    });
  };

  // Prepare data for display
  const sortedDivisionsByGraduationLevel = useMemo(() => {
    if (!offlineData || !offlineData[college] || !offlineData[college][department] || !offlineData[college][department][branch]) {
      return {};
    }

    const branchData = offlineData[college][department][branch];
    const graduationLevels = Object.keys(branchData);

    const divisionsByGraduationLevel = graduationLevels.reduce((acc: any, gradLevel) => {
      const passoutYears = Object.keys(branchData[gradLevel]);
      const allDivisions = passoutYears.flatMap((passoutYear) => {
        const semesters = Object.keys(branchData[gradLevel][passoutYear]);
        return semesters.flatMap((sem) => {
          const divisions = Object.keys(branchData[gradLevel][passoutYear][sem]);
          return divisions.map((div) => ({
            sem,
            div,
            passoutYear,
            graduationLevel: gradLevel,
            key: `${gradLevel}-${passoutYear}-${sem}-${div}`, // Unique key
          }));
        });
      });

      // Check for duplicate sem-div combos within the same graduation level
      const semDivCount = allDivisions.reduce((countMap: any, division) => {
        const comboKey = `${division.sem}-${division.div}`;
        countMap[comboKey] = (countMap[comboKey] || 0) + 1;
        return countMap;
      }, {});

      // Sort divisions by pinned status
      const pinned = allDivisions.filter((d) => pinnedDivisions[gradLevel]?.includes(d.key));
      const unpinned = allDivisions.filter((d) => !pinnedDivisions[gradLevel]?.includes(d.key));

      // Add flag to show passout year only if sem-div combo appears more than once within the same graduation level
      const divisionsWithDisplayNames = [...pinned, ...unpinned].map((division) => ({
        ...division,
        showPassoutYear: semDivCount[`${division.sem}-${division.div}`] > 1, // Show passout year if this combo appears more than once
      }));

      acc[gradLevel] = divisionsWithDisplayNames;
      return acc;
    }, {});

    return divisionsByGraduationLevel;
  }, [offlineData, pinnedDivisions, college, department, branch]);

  // Handle division press
  const handleDivisionPress = (graduationLevel: string, sem: string, div: string, passoutYear: string) => {
    router.push(`/faculty/(tabs)/home/college/${college}/department/${department}/branch/${branch}/subject?graduationLevel=${graduationLevel}&sem=${sem}&division=${div}&passoutYear=${passoutYear}`);
  };

  if (isOfflineLoading) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (error || !offlineData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  if (!Object.keys(sortedDivisionsByGraduationLevel).length) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[#FF6B6B]">N / A</Text>
      </View>
    );
  }

  // Render each division card
  const renderDivisionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.key}
      className="bg-[#3b3e44] p-4 rounded-lg shadow-md my-2 flex-row justify-between items-center mx-4 border border-[#9DBDFF]"
      onPress={() => handleDivisionPress(item.graduationLevel, item.sem, item.div, item.passoutYear)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">
        {`Sem ${item.sem} Div ${item.div}`}
        {item.showPassoutYear ? ` (${item.passoutYear})` : ''}
      </Text>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinDivision(item.graduationLevel, item.key)}>
        <AntDesign
          name={pinnedDivisions[item.graduationLevel]?.includes(item.key) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedDivisions[item.graduationLevel]?.includes(item.key) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render graduation levels and their corresponding divisions
  const renderGraduationLevelSection = (graduationLevel: string, divisions: any[]) => (
    <View key={graduationLevel} className="mb-4">
      <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-4 ml-4">{graduationLevel}</Text>
      {divisions.map((division) => (
        <View key={division.key}>
          {renderDivisionItem({ item: division })}
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={Object.keys(sortedDivisionsByGraduationLevel)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderGraduationLevelSection(item, sortedDivisionsByGraduationLevel[item])}
        contentContainerStyle={{ paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default DivisionsScreen;