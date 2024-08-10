import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const index = () => {

  const token = SecureStore.getItem('token');

  if (!token) {
    return <Redirect href={"/(auth)/sign-in"} />
  }

  return (
    <View
      className='flex-1 justify-center items-center bg-gray-100 p-4'
    >
      <Text>index</Text>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})