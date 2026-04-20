import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useLang } from "@/lib/i18n";
import { relativeTime } from "@/lib/format";
import { LangPicker } from "@/components/LangPicker";
import type { AppNotification } from "@/lib/types";

const levelIcon = {
  info: "information-circle-outline" as const,
  warning: "warning-outline" as const,
  error: "alert-circle-outline" as const,
};

const levelColor = {
  info: { light: "#6B7280", dark: "#9CA3AF" },
  warning: { light: "#F59E0B", dark: "#F59E0B" },
  error: { light: "#EF4444", dark: "#F87171" },
};

export default function NotificationsScreen() {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";
  const { items, markAllRead, unread, refreshing, onRefresh } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      if (unread > 0) {
        markAllRead();
      }
    }, [unread, markAllRead]),
  );

  const renderItem = ({ item }: { item: AppNotification }) => {
    const color = levelColor[item.level][dark ? "dark" : "light"];

    return (
      <View className={`mb-px flex-row gap-3 px-4 py-3`}>
        <Ionicons
          name={levelIcon[item.level]}
          size={17}
          color={color}
          style={{ marginTop: 2 }}
        />
        <View className="flex-1 gap-0.5">
          <Text
            className={`text-sm font-medium ${dark ? "text-white" : "text-gray-900"}`}
          >
            {item.title}
          </Text>
          <Text
            className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {item.body}
          </Text>
          <Text
            className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {relativeTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${dark ? "bg-gray-950" : "bg-white"}`}>
      <View
        className={`flex-row items-center justify-between border-b px-4 py-2 ${
          dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
        }`}
      >
        <Text
          className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
        >
          {t("notifications")}
        </Text>
        <LangPicker />
      </View>

      <View className={`flex-1 ${dark ? "bg-gray-950" : "bg-white"}`}>
        {items.length === 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-1 items-center justify-center py-16"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Ionicons
              name="notifications-off-outline"
              size={36}
              color={dark ? "#4B5563" : "#D1D5DB"}
            />
            <Text
              className={`mt-3 text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              {t("nothingHereYet")}
            </Text>
          </ScrollView>
        ) : (
          <FlatList<AppNotification>
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View
                className={`h-px ${dark ? "bg-gray-800" : "bg-gray-100"}`}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
