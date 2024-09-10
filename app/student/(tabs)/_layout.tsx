import { TabBar } from "@/components/student-tabbar/TabBar";
import { FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function StudentTabsLayout() {

  const router = useRouter();

  const role = SecureStore.getItem('role');

  if (role !== 'student') {
    return <Redirect href={"/"} />
  }

  return (
    <Tabs 
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarActiveTintColor: 'black',
          title: 'Home',
          headerTitle: "LDCE Student",
          headerStyle: {
            backgroundColor: '#3b3e44', // Darker background color
          },
          headerTitleStyle: {
            color: '#9DBDFF', // Light blue text color
            fontFamily: 'NunitoExtraBold', // Custom font
            fontSize: 20, // Adjust font size as needed
          },
          headerRight: () => (
            <Ionicons
              name="notifications"
              size={25}
              color="#9DBDFF"
              onPress={() => router.push('/student/notifications')}
              style={{ marginRight: 20 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="material"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={23} name="files-o" color={color} />,
          tabBarActiveTintColor: 'black',
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
              onPress={() => router.push('/student/notifications')}
              style={{ marginRight: 20 }}
            />
          )
        }}
      />
    </Tabs>
  )
}
