import { facultyEndpoints } from "@/constants/ApiEndpoints";
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

//TODO: later use useMutation for all post, delete types requestss

export const useGetPreviousAttendances = (subjectId: string) => {
  return useQuery({
    queryKey: ['previous-attendances', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_PREVIOUS_ATTENDANCES,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            subjectId: subjectId,
          },
        }
      );
      return response.data.data;
    },
    //TODO: later add proper timings for caching here rather than fetching at every focus
    refetchOnWindowFocus: true,
  });
}

export const useGetAttendanceInfo = (attendanceId: string) => {
  return useQuery({
    queryKey: ['attendance-info', attendanceId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_ATTENDANCE_INFO,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            attendanceId: attendanceId,
          },
        }
      );
      return response.data.data;
    },
    //TODO: later add proper timings for caching here rather than fetching at every focus
    // refetchOnWindowFocus: true,
  });
}

export const useGetAnalyseAttendance = (subjectId: string) => {
  return useQuery({
    queryKey: ['analyse-attendance', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_ANALYSE_ATTENDANCE,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            subjectId: subjectId,
          },
        }
      );
      return response.data.data;
    },
    //TODO: later add proper timings for caching here rather than fetching at every focus
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export const useCreateAttendance = () => {
  //@ts-ignore
  return useMutation(async ({ subjectId, value, interDivisions }: { subjectId: string; value: number; interDivisions: string[] }) => {
    const token = await SecureStore.getItemAsync('token');
    const response = await axios.post(facultyEndpoints.CREATE_ATTENDANCE,
      {
        subjectId,
        value,
        interDivisions,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  });
};

export const useGetLiveAttendanceInfo = (attendanceId: string) => {
  return useQuery({
    queryKey: ['get-live-attendance-info', attendanceId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_LIVE_ATTENDANCE_INFO,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            attendanceId: attendanceId,
          },
        }
      );
      return response.data.data;
    },
    //TODO: later add proper timings for caching here rather than fetching at every focus
    // refetchOnWindowFocus: true,
  });
}

export const useManualMarkAttendance = () => {
  return useMutation({
    async mutationFn({ attendanceId, studentIdLists }: { attendanceId: string; studentIdLists: string[]; }) {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(facultyEndpoints.MANUAL_MARK_ATTENDANCE,
        {
          attendanceId,
          studentIdLists,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    }
  });
}

export const useCloseAttendance = () => {
  return useMutation({
    async mutationFn({ attendanceId, message }: { attendanceId: string; message: string; }) {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(facultyEndpoints.CLOSE_ATTENDANCE,
        {
          attendanceId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    }
  });
}