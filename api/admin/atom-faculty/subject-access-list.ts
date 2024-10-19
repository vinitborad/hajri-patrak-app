import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { adminEndpoints } from "@/constants/api-endpoints";

export const useGetFacultySubjectAccessList = (username: string) => {
  return useQuery({
    queryKey: ['admin-atom-faculty-subject-access-list', username],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(adminEndpoints.GET_ATOM_FACULTY_SUBJECT_ACCESS_LIST, {
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