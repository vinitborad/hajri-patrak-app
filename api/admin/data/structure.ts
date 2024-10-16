import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_DATA_STRUCTURE, ADMIN_DATA_STRUCTURE_KEY } from "@/constants/async-store-keys";
import { adminEndpoints } from "@/constants/api-endpoints";
import * as SecureStore from 'expo-secure-store';

export const useGetSubjectsStructure = () => {
  return useQuery({
    queryKey: ['admin-data-structure'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const contentKey = await AsyncStorage.getItem(ADMIN_DATA_STRUCTURE_KEY); // Fetch contentKey from AsyncStorage

      const response = await axios.get(adminEndpoints.GET_STRUCTURE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { contentKey }  // Pass the contentKey to the API
      });

      const { isUpdated, data, contentKey: newContentKey, success } = response.data;

      if (isUpdated && data && newContentKey && success) {
        // Store the new data and contentKey in AsyncStorage
        await AsyncStorage.setItem(ADMIN_DATA_STRUCTURE, JSON.stringify(data));
        await AsyncStorage.setItem(ADMIN_DATA_STRUCTURE_KEY, newContentKey);
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