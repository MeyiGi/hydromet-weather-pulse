import { memo } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { relativeTime } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import type { Station } from "@/lib/types";

const STATUS_BG = {
  overdue: { dark: "bg-red-900/40", light: "bg-red-100" },
  pending: { dark: "bg-amber-900/40", light: "bg-amber-100" },
  default: { dark: "bg-gray-800", light: "bg-gray-100" },
} as const;

const STATUS_TEXT = {
  overdue: { dark: "text-red-400", light: "text-red-600" },
  pending: { dark: "text-amber-400", light: "text-amber-600" },
  default: { dark: "text-gray-400", light: "text-gray-600" },
} as const;

interface Props {
  station: Station;
  onPress: () => void;
}

const HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

export const StationCard = memo(function StationCard({ station, onPress }: Props) {
  const { t, lang } = useLang();
  const dark = useColorScheme() === "dark";
  const mode = dark ? "dark" : "light";

  const statusKey =
    station.submission_status === "overdue"
      ? "overdue"
      : station.submission_status === "pending"
      ? "pending"
      : "default";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${station.station_id}`}
      className={`mb-3 rounded-2xl p-4 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
          >
            {station.name}
          </Text>
          <Text className={`mt-0.5 font-mono text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {station.station_id}
          </Text>
        </View>
        <View className={`shrink-0 rounded-full px-2.5 py-1 ${STATUS_BG[statusKey][mode]}`}>
          <Text className={`text-xs font-normal ${STATUS_TEXT[statusKey][mode]}`}>
            {statusKey === "overdue"
              ? t("overdue")
              : statusKey === "pending"
              ? t("pending")
              : t("onTime")}
          </Text>
        </View>
      </View>

      <View className="mt-3 gap-1.5">
        {!!station.location && (
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={13} color={dark ? "#9CA3AF" : "#6B7280"} />
            <Text
              numberOfLines={1}
              className={`flex-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              {station.location}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={13} color={dark ? "#9CA3AF" : "#6B7280"} />
          <Text className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("lastSeen")}: {relativeTime(station.last_seen, lang)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
