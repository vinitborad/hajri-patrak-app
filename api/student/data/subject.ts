import { studentEndpoints } from '@/constants/api-endpoints';
import { STUDENT_ACTIVE_SUBJECTS, STUDENT_ACTIVE_SUBJECTS_KEY } from '@/constants/async-store-keys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const useGetStudentSubjects = () => {
  return useQuery({
    queryKey: ['student-active-subjects'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const contentKey = await AsyncStorage.getItem(STUDENT_ACTIVE_SUBJECTS); // Fetch contentKey from AsyncStorage

      const response = await axios.get(studentEndpoints.STUDENT_ACTIVE_SUBJECTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { contentKey },
      });

      const { isUpdated, data, contentKey: newContentKey, success } = response.data;

      if (isUpdated && data && newContentKey && success) {
        // Store the new data and contentKey in AsyncStorage
        await AsyncStorage.setItem(STUDENT_ACTIVE_SUBJECTS, JSON.stringify(data));
        await AsyncStorage.setItem(STUDENT_ACTIVE_SUBJECTS_KEY, newContentKey);
      }

      return { data, isUpdated };

    },
    //TODO: chnage params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  });
};

export const useGetStudentSubjectInfo = ({ subjectId }: { subjectId: string }) => {
  return useQuery({
    queryKey: ['student-subject-info', subjectId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(studentEndpoints.STUDENT_SUBJECT_INFO, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          subjectId: subjectId,
        },
      });

      return response.data?.data;
    },
    //TODO: chnage params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  });
};
