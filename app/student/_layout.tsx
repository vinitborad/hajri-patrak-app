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
          headerStyle: {
            backgroundColor: '#3b3e44', // Consistent dark background
          },
          headerTitleStyle: {
            color: '#9DBDFF', // Light blue text color
            fontFamily: 'NunitoExtraBold', // Custom font
            fontSize: 20, // Font size consistent with other screens
          },
          headerTintColor: '#9DBDFF', // Back button color
        }}
      />
      <Stack.Screen
        name="subject/[id]"
        options={{
          title: 'Subject Detail',
          headerStyle: {
            backgroundColor: '#3b3e44', // Consistent dark background
          },
          headerTitleStyle: {
            color: '#9DBDFF', // Light blue text color
            fontFamily: 'NunitoExtraBold', // Custom font
            fontSize: 20, // Font size consistent with other screens
          },
          headerTintColor: '#9DBDFF', // Back button color
        }}
      />
      <Stack.Screen
        name="qr"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
