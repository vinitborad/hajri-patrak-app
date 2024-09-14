import { facultyEndpoints } from "@/constants/ApiEndpoints";
import { LIVE_ATTENDANCE } from "@/constants/async-store-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { isConnected } from "../network";
import { addAttendanceToQueue } from "./attendance-queue";
import { GOOD_ATTENDANCE_CUTOFF, MEDIUM_ATTENDANCE_CUTOFF } from "@/constants/config";

export const callCreateAttendance = async (subjectId: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");

    const liveAttendance = await AsyncStorage.getItem(LIVE_ATTENDANCE(subjectId));

    if (!liveAttendance) {
      return {
        success: false,
        message: "Live attendance not found",
      }
    }

    const parsedLiveAttendance = JSON.parse(liveAttendance);

    const createResponse = await axios.post(facultyEndpoints.CREATE_ATTENDANCE,
      {
        subjectId: parsedLiveAttendance.subjectId,
        value: parsedLiveAttendance.value,
        interDivisions: parsedLiveAttendance.interDivisions.map((division: any) => division.interDivision),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (createResponse.data.success && createResponse.data.data.attendanceId) {
      parsedLiveAttendance._id = createResponse.data.data.attendanceId;
      await AsyncStorage.setItem(LIVE_ATTENDANCE(subjectId), JSON.stringify(parsedLiveAttendance));
    } else {
      return {
        success: false,
        message: "Failed to create attendance",
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Internal error",
    }
  }
}

export const closeAttendance = async (subjectId: string, message: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    const liveAttendance = await AsyncStorage.getItem(LIVE_ATTENDANCE(subjectId));
    if (!liveAttendance) {
      return {
        success: false,
        message: "Live attendance not found",
      }
    }
    let parsedLiveAttendance = JSON.parse(liveAttendance);
    const networkStatus = await isConnected();
    if (networkStatus) {
      if (!parsedLiveAttendance._id) {
        await callCreateAttendance(subjectId);
        parsedLiveAttendance = await AsyncStorage.getItem(LIVE_ATTENDANCE(subjectId));
      }
      if (parsedLiveAttendance._id) {
        // call mark api
        const markResponse = await axios.post(facultyEndpoints.MANUAL_MARK_ATTENDANCE,
          {
            attendanceId: parsedLiveAttendance?._id,
            studentIdLists: parsedLiveAttendance?.presentStudentsList,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (markResponse.data.success) {
          const closeResponse = await axios.post(facultyEndpoints.CLOSE_ATTENDANCE,
            {
              attendanceId: parsedLiveAttendance._id,
              message: message,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (closeResponse.data.success) {
            await AsyncStorage.removeItem(LIVE_ATTENDANCE(subjectId));
            return {
              success: true,
              message: "Attendance closed successfully.",
            }
          }
        }
      }
    }
    if (!networkStatus) {
      parsedLiveAttendance.message = message;
      parsedLiveAttendance.uniqueId = `${new Date().getTime()}`;
      await addAttendanceToQueue(parsedLiveAttendance);
      await AsyncStorage.removeItem(LIVE_ATTENDANCE(subjectId));
      return {
        success: true,
        message: "Attendance moved to pending attendances !",
      }
    }
    return {
      success: false,
      message: "Something is going wrong !",
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Internal error",
    }
  }
}

export const calculateAttendanceLevel = (percentage: string) => {
  if (percentage >= GOOD_ATTENDANCE_CUTOFF) {
    return 'Good';
  } else if (percentage >= MEDIUM_ATTENDANCE_CUTOFF) {
    return 'Medium';
  }
  return 'Low';
}