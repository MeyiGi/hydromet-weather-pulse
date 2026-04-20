import {
  View,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useStations } from "@/hooks/useStations";
import { useLang } from "@/lib/i18n";
import { StationCard } from "@/components/StationCard";
import { WindowStatusCard } from "@/components/WindowStatusCard";
import { LangPicker } from "@/components/LangPicker";
import type { Station } from "@/lib/types";

export default function HomeScreen() {
  const { t } = useLang();
  const router = useRouter();
  const dark = useColorScheme() === "dark";
  const { stations, error, refreshing, onRefresh } = useStations();
  const [search, setSearch] = useState("");

  const filtered = (stations ?? []).filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.station_id.toLowerCase().includes(search.toLowerCase()),
  );

  const header = (
    <View className="gap-4 pb-2">
      <WindowStatusCard />
      <View
        className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${
          dark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
        }`}
      >
        <Ionicons
          name="search-outline"
          size={16}
          color={dark ? "#9CA3AF" : "#6B7280"}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={`${t("stations")}…`}
          placeholderTextColor={dark ? "#6B7280" : "#9CA3AF"}
          className={`flex-1 text-sm ${dark ? "text-white" : "text-gray-900"}`}
        />
        {search.length > 0 && (
          <Ionicons
            name="close-circle"
            size={16}
            color={dark ? "#9CA3AF" : "#6B7280"}
            onPress={() => setSearch("")}
          />
        )}
      </View>
      <Text className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
        {t("stations")}
        {stations !== null && (
          <Text className={dark ? "text-gray-500" : "text-gray-400"}>
            {" "}
            ({filtered.length})
          </Text>
        )}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
      <View
        className={`flex-row items-center justify-between border-b px-4 py-2 ${
          dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
        }`}
      >
        <View>
          <Text
            className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
          >
            SynopNet
          </Text>
          <Text
            className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("appSubtitle")}
          </Text>
        </View>
        <LangPicker />
      </View>

      {error ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 items-center justify-center p-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color={dark ? "#6B7280" : "#9CA3AF"}
          />
          <Text
            className={`mt-3 text-center text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("couldNotLoad")}
          </Text>
        </ScrollView>
      ) : (
        <FlatList<Station>
          data={filtered}
          keyExtractor={(item) => item.station_id}
          renderItem={({ item }) => (
            <StationCard
              station={item}
              onPress={() => router.push(`/station/${item.station_id}`)}
            />
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            stations !== null ? (
              <View className="items-center py-12">
                <Text
                  className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("noStationsYet")}
                </Text>
              </View>
            ) : null
          }
          contentContainerClassName="px-4 pt-4 pb-8"
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
