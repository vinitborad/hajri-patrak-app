import axios from "axios";
import { logout } from "./logout";
import { firebase } from "@react-native-firebase/app-check"

// Set up a global Axios interceptor
export const setupAxiosInterceptors = async (router: any) => {
  try {
    console.log('setting up axios interceptors');
    const appCheck = firebase.appCheck();
    const tokenResult = await appCheck.getToken();
    console.log('firebase app check token', tokenResult.token);

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

    axios.interceptors.request.use(
      async (config) => {
        if (tokenResult.token) {
          config.headers['X-Firebase-AppCheck'] = tokenResult.token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    )
  } catch (error) {
    console.error('Failed to set up Axios interceptors', error);
  }
};