import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, Animated, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { generalEndpoints, studentEndpoints } from '@/constants/api-endpoints';
import axios from 'axios';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const INSTITUTE_LOCATION = {
  latitude: parseFloat(process.env.EXPO_PUBLIC_INSTITUTE_LATITUDE || '0'),
  longitude: parseFloat(process.env.EXPO_PUBLIC_INSTITUTE_LONGITUDE || '0'),
};

const RADIUS_LIMIT = parseInt(process.env.EXPO_PUBLIC_INSTITUTE_RANGE_LIMIT || '0');

const checkProximityToInstitute = (userLocation: Location.LocationObject) => {
  const { latitude, longitude } = userLocation.coords;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(latitude - INSTITUTE_LOCATION.latitude);
  const dLon = toRad(longitude - INSTITUTE_LOCATION.longitude);
  const lat1 = toRad(INSTITUTE_LOCATION.latitude);
  const lat2 = toRad(latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance <= RADIUS_LIMIT;
};

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [scanAnim] = useState(new Animated.Value(0));
  const [locationEnabledFlag, setLocationEnabledFlag] = useState(true);
  const [locationAccuracyFlag, setLocationAccuracyFlag] = useState(true);

  useEffect(() => {
    getPreciseLocation();
  }, []);

  const getPreciseLocation = async () => {
    setLoading(true);
    try {
      const camPerm = await requestPermission();
      const locPerm = await requestLocationPermission();

      if (camPerm.granted && locPerm.granted) {
        const status = await Location.getProviderStatusAsync();
        if (status.locationServicesEnabled) {
          setLocationEnabledFlag(true);
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          if (location.coords.accuracy && location.coords.accuracy > 100) {
            setLocationAccuracyFlag(false);
            return null;
          } else {
            setLocationAccuracyFlag(true);
            return location;
          }
        } else {
          setLocationEnabledFlag(false);
          return null;
        }
      }
    } catch (error) {
      setLocationEnabledFlag(false);
      setLocationAccuracyFlag(false);
      return null;
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isActive]);

  const handleScan = async (data: any) => {
    console.log(data.data);
    const fetchedTimeOffset = await fetchTimeOffset();
    const adjustedTimeUTC = new Date(new Date().getTime() + fetchedTimeOffset * 1000).toISOString();

    if (!locationEnabledFlag) {
      Alert.alert("Error", "Location services are off. Please enable them to proceed.");
      return;
    }

    const currentLocation = await getPreciseLocation();

    if (currentLocation) {
      // if (checkProximityToInstitute(currentLocation)) {
      const value: string = data.data;
      const oCode = value.slice(0, 5);
      const code = value.slice(5);

      try {
        const token = await SecureStore.getItemAsync('token');

        const response = await axios.post(
          studentEndpoints.QR_MARK_ATTENDANCE,
          { oCode, time: adjustedTimeUTC, code },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          Alert.alert('Success', response.data.message || 'Attendance marked successfully');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to mark attendance');
        }
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to mark attendance');
      }
      // } else {
      //   Alert.alert('Error', 'You are not in the institute');
      // }
    }
  };

  const fetchTimeOffset = async () => {
    try {
      const localTime = new Date();
      const response = await fetch(`${generalEndpoints.GET_SYNC_TIME}`);
      const data = await response.json();
      return (new Date(data.utc_datetime).getTime() - localTime.getTime()) / 1000;
    } catch {
      return 0;
    }
  };

  const animatedStyle = {
    transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }],
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        <ActivityIndicator size="large" color="#9DBDFF" />
      </View>
    );
  }

  if (!permission || !permission.granted || !locationPermission || !locationPermission.granted || !locationAccuracyFlag || !locationEnabledFlag) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1E1E1E]">
        {(!permission || !permission.granted) && (
          <Text className="text-white font-NunitoMedium text-base">Please, Give Camera permission to proceed</Text>
        )}
        {(!locationPermission || !locationPermission.granted) && (
          <Text className="text-white font-NunitoMedium text-base">Please, Give Location permission to proceed</Text>
        )}
        {!locationEnabledFlag && (
          <Text className="text-white font-NunitoMedium text-base">Turn on GPS !</Text>
        )}
        {!locationAccuracyFlag && (
          <Text className="text-white font-NunitoMedium text-base">Please, Give Precise Location Permission.</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View className="flex-1 justify-center h-full bg-white">
        {isActive ? (
          <View className=' bg-red-500'>
            <CameraView
              className="flex-1 w-full h-full"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={(data) => { setIsActive(false); handleScan(data); }}
            >
              <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
                <View className="border-4 border-[#9DBDFF] rounded-lg relative" style={{ height: 250, width: 250 }}>
                  <Ionicons name="qr-code" size={120} color="#9DBDFF" style={{ opacity: 0.2, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -60 }] }} />
                  <Animated.View className="absolute left-0 right-0 h-1 bg-[#9DBDFF]" style={animatedStyle} />
                </View>
              </View>
            </CameraView>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <TouchableOpacity onPress={() => setIsActive(true)} className="p-2 bg-[#9DBDFF] rounded-lg">
              <AntDesign name="qrcode" size={100} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View> */}
      {isActive ? (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(data) => { setIsActive(false); handleScan(data); }}
        >
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
            <View className="border-4 border-[#9DBDFF] rounded-lg relative" style={{ height: 250, width: 250 }}>
              <Ionicons name="qr-code" size={120} color="#9DBDFF" style={{ opacity: 0.2, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -60 }] }} />
              <Animated.View className="absolute left-0 right-0 h-1 bg-[#9DBDFF]" style={animatedStyle} />
            </View>
          </View>
        </CameraView>
      ) : (
        <View className="flex justify-center items-center">
          <TouchableOpacity onPress={() => setIsActive(true)} className="p-2 bg-[#9DBDFF] rounded-lg">
            <AntDesign name="qrcode" size={100} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});