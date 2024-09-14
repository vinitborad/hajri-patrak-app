import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetSubjectsStructure } from '@/api/faculty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBJECT_STRUCTURE, PINNED_SEM_DIV } from '@/constants/async-store-keys';
import { AntDesign } from '@expo/vector-icons';

const Branch = () => {
  const { department, branch } = useLocalSearchParams<{ department: string; branch: string }>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState(null); // To hold offline data
  const [isOfflineLoading, setIsOfflineLoading] = useState(true); // Manage offline data loading
  const [pinnedSemDivs, setPinnedSemDivs] = useState<string[]>([]); // Array for pinned sem-div pairs

  // Fetch the data from the API using custom hook
  const { data: apiResponse, isLoading, error } = useGetSubjectsStructure();

  // Fetch offline data and pinned sem-div pairs on mount
  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(SUBJECT_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData)); // Set offline data
        }

        const cachedPinnedSemDivs = await AsyncStorage.getItem(PINNED_SEM_DIV);
        if (cachedPinnedSemDivs) {
          setPinnedSemDivs(JSON.parse(cachedPinnedSemDivs)); // Load pinned sem-div pairs from AsyncStorage
        }
      } catch (error) {
        console.log('Error fetching offline data or pinned sem-div pairs:', error);
      } finally {
        setIsOfflineLoading(false); // Done loading offline data
      }
    };

    fetchOfflineData();
  }, []);

  // Update offline data if API returns updated data
  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data); // Set new data
    }
  }, [apiResponse]);

  // Persist pinned sem-div pairs in AsyncStorage whenever updated
  const savePinnedSemDivs = async (newPinnedSemDivs: string[]) => {
    try {
      await AsyncStorage.setItem(PINNED_SEM_DIV, JSON.stringify(newPinnedSemDivs));
    } catch (error) {
      console.log('Error saving pinned sem-div pairs:', error);
    }
  };

  // Handle pinning and unpinning of sem-div
  const togglePinSemDiv = (gradLevel: string, sem: string, div: string) => {
    const key = `${gradLevel}-${sem}-${div}`;
    setPinnedSemDivs((prevPinnedSemDivs) => {
      const newPinnedSemDivs = prevPinnedSemDivs.includes(key)
        ? prevPinnedSemDivs.filter((item) => item !== key) // Unpin
        : [...prevPinnedSemDivs, key]; // Pin

      savePinnedSemDivs(newPinnedSemDivs); // Save updated pinned sem-div pairs
      return newPinnedSemDivs;
    });
  };

  // Determine the data to display (either offline or API)
  const dataToShow = apiResponse?.data || offlineData;

  if (isOfflineLoading || isLoading) {
    return <Text className="text-center text-[#F6F5F5] mt-4">Loading...</Text>;
  }

  if (error && !offlineData) {
    return <Text className="text-center text-[#FF6B6B] mt-4">No Data Available !</Text>;
  }

  if (!dataToShow) {
    return <Text className="text-center text-[#FF6B6B] mt-4">No Data Available !</Text>;
  }

  // Extract degrees under the selected department and branch
  const degrees = dataToShow.ldce?.[department]?.[branch] || {};

  // Flatten all sem-divs into a single array, then sort by pinned status
  const flattenAndSortSemDivs = (gradLevel: string) => {
    const semesters = Object.keys(degrees[gradLevel]);
    const semDivs = semesters.flatMap((sem) =>
      Object.keys(degrees[gradLevel][sem]).map((div) => ({
        sem,
        div,
        key: `${gradLevel}-${sem}-${div}`,
      }))
    );
    // Sort sem-divs by pinned status
    return semDivs.sort((a, b) => {
      const isPinnedA = pinnedSemDivs.includes(a.key);
      const isPinnedB = pinnedSemDivs.includes(b.key);
      return isPinnedA === isPinnedB ? 0 : isPinnedA ? -1 : 1; // Pinned first
    });
  };

  const handleDivisionPress = (gradLevel: string, sem: string, div: string) => {
    router.push(`/faculty/home/department/${department}/branch/${branch}/subject?graduationLevel=${gradLevel}&sem=${sem}&division=${div}`);
  };

  // Render a card for each division
  const renderDivisionItem = ({ sem, div, gradLevel }: { sem: string, div: string, gradLevel: string }) => (
    <TouchableOpacity
      key={sem + div}
      className="bg-[#3b3e44] p-4 rounded-lg shadow-md my-2 flex-row justify-between items-center mx-4 border border-[#9DBDFF]"
      onPress={() => handleDivisionPress(gradLevel, sem, div)}
    >
      <Text className="text-lg font-NunitoBold text-[#9DBDFF]">{`Sem ${sem} Div ${div}`}</Text>
      {/* Pin button */}
      <TouchableOpacity onPress={() => togglePinSemDiv(gradLevel, sem, div)}>
        <AntDesign
          name={pinnedSemDivs.includes(`${gradLevel}-${sem}-${div}`) ? 'pushpin' : 'pushpino'}
          size={24}
          color={pinnedSemDivs.includes(`${gradLevel}-${sem}-${div}`) ? '#FF6B6B' : '#9DBDFF'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render each degree (btech, mtech, mca) and its respective sorted sem-div pairs
  const renderDegreeItem = ({ item }: { item: string }) => {
    const sortedSemDivs = flattenAndSortSemDivs(item); // Flatten and sort sem-divs for this grad level (e.g., btech)

    return (
      <View key={item} className="mb-4">
        <Text className="text-xl font-NunitoExtraBold text-[#F6F5F5] mt-4 ml-4">{item}</Text>
        {sortedSemDivs.map(({ sem, div }) => (
          <View key={sem + div}>
            {renderDivisionItem({ sem, div, gradLevel: item })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex flex-1 justify-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={Object.keys(degrees)}
        keyExtractor={(item) => item}
        //@ts-ignore
        renderItem={renderDegreeItem}
        contentContainerStyle={{ paddingBottom: 150 }}
        className="w-full"
      />
    </View>
  );
};

export default Branch;
