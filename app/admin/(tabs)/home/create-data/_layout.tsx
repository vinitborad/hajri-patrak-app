import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="create-faculty"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="create-division"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="create-subject"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="create-student"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}