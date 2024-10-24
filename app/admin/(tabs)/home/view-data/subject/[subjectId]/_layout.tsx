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
        name="faculties-list"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="attendances"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}