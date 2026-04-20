import { useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStations } from "@/hooks/useStations";
import { useLang } from "@/lib/i18n";
import { LangPicker } from "@/components/LangPicker";
import type { Station } from "@/lib/types";

// Kyrgyzstan center
const KG_REGION: Region = {
  latitude: 41.2,
  longitude: 74.7,
  latitudeDelta: 7,
  longitudeDelta: 7,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
];

export default function MapScreen() {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { stations } = useStations();

  const mapped = useMemo(
    () =>
      (stations ?? []).filter(
        (s): s is Station & { latitude: number; longitude: number } =>
          s.latitude !== null && s.longitude !== null,
      ),
    [stations],
  );

  const unmapped = (stations ?? []).length - mapped.length;

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
          <Text
            className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
          >
            {t("map")}
          </Text>
          <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {mapped.length} {t("stationsOnMap")}
            {unmapped > 0 ? ` · ${unmapped} ${t("noCoordinates")}` : ""}
          </Text>
        </View>
        <LangPicker />
      </View>

      {/* Map */}
      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_DEFAULT}
          initialRegion={KG_REGION}
          customMapStyle={dark ? DARK_MAP_STYLE : []}
          showsUserLocation
          showsCompass
          showsScale
        >
          {mapped.map((s) => (
            <Marker
              key={s.station_id}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              title={s.name}
              description={s.location}
              pinColor={s.is_overdue ? "#EF4444" : "#22C55E"}
              onCalloutPress={() => router.push(`/station/${s.station_id}`)}
            />
          ))}
        </MapView>

        {/* Reset button */}
        <TouchableOpacity
          onPress={() => mapRef.current?.animateToRegion(KG_REGION, 500)}
          className={`absolute right-4 bottom-8 h-10 w-10 items-center justify-center rounded-full shadow-md ${
            dark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <Ionicons
            name="locate-outline"
            size={20}
            color={dark ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
