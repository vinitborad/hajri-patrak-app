import { TabBar } from "@/components/admin-tabbar/TabBar";
import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AdminTabsLayout() {

  const router = useRouter();

  // Check if user is faculty
  const role = SecureStore.getItem('role');
  if (role !== 'admin') {
    return <Redirect href={"/"} />
  }

  return (
    <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarActiveTintColor: '#9DBDFF',  // Updated color to match the theme
          title: 'Home',
          headerTitle: "LDCE Admin",
          headerStyle: {
            backgroundColor: '#3b3e44', // Consistent header background
          },
          headerTitleStyle: {
            color: '#9DBDFF', // Consistent header title color
            fontFamily: 'NunitoExtraBold', // Font style
            fontSize: 20, // Font size consistent with other screens
          },
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              color="#9DBDFF" // Matching icon color
              onPress={() => router.push('/admin/notifications')}
              style={{ marginRight: 20 }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="material"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={23} name="files-o" color={color} />,
          tabBarActiveTintColor: '#9DBDFF', // Updated color to match the theme
          title: 'Material',
          headerStyle: {
            backgroundColor: '#3b3e44',
          },
          headerTitleStyle: {
            color: '#9DBDFF',
            fontFamily: 'NunitoExtraBold',
            fontSize: 20,
          },
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              color="#9DBDFF"
              onPress={() => router.push('/admin/notifications')}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Octicons name="person-fill" size={28} color={color} />,
          tabBarActiveTintColor: '#9DBDFF', // Updated color to match the theme
          title: 'Profile',
          tabBarLabelStyle: {
            marginTop: -5, // Adjust this value to change the spacing
          },
          tabBarIconStyle: {
            marginBottom: -5, // Adjust this value to change the spacing
          },
          headerStyle: {
            backgroundColor: '#3b3e44',
          },
          headerTitleStyle: {
            color: '#9DBDFF',
            fontFamily: 'NunitoExtraBold',
            fontSize: 20,
          },
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              color="#9DBDFF"
              onPress={() => router.push('/admin/notifications')}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />

    </Tabs>
  )
}
