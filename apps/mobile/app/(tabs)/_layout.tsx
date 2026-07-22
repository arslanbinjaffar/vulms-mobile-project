import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: "#888",
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "SourceSans3_600SemiBold" },
        sceneStyle: { padding: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: "To Do",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="gradebook"
        options={{
          title: "Grade Book",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
