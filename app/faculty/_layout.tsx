
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';

export default function Layout() {

  const router = useRouter();

  return (
    <Stack>

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      
    </Stack>
  );
}
