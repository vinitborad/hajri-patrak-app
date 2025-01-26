import { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import "../global.css";

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { firebase } from "@react-native-firebase/app-check"

import QueryProvider from '@/utils/QueryProvider';
import { logout } from '@/utils/auth/logout';
import { checkTokenValidity } from '@/utils/auth/check-token-validity';
import { setupAxiosInterceptors } from '@/utils/auth/axios-interceptor';
// Import your global CSS file

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

  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

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

  useEffect(() => {
    const initializeAppCheck = async () => {
      console.log('initializing app check');
      try {
        // const appCheck = firebase.appCheck();
        // const rnfbProvider = appCheck.newReactNativeFirebaseAppCheckProvider();
        // console.log('app check debug token', process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN);
        // rnfbProvider.configure({
        //   android: {
        //     provider: __DEV__ ? 'debug' : 'playIntegrity',
        //     debugToken: process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN
        //   },
        // });
        // await appCheck.initializeAppCheck({
        //   provider: rnfbProvider,
        //   isTokenAutoRefreshEnabled: true
        // });
      } catch (error) {
        console.error('Failed to initialize Firebase App Check', error);
      }
    };
    const validateToken = async () => {
      console.log('validating token');
      try {
        const isValid = await checkTokenValidity();
        if (!isValid) {
          await logout(router); // Log out the user
        } else {
          setIsCheckingToken(false); // Allow rendering the app if token is valid
        }
      } catch (error) {
        await logout(router); // Log out the user
      }
    };

    initializeAppCheck();
    validateToken();
    setupAxiosInterceptors(router);
  }, []);

  if (!loaded || isCheckingToken) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <QueryProvider>
        <Stack
          screenOptions={{
            presentation: 'transparentModal',
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