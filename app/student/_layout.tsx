import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { TouchableOpacity } from 'react-native';

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
          headerBackTitleVisible: false, // Hide back button text
          headerLeft: () => (
            <TouchableOpacity
              style={{ paddingLeft: 8, paddingRight: 16 }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#9DBDFF" />
            </TouchableOpacity>
          ),
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
