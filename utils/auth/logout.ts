import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Router } from 'expo-router';
import { Alert } from 'react-native';

export const logout = async (router: Router) => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('role');
  // clear whole async store
  await AsyncStorage.clear();
  Alert.alert('You have been logged out !')
  router.replace('/');
}