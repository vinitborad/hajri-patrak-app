import { QUEUED_ATTENDANCES } from "@/constants/async-store-keys";
import AsyncStorage from "@react-native-async-storage/async-storage"


export const addAttendanceToQueue = async (attendanceData: any) => {
  try {

    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES);

    const parsedQueuedAttendances = queuedAttendances ? JSON.parse(queuedAttendances) : [];

    const updatedQueuedAttendances = [...parsedQueuedAttendances, attendanceData];

    await AsyncStorage.setItem(QUEUED_ATTENDANCES, JSON.stringify(updatedQueuedAttendances));

    return {
      success: true,
      data: updatedQueuedAttendances,
    }

  } catch (error) {
    return {
      success: false,
    }
  }
}

export const getQueuedAttendances = async () => {
  try {
    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES);

    return {
      success: true,
      data: queuedAttendances ? JSON.parse(queuedAttendances) : [],
    }

  } catch (error) {
    return {
      success: false,
    }
  }
}

export const deleteAttendanceFromQueue = async (uniqueId: string) => {
  try {

    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES);
    const parsedQueuedAttendances = queuedAttendances ? JSON.parse(queuedAttendances) : [];

    const updatedQueuedAttendances: any[] = [];

    // Using a for-loop to handle async operations inside
    for (const attendance of parsedQueuedAttendances) {
      if (attendance.uniqueId !== uniqueId) {
        updatedQueuedAttendances.push(attendance);
      }
    }

    await AsyncStorage.setItem(QUEUED_ATTENDANCES, JSON.stringify(updatedQueuedAttendances));

    return {
      success: true,
    }

  } catch (error) {
    return {
      success: false,
    }
  }
}

export const updateAttendanceInQueue = async (uniqueId: string, updatedAttendanceData: any) => {
  try {

    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES);
    const parsedQueuedAttendances = queuedAttendances ? JSON.parse(queuedAttendances) : [];

    const updatedQueuedAttendances: any[] = [];

    // Using a for-loop to handle async operations inside
    for (const attendance of parsedQueuedAttendances) {
      if (attendance.uniqueId !== uniqueId) {
        updatedQueuedAttendances.push(attendance);
      }
    }

    // append updated attendance data
    updatedQueuedAttendances.push(updatedAttendanceData);

    await AsyncStorage.setItem(QUEUED_ATTENDANCES, JSON.stringify(updatedQueuedAttendances));

    return {
      success: true,
    }

  } catch (error) {
    return {
      success: false,
    }
  }
}