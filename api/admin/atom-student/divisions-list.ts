import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { adminEndpoints } from "@/constants/api-endpoints";

export const useGetStudentDivisionsList = (username: string) => {
  return useQuery({
    queryKey: ['admin-atom-student-divisions-list', username],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(adminEndpoints.GET_ATOM_STUDENT_DIVISIONS_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username,
        }
      });

      return response.data;
    },
  });
};