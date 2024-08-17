import { StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const index = () => {

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'faculty' | 'student'>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const role = await SecureStore.getItemAsync('role');
      setToken(storedToken);
      setRole(role as 'faculty' | 'student');
      setLoading(false);
    };

    fetchToken();
  }, []);

  if (loading) {
    // Optionally, you can show a loading indicator here
    return null;
  }

  if (!token) {
    return <Redirect href="/sign-in" />;
  }

  if (role === 'faculty') {
    return <Redirect href='/faculty/(tabs)/' />;
  }

  return <Redirect href="/student/(tabs)" />;
}

export default index

const styles = StyleSheet.create({})