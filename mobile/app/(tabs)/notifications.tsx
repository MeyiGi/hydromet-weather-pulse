import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useNotificationsContext } from "@/context/NotificationsContext";
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
  const { t, lang } = useLang();
  const dark = useColorScheme() === "dark";
  const { items, markAllRead, unread, refreshing, onRefresh } =
    useNotificationsContext();
  const tabBarHeight = useBottomTabBarHeight();

  useFocusEffect(
    useCallback(() => {
      markAllRead();
    }, [markAllRead]),
  );

  const renderItem = ({ item }: { item: AppNotification }) => {
    const color = levelColor[item.level][dark ? "dark" : "light"];
    const isUnread = !item.is_read;

    return (
      <View
        className={`mb-3 rounded-2xl p-4 shadow-sm ${
          isUnread
            ? dark
              ? "bg-gray-800"
              : "bg-white"
            : dark
              ? "bg-gray-900"
              : "bg-white"
        }`}
      >
        <View className="flex-row items-start gap-3">
          {isUnread && (
            <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
          )}
          <Ionicons
            name={levelIcon[item.level]}
            size={17}
            color={color}
            style={{ marginTop: 2 }}
          />
          <View className="flex-1 gap-0.5">
            <Text
              className={`text-sm ${isUnread ? "font-semibold" : "font-medium"} ${dark ? "text-white" : "text-gray-900"}`}
            >
              {item.title}
            </Text>
            <Text
              className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              {item.body}
            </Text>
            <Text
              className={`mt-1 text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              {relativeTime(item.created_at, lang)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${dark ? "bg-gray-950" : "bg-white"}`}
    >
      <View
        className={`flex-row items-center justify-between border-b px-4 py-2 ${
          dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
        }`}
      >
        <View>
          <Text
            className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
          >
            {t("notifications")}
          </Text>
          <Text
            className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"} ${unread === 0 ? "opacity-0" : ""}`}
          >
            {unread} {t("unread")}
          </Text>
        </View>
        <LangPicker />
      </View>

      {items.length === 0 ? (
        <ScrollView
          className={`flex-1 ${dark ? "bg-gray-950" : "bg-gray-100"}`}
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
          style={{ backgroundColor: dark ? "#030712" : "#F3F4F6" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: tabBarHeight + 16,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
