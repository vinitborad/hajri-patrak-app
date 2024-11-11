import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { deleteAttendanceFromQueue, getQueuedAttendances } from '@/utils/attendances/attendance-queue';
import { AntDesign, MaterialIcons, Foundation, Feather } from '@expo/vector-icons'; // Icons as per your design
import { processQueuedAttendances } from '@/utils/attendances/processing-queue';
import { isConnected } from '@/utils/network';

const QueuedAttendancesScreen = () => {
  const [queuedAttendances, setQueuedAttendances] = useState<any[]>([]); // State for queued attendances
  const [isOfflineLoading, setIsOfflineLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        // Fetch queued attendances from AsyncStorage
        const queued = await getQueuedAttendances();
        setQueuedAttendances(queued?.data || []);
      } catch (error) {
        console.log('Error fetching queued attendances.', error);
      } finally {
        setIsOfflineLoading(false);
      }
    };

    fetchOfflineData();
  }, []);

  const onSyncPress = () => {
    Alert.alert('Sync ?', 'Are you sure you want to sync the queued attendances?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sync',
        onPress: async () => {
          try {
            setIsSyncing(true);
            if (await isConnected()) {
              if (queuedAttendances.length === 0) {
                Alert.alert('No Queued Attendances', 'There are no queued attendances to sync.');
                return;
              }
              // Your sync logic here
              const { success, message } = await processQueuedAttendances();
              console.log('Process queued attendances response: ', success, message);
              if (success) {
                Alert.alert('Synced', 'All queued attendances processed successfully.');
              } else {
                Alert.alert('Error', message);
              }
            } else {
              Alert.alert('No Internet', 'Please check your internet connection and try again.');
            }
          } finally {
            setIsSyncing(false);
          }
        },
      },
    ]);
  }

  const onDeletePress = (uniqueId: string) => {
    try {
      console.log('Deleting queued attendance with uniqueId: ', uniqueId);
      // ask for confirmation
      Alert.alert(
        'Confirm Deletion ?',
        'Are you sure you want to delete this attendance ?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes !',
            onPress: async () => {
              await deleteAttendanceFromQueue(uniqueId);
              const queued = await getQueuedAttendances();
              setQueuedAttendances(queued?.data || []);
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the queued attendance.');
    }
  }

  const renderQueuedAttendanceItem = ({ item, index }: any) => (
    <View key={index} className="bg-[#3b3e44] p-2 rounded-lg mb-2 border border-[#e5eb95] flex w-full">
      <View className=' pl-1 pr-2 mb-1 flex-row justify-between items-center'>
        <Text className="text-[#e5eb95] text-lg font-NunitoExtraBold">{item?.subjectName ? item?.subjectName.toUpperCase() : "N / A"}</Text>
        <Text className='text-[#a2a393]'>Retry count {item?.retry}</Text>
      </View>

      {/* Message Input */}
      <View className="bg-[#1E1E1E] p-2 pl-3 pr-3 rounded-lg mb-2 flex-row items-center w-full">
        <Text className="text-[#e5eb95]">{item.message || 'N / A'}</Text>
      </View>

      {/* Hours and Divisions */}
      <View className="flex-row justify-between items-center mb-2 px-2">
        <View className="flex-row items-center">
          <AntDesign name="clockcircle" size={20} color="#9DBDFF" />
          <Text className="text-[#c5d4f3] ml-2 font-NunitoLight">{item.value} Hour</Text>
        </View>

        <View className="flex-row items-center">
          <MaterialIcons name="people-alt" size={22} color="#9DBDFF" />
          <Text className="text-[#c5d4f3] ml-2 font-NunitoMedium">
            {item.interDivisions.map((div: any) => div.interDivision).join(', ')}
          </Text>
        </View>
      </View>

      {/* Present Students */}
      <View className="flex-row justify-between items-center">
        <View className='flex-row items-center justify-start gap-2 px-2'>
          <Foundation name="list-number" size={24} color="#c5d4f3" />
          <Text className="text-[#9DBDFF] text-base font-NunitoExtraBold">
            Present Count : {item.presentStudentsList.length}
          </Text>
        </View>
        <TouchableOpacity
          className="px-3"
          onPress={() => onDeletePress(item.uniqueId)}
        >
          <AntDesign name="delete" size={22} color="#f63d3d" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNoDataMessage = () => (
    <View className="flex flex-col items-center justify-center h-full -mt-10">
      <Feather name="inbox" size={40} color="#f6ff90" />
      <Text className="text-[#f6ff90] mt-4 text-lg font-NunitoExtraBold">No Queued Attendances</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#1E1E1E] px-2">
      <Stack.Screen options={{ headerShown: false }} />

      {/* FlatList or no-data message */}
      {(isOfflineLoading || isSyncing) ? (
        <View className='flex h-full items-center justify-center -mt-10'>
          <ActivityIndicator size="large" color="#f6ff90" />
        </View>
      ) : queuedAttendances.length === 0 ? (
        renderNoDataMessage()
      ) : (
        <FlatList
          data={queuedAttendances}
          renderItem={renderQueuedAttendanceItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 200, paddingTop: 20, width: '100%', gap: 8 }} // Added paddingBottom
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sync Button (Fixed at the bottom, above the tab bar) */}
      <View className="absolute bottom-20 left-0 right-0 flex-row justify-center">
        <TouchableOpacity
          className="bg-[#FF6B6B] rounded-t-3xl flex-row justify-center items-center px-4 py-1"
          onPress={() => onSyncPress()}
          disabled={isSyncing}
        >
          <MaterialIcons name="sync" size={24} color="#1E1E1E" />
          <Text className="text-[#ffffff] text-lg font-NunitoExtraBold ml-2">SYNC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QueuedAttendancesScreen;
