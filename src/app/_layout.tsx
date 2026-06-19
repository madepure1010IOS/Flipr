import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    const inLoginScreen = segments[0] === "login";
    if (!session && !inLoginScreen) {
      router.replace("/login");
    } else if (session && inLoginScreen) {
      router.replace("/");
    }
  }, [session, segments]);

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
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
