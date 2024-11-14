import { Stack } from "expo-router";


export default function AuthLayout(): JSX.Element {

  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="admin"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false }}
      />
    </Stack>
  )

}
