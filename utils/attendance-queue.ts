import { QUEUED_ATTENDANCES } from "@/constants/async-store-keys";
import AsyncStorage from "@react-native-async-storage/async-storage"


export const addAttendanceToQueue = async (subjectId:string, attendanceData: any) => {
  try {

    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES(subjectId));

    const parsedQueuedAttendances = queuedAttendances ? JSON.parse(queuedAttendances) : [];

    const updatedQueuedAttendances = [...parsedQueuedAttendances, attendanceData];

    await AsyncStorage.setItem(QUEUED_ATTENDANCES(subjectId), JSON.stringify(updatedQueuedAttendances));

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

export const getQueuedAttendances = async (subjectId: string) => {
  try {
    const queuedAttendances = await AsyncStorage.getItem(QUEUED_ATTENDANCES(subjectId));

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