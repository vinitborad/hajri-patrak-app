import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGetSubjectsStructure } from '@/api/admin/data/structure';
import { ADMIN_DATA_STRUCTURE } from '@/constants/async-store-keys';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { adminEndpoints } from '@/constants/api-endpoints';
import * as SecureStore from 'expo-secure-store';

type Params = {
  college: string;
  department: string;
  branch: string;
  graduationLevel: string;
  passoutYear: string;
  semester: string;
  division: string;
};

const DivisionInfoScreen = () => {
  const { college, department, branch, graduationLevel, passoutYear, semester, division } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [offlineData, setOfflineData] = useState<any>(null);
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedSubject, setSelectedSubject] = useState<any>(null); // Track selected subject
  const [newSubjectName, setNewSubjectName] = useState(''); // Input field state
  const [isSubjectDeleting, setIsSubjectDeleting] = useState<string | null>(null); // To track loading state for delete button
  const [isDivisionDeleting, setIsDivisionDeleting] = useState<string | null>(null); // To track loading state for delete button

  const { data: apiResponse, isLoading, error, refetch } = useGetSubjectsStructure();

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE);
        if (cachedData) {
          setOfflineData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.log('Error fetching offline data:', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, []);

  useEffect(() => {
    if (apiResponse?.isUpdated && apiResponse?.data) {
      setOfflineData(apiResponse.data);
    }
  }, [apiResponse]);

  const handleRenameSubject = async () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a valid subject name.');
      return;
    }

    Alert.alert(
      'Confirm Rename',
      `Are you sure you want to rename ${selectedSubject.subjectName} to ${newSubjectName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('token');
              const response = await axios.patch(
                adminEndpoints.RENAME_SUBJECT,
                {
                  subjectId: selectedSubject.subjectId,
                  subjectName: newSubjectName,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert('Success', `Subject renamed to ${newSubjectName}`);
                setModalVisible(false);
                setNewSubjectName('');
                refetch(); // Refetch the data to update the UI
              } else {
                Alert.alert('Error', response.data.message || 'Failed to rename subject.');
              }
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to rename subject.');
            }
          },
        },
      ]
    );
  };

  // Get subjects and interDivisions for the specific division
  const divisionData = offlineData?.[college]?.[department]?.[branch]?.[graduationLevel]?.[passoutYear]?.[semester]?.[division];

  const deleteSubject = async (subjectId: string) => {
    Alert.alert('Confirm Delete !', 'Are you sure you want to delete this subject ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          Alert.alert(
            'Confirm Delete Again !',
            'This action is irreversible. Do you really want to delete this subject ?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                onPress: async () => {
                  setIsSubjectDeleting(subjectId);
                  try {
                    const token = await SecureStore.getItemAsync('token');
                    const response = await axios.delete(adminEndpoints.DELETE_SUBJECT, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      params: { subjectId },
                    });

                    if (response.data.success) {
                      Alert.alert('Success', 'Subject deleted successfully.');
                      refetch(); // Refresh the data
                    } else {
                      Alert.alert('Error', response.data.message || 'Failed to delete subject.');
                    }
                  } catch (error: any) {
                    Alert.alert('Error', error?.response?.data?.message || 'Failed to delete subject.');
                  } finally {
                    setIsSubjectDeleting(null); // Reset loading state
                  }
                },
              },
            ]
          );
        },
      },
    ]);
  };

  const deleteInterDivision = async (divisionId: string) => {
    Alert.alert('Confirm Delete !', 'Are you sure you want to delete this inter division ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          Alert.alert(
            'Confirm Delete Again !',
            'This action is irreversible. Do you really want to delete this inter division ?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                onPress: async () => {
                  setIsDivisionDeleting(divisionId);
                  try {
                    const token = await SecureStore.getItemAsync('token');
                    const response = await axios.delete(adminEndpoints.DELTE_INTER_DIVISION, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      params: { interDivisionId: divisionId },
                    });

                    if (response.data.success) {
                      Alert.alert('Success', 'Inter division deleted successfully.');
                      refetch(); // Refresh the data
                    } else {
                      Alert.alert('Error', response.data.message || 'Failed to delete inter division.');
                    }
                  } catch (error: any) {
                    Alert.alert('Error', error?.response?.data?.message || 'Failed to delete inter division.');
                  } finally {
                    setIsDivisionDeleting(null); // Reset loading state
                  }
                },
              },
            ]
          );
        },
      },
    ]);
  };

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

  if (!divisionData) {
    return (
      <View className="flex flex-1 justify-center items-center bg-[#1E1E1E] pb-16">
        <Text className="text-[#FF6B6B]">No data available for this division</Text>
      </View>
    );
  }

  // Render Subject Card
  const renderSubjectItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.subjectId}
      className="flex-row justify-between items-start bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() =>
        router.push({
          // @ts-ignore
          pathname: `/admin/(tabs)/home/view-data/subject/${item.subjectId}`,
          params: {
            subjectName: item.subjectName,
            subjectCode: item.subjectCode,
            subjectType: item.subjectType,
            college,
            department,
            branch,
            graduationLevel,
            passoutYear,
            semester,
            division,
          },
        })
      }
    >
      <View className="flex-1 mr-3">
        <Text className="text-lg font-NunitoBold text-[#9DBDFF] capitalize flex-wrap">
          {item.subjectName}
        </Text>
        <Text className="text-sm font-Nunito text-[#F6F5F5]">
          ({item.subjectCode})
        </Text>
      </View>

      <View className="flex-row items-center gap-x-3">
        <TouchableOpacity
          onPress={() => {
            setSelectedSubject(item);
            setNewSubjectName(item.subjectName);
            setModalVisible(true);
          }}
        >
          <Entypo name="pencil" size={24} color="#e6eeff" />
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isSubjectDeleting === item.subjectId}
          onPress={() => deleteSubject(item.subjectId)}
        >
          {isSubjectDeleting === item.subjectId ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <MaterialIcons name="delete" size={24} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render Inter-Division Card
  const renderInterDivisionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item._id}
      className="flex-row justify-between items-center bg-[#3b3e44] p-4 pr-5 rounded-lg shadow-md m-2 border border-[#9DBDFF]"
      onPress={() => {
        router.push({
          // @ts-ignore
          pathname: `/admin/(tabs)/home/view-data/inter-division/${item._id}`,
          params: {
            college,
            department,
            branch,
            graduationLevel,
            passoutYear,
            semester,
            division,
            interDivision: item.interDivision,
          },
        });
      }}
    >
      <View>
        <Text className="text-lg font-NunitoBold text-[#9DBDFF]">Inter Div {item.interDivision}</Text>
      </View>
      <TouchableOpacity disabled={isDivisionDeleting === item.subjectId} onPress={() => deleteInterDivision(item._id)}>
        {isDivisionDeleting === item.subjectId ? (
          <ActivityIndicator size="small" color="#FF6B6B" />
        ) : (
          <MaterialIcons name="delete" size={24} color="#FF6B6B" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex flex-1 justify-center items-center bg-[#1E1E1E]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 200, padding: 10 }} className="w-full">
        {/* Subjects Section */}
        <Text className="text-[#F6F5F5] text-xl font-NunitoExtraBold px-3 py-2">Subjects</Text>
        {divisionData.subjects.length > 0 ? (
          divisionData.subjects.map((subject: any) => (
            <React.Fragment key={subject.subjectId}>
              {renderSubjectItem({ item: subject })}
            </React.Fragment>
          ))
        ) : (
          <Text className="text-[#FF6B6B] text-center p-4">No subjects available</Text>
        )}

        {/* Inter-Divisions Section */}
        <Text className="text-[#F6F5F5] text-xl font-NunitoExtraBold px-3 py-2">Inter Divisions</Text>
        {divisionData.interDivisions.length > 0 ? (
          divisionData.interDivisions.map((division: any) => (
            <React.Fragment key={division._id}>
              {renderInterDivisionItem({ item: division })}
            </React.Fragment>
          ))
        ) : (
          <Text className="text-[#FF6B6B] text-center p-4">No inter-divisions available</Text>
        )}
      </ScrollView>

      {/* Modal for renaming the subject */}
      {modalVisible && (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
            <View className="bg-[#3b3e44] p-6 rounded-lg border border-[#9DBDFF] w-[85%]">
              <Text className="text-lg font-NunitoExtraBold text-[#9DBDFF] mb-4 text-center">
                Rename {selectedSubject?.subjectName} name?
              </Text>
              <TextInput
                className="bg-[#2D2D2D] p-3 rounded-lg text-white"
                placeholder="New Subject Name"
                value={newSubjectName}
                onChangeText={setNewSubjectName}
              />
              <TouchableOpacity className="bg-[#9DBDFF] p-3 rounded-lg mt-4" onPress={handleRenameSubject}>
                <Text className="text-white text-center font-NunitoExtraBold">Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DivisionInfoScreen;