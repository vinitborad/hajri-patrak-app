import { Stack } from "expo-router";

export default function FacultyProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile-info"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="queued-attendances"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}