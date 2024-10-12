import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT_PROFILE } from '@/constants/async-store-keys';
import { studentEndpoints } from '@/constants/api-endpoints';

export const useGetStudentProfile = () => {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(studentEndpoints.GET_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        await AsyncStorage.setItem(STUDENT_PROFILE, JSON.stringify(response.data.data));
      }
      return response.data.data;
    },
    //TODO: later fix this parameters properly
    refetchOnMount: true, // Do not refetch on component mount
    refetchOnWindowFocus: true, // Do not refetch when window regains focus
  });
}