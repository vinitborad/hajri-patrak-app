import { adminEndpoints } from "@/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import * as SecureStore from 'expo-secure-store'

export const useGetDivisionActiveStatus = ({ college, passoutYear, department, graduationLevel, branch, semester, division }: any) => {
  return useQuery({
    queryKey: ['division-active-status', college, passoutYear, department, graduationLevel, branch, semester, division],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(adminEndpoints.GET_DIVISION_ACTIVE_STATUS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          college,
          passoutYear,
          department,
          graduationLevel,
          branch,
          semester,
          division
        }
      });
      return response.data;
    },
    //TODO: change params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  })
}