import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

const PAGE_SIZES = [10, 20, 50, 100];

export default function NotificationsScreen() {
  const { t, lang } = useLang();
  const dark = useColorScheme() === "dark";
  const {
    items,
    markAllRead,
    unread,
    refreshing,
    onRefresh,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
  } = useNotificationsContext();
  const tabBarHeight = useBottomTabBarHeight();
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const textPrimary = dark ? "text-white" : "text-gray-900";
  const cardBg = dark ? "bg-gray-900" : "bg-white";

  useFocusEffect(
    useCallback(() => {
      markAllRead();
    }, [markAllRead]),
  );

  const paginationRow = useMemo(
    () =>
      totalPages > 1 ? (
        <View
          className={`flex-row items-center justify-center gap-2 py-3 border-t ${
            dark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`p-1.5 rounded-lg ${cardBg} ${page <= 1 ? "opacity-30" : ""}`}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={dark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
          <Text className={`min-w-12 text-center text-xs tabular-nums ${textMuted}`}>
            {page} / {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`p-1.5 rounded-lg ${cardBg} ${page >= totalPages ? "opacity-30" : ""}`}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={dark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      ) : null,
    [page, totalPages, dark, cardBg, textMuted, setPage],
  );

  const listHeader = useMemo(
    () =>
      totalPages > 1 ? (
        <View
          className={`flex-row items-center justify-center gap-2 pb-3 border-b mb-3 ${
            dark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`p-1.5 rounded-lg ${cardBg} ${page <= 1 ? "opacity-30" : ""}`}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={dark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
          <Text className={`min-w-12 text-center text-xs tabular-nums ${textMuted}`}>
            {page} / {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`p-1.5 rounded-lg ${cardBg} ${page >= totalPages ? "opacity-30" : ""}`}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={dark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      ) : null,
    [page, totalPages, dark, cardBg, textMuted, setPage],
  );

  const renderItem = ({ item }: { item: AppNotification }) => {
    const color = levelColor[item.level][dark ? "dark" : "light"];
    const isUnread = !item.is_read;

    return (
      <View className={`mb-3 rounded-2xl p-4 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
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
              className={`text-sm ${isUnread ? "font-semibold" : "font-medium"} ${textPrimary}`}
            >
              {item.title}
            </Text>
            <Text className={`text-xs ${textMuted}`}>{item.body}</Text>
            <Text className={`mt-1 text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
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
      {/* Header */}
      <View
        className={`flex-row items-center justify-between border-b px-4 py-2 ${
          dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
        }`}
      >
        <View>
          <Text className={`text-base font-medium ${textPrimary}`}>
            {t("notifications")}
          </Text>
          <Text
            className={`text-xs ${textMuted} ${unread === 0 ? "opacity-0" : ""}`}
          >
            {unread} {t("unread")}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Page size button */}
          <TouchableOpacity
            onPress={() => setPageSizeOpen(true)}
            className={`flex-row items-center gap-1 rounded-lg px-2.5 py-1.5 ${cardBg}`}
          >
            <Text className={`text-xs tabular-nums ${textMuted}`}>{pageSize}</Text>
            <Ionicons name="chevron-down" size={12} color={dark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
          <LangPicker />
        </View>
      </View>

      {/* Page size modal */}
      <Modal visible={pageSizeOpen} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setPageSizeOpen(false)}
        >
          <Pressable>
            <View
              style={{ minWidth: 140, borderRadius: 16, overflow: "hidden" }}
              className={dark ? "bg-gray-900" : "bg-white"}
            >
              {PAGE_SIZES.map((s, i) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => { setPageSize(s); setPageSizeOpen(false); }}
                  className={`flex-row items-center justify-between px-5 py-3.5 ${
                    i < PAGE_SIZES.length - 1
                      ? dark ? "border-b border-gray-800" : "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text className={`text-sm ${pageSize === s ? `font-medium ${textPrimary}` : textMuted}`}>
                    {s}
                  </Text>
                  {pageSize === s && (
                    <Ionicons name="checkmark" size={16} color={dark ? "#fff" : "#111827"} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
          <Text className={`mt-3 text-sm ${textMuted}`}>
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
          ListHeaderComponent={listHeader}
          ListFooterComponent={paginationRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
