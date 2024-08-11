import { profileENdpoints } from "@/constants/ApiEndpoints";
import { useQuery } from "@tanstack/react-query"
import axios from "axios";



export const studentProfileApi = (token: string) => {
  return useQuery({
    queryKey: ["profile", "student"],
    queryFn: async () => {
      const response = await axios.get(profileENdpoints.STUDENT_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    }
  });
}