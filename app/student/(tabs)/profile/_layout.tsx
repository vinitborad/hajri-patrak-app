import { Stack } from "expo-router";

export default function StudentProfileLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
      }}
    >
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
        name="previous-divisions"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}