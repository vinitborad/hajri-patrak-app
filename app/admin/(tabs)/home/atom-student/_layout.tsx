import { Stack } from "expo-router";

export default function Layout() {
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
        name="divisions-list/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}