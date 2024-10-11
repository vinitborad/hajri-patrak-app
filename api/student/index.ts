import { studentEndpoints } from "@/constants/api-endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    },
    //TODO: later fix this parameters properly
    refetchOnMount: true, // Do not refetch on component mount
    refetchOnWindowFocus: true, // Do not refetch when window regains focus
  });
}

export const useGetStudentSubjectInfo = ({ subjectId }: { subjectId: string }) => {
  return useQuery({
    queryKey: ["subject-info", "student", subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(studentEndpoints.STUDENT_SUBJECT_DETAILS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          subjectId: subjectId,
        },
      });

      return response.data?.data;
    },
    //TODO: later fix this parameters properly
    // staleTime: 1000 * 60 * 10, // Data will be considered fresh for 10 minutes
    refetchOnMount: true, // Do not refetch on component mount
    refetchOnWindowFocus: true, // Do not refetch when window regains focus
  });
}
