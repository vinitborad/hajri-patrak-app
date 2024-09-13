import axios from "axios";
import { deleteAttendanceFromQueue, getQueuedAttendances, updateAttendanceInQueue } from "./attendance-queue";
import { facultyEndpoints } from "@/constants/ApiEndpoints";
import * as SecureStore from 'expo-secure-store';
import { isConnected } from "../network";

export const processQueuedAttendances = async () => {
  try {
    if (await isConnected()) {
      console.log("Processing queued attendances");
      // get token from secure store
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        return {
          success: false,
          message: "Token not found.",
        }
      }

      const getQueuedAttendancesList = await getQueuedAttendances();
      console.log("Queued attendances list: ", getQueuedAttendancesList);

      if (!getQueuedAttendancesList.success) {
        return {
          success: false,
          message: "Internally something went wrong !",
        }
      }

      // Process the queued attendances
      const queuedAttendances = getQueuedAttendancesList.data;

      console.log("Processing queued attendances: ", queuedAttendances);

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

      console.log("checking time")

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
    console.log("Processing attendance data : ", attendanceData);
    // check for _id, if it is then dont call create
    if (!attendanceData._id) {
      console.log("Creating id", attendanceData);
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
      
      console.log("Created attendance resonse: ", createResponse.data);

      if (createResponse.data.success) {
        attendanceData._id = createResponse.data.data.attendanceId;
      }
    }

    console.log("Marking attendance: ", attendanceData._id);
    // call for manual mark
    const markResponse = await axios.post(facultyEndpoints.MANUAL_MARK_ATTENDANCE,
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

    console.log("Marked attendance: ", attendanceData._id, markResponse.data);

    if (!attendanceData.close) {
      // call for close attendance
      console.log("Closing attendance: ", attendanceData._id);
      const closeResponse = await axios.post(facultyEndpoints.CLOSE_ATTENDANCE,
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

      console.log("Closed attendance: ", attendanceData._id, closeResponse.data);
    }

    attendanceData.close = true;
    await updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);

    // delete the attendance from queue
    const { success } = await deleteAttendanceFromQueue(attendanceData.uniqueId);

    if (!success) {
      if (attendanceData.retry >= 3) {
        await deleteAttendanceFromQueue(attendanceData.uniqueId);
        return;
      } else {
        attendanceData.retry += 1;
        updateAttendanceInQueue(attendanceData.uniqueId, attendanceData);
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