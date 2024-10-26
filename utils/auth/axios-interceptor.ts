import axios from "axios";
import { logout } from "./logout";

// Set up a global Axios interceptor
export const setupAxiosInterceptors = async (router: any) => {
  axios.interceptors.response.use(
    response => response, // Return the response if successful
    async error => {
      // If the error is a 401 Unauthorized error or session expired
      if (
        error.response?.status === 401 ||
        error.response?.data?.message === 'Session expired, please log in again'
      ) {
        await logout(router); // Log out the user
      }

      return Promise.reject(error); // Forward the error to be handled elsewhere
    }
  );
};