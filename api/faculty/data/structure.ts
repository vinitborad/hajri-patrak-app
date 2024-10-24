import { commonEndpoints, facultyEndpoints } from '@/constants/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_SUBJECTS_STRUCTURE, ACTIVE_SUBJECTS_STRUCTURE_KEY, DIVISION_STUDENTS_LIST, DIVISION_STUDENTS_LIST_KEY } from '@/constants/async-store-keys';

export const useGetSubjectsStructure = () => {
  return useQuery({
    queryKey: ['active-subjects-structure'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const contentKey = await AsyncStorage.getItem(ACTIVE_SUBJECTS_STRUCTURE_KEY); // Fetch contentKey from AsyncStorage

      const response = await axios.get(facultyEndpoints.GET_ACTIVE_SUBJECTS_STRUCTURE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { contentKey }  // Pass the contentKey to the API
      });

      const { isUpdated, data, contentKey: newContentKey, success } = response.data;

      if (isUpdated && data && newContentKey && success) {
        // Store the new data and contentKey in AsyncStorage
        await AsyncStorage.setItem(ACTIVE_SUBJECTS_STRUCTURE, JSON.stringify(data));
        await AsyncStorage.setItem(ACTIVE_SUBJECTS_STRUCTURE_KEY, newContentKey);
      }

      return { data, isUpdated };
    },
    //TODO: change params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  });
};

export const useGetDivisionStudentsList = (divisionId: string) => {
  console.log('divisionId : ', divisionId);
  return useQuery({
    queryKey: ['division-students-list', divisionId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const contentKey = await AsyncStorage.getItem(DIVISION_STUDENTS_LIST_KEY(divisionId));

      const response = await axios.get(commonEndpoints.GET_DIVISION_STUDENTS_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { divisionId, contentKey }
      });

      const { data, success, isUpdated, contentKey: newContentKey } = response.data;

      if (isUpdated && data && newContentKey && success) {
        await AsyncStorage.setItem(DIVISION_STUDENTS_LIST_KEY(divisionId), newContentKey);
        await AsyncStorage.setItem(DIVISION_STUDENTS_LIST(divisionId), JSON.stringify(data));
      }

      return { data, isUpdated };
    },
    //TODO: change params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attempts
  });
};
