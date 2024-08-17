import { studentEndpoints } from "@/constants/ApiEndpoints";
import { useQuery } from "@tanstack/react-query"
import axios from "axios";
import * as SecureStore from 'expo-secure-store';


export const useGetStudentSubjects = () => {
  return useQuery({
    queryKey: ["subject-list", "student"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(studentEndpoints.STUDENT_SUBJECTS_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    }
  });
}

export const useGetStudentSubjectInfo = ({subjectId}: {subjectId: string}) => {
  console.log(subjectId);
  return useQuery({
    queryKey: ["subject-info", "student", subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(studentEndpoints.STUDENT_SUBJECT_DETAILS, 
        {
          "subjectId": subjectId
        }, 
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
    // staleTime: 1000 * 60 * 10, // Data will be considered fresh for 10 minutes
    // cacheTime: 1000 * 60 * 60, // Cache the data for 1 hour
    // refetchOnMount: false, // Do not refetch on component mount
    // refetchOnWindowFocus: false, // Do not refetch when window regains focus
  });
}
