import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/hooks/useNotifications";
import { View, Text } from "react-native";
import { useLang } from "@/lib/i18n";

function NotificationTabIcon({ color, size }: { color: string; size: number }) {
  const { unread } = useNotifications();
  return (
    <View>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unread > 0 && (
        <View className="absolute -right-1.5 -top-1 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1">
          <Text className="text-[9px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLang();

  const dark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: dark ? "#ffffff" : "#111827",
        tabBarInactiveTintColor: dark ? "#6B7280" : "#9CA3AF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: dark ? "#030712" : "#ffffff",
          borderTopColor: dark ? "#1f2937" : "#f3f4f6",
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("stations"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t("map"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t("notifications"),
          tabBarIcon: ({ color, size }) => (
            <NotificationTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
