import {
  View,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useStations } from "@/hooks/useStations";
import { useLang } from "@/lib/i18n";
import { StationCard } from "@/components/StationCard";
import { WindowStatusCard } from "@/components/WindowStatusCard";
import { LangPicker } from "@/components/LangPicker";
import type { Station } from "@/lib/types";

type Filter = "all" | "on_time" | "overdue";

function SkeletonCard({ dark }: { dark: boolean }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  const bg = dark ? "#1f2937" : "#f3f4f6";
  const line = dark ? "#374151" : "#e5e7eb";
  return (
    <Animated.View style={{ opacity, marginBottom: 12, borderRadius: 16, padding: 16, backgroundColor: bg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ gap: 6, flex: 1 }}>
          <View style={{ height: 14, width: "55%", borderRadius: 6, backgroundColor: line }} />
          <View style={{ height: 11, width: "30%", borderRadius: 6, backgroundColor: line }} />
        </View>
        <View style={{ height: 22, width: 60, borderRadius: 12, backgroundColor: line }} />
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ height: 11, width: "70%", borderRadius: 6, backgroundColor: line }} />
        <View style={{ height: 11, width: "45%", borderRadius: 6, backgroundColor: line }} />
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { t } = useLang();
  const router = useRouter();
  const dark = useColorScheme() === "dark";
  const tabBarHeight = useBottomTabBarHeight();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const { stations, totalPages, total, error, loading, refreshing, onRefresh } =
    useStations({
      page,
      page_size: pageSize,
      search,
      status: filter === "all" ? undefined : filter,
    });

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (f: Filter) => { setFilter(f); setPage(1); setFilterOpen(false); };
  const handlePageSize = (s: number) => { setPageSize(s); setPage(1); setPageSizeOpen(false); };

  const filterLabel = (f: Filter) =>
    f === "all" ? t("filterAll") : f === "on_time" ? t("onTime") : t("overdue");

  const bg = dark ? "bg-gray-950" : "bg-gray-100";
  const safeBg = dark ? "bg-gray-950" : "bg-white";
  const cardBg = dark ? "bg-gray-900" : "bg-white";
  const borderColor = dark ? "border-gray-800" : "border-gray-100";
  const textPrimary = dark ? "text-white" : "text-gray-900";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";

  const paginationRow = useMemo(() => (
    <View className="flex-row items-center justify-center gap-1 py-3">
      <TouchableOpacity
        onPress={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page <= 1}
        className={`rounded-lg p-1.5 ${cardBg} ${page <= 1 ? "opacity-30" : ""}`}
      >
        <Ionicons name="chevron-back" size={14} color={dark ? "#fff" : "#111827"} />
      </TouchableOpacity>
      <Text className={`min-w-12 text-center text-xs tabular-nums ${textMuted}`}>
        {page} / {totalPages}
      </Text>
      <TouchableOpacity
        onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page >= totalPages}
        className={`rounded-lg p-1.5 ${cardBg} ${page >= totalPages ? "opacity-30" : ""}`}
      >
        <Ionicons name="chevron-forward" size={14} color={dark ? "#fff" : "#111827"} />
      </TouchableOpacity>
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [page, totalPages, cardBg, dark, textMuted]);

  const header = useMemo(() => (
    <View className="gap-3 pb-2">
      <WindowStatusCard />

      <View className={`flex-row items-center gap-2 rounded-xl px-3 py-2.5 ${cardBg}`}>
        <Ionicons name="search-outline" size={16} color={dark ? "#9CA3AF" : "#6B7280"} />
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder={`${t("stations")}…`}
          placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 text-sm ${textPrimary}`}
        />
        {search.length > 0 && (
          <Ionicons
            name="close-circle"
            size={16}
            color={dark ? "#9CA3AF" : "#6B7280"}
            onPress={() => handleSearch("")}
          />
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className={`text-sm ${textMuted}`}>
            {t("stations")}
            {total > 0 && (
              <Text className={dark ? "text-gray-600" : "text-gray-400"}> ({total})</Text>
            )}
          </Text>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            className={`flex-row items-center gap-1 rounded-lg px-2.5 py-1 ${cardBg}`}
          >
            <Text className={`text-xs ${textPrimary}`}>{filterLabel(filter)}</Text>
            <Ionicons name="chevron-down" size={12} color={dark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPageSizeOpen(true)}
            className={`flex-row items-center gap-1 rounded-lg px-2.5 py-1 ${cardBg}`}
          >
            <Text className={`text-xs ${textMuted}`}>{pageSize}</Text>
            <Ionicons name="chevron-down" size={12} color={dark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
        {paginationRow}
      </View>
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [total, totalPages, page, pageSize, filter, search, dark, filterOpen, pageSizeOpen, paginationRow]);

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 ${safeBg}`}>
      <View className={`flex-row items-center justify-between border-b px-4 py-2 ${borderColor} ${cardBg}`}>
        <View>
          <Text className={`text-base font-medium ${textPrimary}`}>SynopNet</Text>
          <Text className={`text-xs ${textMuted}`}>{t("appSubtitle")}</Text>
        </View>
        <LangPicker />
      </View>

      {/* Filter modal */}
      <Modal visible={filterOpen} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setFilterOpen(false)}
        >
          <Pressable>
            <View style={{ minWidth: 180, borderRadius: 16, overflow: "hidden" }} className={dark ? "bg-gray-900" : "bg-white"}>
              {(["all", "on_time", "overdue"] as Filter[]).map((f, i) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => handleFilter(f)}
                  className={`flex-row items-center justify-between px-5 py-3.5 ${i < 2 ? (dark ? "border-b border-gray-800" : "border-b border-gray-100") : ""}`}
                >
                  <Text className={`text-sm ${filter === f ? `font-medium ${textPrimary}` : textMuted}`}>
                    {filterLabel(f)}
                  </Text>
                  {filter === f && <Ionicons name="checkmark" size={16} color={dark ? "#fff" : "#111827"} />}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Page size modal */}
      <Modal visible={pageSizeOpen} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setPageSizeOpen(false)}
        >
          <Pressable>
            <View style={{ minWidth: 140, borderRadius: 16, overflow: "hidden" }} className={dark ? "bg-gray-900" : "bg-white"}>
              {[10, 20, 50, 100].map((s, i) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handlePageSize(s)}
                  className={`flex-row items-center justify-between px-5 py-3.5 ${i < 3 ? (dark ? "border-b border-gray-800" : "border-b border-gray-100") : ""}`}
                >
                  <Text className={`text-sm ${pageSize === s ? `font-medium ${textPrimary}` : textMuted}`}>
                    {s}
                  </Text>
                  {pageSize === s && <Ionicons name="checkmark" size={16} color={dark ? "#fff" : "#111827"} />}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <View className={`flex-1 ${bg}`}>
        {error ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-1 items-center justify-center p-8"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <Ionicons name="cloud-offline-outline" size={40} color={dark ? "#6B7280" : "#9CA3AF"} />
            <Text className={`mt-3 text-center text-sm ${textMuted}`}>{t("couldNotLoad")}</Text>
          </ScrollView>
        ) : stations === null ? (
          /* Initial load — skeleton */
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: tabBarHeight + 16 }}
          >
            {header}
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} dark={dark} />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList<Station>
              data={stations}
              keyExtractor={(item) => item.station_id}
              renderItem={({ item }) => (
                <StationCard
                  station={item}
                  onPress={() => router.push(`/station/${item.station_id}`)}
                />
              )}
              ListHeaderComponent={header}
              ListFooterComponent={paginationRow}
              ListEmptyComponent={
                <View className="items-center py-12">
                  <Text className={`text-sm ${textMuted}`}>{t("noStationsYet")}</Text>
                </View>
              }
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: tabBarHeight + 16,
              }}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
            />
            {/* Overlay spinner on filter/page changes */}
            {loading && (
              <View
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: dark ? "rgba(3,7,18,0.45)" : "rgba(255,255,255,0.55)",
                }}
                pointerEvents="none"
              >
                <ActivityIndicator size="large" color={dark ? "#fff" : "#111827"} />
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
