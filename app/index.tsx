import { ActivityIndicator, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const index = () => {

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'faculty' | 'student' | 'admin'>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const role = await SecureStore.getItemAsync('role');
      setToken(storedToken);
      setRole(role as 'faculty' | 'student' | 'admin');
      setLoading(false);
    };
    fetchToken();
  }, []);

  if (loading) {
    return <ActivityIndicator size='large' color='#0000ff' />;
  }

  if (!token) {
    return <Redirect href='/auth/sign-in' />;
  }

  if (role === 'faculty') {
    return <Redirect href='/faculty/(tabs)/home/' />;
  }

  if (role === 'admin') {
    return <Redirect href='/admin' />;
  }

  if (role === 'student') {
    return <Redirect href='/student/(tabs)' />;
  }

  return <Redirect href='/auth/sign-in' />;
}

export default index

const styles = StyleSheet.create({})