import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0a1a",
          borderTopColor: "#1e1e3a",
        },
        tabBarActiveTintColor: "#00e5aa",
        tabBarInactiveTintColor: "#555",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Search" }} />
      <Tabs.Screen
        name="item"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
