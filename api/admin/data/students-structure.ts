import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { adminEndpoints } from "@/constants/api-endpoints";

export const useGetStudentsStrcutreStudentList = ({
  college,
  department,
  graduationLevel,
  branch,
  passoutYear,
}: any) => {
  return useQuery({
    queryKey: ['admin-students-structure-student-list', college, department, graduationLevel, branch, passoutYear],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(adminEndpoints.GET_STUDENTS_STRUCTURE_STUDENT_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          college,
          department,
          graduationLevel,
          branch,
          passoutYear
        }
      });

      console.log(response.data.data);

      return response.data.data;
    },
    //TODO: change params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  });
};