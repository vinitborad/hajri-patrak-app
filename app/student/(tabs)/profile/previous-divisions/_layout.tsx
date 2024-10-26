import { Stack } from "expo-router";

export default function StudentProfileLayout() {
  return (
    <Stack>
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