import { studentEndpoints } from "@/constants/ApiEndpoints";
import { useMutation } from "@tanstack/react-query"
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const useMarkAttendance = ({ oCode, time, code }: { oCode: string, time: string, code: string }) => {
  //@ts-ignore
  return useMutation(async ({ oCode, time, code }: { oCode: string, time: string, code: string }) => {
    const token = await SecureStore.getItemAsync('token');
    const response = await axios.post(studentEndpoints.QR_MARK_ATTENDANCE,
      {
        oCode,
        time,
        code,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  })
}