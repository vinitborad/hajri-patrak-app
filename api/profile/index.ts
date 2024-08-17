import { profileENdpoints } from "@/constants/ApiEndpoints";
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
      return response.data.data;
    }
  });
}