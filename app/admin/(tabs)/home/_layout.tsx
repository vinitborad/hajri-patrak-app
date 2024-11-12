import { Stack } from 'expo-router';

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
        name="atom-student"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="atom-faculty"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-data"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="view-data"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="view-students-data"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="upgrade-divisions"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}