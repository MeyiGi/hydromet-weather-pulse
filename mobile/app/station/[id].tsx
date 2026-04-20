import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useStations } from "@/hooks/useStations";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { isUnlocked, lock } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { relativeTime, countdown } from "@/lib/format";
import { WindowStatusCard } from "@/components/WindowStatusCard";
import { SubmitForm } from "@/components/SubmitForm";
import { LoginModal } from "@/components/LoginModal";

export default function StationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const router = useRouter();
  const dark = useColorScheme() === "dark";

  const { stations } = useStations();
  const { status } = useWindowStatus();
  const station = stations?.find((s) => s.station_id === id);

  const [unlocked, setUnlocked] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    isUnlocked(id).then(setUnlocked);
  }, [id]);

  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0
    ? insets.top
    : Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

  const windowOpen = !!status?.is_open;
  const opensIn =
    status && !status.is_open && status.next ? status.next.opens_in_seconds : null;

  if (!id) return null;

  return (
    <View style={{ flex: 1, paddingTop: topInset }} className={dark ? "bg-gray-950" : "bg-gray-50"}>
      {/* Header — same structure as home and notifications */}
      <View
        className={`flex-row items-center border-b px-4 py-2 ${
          dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3 -ml-1 p-1">
          <Ionicons name="chevron-back" size={22} color={dark ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          {station ? (
            <Text
              numberOfLines={1}
              className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
            >
              {station.name}
            </Text>
          ) : (
            <View className={`h-4 w-28 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
          )}
          <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("stations")}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Station info card */}
        {!station ? (
          <View className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
            <View className={`mb-2 h-5 w-40 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            <View className={`mb-3 h-3 w-24 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
            <View className={`mb-2 h-px ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
            <View className={`h-3 w-32 rounded ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
          </View>
        ) : (
          <View className={`rounded-2xl shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
            <View className="flex-row items-start justify-between gap-2 p-4 pb-2">
              <View className="min-w-0 flex-1">
                <Text
                  className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {station.name}
                </Text>
                <Text
                  className={`mt-0.5 font-mono text-xs ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {station.station_id}
                </Text>
              </View>
              <View
                className={`shrink-0 rounded-full px-2.5 py-1 ${
                  station.is_overdue
                    ? dark ? "bg-red-900/40" : "bg-red-100"
                    : dark ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs ${
                    station.is_overdue
                      ? dark ? "text-red-400" : "text-red-600"
                      : dark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {station.is_overdue ? t("overdue") : t("onTime")}
                </Text>
              </View>
            </View>

            {station.location ? (
              <>
                <View className="flex-row items-center gap-2 px-4 py-2">
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={dark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text
                    numberOfLines={1}
                    className={`flex-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {station.location}
                  </Text>
                </View>
                <View className={`mx-4 h-px ${dark ? "bg-gray-800" : "bg-gray-100"}`} />
              </>
            ) : null}

            <View className="flex-row items-center gap-2 px-4 py-2">
              <Ionicons
                name="time-outline"
                size={13}
                color={dark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                {t("lastSeen")}: {relativeTime(station.last_seen)}
              </Text>
            </View>
          </View>
        )}

        {/* Mini-map — only when coordinates are available */}
        {station?.latitude !== undefined &&
          station?.longitude !== undefined &&
          station.latitude !== null &&
          station.longitude !== null && (
            <View
              className={`overflow-hidden rounded-2xl shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}
            >
              <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
                <Ionicons
                  name="map-outline"
                  size={13}
                  color={dark ? "#9CA3AF" : "#6B7280"}
                />
                <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {t("location")}
                </Text>
              </View>
              <MapView
                style={{ height: 180 }}
                provider={PROVIDER_DEFAULT}
                initialRegion={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                  latitudeDelta: 0.15,
                  longitudeDelta: 0.15,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: station.latitude,
                    longitude: station.longitude,
                  }}
                  title={station.name}
                  pinColor={station.is_overdue ? "#EF4444" : "#22C55E"}
                />
              </MapView>
            </View>
          )}

        <WindowStatusCard />

        {/* Window closed notice */}
        {status && !windowOpen && (
          <View
            className={`rounded-2xl border px-4 py-3 ${
              dark
                ? "border-amber-900/40 bg-amber-950/20"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <View className="flex-row items-start gap-3">
              <Ionicons name="timer-outline" size={18} color="#F59E0B" style={{ marginTop: 1 }} />
              <View className="flex-1">
                <Text
                  className={`text-sm font-medium ${
                    dark ? "text-amber-400" : "text-amber-700"
                  }`}
                >
                  {t("windowClosed")}
                </Text>
                <Text
                  className={`text-xs ${dark ? "text-amber-500/80" : "text-amber-600/80"}`}
                >
                  {t("windowClosedDesc")}
                  {opensIn !== null && ` — ${countdown(opensIn)}`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Submit form or unlock */}
        {unlocked ? (
          <SubmitForm
            stationId={id}
            windowOpen={windowOpen}
            onLock={async () => {
              await lock(id);
              setUnlocked(false);
            }}
          />
        ) : (
          <View
            className={`rounded-2xl border border-dashed p-8 ${
              dark ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <View className="items-center gap-3">
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  dark ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={dark ? "#9CA3AF" : "#6B7280"}
                />
              </View>
              <Text
                className={`text-center text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("onlyOperator")}
              </Text>
              <TouchableOpacity
                onPress={() => setLoginVisible(true)}
                className={`h-11 items-center justify-center rounded-xl px-6 ${
                  dark ? "bg-white" : "bg-gray-900"
                }`}
              >
                <Text className={dark ? "text-gray-900" : "text-white"}>
                  {t("unlockStation")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <LoginModal
        stationId={id}
        stationName={station?.name ?? id}
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onUnlocked={() => {
          setUnlocked(true);
          setLoginVisible(false);
        }}
      />
    </View>
  );
}
