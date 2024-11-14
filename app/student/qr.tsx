import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { generalEndpoints, studentEndpoints } from '@/constants/api-endpoints';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [scanAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isActive]);

  const checkLocation = async () => {
    
  }

  const fetchTimeOffset = async () => {
    try {
      const localTime = new Date();
      const response = await fetch(`${generalEndpoints.GET_SYNC_TIME}`);
      const data = await response.json();
      const serverTime = new Date(data.utc_datetime);
      const timeDifference = serverTime.getTime() - localTime.getTime();
      const timeDifferenceInSeconds = timeDifference / 1000;
      return timeDifferenceInSeconds;
    } catch (error) {
      return 0;
    }
  };

  async function handleScan(data: any) {
    try {
      const fetchedTimeOffset = await fetchTimeOffset();
      const now = new Date();
      const adjustedTime = new Date(now.getTime() + fetchedTimeOffset * 1000);
      const adjustedTimeUTC = adjustedTime.toISOString();

      const value: string = data.data;
      const oCode = value.slice(0, 5);
      const code = value.slice(5);

      const token = await SecureStore.getItemAsync('token');

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

      const success = response.data.success;

      if (success) {
        Alert.alert('Success', 'Attendance marked successfully');
      } else {
        Alert.alert('Error', 'Failed to mark attendance');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  }

  const animatedStyle = {
    transform: [
      {
        translateY: scanAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200], // Adjust based on your square height
        }),
      },
    ],
  };

  if (!permission) {
    return <View className="flex-1 justify-center items-center bg-[#1E1E1E]" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <Text className="text-center pb-2 text-lg text-[#F6F5F5]">We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} className="p-3 bg-[#9DBDFF] rounded-lg mt-4">
          <Text className="text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center bg-[#1E1E1E]">
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
        >
          {/* QR Scanner Overlay */}
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
            <View className="border-4 border-[#9DBDFF] rounded-lg relative" style={{ height: 250, width: 250 }}>
              {/* QR Logo */}
              <Ionicons name="qr-code" size={120} color="#9DBDFF" style={{ opacity: 0.2, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -60 }] }} />

              {/* Scanning Bar */}
              <Animated.View className="absolute left-0 right-0 h-1 bg-[#9DBDFF]" style={animatedStyle} />
            </View>
          </View>
        </CameraView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center pb-2 text-lg text-[#F6F5F5]">Press the button to scan the QR code</Text>
          <TouchableOpacity onPress={() => setIsActive(true)} className="p-2 bg-[#9DBDFF] rounded-lg">
            <Text className="text-[#1E1E1E]">Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
