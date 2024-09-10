import { facultyEndpoints } from "@/constants/ApiEndpoints";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const useGetSubjectsStructure = () => {
  return useQuery({
    queryKey: ['subjects-structure'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const contentKey = await AsyncStorage.getItem('subjects-structure-contentKey'); // Fetch contentKey from AsyncStorage

      const response = await axios.get(facultyEndpoints.GET_SUBJECTS_STRUCTURE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { contentKey }  // Pass the contentKey to the API
      });

      const { isUpdated, data, contentKey: newContentKey, success } = response.data;

      if (isUpdated && data && newContentKey && success) {
        // Store the new data and contentKey in AsyncStorage
        await AsyncStorage.setItem('subjects-structure', JSON.stringify(data));
        await AsyncStorage.setItem('subjects-structure-contentKey', newContentKey);
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

export const useGetDivisionStudentsList = (divisionId: string) => {
  console.log('divisionId : ', divisionId);
  return useQuery({
    queryKey: ['division-students-list', divisionId],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      console.log('divisionId : ', divisionId);
      const contentKey = await AsyncStorage.getItem(`division-students-list-contentKey-${divisionId}`);
      console.log('contentKey : ', contentKey);

      const response = await axios.get(facultyEndpoints.GET_DIVISION_STUDENTS_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { divisionId, contentKey }
      });

      console.log('response.data : ', response.data);
      const { data, success, isUpdated, contentKey: newContentKey } = response.data;

      if (isUpdated && data && newContentKey && success) {
        await AsyncStorage.setItem(`division-students-list-contentKey-${divisionId}`, newContentKey);
        await AsyncStorage.setItem(`division-students-list-data-${divisionId}`, JSON.stringify(data));
      }

      return { data, isUpdated };
    },
        //TODO: chnage params later accordingly
    // Adjust refetch behaviors
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1, // Limit retry attemptsF
  });
}