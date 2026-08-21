import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function WebTabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: "top",
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 72,
          paddingHorizontal: 28,
          paddingVertical: 10,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
        },
        tabBarItemStyle: {
          maxWidth: 150,
          minWidth: 100,
          borderRadius: 12,
          marginHorizontal: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={21} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <IconSymbol size={21} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Practice",
          tabBarIcon: ({ color }) => <IconSymbol size={21} name="rectangle.stack.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          title: "AI Tutor",
          tabBarIcon: ({ color }) => <IconSymbol size={21} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={21} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
