import { profileENdpoints } from "@/constants/ApiEndpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query"
import axios from "axios";
import * as SecureStore from 'expo-secure-store';


export const useGetStudentProfile = () => {
  return useQuery({
    queryKey: ["profile", "student"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(profileENdpoints.STUDENT_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        await AsyncStorage.setItem('studentProfile', JSON.stringify(response.data.data));
      }
      return response.data.data;
    },
    //TODO: later fix this parameters properly
    refetchOnMount: true, // Do not refetch on component mount
    refetchOnWindowFocus: true, // Do not refetch when window regains focus
  });
}

export const useGetFacultyProfile = () => {
  return useQuery({
    queryKey: ["profile", "faculty"],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(profileENdpoints.FACULTY_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        await AsyncStorage.setItem('facultyProfile', JSON.stringify(response.data.data));
      }
      return response.data.data;
    },
    //TODO: later fix this parameters properly
    refetchOnMount: true, // Do not refetch on component mount
    refetchOnWindowFocus: true, // Do not refetch when window regains focus    
  });
}