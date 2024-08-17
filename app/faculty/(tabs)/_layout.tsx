import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function StudentTabsLayout() {

  const router = useRouter();

  // Check if user is faculty
  const role = SecureStore.getItem('role');
  if (role !== 'faculty') {
    return <Redirect href={"/"} />
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarActiveTintColor: 'black',
          title: 'Home',
          headerTitle: "LDCE Faculty",
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              onPress={() => router.push('/faculty/notifications')}
              style={{ marginRight: 20 }}
            />
          ),
        }}
      />
    
      <Tabs.Screen
        name="material"
        options={{
          tabBarIcon: ({ color }) =>  <FontAwesome size={23} name="files-o" color={color}/>,
          tabBarActiveTintColor: 'black',
          title: 'Material',
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              onPress={() => router.push('/student/notifications')}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Octicons name="person-fill" size={28} color={color} />,
          tabBarActiveTintColor: 'black',
          title: 'Profile',
          tabBarLabelStyle: {
            marginTop: -5, // Adjust this value to change the spacing
          },
          tabBarIconStyle: {
            marginBottom: -5, // Adjust this value to change the spacing
          },
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              onPress={() => router.push('/student/notifications')}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />

    </Tabs>
  )
}