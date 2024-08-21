import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, Button, Text, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { generalEndpoints, studentEndpoints } from '@/constants/ApiEndpoints';
import axios from 'axios';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState<boolean>(true);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center pb-2 text-lg">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const fetchTimeOffset = async () => {
    try {
      console.log('Fetching time offset...');
      const localTime = new Date();
      const response = await fetch(`${generalEndpoints.GET_SYNC_TIME}`);
      const data = await response.json();
      const serverTime = new Date(data.utc_datetime);
      const timeDifference = serverTime.getTime() - localTime.getTime();
      const timeDifferenceInSeconds = timeDifference / 1000;
      return timeDifferenceInSeconds;
    } catch (error) {
      console.error('Failed to fetch time offset:', error);
      return 0; // Return 0 offset in case of error
    }
  };

  async function handleScan(data: any) {
    try {
      const fetchedTimeOffset = await fetchTimeOffset();
      const now = new Date();
      const adjustedTime = new Date(now.getTime() + fetchedTimeOffset * 1000);

      // Convert to ISO strings (which are already in the desired format)
      const adjustedTimeUTC = adjustedTime.toISOString();

      const value: string = data.data;

      const oCode = value.slice(0, 5);
      const code = value.slice(5);

      const token = await SecureStore.getItemAsync('token');
      console.log('Token:', token);
      console.log('ApiEndpoint:', studentEndpoints.QR_MARK_ATTENDANCE);

      const response = await axios.post(studentEndpoints.QR_MARK_ATTENDANCE,
        {
          oCode,
          time: adjustedTimeUTC,
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response:', response.data);

      const success = response.data.success;

      if (success) {
        Alert.alert('Success', 'Attendance marked successfully');
      } else {
        Alert.alert('Error', 'Failed to mark attendance');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
      //@ts-ignore
      console.log('Error:', error.message);
    }
  }

  return (
    <View className="flex-1 justify-center">
      {isActive ? (
        <CameraView
          className="flex-1"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={(data) => {
            setIsActive(false);
            handleScan(data);
          }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center pb-2 text-lg">Press the button to scan the QR code</Text>
          <TouchableOpacity onPress={() => setIsActive(true)}>
            <View className="p-2 bg-blue-500 rounded-md">
              <Text className="text-white">Scan QR Code</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
