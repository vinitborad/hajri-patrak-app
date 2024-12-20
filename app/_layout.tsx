import QueryProvider from '@/utils/QueryProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { logout } from '@/utils/auth/logout';
import { checkTokenValidity } from '@/utils/auth/check-token-validity';
import { setupAxiosInterceptors } from '@/utils/auth/axios-interceptor';
import React from 'react';
// Import your global CSS file
import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '/',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'NunitoBlack': require('../assets/fonts/nunito/Nunito-Black.ttf'),
    'NunitoBlackItalic': require('../assets/fonts/nunito/Nunito-BlackItalic.ttf'),
    'NunitoBold': require('../assets/fonts/nunito/Nunito-Bold.ttf'),
    'NunitoBoldItalic': require('../assets/fonts/nunito/Nunito-BoldItalic.ttf'),
    'NunitoExtraBold': require('../assets/fonts/nunito/Nunito-ExtraBold.ttf'),
    'NunitoExtraBoldItalic': require('../assets/fonts/nunito/Nunito-ExtraBoldItalic.ttf'),
    'NunitoExtraLight': require('../assets/fonts/nunito/Nunito-ExtraLight.ttf'),
    'NunitoExtraLightItalic': require('../assets/fonts/nunito/Nunito-ExtraLightItalic.ttf'),
    'NunitoItalic': require('../assets/fonts/nunito/Nunito-Italic.ttf'),
    'NunitoLight': require('../assets/fonts/nunito/Nunito-Light.ttf'),
    'NunitoLightItalic': require('../assets/fonts/nunito/Nunito-LightItalic.ttf'),
    'NunitoMedium': require('../assets/fonts/nunito/Nunito-Medium.ttf'),
    'NunitoMediumItalic': require('../assets/fonts/nunito/Nunito-MediumItalic.ttf'),
    'NunitoRegular': require('../assets/fonts/nunito/Nunito-Regular.ttf'),
    'NunitoSemiBold': require('../assets/fonts/nunito/Nunito-SemiBold.ttf'),
    'NunitoSemiBoldItalic': require('../assets/fonts/nunito/Nunito-SemiBoldItalic.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // checking token validy by expriy time and loging out if expired
  useEffect(() => {
    const validateToken = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        await logout(router); // Log out the user
      } else {
        setIsCheckingToken(false); // Allow rendering the app if token is valid
      }
    };

    // Set up Axios interceptors when the app starts
    setupAxiosInterceptors(router);
    validateToken();
  }, []);

  if (isCheckingToken) {
    return null; // Render nothing while checking the token
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <QueryProvider>
        <Stack
          screenOptions={{
            // contentStyle: { backgroundColor: '#1E1E1Ez' },
            presentation: 'transparentModal',
            // cardStyleInterpolator: ({ current }) => ({
            //   cardStyle: {
            //     opacity: current.progress,
            //     backgroundColor: '#1E1E1E',
            //   },
            // }),
          }}
        >
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='auth' options={{
            headerShown: false,
            presentation: "transparentModal",
          }} />
          <Stack.Screen name='student' options={{ headerShown: false }} />
          <Stack.Screen name='faculty' options={{ headerShown: false }} />
          <Stack.Screen name='admin' options={{ headerShown: false }} />
          <Stack.Screen name='common' options={{ headerShown: false }} />
        </Stack>
      </QueryProvider>
    </ThemeProvider>
  );
}
