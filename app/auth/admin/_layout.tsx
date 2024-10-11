import { Stack } from "expo-router";


export default function AdminLayout(): JSX.Element {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
    </Stack>
  )

}
