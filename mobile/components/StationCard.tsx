import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { relativeTime } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import type { Station } from "@/lib/types";

interface Props {
  station: Station;
  onPress: () => void;
}

export function StationCard({ station, onPress }: Props) {
  const { t } = useLang();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
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
        <View
          className={`shrink-0 rounded-full px-2.5 py-1 ${
            station.is_overdue
              ? dark ? "bg-red-900/40" : "bg-red-100"
              : dark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-normal ${
              station.is_overdue
                ? dark ? "text-red-400" : "text-red-600"
                : dark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {station.is_overdue ? t("overdue") : t("onTime")}
          </Text>
        </View>
      </View>

      <View className="mt-3 gap-1.5">
        {!!station.location && (
          <View className="flex-row items-center gap-2">
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
        )}
        <View className="flex-row items-center gap-2">
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
    </TouchableOpacity>
  );
}
