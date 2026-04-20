import { useMemo } from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useRouter } from "expo-router";
import { useStations } from "@/hooks/useStations";
import { useLang } from "@/lib/i18n";
import { LangPicker } from "@/components/LangPicker";
import { buildMapHtml, type MapMarker } from "@/lib/mapHtml";
import type { Station } from "@/lib/types";

export default function MapScreen() {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";
  const router = useRouter();
  const { stations } = useStations();

  const markers: MapMarker[] = useMemo(
    () =>
      (stations ?? [])
        .filter(
          (s): s is Station & { latitude: number; longitude: number } =>
            s.latitude !== null && s.longitude !== null,
        )
        .map((s) => ({
          id: s.station_id,
          name: s.name,
          location: s.location,
          lat: s.latitude,
          lng: s.longitude,
          overdue: s.submission_status === "overdue",
        })),
    [stations],
  );

  const unmapped = (stations ?? []).length - markers.length;

  const html = useMemo(
    () => buildMapHtml(markers, dark, { interactive: true, zoom: 6, lat: 41.2, lng: 74.7 }),
    [markers, dark],
  );

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
            {t("map")}
          </Text>
          {stations !== null && (
            <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {markers.length} {t("stationsOnMap")}
              {unmapped > 0 ? ` · ${unmapped} ${t("noCoordinates")}` : ""}
            </Text>
          )}
        </View>
        <LangPicker />
      </View>

      <WebView
        style={{ flex: 1 }}
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === "navigate" && msg.id) {
              router.push(`/station/${msg.id}`);
            }
          } catch {}
        }}
      />
    </SafeAreaView>
  );
}
