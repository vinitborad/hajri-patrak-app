import { facultyEndpoints } from "@/constants/ApiEndpoints";
import { useQuery } from "@tanstack/react-query"
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const useGetSubjectsStructure = () => {
  return useQuery({
    queryKey: ['subjects-structure'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(facultyEndpoints.GET_SUBJECTS_STRUCTURE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Data will be considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
}