import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

// Utility function to check JWT expiry
export const checkTokenValidity = async () => {
  const token = await SecureStore.getItemAsync('token');
  console.log('Token:', token);
  if (token) {
    const decodedToken = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    // show remaining time in days
    if (decodedToken.exp < currentTime) {
      // Token is expired, delete it and log out user
      return false; // Token expired
    }
    return true; // Token valid
  }
  return true; // No token found
};