import axios from "axios";
import { deleteAttendanceFromQueue, getQueuedAttendances, updateAttendanceInQueue } from "./attendance-queue";
import { facultyEndpoints } from "@/constants/ApiEndpoints";
import * as SecureStore from 'expo-secure-store';
import { isConnected } from "../network";

export const processQueuedAttendances = async () => {
  try {
    if (await isConnected()) {
      // get token from secure store
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        return {
          success: false,
          message: "Token not found.",
        }
      }

      const getQueuedAttendancesList = await getQueuedAttendances();

      if (!getQueuedAttendancesList.success) {
        return {
          success: false,
          message: "Internally something went wrong !",
        }
      }

      // Process the queued attendances
      const queuedAttendances = getQueuedAttendancesList.data;

      if (!queuedAttendances.length) {
        return {
          success: true,
          message: "No queued attendances found.",
        }
      }

      // Use for...of loop to await each asynchronous operation
      for (const attendanceData of queuedAttendances) {
        if (await isConnected()) {
          // Process each attendance data
          await processAttendanceDataHelper(attendanceData, token as string);
        } else {
          return {
            success: false,
            message: "Please check your internet connection and try again.",
          };
        }
      }

      return {
        success: true,
        message: "All queued attendances processed successfully.",
      }

    } else {

      return {
        success: false,
        message: "Please check your internet connection and try again.",
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Internally something went wrong !",
    }
  }
}

const processAttendanceDataHelper = async (attendanceData: any, token: string) => {
  try {
    if (!attendanceData._id) {
      // call create api, and store _id back to the attendanceData
      const createResponse = await axios.post(facultyEndpoints.CREATE_ATTENDANCE,
        {
          subjectId: attendanceData.subjectId,
          value: attendanceData.value,
          interDivisions: attendanceData.interDivisions.map((division: any) => division.interDivision),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (createResponse.data.success) {
        attendanceData._id = createResponse.data.data.attendanceId;
        await updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);
      }
    }

    // call for manual mark
    await axios.post(facultyEndpoints.MANUAL_MARK_ATTENDANCE,
      {
        attendanceId: attendanceData._id,
        studentIdLists: attendanceData.presentStudentsList,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!attendanceData.close) {
      // call for close attendance
      await axios.post(facultyEndpoints.CLOSE_ATTENDANCE,
        {
          attendanceId: attendanceData._id,
          message: attendanceData.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      attendanceData.close = true;
      await updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);
    }

    // delete the attendance from queue
    const { success } = await deleteAttendanceFromQueue(attendanceData.uniqueId);

    if (!success) {
      if (attendanceData.retry >= 3) {
        await deleteAttendanceFromQueue(attendanceData.uniqueId);
        return;
      } else {
        attendanceData.retry += 1;
        await updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);
        return;
      }
    }

    return {
      success: true,
      message: "Attendance processed successfully.",
    }

  } catch (error: any) {
    console.log("Error processing attendance data: ", error.response?.data);
    if (attendanceData.retry >= 3) {
      await deleteAttendanceFromQueue(attendanceData.uniqueId);
      return;
    } else {
      attendanceData.retry += 1;
      await updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);
      return;
    }
  }
}