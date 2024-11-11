import { adminEndpoints, commonEndpoints } from "@/constants/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const useCommonGetSubjectAnalyse = (subjectId: string) => {
  return useQuery({
    queryKey: ['subject-analysis', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(commonEndpoints.GET_ANALYSE_ATTENDANCE,
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

export const useGetDivisionStudentsList = (divisionId: string) => {
  return useQuery({
    queryKey: ['division-students-list', divisionId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_DIVISION_STUDENTS_LIST,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            divisionId: divisionId,
          },
        }
      );
      return response.data.data;
    },
    //TODO: later add proper timings for caching here rather than fetching at every focus
    staleTime: 0,
    refetchOnMount: true,
    retry: 1, // Limit retry attempts
    refetchOnWindowFocus: true,
  });
}