import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLang } from "@/lib/i18n";
import { LangPicker } from "@/components/LangPicker";

export default function MapScreen() {
  const { t } = useLang();
  const dark = useColorScheme() === "dark";

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
        <Text
          className={`text-base font-medium ${dark ? "text-white" : "text-gray-900"}`}
        >
          {t("map")}
        </Text>
        <LangPicker />
      </View>

      {/* Coming Soon */}
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Ionicons
          name="map-outline"
          size={64}
          color={dark ? "#4B5563" : "#D1D5DB"}
        />
        <Text
          className={`text-xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}
        >
          Coming Soon
        </Text>
        <Text
          className={`text-center text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          Map functionality will be available in a future version.
        </Text>
      </View>
    </SafeAreaView>
  );
}
