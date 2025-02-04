import axios from "axios";
import { logout } from "./logout";
import { firebase } from "@react-native-firebase/app-check"

export const setupAxiosInterceptorForAppCheck = async () => {
  try {
    console.log('setting up app check interceptor');
    const appCheck = firebase.appCheck();
    const tokenResult = await appCheck.getToken();
    console.log('firebase app check token', tokenResult.token);


    axios.interceptors.request.use(
      async (config) => {
        if (tokenResult.token) {
          config.headers['X-Firebase-AppCheck'] = tokenResult.token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return true;
  } catch (error) {
    console.error('Failed to set up App Check interceptor', error);
    return false;
  }
};

export const setupAxiosInterceptors = async (router: any) => {
  try {
    console.log('setting up axios interceptors');

    // Then setup auth interceptor
    axios.interceptors.response.use(
      response => response, // Return the response if successful
      async error => {
        // If the error is a 401 Unauthorized error or session expired
        if (
          error.response?.status === 401 ||
          error.response?.data?.message === 'Session expired, please log in again'
        ) {
          logout(router); // Log out the user
        }
        return Promise.reject(error); // Forward the error to be handled elsewhere
      }
    );

  } catch (error) {
    console.error('Failed to set up Axios interceptors', error);
  }
};