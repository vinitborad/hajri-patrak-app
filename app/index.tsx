import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Redirect, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const index = () => {

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      setToken(storedToken);
      setLoading(false);
    };

    fetchToken();
  }, []);

  if (loading) {
    // Optionally, you can show a loading indicator here
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(student)" />;
}

export default index

const styles = StyleSheet.create({})