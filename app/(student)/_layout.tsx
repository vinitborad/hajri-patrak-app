import { FontAwesome } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import * as SecureStore from 'expo-secure-store';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function StudentTabsLayout () {

  const role = SecureStore.getItem('role');

  if (role !== 'student') {
    return <Redirect href={"/"} />
  }

  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'LDCE',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarActiveTintColor: 'black',
        }}
      />
    </Tabs>
  )
}