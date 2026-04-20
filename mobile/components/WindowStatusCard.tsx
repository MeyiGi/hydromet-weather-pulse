import { View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWindowStatus } from "@/hooks/useWindowStatus";
import { useLang } from "@/lib/i18n";
import { countdown, kgHour } from "@/lib/format";

const WINDOW_SECONDS = 20 * 60;

const DISPLAY_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export function WindowStatusCard() {
  const { status } = useWindowStatus();
  const { t } = useLang();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const sortedHours = DISPLAY_HOURS.slice().sort((a, b) => (a + 6) % 24 - (b + 6) % 24);

  return (
    <View className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="radio-outline" size={16} color={dark ? "#9CA3AF" : "#6B7280"} />
          <Text className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("submissionWindow")}
          </Text>
        </View>
        {status ? (
          <View
            className={`rounded-full px-2.5 py-1 ${
              status.is_open
                ? dark ? "bg-gray-700" : "bg-gray-900"
                : dark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-normal ${
                status.is_open
                  ? dark ? "text-gray-100" : "text-white"
                  : dark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {status.is_open ? t("open") : t("closed")}
            </Text>
          </View>
        ) : (
          <View className={`h-5 w-14 rounded-full ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
        )}
      </View>

      {/* Countdown */}
      {!status && (
        <View className={`mb-3 h-10 w-32 rounded-lg ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
      )}

      {status?.is_open && status.current && (
        <View className="mb-3">
          <View className="mb-1 flex-row items-end justify-between">
            <View>
              <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                {t("closesIn")}
              </Text>
              <Text
                className={`text-3xl font-light tabular-nums tracking-wide ${
                  dark ? "text-white" : "text-gray-900"
                }`}
              >
                {countdown(status.current.seconds_left)}
              </Text>
            </View>
            <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {kgHour(status.current.hour)}
            </Text>
          </View>
          {/* Progress bar */}
          <View className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-gray-800" : "bg-gray-200"}`}>
            <View
              className={`h-full rounded-full ${dark ? "bg-white" : "bg-gray-900"}`}
              style={{
                width: `${Math.round((status.current.seconds_left / WINDOW_SECONDS) * 100)}%`,
              }}
            />
          </View>
        </View>
      )}

      {status && !status.is_open && status.next && (
        <View className="mb-3 flex-row items-end justify-between">
          <View>
            <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {t("opensIn")}
            </Text>
            <Text
              className={`text-3xl font-light tabular-nums tracking-wide ${
                dark ? "text-white" : "text-gray-900"
              }`}
            >
              {countdown(status.next.opens_in_seconds)}
            </Text>
          </View>
          <Text className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {t("nextWindow")} {kgHour(status.next.hour)}
          </Text>
        </View>
      )}

      {/* Separator */}
      <View className={`mb-3 h-px ${dark ? "bg-gray-800" : "bg-gray-100"}`} />

      {/* Hour badges */}
      <View className="flex-row flex-wrap gap-1.5">
        {sortedHours.map((h) => {
          const active = status?.is_open && status.current?.hour === h;
          const isNext = !active && status?.next?.hour === h;
          return (
            <View
              key={h}
              className={`rounded-full border px-2.5 py-1 ${
                active
                  ? dark ? "border-transparent bg-white" : "border-transparent bg-gray-900"
                  : isNext
                  ? dark ? "border-transparent bg-white/20" : "border-gray-900"
                  : dark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <Text
                className={`font-mono text-[11px] ${
                  active
                    ? dark ? "font-semibold text-gray-900" : "font-semibold text-white"
                    : isNext
                    ? dark ? "font-medium text-white" : "font-medium text-gray-900"
                    : dark ? "font-normal text-gray-400" : "font-normal text-gray-600"
                }`}
              >
                {kgHour(h)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
