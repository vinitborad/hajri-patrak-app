import { Stack } from 'expo-router/stack';

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen
        name='student/subject-info/[id]'
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
