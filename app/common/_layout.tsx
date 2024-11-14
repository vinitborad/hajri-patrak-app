import { Stack } from 'expo-router/stack';

export default function Layout() {

  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
      }}
    >
      <Stack.Screen
        name='student/subject-info/[id]'
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
