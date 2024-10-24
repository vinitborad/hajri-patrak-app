import { adminEndpoints } from "@/constants/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const useGetAccessedFacultiesList = (subjectId: string) => {
  return useQuery({
    queryKey: ['accessed-faculties-list', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_ACCESSED_FACULTIES_LIST,
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

export const useGetSubjectPreviousAttendances = (subjectId: string) => {
  return useQuery({
    queryKey: ['subject-previous-attendances', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_SUBJECT_PREVIOUS_ATTENDANCES,
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

export const useGetStudentsListForPreviousAttendance = (attendanceId: string) => {
  return useQuery({
    queryKey: ['previous-attendance-student-list', attendanceId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_PREVIOUS_ATTENDANCE_STUDENTS_LIST,
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}