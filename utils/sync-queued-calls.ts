import AsyncStorage from "@react-native-async-storage/async-storage";
import { isConnected } from "./network";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const syncQueuedCalls = async () => {
  const connectionStatus = await isConnected();

  if (!connectionStatus) return;

  const queuedCall = await AsyncStorage.getItem('queued-call');

  if (queuedCall) {
    const parsedCall = JSON.parse(queuedCall);
    const token = await SecureStore.getItemAsync('token');

    try {
      const response = await axios.post(parsedCall.url, parsedCall.data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { attendanceId } = response.data.data;

      // Update live attendance with the returned _id
      const liveAttendance = await AsyncStorage.getItem('live-attendance');
      // @ts-ignore
      const parsedAttendance = JSON.parse(liveAttendance);

      parsedAttendance._id = attendanceId;

      await AsyncStorage.setItem('live-attendance', JSON.stringify(parsedAttendance));

      // Remove the queued call after successful completion
      await AsyncStorage.removeItem('queued-call');
    } catch (error) {
      console.log('Error syncing queued call:', error);
    }
  }
};
