import { useQuery } from "@tanstack/react-query";
import { firebase } from "@react-native-firebase/app-check"

export const useGetAppCheck = () => {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      try {
        const appCheck = await firebase.appCheck();

        const rnfbProvider = appCheck.newReactNativeFirebaseAppCheckProvider();

        rnfbProvider.configure({
          android: {
            provider: __DEV__ ? 'debug' : 'playIntegrity',
            debugToken: process.env.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN
          },
        });

        await appCheck.initializeAppCheck({
          provider: rnfbProvider,
          isTokenAutoRefreshEnabled: true
        });

        const appCheckTokenFB = await appCheck.getToken();

        console.log('firebase app check token', appCheckTokenFB.token);

        return appCheckTokenFB.token;

      } catch (e) {
        // Handle Errors which can happen during token generation
        console.log(e);
      }
    },
  });
}