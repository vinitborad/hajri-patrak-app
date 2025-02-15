import * as SecureStore from 'expo-secure-store';
import { Router } from 'expo-router';
import { Alert } from 'react-native';

export const logout = async (router: Router) => {
  // Get the role before clearing
  const role = await SecureStore.getItemAsync('role');

  // Always clear secure store items
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('role');

  Alert.alert('You have been logged out!')
  router.replace('/');
}