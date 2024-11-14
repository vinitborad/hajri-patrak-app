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
        name="[id]/subjects/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}